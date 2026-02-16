import { Plugin } from 'vite'
import path from 'path'
import fs from 'fs'
import { execSync, spawn } from 'child_process'
import { pathToFileURL } from 'url'

const IS_WIN = process.platform === 'win32'

// --- PID Cache ---
const PID_TTL_MS = 8000
const pidCache = new Map<number, { alive: boolean; checkedAt: number }>()

function checkPidAliveCached(pid: number): boolean {
  const now = Date.now()
  const cached = pidCache.get(pid)
  if (cached && (now - cached.checkedAt) < PID_TTL_MS) return cached.alive
  const alive = checkPidAliveRaw(pid)
  pidCache.set(pid, { alive, checkedAt: now })
  return alive
}

function checkPidAliveRaw(pid: number): boolean {
  try {
    process.kill(pid, 0)
    return true
  } catch (e: any) {
    if (e.code === 'EPERM') return true
    if (IS_WIN && e.code === 'ESRCH') {
      try {
        const out = execSync(`tasklist /FI "PID eq ${pid}" /NH`, { encoding: 'utf-8', timeout: 3000 })
        if (out.includes(String(pid))) return true
      } catch { /* continue */ }
      try {
        const out = execSync(`ps -p ${pid}`, { encoding: 'utf-8', timeout: 3000 })
        return out.trim().split('\n').length >= 2
      } catch { /* not found */ }
    }
    return false
  }
}

function readJsonSafe(filePath: string): any {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  } catch {
    return null
  }
}

function readTextSafe(filePath: string): string {
  try {
    return fs.readFileSync(filePath, 'utf-8')
  } catch {
    return ''
  }
}

function readPid(filePath: string): number | null {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8').trim()
    const pid = parseInt(raw, 10)
    return isNaN(pid) ? null : pid
  } catch {
    return null
  }
}

function sendJson(res: any, data: any, status = 200) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(data))
}

function readBody(req: any): Promise<string> {
  return new Promise((resolve) => {
    let body = ''
    req.on('data', (c: any) => { body += c })
    req.on('end', () => resolve(body))
  })
}

interface SessionMetrics {
  cost_usd: number | null
  duration_ms: number | null
  turns: number | null
  model: string | null
}

function readJsonlTailWithMetrics(filePath: string, tail: number): { events: any[]; metrics: SessionMetrics; total_bytes: number; total_events: number } {
  const metrics: SessionMetrics = { cost_usd: null, duration_ms: null, turns: null, model: null }
  try {
    const stat = fs.statSync(filePath)
    const total_bytes = stat.size
    const content = fs.readFileSync(filePath, 'utf-8')
    const lines = content.split('\n').filter(l => l.trim())
    const total_events = lines.length
    const selected = tail > 0 ? lines.slice(-tail) : lines
    const events: any[] = []

    for (const line of selected) {
      try {
        events.push(JSON.parse(line))
      } catch {
        events.push({ type: 'legacy', lines: [line] })
      }
    }

    for (const ev of events) {
      if (ev.type === 'result') {
        if (ev.cost_usd != null) metrics.cost_usd = ev.cost_usd
        if (ev.duration_ms != null) metrics.duration_ms = ev.duration_ms
        if (ev.turns != null) metrics.turns = ev.turns
      }
      if (ev.type === 'system' && ev.model) {
        metrics.model = ev.model
      }
    }

    return { events, metrics, total_bytes, total_events }
  } catch {
    return { events: [], metrics, total_bytes: 0, total_events: 0 }
  }
}

function readJsonlSinceByte(filePath: string, sinceByte: number): { events: any[]; total_bytes: number; append: boolean } {
  try {
    const stat = fs.statSync(filePath)
    const total_bytes = stat.size
    if (sinceByte > total_bytes) return { events: [], total_bytes, append: false }
    if (sinceByte >= total_bytes) return { events: [], total_bytes, append: true }

    const fd = fs.openSync(filePath, 'r')
    const buf = Buffer.alloc(total_bytes - sinceByte)
    fs.readSync(fd, buf, 0, buf.length, sinceByte)
    fs.closeSync(fd)

    const chunk = buf.toString('utf-8')
    const lines = chunk.split('\n').filter(l => l.trim())
    const events: any[] = []
    for (const line of lines) {
      try { events.push(JSON.parse(line)) } catch { events.push({ type: 'legacy', lines: [line] }) }
    }
    return { events, total_bytes, append: true }
  } catch {
    return { events: [], total_bytes: 0, append: false }
  }
}

function detectLoopState(ws: string): { state: string; detail: any | null; alive: boolean } {
  const loopState = readJsonSafe(path.join(ws, 'agent-harness.state'))
  const pid = readPid(path.join(ws, 'agent-harness.pid'))
  const alive = pid ? checkPidAliveCached(pid) : false
  const stopping = fs.existsSync(path.join(ws, '.stop'))

  let state = 'idle'
  if (stopping && alive) state = 'stopping'
  else if (loopState?.status === 'running' && alive) state = 'running'
  else if (loopState?.status === 'between' && alive) state = 'between'
  else if (loopState?.status === 'completed' || loopState?.exit_reason === 'completed') state = 'completed'

  return { state, detail: loopState, alive }
}

function isValidSessionId(sid: string): boolean {
  return /^[a-zA-Z0-9_-]+$/.test(sid)
}

// --- Workspace Discovery ---
interface WorkspaceInfo {
  slug: string
  name: string
  workspace: string
  harness: string
  features: { total: number; passing: number }
}

function discoverWorkspaces(runsDir: string): WorkspaceInfo[] {
  if (!fs.existsSync(runsDir)) return []
  const results: WorkspaceInfo[] = []

  // Scan flat .json files in runs/
  try {
    const entries = fs.readdirSync(runsDir)
    for (const entry of entries) {
      if (!entry.endsWith('.json')) continue
      const filePath = path.join(runsDir, entry)
      try {
        const stat = fs.statSync(filePath)
        if (!stat.isFile()) continue
        const config = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
        if (!config.workspace) continue
        const wsPath = config.workspace.replace(/\\/g, '/')
        if (!fs.existsSync(wsPath)) continue
        if (!fs.existsSync(path.join(wsPath, 'agent-harness.json'))) continue

        // Read features summary
        const featuresRaw = readJsonSafe(path.join(wsPath, 'features.json'))
        const features = Array.isArray(featuresRaw) ? featuresRaw : (featuresRaw?.features ?? [])
        const passing = features.filter((f: any) => f.status === 'passing').length

        results.push({
          slug: config.slug || entry.replace('.json', ''),
          name: config.name || config.slug || entry.replace('.json', ''),
          workspace: wsPath,
          harness: config.agent?.harness || 'unknown',
          features: { total: features.length, passing },
        })
      } catch { /* skip */ }
    }
  } catch { /* ok */ }

  // Scan subdirs with project.json
  try {
    const entries = fs.readdirSync(runsDir, { withFileTypes: true })
    for (const entry of entries) {
      if (!entry.isDirectory() || entry.name === '.meta' || entry.name === 'workspaces' || entry.name === 'worktrees') continue
      const projPath = path.join(runsDir, entry.name, 'project.json')
      if (!fs.existsSync(projPath)) continue
      try {
        const config = JSON.parse(fs.readFileSync(projPath, 'utf-8'))
        if (!config.workspace) continue
        const wsPath = config.workspace.replace(/\\/g, '/')
        if (!fs.existsSync(wsPath)) continue
        if (!fs.existsSync(path.join(wsPath, 'agent-harness.json'))) continue
        // Skip if already found from flat scan
        if (results.some(r => r.workspace === wsPath)) continue

        const featuresRaw = readJsonSafe(path.join(wsPath, 'features.json'))
        const features = Array.isArray(featuresRaw) ? featuresRaw : (featuresRaw?.features ?? [])
        const passing = features.filter((f: any) => f.status === 'passing').length

        results.push({
          slug: config.slug || entry.name,
          name: config.name || config.slug || entry.name,
          workspace: wsPath,
          harness: config.agent?.harness || 'unknown',
          features: { total: features.length, passing },
        })
      } catch { /* skip */ }
    }
  } catch { /* ok */ }

  return results
}

export function sneakPeekPlugin(defaultWorkspace: string, runsDir: string): Plugin {
  // Mutable active workspace
  let activeWorkspace = process.env.WORKSPACE || defaultWorkspace

  return {
    name: 'sneak-peek-api',
    configureServer(server) {
      // Helper: current ws
      const ws = () => activeWorkspace

      // GET /api/workspaces — list available workspaces
      server.middlewares.use('/api/workspaces', (req, res, next) => {
        if (req.method !== 'GET') return next()
        const workspaces = discoverWorkspaces(runsDir)
        sendJson(res, { workspaces, active: activeWorkspace })
      })

      // POST /api/workspace — switch active workspace
      server.middlewares.use('/api/workspace', async (req, res, next) => {
        if (req.method !== 'POST') return next()
        const body = await readBody(req)
        try {
          const { workspace } = JSON.parse(body)
          if (!workspace || !fs.existsSync(workspace)) {
            return sendJson(res, { error: 'Workspace não encontrado' }, 400)
          }
          if (!fs.existsSync(path.join(workspace, 'agent-harness.json'))) {
            return sendJson(res, { error: 'Workspace sem agent-harness.json' }, 400)
          }
          activeWorkspace = workspace
          sendJson(res, { success: true, workspace: activeWorkspace })
        } catch {
          sendJson(res, { error: 'Body inválido' }, 400)
        }
      })

      // GET /api/config
      server.middlewares.use('/api/config', (req, res, next) => {
        if (req.method !== 'GET') return next()
        const config = readJsonSafe(path.join(ws(), 'agent-harness.json'))
        if (!config) return sendJson(res, { error: 'agent-harness.json não encontrado' }, 404)
        sendJson(res, { config })
      })

      // GET /api/state
      server.middlewares.use('/api/state', (req, res, next) => {
        if (req.method !== 'GET') return next()
        const { state, detail, alive } = detectLoopState(ws())
        const pid = readPid(path.join(ws(), 'agent-harness.pid'))
        sendJson(res, { state, detail, pid, alive })
      })

      // GET /api/features
      server.middlewares.use('/api/features', (req, res, next) => {
        if (req.method !== 'GET') return next()
        const raw = readJsonSafe(path.join(ws(), 'features.json'))
        const features = Array.isArray(raw) ? raw : (raw?.features ?? [])
        const summary: Record<string, number> = {}
        for (const f of features) { summary[f.status] = (summary[f.status] || 0) + 1 }
        sendJson(res, { features, summary, total: features.length })
      })

      // GET /api/progress
      server.middlewares.use('/api/progress', (req, res, next) => {
        if (req.method !== 'GET') return next()
        const url = new URL(req.url!, `http://${req.headers.host}`)
        const lines = parseInt(url.searchParams.get('lines') || '200', 10)
        try {
          const content = fs.readFileSync(path.join(ws(), 'agent-progress.txt'), 'utf-8')
          const allLines = content.split('\n')
          sendJson(res, { text: lines > 0 ? allLines.slice(-lines).join('\n') : content, total_lines: allLines.length })
        } catch {
          sendJson(res, { text: '', total_lines: 0 })
        }
      })

      // GET /api/sessions
      server.middlewares.use((req, res, next) => {
        if (req.method !== 'GET' || req.url !== '/api/sessions') return next()
        const sessionsDir = path.join(ws(), '.sessions')
        if (!fs.existsSync(sessionsDir)) return sendJson(res, { sessions: [] })

        const currentFeature = readTextSafe(path.join(sessionsDir, '.current-feature')).trim()
        const entries = fs.readdirSync(sessionsDir, { withFileTypes: true })
        const sessions: any[] = []

        for (const entry of entries) {
          if (!entry.isDirectory() || entry.name.startsWith('.')) continue
          const sid = entry.name
          const sessionDir = path.join(sessionsDir, sid)
          const pid = readPid(path.join(sessionDir, 'pid'))
          const alive = pid ? checkPidAliveCached(pid) : false
          const startedAt = readTextSafe(path.join(sessionDir, 'started_at')).trim() || null
          const finishedAt = readTextSafe(path.join(sessionDir, 'finished_at')).trim() || null
          let outputBytes = 0
          try { outputBytes = fs.statSync(path.join(sessionDir, 'output.jsonl')).size } catch { /* ok */ }
          let metrics: SessionMetrics | null = null
          if (finishedAt && outputBytes > 0) {
            metrics = readJsonlTailWithMetrics(path.join(sessionDir, 'output.jsonl'), 5).metrics
          }
          sessions.push({ id: sid, pid, alive, started_at: startedAt, finished_at: finishedAt, output_bytes: outputBytes, is_current: sid === currentFeature, metrics })
        }

        sessions.sort((a, b) => {
          if (a.is_current && !b.is_current) return -1
          if (!a.is_current && b.is_current) return 1
          return (a.started_at || '').localeCompare(b.started_at || '')
        })
        sendJson(res, { sessions })
      })

      // GET /api/sessions/:sid/output
      server.middlewares.use((req, res, next) => {
        const match = req.url?.match(/^\/api\/sessions\/([^/]+)\/output/)
        if (!match || req.method !== 'GET') return next()
        const sid = match[1]
        if (!isValidSessionId(sid)) return sendJson(res, { error: 'ID de sessão inválido' }, 400)

        const url = new URL(req.url!, `http://${req.headers.host}`)
        const tail = parseInt(url.searchParams.get('tail') || '50', 10)
        const sinceByte = url.searchParams.get('since_byte')
        const outputPath = path.join(ws(), '.sessions', sid, 'output.jsonl')

        if (sinceByte != null && parseInt(sinceByte, 10) > 0) {
          const result = readJsonlSinceByte(outputPath, parseInt(sinceByte, 10))
          sendJson(res, { events: result.events, total_bytes: result.total_bytes, total_events: result.events.length, truncated: false, metrics: null, append: result.append })
        } else {
          const result = readJsonlTailWithMetrics(outputPath, tail)
          sendJson(res, { events: result.events, total_bytes: result.total_bytes, total_events: result.total_events, truncated: result.total_events > tail, metrics: result.metrics, append: false })
        }
      })

      // --- Harness Create Flow ---

      // POST /api/harness/infer
      server.middlewares.use('/api/harness/infer', async (req, res, next) => {
        if (req.method !== 'POST') return next()
        const body = await readBody(req)
        try {
          const { specsPath } = JSON.parse(body)
          if (!specsPath) return sendJson(res, { error: 'specsPath é obrigatório' }, 400)

          const normalizedPath = specsPath.replace(/\\/g, '/')
          if (!fs.existsSync(normalizedPath)) {
            return sendJson(res, { error: `Caminho não encontrado: ${specsPath}` }, 404)
          }

          // Inferir repoRoot via git
          let repoRoot: string
          try {
            repoRoot = execSync(`git -C "${normalizedPath}" rev-parse --show-toplevel`, {
              encoding: 'utf-8', timeout: 5000
            }).trim().replace(/\\/g, '/')
          } catch {
            return sendJson(res, { error: 'Não foi possível determinar o repositório git' }, 400)
          }

          // Extrair milestone do path (último segmento)
          const parts = normalizedPath.replace(/\/$/, '').split('/')
          const milestone = parts[parts.length - 1]

          // Derivar slug e nome
          const repoBasename = path.basename(repoRoot).toLowerCase().replace(/[^a-z0-9]/g, '')
          const suggestedSlug = `${repoBasename}-${milestone}--cc`
          const suggestedName = `${path.basename(repoRoot)} — ${milestone}`

          // Computar specs relativo ao workspace
          const specs = path.relative(repoRoot, normalizedPath).replace(/\\/g, '/')

          sendJson(res, {
            specsPath: normalizedPath,
            workspace: repoRoot,
            repoRoot,
            milestone,
            suggestedSlug,
            suggestedName,
            specs,
          })
        } catch (e: any) {
          sendJson(res, { error: e.message || 'Erro ao inferir' }, 500)
        }
      })

      // POST /api/harness/create
      server.middlewares.use('/api/harness/create', async (req, res, next) => {
        if (req.method !== 'POST') return next()
        const body = await readBody(req)
        try {
          const { slug, name, workspace, specs, harness: harnessType } = JSON.parse(body)
          if (!slug || !name || !workspace || !specs || !harnessType) {
            return sendJson(res, { error: 'slug, name, workspace, specs e harness são obrigatórios' }, 400)
          }

          const metaDir = path.resolve(runsDir, '.meta')
          const apiDir = path.join(metaDir, 'api')

          // Importar e chamar createProject
          const createProjectMod = await import(pathToFileURL(path.join(apiDir, 'create-project.mjs')).href)
          await createProjectMod.createProject({
            slug,
            name,
            workspace: workspace.replace(/\\/g, '/'),
            specs,
            harness: harnessType,
            force: true,
            format: 'structured',
            runsDir,
          })

          // Importar e chamar initWorkspace
          const initWorkspaceMod = await import(pathToFileURL(path.join(apiDir, 'init-workspace.mjs')).href)
          const result = await initWorkspaceMod.initWorkspace({
            slug,
            runsDir,
          })

          sendJson(res, {
            success: true,
            slug,
            workspace: result.workspace,
            artifacts_created: result.artifacts_created,
          })
        } catch (e: any) {
          sendJson(res, { error: e.message || 'Erro ao criar harness' }, 500)
        }
      })

      // POST /api/harness/setup
      server.middlewares.use('/api/harness/setup', async (req, res, next) => {
        if (req.method !== 'POST') return next()
        const body = await readBody(req)
        try {
          const { workspace } = JSON.parse(body)
          if (!workspace) return sendJson(res, { error: 'workspace é obrigatório' }, 400)

          const wsPath = workspace.replace(/\\/g, '/')
          const setupScript = path.join(wsPath, 'setup-harness.mjs')
          if (!fs.existsSync(setupScript)) {
            return sendJson(res, { error: `setup-harness.mjs não encontrado em ${wsPath}` }, 404)
          }

          // Arquivar .sessions existente se houver
          const sessionsDir = path.join(wsPath, '.sessions')
          if (fs.existsSync(sessionsDir)) {
            const historyDir = path.join(sessionsDir, '.history')
            fs.mkdirSync(historyDir, { recursive: true })
            const guid = Math.random().toString(36).slice(2, 10)
            const archiveDir = path.join(historyDir, guid)
            fs.mkdirSync(archiveDir, { recursive: true })
            try {
              const entries = fs.readdirSync(sessionsDir, { withFileTypes: true })
              for (const entry of entries) {
                if (entry.name === '.history') continue
                fs.renameSync(path.join(sessionsDir, entry.name), path.join(archiveDir, entry.name))
              }
            } catch { /* ok */ }
          }

          // Spawnar setup-harness.mjs --force
          const proc = spawn('node', [setupScript, '--force'], {
            cwd: wsPath,
            stdio: ['ignore', 'pipe', 'pipe'],
            shell: true,
          })

          let output = ''
          proc.stdout.on('data', (d: Buffer) => { output += d.toString() })
          proc.stderr.on('data', (d: Buffer) => { output += d.toString() })

          const exitCode = await new Promise<number>((resolve) => {
            proc.on('close', (code: number | null) => resolve(code ?? 1))
            proc.on('error', () => resolve(1))
          })

          sendJson(res, { success: exitCode === 0, output, exitCode })
        } catch (e: any) {
          sendJson(res, { error: e.message || 'Erro ao executar setup' }, 500)
        }
      })

      // POST /api/harness/start
      server.middlewares.use('/api/harness/start', async (req, res, next) => {
        if (req.method !== 'POST') return next()
        const body = await readBody(req)
        try {
          const { workspace } = JSON.parse(body)
          if (!workspace) return sendJson(res, { error: 'workspace é obrigatório' }, 400)

          const wsPath = workspace.replace(/\\/g, '/')
          const harnessScript = path.join(wsPath, 'agent-harness.mjs')
          if (!fs.existsSync(harnessScript)) {
            return sendJson(res, { error: `agent-harness.mjs não encontrado em ${wsPath}` }, 404)
          }

          // Remover .stop residual
          const stopFile = path.join(wsPath, '.stop')
          if (fs.existsSync(stopFile)) {
            fs.unlinkSync(stopFile)
          }

          // Preparar log
          const sessionsDir = path.join(wsPath, '.sessions')
          fs.mkdirSync(sessionsDir, { recursive: true })
          const logPath = path.join(sessionsDir, 'loop-output.log')
          const logFd = fs.openSync(logPath, 'a')

          // Spawnar detached
          const proc = spawn('node', [harnessScript], {
            cwd: wsPath,
            stdio: ['ignore', logFd, logFd],
            detached: true,
            shell: true,
          })

          proc.unref()
          const pid = proc.pid

          sendJson(res, {
            pid,
            workspace: wsPath,
            log: logPath,
            message: `Loop iniciado (PID ${pid})`,
          })
        } catch (e: any) {
          sendJson(res, { error: e.message || 'Erro ao iniciar loop' }, 500)
        }
      })

      // POST /api/harness/stop
      server.middlewares.use('/api/harness/stop', async (req, res, next) => {
        if (req.method !== 'POST') return next()
        const body = await readBody(req)
        try {
          const { workspace } = JSON.parse(body)
          if (!workspace) return sendJson(res, { error: 'workspace é obrigatório' }, 400)

          const wsPath = workspace.replace(/\\/g, '/')
          const stopFile = path.join(wsPath, '.stop')
          fs.writeFileSync(stopFile, new Date().toISOString(), 'utf-8')

          sendJson(res, { success: true, workspace: wsPath })
        } catch (e: any) {
          sendJson(res, { error: e.message || 'Erro ao parar loop' }, 500)
        }
      })

      // SPA fallback — serve index.html for non-API, non-file routes
      server.middlewares.use((req, res, next) => {
        if (!req.url) return next()
        const url = req.url.split('?')[0]
        // Skip API routes, assets, and HMR
        if (url.startsWith('/api/') || url.startsWith('/@') || url.startsWith('/node_modules/') || url.startsWith('/src/') || url.includes('.')) {
          return next()
        }
        // Rewrite to / so Vite serves index.html
        req.url = '/'
        next()
      })

      // GET /api/specs
      server.middlewares.use((req, res, next) => {
        if (req.method !== 'GET') return next()
        const url = new URL(req.url!, `http://${req.headers.host}`)
        const specsMatch = url.pathname.match(/^\/api\/specs(?:\/(.+))?$/)
        if (!specsMatch) return next()

        const config = readJsonSafe(path.join(ws(), 'agent-harness.json'))
        if (!config?.specs) return sendJson(res, { error: 'specs path não configurado' }, 404)

        let specsRoot = config.specs.replace(/\\/g, '/')
        // Resolve relative paths against workspace
        if (!path.isAbsolute(specsRoot)) {
          specsRoot = path.resolve(ws(), specsRoot)
        }
        const subPath = decodeURIComponent(specsMatch[1] || '')
        const targetPath = subPath ? path.join(specsRoot, subPath) : specsRoot

        if (!fs.existsSync(targetPath)) return sendJson(res, { error: 'Não encontrado' }, 404)
        const stat = fs.statSync(targetPath)

        if (stat.isFile()) {
          sendJson(res, { type: 'file', path: subPath || path.basename(targetPath), content: fs.readFileSync(targetPath, 'utf-8') })
        } else if (stat.isDirectory()) {
          const items = fs.readdirSync(targetPath, { withFileTypes: true })
            .filter(e => !e.name.startsWith('.'))
            .map(e => ({ name: e.name, type: e.isDirectory() ? 'directory' as const : 'file' as const, path: subPath ? `${subPath}/${e.name}` : e.name }))
            .sort((a, b) => { if (a.type !== b.type) return a.type === 'directory' ? -1 : 1; return a.name.localeCompare(b.name) })
          sendJson(res, { type: 'directory', path: subPath || '.', items })
        }
      })
    },
  }
}
