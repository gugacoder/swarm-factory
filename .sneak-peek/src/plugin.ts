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

// --- Harness (.harness/) helpers ---

interface HarnessPaths {
  session: string
  configPath: string
  featuresPath: string
  progressPath: string
  loopJsonPath: string
  runsDir: string
}

function resolveHarness(ws: string): HarnessPaths | null {
  const activePath = path.join(ws, '.harness', 'active')
  const session = readTextSafe(activePath).trim()
  if (!session) return null

  const sessionDir = path.join(ws, '.harness', session)
  if (!fs.existsSync(sessionDir)) return null

  return {
    session,
    configPath: path.join(sessionDir, 'config.json'),
    featuresPath: path.join(sessionDir, 'features.json'),
    progressPath: path.join(sessionDir, 'progress.txt'),
    loopJsonPath: path.join(sessionDir, 'loop.json'),
    runsDir: path.join(sessionDir, 'runs'),
  }
}

function detectLoopState(ws: string): { state: string; detail: any | null; alive: boolean; pid: number | null } {
  const hp = resolveHarness(ws)
  if (!hp) return { state: 'idle', detail: null, alive: false, pid: null }

  const loopState = readJsonSafe(hp.loopJsonPath)
  const pid = loopState?.pid ?? null
  const alive = pid ? checkPidAliveCached(pid) : false
  const stopping = fs.existsSync(path.join(ws, '.stop'))

  let state = 'idle'
  if (stopping && alive) state = 'stopping'
  else if (loopState?.status === 'running' && alive) state = 'running'
  else if (loopState?.status === 'between' && alive) state = 'between'
  else if (loopState?.status === 'completed' || loopState?.exit_reason === 'completed') state = 'completed'

  return { state, detail: loopState, alive, pid }
}

function isValidSessionId(sid: string): boolean {
  return /^[a-zA-Z0-9_.-]+$/.test(sid)
}

// --- Workspace Discovery with Cache ---
interface WorkspaceInfo {
  slug: string
  name: string
  workspace: string
  harness: string
  features: { total: number; passing: number }
  activeSession: string
}

const DISCOVER_TTL_MS = 5000
let discoverCache: { data: WorkspaceInfo[]; ts: number } | null = null

function discoverWorkspaces(runsDir: string): WorkspaceInfo[] {
  const now = Date.now()
  if (discoverCache && (now - discoverCache.ts) < DISCOVER_TTL_MS) return discoverCache.data

  const results = discoverWorkspacesRaw(runsDir)
  discoverCache = { data: results, ts: now }
  return results
}

function discoverWorkspacesRaw(runsDir: string): WorkspaceInfo[] {
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
        const wsPath = resolveWorkspacePath(runsDir, config.workspace)
        if (!wsPath || !fs.existsSync(wsPath)) continue
        // Must have .harness/active
        if (!fs.existsSync(path.join(wsPath, '.harness', 'active'))) continue

        const hp = resolveHarness(wsPath)
        const activeSession = hp?.session || ''
        const featuresRaw = hp ? readJsonSafe(hp.featuresPath) : null
        const features = Array.isArray(featuresRaw) ? featuresRaw : (featuresRaw?.features ?? [])
        const passing = features.filter((f: any) => f.status === 'passing').length

        results.push({
          slug: config.slug || entry.replace('.json', ''),
          name: config.name || config.slug || entry.replace('.json', ''),
          workspace: wsPath,
          harness: config.agent?.harness || 'unknown',
          features: { total: features.length, passing },
          activeSession,
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
        const wsPath = resolveWorkspacePath(runsDir, config.workspace)
        if (!wsPath || !fs.existsSync(wsPath)) continue
        // Must have .harness/active
        if (!fs.existsSync(path.join(wsPath, '.harness', 'active'))) continue
        if (results.some(r => r.workspace === wsPath)) continue

        const hp = resolveHarness(wsPath)
        const activeSession = hp?.session || ''
        const featuresRaw = hp ? readJsonSafe(hp.featuresPath) : null
        const features = Array.isArray(featuresRaw) ? featuresRaw : (featuresRaw?.features ?? [])
        const passing = features.filter((f: any) => f.status === 'passing').length

        results.push({
          slug: config.slug || entry.name,
          name: config.name || config.slug || entry.name,
          workspace: wsPath,
          harness: config.agent?.harness || 'unknown',
          features: { total: features.length, passing },
          activeSession,
        })
      } catch { /* skip */ }
    }
  } catch { /* ok */ }

  return results
}

// --- Slug Resolution ---
function resolveWorkspacePath(runsDir: string, rawWorkspace: string): string {
  const normalized = (rawWorkspace || '').replace(/\\/g, '/')
  if (!normalized) return ''
  if (!path.isAbsolute(normalized)) {
    return path.resolve(runsDir, normalized).replace(/\\/g, '/')
  }
  return normalized
}

function resolveSlug(runsDir: string, slug: string): { config: any; workspace: string } | null {
  // Structured: runs/{slug}/project.json
  let projPath = path.join(runsDir, slug, 'project.json')
  if (fs.existsSync(projPath)) {
    const config = JSON.parse(fs.readFileSync(projPath, 'utf-8'))
    return { config, workspace: resolveWorkspacePath(runsDir, config.workspace) }
  }
  // Flat: runs/{slug}.json
  projPath = path.join(runsDir, `${slug}.json`)
  if (fs.existsSync(projPath)) {
    const config = JSON.parse(fs.readFileSync(projPath, 'utf-8'))
    return { config, workspace: resolveWorkspacePath(runsDir, config.workspace) }
  }
  // Fallback: search discovered workspaces
  const workspaces = discoverWorkspaces(runsDir)
  const match = workspaces.find(w => w.slug === slug)
  if (match) return { config: { slug: match.slug, name: match.name, workspace: match.workspace }, workspace: match.workspace }
  return null
}

// --- Harness Session Discovery ---
const HARNESS_INTERNAL = new Set(['scripts', 'active', 'prompt.md', 'learnings.md'])

function listHarnessSessions(ws: string): { sessions: any[]; active: string } {
  const harnessDir = path.join(ws, '.harness')
  const activeSession = readTextSafe(path.join(harnessDir, 'active')).trim()

  if (!fs.existsSync(harnessDir)) return { sessions: [], active: '' }

  const sessions: any[] = []
  try {
    const entries = fs.readdirSync(harnessDir, { withFileTypes: true })
    for (const entry of entries) {
      if (!entry.isDirectory()) continue
      if (HARNESS_INTERNAL.has(entry.name)) continue
      const sessionDir = path.join(harnessDir, entry.name)
      const featuresRaw = readJsonSafe(path.join(sessionDir, 'features.json'))
      const features = Array.isArray(featuresRaw) ? featuresRaw : (featuresRaw?.features ?? [])
      const passing = features.filter((f: any) => f.status === 'passing').length

      sessions.push({
        name: entry.name,
        isActive: entry.name === activeSession,
        hasFeatures: features.length > 0,
        featuresCount: features.length,
        featuresPassingCount: passing,
      })
    }
  } catch { /* ok */ }

  return { sessions, active: activeSession }
}

// --- SSE Helpers ---
function sendSSE(res: any, event: { type: string; [k: string]: any }) {
  res.write(`data: ${JSON.stringify(event)}\n\n`)
}

function setupSSE(res: any) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  })
}

export function sneakPeekPlugin(defaultWorkspace: string, runsDir: string): Plugin {
  let activeWorkspace = process.env.WORKSPACE || defaultWorkspace

  return {
    name: 'sneak-peek-api',
    configureServer(server) {
      // Helper: resolve workspace from slug query param or fallback to activeWorkspace
      const wsFromReq = (req: any): string => {
        const url = new URL(req.url!, `http://${req.headers.host}`)
        const slug = url.searchParams.get('slug')
        if (slug) {
          const resolved = resolveSlug(runsDir, slug)
          if (resolved) return resolved.workspace
        }
        return activeWorkspace
      }

      // GET /api/workspaces — list available workspaces
      server.middlewares.use('/api/workspaces', (req, res, next) => {
        if (req.method !== 'GET') return next()
        const workspaces = discoverWorkspaces(runsDir)
        sendJson(res, { workspaces, active: activeWorkspace })
      })

      // GET /api/config — read .harness/{session}/config.json
      server.middlewares.use('/api/config', (req, res, next) => {
        if (req.method !== 'GET') return next()
        const ws = wsFromReq(req)
        const hp = resolveHarness(ws)
        if (!hp) return sendJson(res, { error: '.harness/active não encontrado' }, 404)
        const config = readJsonSafe(hp.configPath)
        if (!config) return sendJson(res, { error: 'config.json não encontrado' }, 404)
        sendJson(res, { config })
      })

      // GET /api/state — loop state from loop.json
      server.middlewares.use('/api/state', (req, res, next) => {
        if (req.method !== 'GET') return next()
        const ws = wsFromReq(req)
        const { state, detail, alive, pid } = detectLoopState(ws)
        sendJson(res, { state, detail, pid, alive })
      })

      // GET /api/features — read .harness/{session}/features.json
      server.middlewares.use('/api/features', (req, res, next) => {
        if (req.method !== 'GET') return next()
        const ws = wsFromReq(req)
        const hp = resolveHarness(ws)
        const raw = hp ? readJsonSafe(hp.featuresPath) : null
        const features = Array.isArray(raw) ? raw : (raw?.features ?? [])
        const summary: Record<string, number> = {}
        for (const f of features) { summary[f.status] = (summary[f.status] || 0) + 1 }
        sendJson(res, { features, summary, total: features.length })
      })

      // GET /api/progress — read .harness/{session}/progress.txt
      server.middlewares.use('/api/progress', (req, res, next) => {
        if (req.method !== 'GET') return next()
        const ws = wsFromReq(req)
        const hp = resolveHarness(ws)
        const url = new URL(req.url!, `http://${req.headers.host}`)
        const lines = parseInt(url.searchParams.get('lines') || '200', 10)
        const progressPath = hp?.progressPath || path.join(ws, '.harness', 'unknown', 'progress.txt')
        try {
          const content = fs.readFileSync(progressPath, 'utf-8')
          const allLines = content.split('\n')
          sendJson(res, { text: lines > 0 ? allLines.slice(-lines).join('\n') : content, total_lines: allLines.length })
        } catch {
          sendJson(res, { text: '', total_lines: 0 })
        }
      })

      // GET /api/sessions — list feature runs from .harness/{session}/runs/*.json
      server.middlewares.use((req, res, next) => {
        if (req.method !== 'GET') return next()
        const url = new URL(req.url!, `http://${req.headers.host}`)
        if (url.pathname !== '/api/sessions') return next()

        const ws = wsFromReq(req)
        const hp = resolveHarness(ws)
        if (!hp) return sendJson(res, { sessions: [] })

        const featureRunsDir = hp.runsDir
        if (!fs.existsSync(featureRunsDir)) return sendJson(res, { sessions: [] })

        // Read loop.json for current feature
        const loopState = readJsonSafe(hp.loopJsonPath)
        const currentFeatureId = loopState?.feature_id || ''

        const sessions: any[] = []
        try {
          const entries = fs.readdirSync(featureRunsDir).filter(e => e.endsWith('.json') && !e.endsWith('.jsonl'))
          for (const entry of entries) {
            const metaPath = path.join(featureRunsDir, entry)
            const meta = readJsonSafe(metaPath)
            if (!meta) continue

            const featureId = entry.replace('.json', '')
            const jsonlPath = path.join(featureRunsDir, `${featureId}.jsonl`)
            let outputBytes = 0
            try { outputBytes = fs.statSync(jsonlPath).size } catch { /* ok */ }

            let metrics: SessionMetrics | null = null
            if (meta.finished_at && outputBytes > 0) {
              metrics = readJsonlTailWithMetrics(jsonlPath, 5).metrics
            }

            sessions.push({
              id: featureId,
              pid: meta.pid ?? null,
              alive: meta.pid ? checkPidAliveCached(meta.pid) : false,
              started_at: meta.started_at ?? null,
              finished_at: meta.finished_at ?? null,
              output_bytes: outputBytes,
              is_current: featureId === currentFeatureId,
              metrics,
              exit_code: meta.exit_code ?? null,
              retries: meta.retries ?? null,
            })
          }
        } catch { /* ok */ }

        sessions.sort((a, b) => {
          if (a.is_current && !b.is_current) return -1
          if (!a.is_current && b.is_current) return 1
          return (a.started_at || '').localeCompare(b.started_at || '')
        })
        sendJson(res, { sessions })
      })

      // GET /api/sessions/:sid/output — read .harness/{session}/runs/{sid}.jsonl
      server.middlewares.use((req, res, next) => {
        const url = new URL(req.url!, `http://${req.headers.host}`)
        const match = url.pathname.match(/^\/api\/sessions\/([^/]+)\/output$/)
        if (!match || req.method !== 'GET') return next()
        const sid = match[1]
        if (!isValidSessionId(sid)) return sendJson(res, { error: 'ID de sessão inválido' }, 400)

        const ws = wsFromReq(req)
        const hp = resolveHarness(ws)
        if (!hp) return sendJson(res, { error: '.harness/active não encontrado' }, 404)

        const tail = parseInt(url.searchParams.get('tail') || '50', 10)
        const sinceByte = url.searchParams.get('since_byte')
        const outputPath = path.join(hp.runsDir, `${sid}.jsonl`)

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

          // Se o caminho aponta para um arquivo, usa o diretório pai
          const stat = fs.statSync(normalizedPath)
          const specsDir = stat.isFile()
            ? path.dirname(normalizedPath).replace(/\\/g, '/')
            : normalizedPath

          const parts = specsDir.replace(/\/$/, '').split('/')
          const milestone = parts[parts.length - 1]

          let repoRoot: string | null = null
          try {
            repoRoot = execSync(`git -C "${specsDir}" rev-parse --show-toplevel`, {
              encoding: 'utf-8', timeout: 5000
            }).trim().replace(/\\/g, '/')
          } catch { /* git não disponível — continua */ }

          const baseDir = repoRoot || path.dirname(specsDir).replace(/\\/g, '/')
          const repoBasename = path.basename(baseDir).toLowerCase().replace(/[^a-z0-9]/g, '')
          const suggestedSlug = `${repoBasename}-${milestone}--cc`
          const suggestedName = `${path.basename(baseDir)} — ${milestone}`
          const specs = repoRoot
            ? path.relative(repoRoot, specsDir).replace(/\\/g, '/')
            : specsDir

          sendJson(res, {
            specsPath: normalizedPath,
            workspace: repoRoot || '',
            repoRoot: repoRoot || '',
            milestone,
            suggestedSlug,
            suggestedName,
            specs,
          })
        } catch (e: any) {
          sendJson(res, { error: e.message || 'Erro ao inferir' }, 500)
        }
      })

      // POST /api/runs/create — only creates project.json (no init)
      server.middlewares.use('/api/runs/create', async (req, res, next) => {
        if (req.method !== 'POST') return next()
        const body = await readBody(req)
        try {
          const { slug, name, workspace, specs, harness: harnessType } = JSON.parse(body)
          if (!slug || !name || !workspace || !specs || !harnessType) {
            return sendJson(res, { error: 'slug, name, workspace, specs e harness são obrigatórios' }, 400)
          }

          const metaDir = path.resolve(runsDir, '.meta')
          const script = path.join(metaDir, 'api', 'create-project.mjs')

          const result = await new Promise<string>((resolve, reject) => {
            const args = [
              script,
              '--slug', slug,
              '--name', name,
              '--workspace', workspace.replace(/\\/g, '/'),
              '--specs', specs,
              '--harness', harnessType,
              '--format', 'structured',
            ]
            const proc = spawn(process.execPath, args, {
              cwd: runsDir,
              stdio: ['ignore', 'pipe', 'pipe'],
              env: { ...process.env, RUNS_DIR: runsDir },
            })
            let stdout = ''
            let stderr = ''
            proc.stdout.on('data', (d: Buffer) => { stdout += d.toString() })
            proc.stderr.on('data', (d: Buffer) => { stderr += d.toString() })
            proc.on('close', (code: number | null) => {
              if (code === 0) resolve(stdout)
              else reject(new Error(stderr.trim() || `Saiu com código ${code}`))
            })
            proc.on('error', reject)
          })

          discoverCache = null

          sendJson(res, { success: true, slug })
        } catch (e: any) {
          sendJson(res, { error: e.message || 'Erro ao criar run' }, 500)
        }
      })

      // GET /api/runs/:slug/create-stream — SSE: cria .harness/ no workspace do milestone
      server.middlewares.use((req, res, next) => {
        const url = new URL(req.url!, `http://${req.headers.host}`)
        const match = url.pathname.match(/^\/api\/runs\/([^/]+)\/create-stream$/)
        if (!match || req.method !== 'GET') return next()

        const slug = match[1]

        const resolved = resolveSlug(runsDir, slug)
        if (!resolved) {
          sendJson(res, { error: `Slug "${slug}" não encontrado` }, 404)
          return
        }

        setupSSE(res)
        sendSSE(res, { type: 'log', text: `Criando .harness/ para ${slug}...` })

        const metaDir = path.resolve(runsDir, '.meta')
        const script = path.join(metaDir, 'api', 'init-workspace.mjs')

        const proc = spawn(process.execPath, [script, '--slug', slug, '--runs-dir', runsDir], {
          cwd: runsDir,
          stdio: ['ignore', 'pipe', 'pipe'],
        })

        proc.stdout.on('data', (d: Buffer) => {
          const text = d.toString().trim()
          if (text) sendSSE(res, { type: 'log', text })
        })
        proc.stderr.on('data', (d: Buffer) => {
          const text = d.toString().trim()
          if (text) sendSSE(res, { type: 'log', text })
        })

        proc.on('close', (code: number | null) => {
          discoverCache = null
          if (code === 0) {
            sendSSE(res, { type: 'done', exitCode: 0 })
          } else {
            sendSSE(res, { type: 'error', error: `Criação falhou com código ${code ?? 1}` })
          }
          res.end()
        })

        proc.on('error', (err) => {
          sendSSE(res, { type: 'error', error: err.message })
          res.end()
        })
      })

      // GET /api/runs/:slug/initialize-stream — SSE: executa initialize-harness (gera features.json)
      server.middlewares.use((req, res, next) => {
        const url = new URL(req.url!, `http://${req.headers.host}`)
        const match = url.pathname.match(/^\/api\/runs\/([^/]+)\/initialize-stream$/)
        if (!match || req.method !== 'GET') return next()

        const slug = match[1]
        const resolved = resolveSlug(runsDir, slug)
        if (!resolved) {
          sendJson(res, { error: `Slug "${slug}" não encontrado` }, 404)
          return
        }

        const wsPath = resolved.workspace
        const hp = resolveHarness(wsPath)
        if (!hp) {
          sendJson(res, { error: `.harness/active não encontrado em ${wsPath}` }, 404)
          return
        }

        // Resolve initialize-harness.mjs
        const config = readJsonSafe(hp.configPath)
        const harnessType = config?.agent?.harness || resolved.config?.agent?.harness || 'claude-code'
        const harnessDir = path.resolve(runsDir, '.meta', 'harnesses', harnessType)
        const initScript = path.join(harnessDir, 'initialize-harness.mjs')
        if (!fs.existsSync(initScript)) {
          sendJson(res, { error: `initialize-harness.mjs não encontrado para harness "${harnessType}"` }, 404)
          return
        }

        setupSSE(res)
        sendSSE(res, { type: 'log', text: `Inicializando ${slug} (session: ${hp.session})...` })

        // Limpar features e progress antes de executar
        try {
          fs.writeFileSync(hp.featuresPath, '[]', 'utf-8')
          fs.writeFileSync(hp.progressPath, '', 'utf-8')
          sendSSE(res, { type: 'log', text: 'features.json e progress resetados.' })
        } catch { /* ok */ }

        const proc = spawn('node', [initScript, '--force'], {
          cwd: wsPath,
          stdio: ['ignore', 'pipe', 'pipe'],
          shell: true,
        })

        proc.stdout.on('data', (d: Buffer) => {
          const text = d.toString().trim()
          if (text) sendSSE(res, { type: 'log', text })
        })
        proc.stderr.on('data', (d: Buffer) => {
          const text = d.toString().trim()
          if (text) sendSSE(res, { type: 'log', text })
        })

        proc.on('close', (code: number | null) => {
          discoverCache = null
          if (code === 0) {
            sendSSE(res, { type: 'done', exitCode: 0 })
          } else {
            sendSSE(res, { type: 'error', error: `Inicialização falhou com código ${code ?? 1}` })
          }
          res.end()
        })

        proc.on('error', (err) => {
          sendSSE(res, { type: 'error', error: err.message })
          res.end()
        })
      })

      // POST /api/harness/start — spawn .harness/scripts/loop.mjs
      server.middlewares.use('/api/harness/start', async (req, res, next) => {
        if (req.method !== 'POST') return next()
        const body = await readBody(req)
        try {
          const parsed = JSON.parse(body)
          let wsPath: string

          if (parsed.slug) {
            const resolved = resolveSlug(runsDir, parsed.slug)
            if (!resolved) return sendJson(res, { error: `Slug "${parsed.slug}" não encontrado` }, 404)
            wsPath = resolved.workspace
          } else if (parsed.workspace) {
            wsPath = parsed.workspace.replace(/\\/g, '/')
          } else {
            return sendJson(res, { error: 'workspace ou slug é obrigatório' }, 400)
          }

          const hp = resolveHarness(wsPath)
          if (!hp) return sendJson(res, { error: '.harness/active não encontrado' }, 404)

          const loopScript = path.join(wsPath, '.harness', 'scripts', 'loop.mjs')
          if (!fs.existsSync(loopScript)) {
            return sendJson(res, { error: `loop.mjs não encontrado em ${wsPath}/.harness/scripts/` }, 404)
          }

          // Check if already running via loop.json PID
          const existingLoop = readJsonSafe(hp.loopJsonPath)
          const existingPid = existingLoop?.pid ?? null
          if (existingPid && checkPidAliveCached(existingPid)) {
            return sendJson(res, { error: `Loop já está rodando (PID ${existingPid})` }, 409)
          }

          // Remove stale .stop file
          const stopFile = path.join(wsPath, '.stop')
          if (fs.existsSync(stopFile)) {
            fs.unlinkSync(stopFile)
          }

          // Log to .harness/{session}/loop-output.log
          const logPath = path.join(wsPath, '.harness', hp.session, 'loop-output.log')
          const logFd = fs.openSync(logPath, 'a')

          // Spawn loop.mjs with session arg
          const proc = spawn(process.execPath, [loopScript, hp.session], {
            cwd: wsPath,
            stdio: ['ignore', logFd, logFd],
            detached: true,
            windowsHide: true,
          })

          const pid = proc.pid
          proc.unref()
          fs.closeSync(logFd)

          // Invalidate PID cache
          if (pid) pidCache.delete(pid)

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

      // POST /api/harness/stop — read PID from loop.json + .stop + signal
      server.middlewares.use('/api/harness/stop', async (req, res, next) => {
        if (req.method !== 'POST') return next()
        const body = await readBody(req)
        try {
          const parsed = JSON.parse(body)
          let wsPath: string

          if (parsed.slug) {
            const resolved = resolveSlug(runsDir, parsed.slug)
            if (!resolved) return sendJson(res, { error: `Slug "${parsed.slug}" não encontrado` }, 404)
            wsPath = resolved.workspace
          } else if (parsed.workspace) {
            wsPath = parsed.workspace.replace(/\\/g, '/')
          } else {
            return sendJson(res, { error: 'workspace ou slug é obrigatório' }, 400)
          }

          // Write .stop file for graceful shutdown
          const stopFile = path.join(wsPath, '.stop')
          fs.writeFileSync(stopFile, new Date().toISOString(), 'utf-8')

          // Read PID from loop.json
          const hp = resolveHarness(wsPath)
          const loopState = hp ? readJsonSafe(hp.loopJsonPath) : null
          const pid = loopState?.pid ?? null
          let signalSent = false

          if (pid) {
            try {
              if (IS_WIN) {
                execSync(`taskkill /PID ${pid} /T /F`, { timeout: 5000, stdio: 'ignore' })
                signalSent = true
              } else {
                process.kill(pid, 'SIGTERM')
                signalSent = true
              }
            } catch { /* process may already be gone */ }
            pidCache.delete(pid)
          }

          sendJson(res, { success: true, workspace: wsPath, pid, signalSent })
        } catch (e: any) {
          sendJson(res, { error: e.message || 'Erro ao parar loop' }, 500)
        }
      })

      // GET /api/harness/sessions — list all sessions in .harness/
      server.middlewares.use('/api/harness/sessions', (req, res, next) => {
        if (req.method !== 'GET') return next()
        const ws = wsFromReq(req)
        const result = listHarnessSessions(ws)
        sendJson(res, result)
      })

      // POST /api/harness/sessions/switch — switch active session
      server.middlewares.use('/api/harness/sessions/switch', async (req, res, next) => {
        if (req.method !== 'POST') return next()
        const body = await readBody(req)
        try {
          const { slug, session } = JSON.parse(body)
          let wsPath: string

          if (slug) {
            const resolved = resolveSlug(runsDir, slug)
            if (!resolved) return sendJson(res, { error: `Slug "${slug}" não encontrado` }, 404)
            wsPath = resolved.workspace
          } else {
            wsPath = activeWorkspace
          }

          const sessionDir = path.join(wsPath, '.harness', session)
          if (!fs.existsSync(sessionDir)) {
            return sendJson(res, { error: `Session "${session}" não encontrada em .harness/` }, 404)
          }

          fs.writeFileSync(path.join(wsPath, '.harness', 'active'), session, 'utf-8')
          discoverCache = null

          sendJson(res, { success: true, session })
        } catch (e: any) {
          sendJson(res, { error: e.message || 'Erro ao trocar session' }, 500)
        }
      })

      // GET /api/runs/:slug/status — quick check if workspace exists and has .harness/
      server.middlewares.use((req, res, next) => {
        const url = new URL(req.url!, `http://${req.headers.host}`)
        const match = url.pathname.match(/^\/api\/runs\/([^/]+)\/status$/)
        if (!match || req.method !== 'GET') return next()

        const slug = match[1]
        const resolved = resolveSlug(runsDir, slug)
        if (!resolved) return sendJson(res, { exists: false, slug })

        const wsPath = resolved.workspace
        const wsExists = fs.existsSync(wsPath)
        const hasHarness = wsExists && fs.existsSync(path.join(wsPath, '.harness', 'active'))
        const hp = hasHarness ? resolveHarness(wsPath) : null
        const featuresRaw = hp ? readJsonSafe(hp.featuresPath) : null
        const features = featuresRaw ? (Array.isArray(featuresRaw) ? featuresRaw : (featuresRaw?.features ?? [])) : []

        // Detectar se já executou: runs/ tem arquivos .json
        let hasRuns = false
        if (hp) {
          try {
            const runEntries = fs.readdirSync(hp.runsDir)
            hasRuns = runEntries.some(e => e.endsWith('.json'))
          } catch { /* runs/ pode não existir */ }
        }

        // Fase do run: pending → created → initialized → executed
        let phase: 'pending' | 'created' | 'initialized' | 'executed' = 'pending'
        if (hasRuns) phase = 'executed'
        else if (features.length > 0) phase = 'initialized'
        else if (hasHarness) phase = 'created'

        sendJson(res, {
          exists: true,
          slug,
          workspace: wsPath,
          workspace_exists: wsExists,
          has_harness: hasHarness,
          phase,
          features_count: features.length,
          features_passing: features.filter((f: any) => f.status === 'passing').length,
        })
      })

      // SPA fallback — serve index.html for non-API, non-file routes
      server.middlewares.use((req, res, next) => {
        if (!req.url) return next()
        const url = req.url.split('?')[0]
        if (url.startsWith('/api/') || url.startsWith('/@') || url.startsWith('/node_modules/') || url.startsWith('/src/') || url.includes('.')) {
          return next()
        }
        req.url = '/'
        next()
      })

      // GET /api/specs — read specs from config
      server.middlewares.use((req, res, next) => {
        if (req.method !== 'GET') return next()
        const url = new URL(req.url!, `http://${req.headers.host}`)
        const specsMatch = url.pathname.match(/^\/api\/specs(?:\/(.+))?$/)
        if (!specsMatch) return next()

        const ws = wsFromReq(req)
        const hp = resolveHarness(ws)
        const config = hp ? readJsonSafe(hp.configPath) : null
        if (!config?.specs) return sendJson(res, { error: 'specs path não configurado' }, 404)

        let specsRoot = config.specs.replace(/\\/g, '/')
        if (!path.isAbsolute(specsRoot)) {
          specsRoot = path.resolve(ws, specsRoot)
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
