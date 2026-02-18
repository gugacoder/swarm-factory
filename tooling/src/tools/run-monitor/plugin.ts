import { Plugin } from 'vite'
import path from 'path'
import fs from 'fs'
import os from 'os'
import { execSync, spawn } from 'child_process'
import type { LoopState, RunConfig, JsonlEvent, SessionMetrics } from './lib/types'

interface RawFeature {
  id: string
  name?: string
  title?: string
  status: string
  priority?: number
  completed_at?: string
  dependencies?: string[]
  description?: string
  tests?: any[]
  prp_path?: string
}

interface LoopStateFile {
  status: string
  iteration: number
  max_iterations: number
  total: number
  done: number
  remaining: number
  feature_id: string
  started_at: string
  updated_at: string
  exit_reason: string
}

function readLoopState(runPath: string): LoopStateFile | null {
  try {
    return JSON.parse(fs.readFileSync(path.join(runPath, 'agent-harness.state'), 'utf-8'))
  } catch {
    return null
  }
}

interface HarnessJson {
  run: string
  project: string
  milestone: string
  planning_path: string
  harness: string
  factory: string
}

function readHarnessJson(runPath: string): HarnessJson | null {
  try {
    return JSON.parse(fs.readFileSync(path.join(runPath, 'agent-harness.json'), 'utf-8'))
  } catch {
    return null
  }
}

function parseFeatures(filePath: string): RawFeature[] {
  try {
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    // Suporta ambos formatos: array direto ou { features: [...] }
    return Array.isArray(raw) ? raw : (raw.features ?? [])
  } catch {
    return []
  }
}

interface ResolvedRun {
  config: RunConfig
  workspacePath: string
}

/** Spawna processo independente sem janela (Windows: wscript+VBS, Unix: detached) */
function spawnDetached(command: string, args: string[], options: { cwd: string; env?: NodeJS.ProcessEnv; stdio?: any }) {
  if (process.platform === 'win32') {
    const vbsPath = path.join(os.tmpdir(), 'swarm-run-hidden.vbs')
    if (!fs.existsSync(vbsPath)) {
      fs.writeFileSync(vbsPath, 'CreateObject("Wscript.Shell").Run WScript.Arguments(0), 0, False\n')
    }
    const fullCmd = [command, ...args].map(a => a.includes(' ') ? `"${a}"` : a).join(' ')
    spawn('wscript.exe', [vbsPath, fullCmd], { cwd: options.cwd, env: options.env, stdio: 'ignore' })
    return { pid: undefined }
  }
  const child = spawn(command, args, { ...options, detached: true })
  child.unref()
  return { pid: child.pid }
}

function discoverRuns(runsDir: string): ResolvedRun[] {
  if (!fs.existsSync(runsDir)) return []

  const results: ResolvedRun[] = []
  const entries = fs.readdirSync(runsDir)

  for (const entry of entries) {
    if (!entry.endsWith('.json')) continue
    const filePath = path.join(runsDir, entry)
    try {
      const stat = fs.statSync(filePath)
      if (!stat.isFile()) continue
      const config: RunConfig = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
      const workspacePath = path.isAbsolute(config.location)
        ? config.location
        : path.resolve(runsDir, config.location)
      if (!fs.existsSync(workspacePath)) continue
      results.push({ config, workspacePath })
    } catch {
      // Skip invalid JSON files
    }
  }

  return results
}

function resolveRun(runsDir: string, runId: string): ResolvedRun | null {
  const filePath = path.join(runsDir, `${runId}.json`)
  try {
    const config: RunConfig = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    const workspacePath = path.isAbsolute(config.location)
      ? config.location
      : path.resolve(runsDir, config.location)
    if (!fs.existsSync(workspacePath)) return null
    return { config, workspacePath }
  } catch {
    return null
  }
}

function readProgress(runPath: string, lines: number = 50): { text: string; total_lines: number } {
  const progressPath = path.join(runPath, 'agent-progress.txt')
  try {
    const content = fs.readFileSync(progressPath, 'utf-8')
    const allLines = content.split('\n')
    const total_lines = allLines.length
    return { text: allLines.slice(-lines).join('\n'), total_lines }
  } catch {
    return { text: '', total_lines: 0 }
  }
}

const IS_WIN = process.platform === 'win32'

function isValidSessionId(sid: string): boolean {
  return /^[a-zA-Z0-9_-]+$/.test(sid)
}

// --- PID Cache ---
const PID_TTL_MS = 8000

interface PidCacheEntry {
  alive: boolean
  info: ProcessInfo
  checkedAt: number
}

const pidCache = new Map<number, PidCacheEntry>()

function checkPidAliveCached(pid: number): boolean {
  const now = Date.now()
  const cached = pidCache.get(pid)
  if (cached && (now - cached.checkedAt) < PID_TTL_MS) {
    return cached.alive
  }
  const alive = checkPidAliveRaw(pid)
  pidCache.set(pid, { alive, info: { alive }, checkedAt: now })
  return alive
}

function getProcessInfoCached(pid: number): ProcessInfo {
  const now = Date.now()
  const cached = pidCache.get(pid)
  if (cached && (now - cached.checkedAt) < PID_TTL_MS) {
    return cached.info
  }
  const info = getProcessInfoRaw(pid)
  pidCache.set(pid, { alive: info.alive, info, checkedAt: now })
  return info
}

function evictExpiredPids(): void {
  const now = Date.now()
  for (const [pid, entry] of pidCache) {
    if ((now - entry.checkedAt) >= PID_TTL_MS) {
      pidCache.delete(pid)
    }
  }
}

function checkPidAliveRaw(pid: number): boolean {
  try {
    process.kill(pid, 0)
    return true
  } catch (e: any) {
    if (e.code === 'EPERM') return true
    if (IS_WIN && e.code === 'ESRCH') {
      // Fallback 1: tasklist (Windows PIDs)
      try {
        const out = execSync(`tasklist /FI "PID eq ${pid}" /NH`, { encoding: 'utf-8', timeout: 3000 })
        if (out.includes(String(pid))) return true
      } catch { /* continue */ }
      // Fallback 2: ps -p (MSYS PIDs)
      try {
        const out = execSync(`ps -p ${pid}`, { encoding: 'utf-8', timeout: 3000 })
        return out.trim().split('\n').length >= 2
      } catch { /* not found */ }
    }
    return false
  }
}

interface ProcessInfo {
  alive: boolean
  stime?: string
  command?: string
  winpid?: number
}

function getProcessInfoRaw(pid: number): ProcessInfo {
  // Try ps -p first (works for MSYS PIDs and returns extra info)
  try {
    const out = execSync(`ps -p ${pid}`, { encoding: 'utf-8', timeout: 3000 })
    const lines = out.trim().split('\n')
    if (lines.length >= 2) {
      // Colunas: PID PPID PGID WINPID TTY UID STIME COMMAND
      const parts = lines[1].trim().split(/\s+/)
      if (parts.length >= 8) {
        return {
          alive: true,
          winpid: parseInt(parts[3], 10) || undefined,
          stime: parts[6],
          command: parts.slice(7).join(' '),
        }
      }
      return { alive: true }
    }
  } catch { /* not found via ps */ }

  // Fallback: check via process.kill / tasklist (no extra info)
  const alive = checkPidAliveRaw(pid)
  return { alive }
}

function parseChecklist(content: string): { total: number; checked: number } {
  const matches = content.match(/^- \[([ x])\]/gm) ?? []
  const total = matches.length
  const checked = matches.filter(m => m.includes('[x]')).length
  return { total, checked }
}

function readOutputTail(filePath: string, maxLines: number): { lines: string[]; total_bytes: number; total_lines: number; truncated: boolean } {
  try {
    const stat = fs.statSync(filePath)
    const fileSize = stat.size
    if (fileSize === 0) {
      return { lines: [], total_bytes: 0, total_lines: 0, truncated: false }
    }

    const fd = fs.openSync(filePath, 'r')
    try {
      let chunkSize = 64 * 1024
      let resultLines: string[] = []
      let readAll = false

      while (true) {
        const position = Math.max(0, fileSize - chunkSize)
        const readSize = Math.min(chunkSize, fileSize)
        const buffer = Buffer.alloc(readSize)
        fs.readSync(fd, buffer, 0, readSize, position)
        const text = buffer.toString('utf-8')
        resultLines = text.split('\n')
        // Remove trailing empty line from split
        if (resultLines.length > 0 && resultLines[resultLines.length - 1] === '') resultLines.pop()

        if (position > 0 && resultLines.length > 0) {
          resultLines.shift() // discard partial first line
        } else {
          readAll = true
        }

        if (resultLines.length >= maxLines || readAll) break

        chunkSize *= 2
        if (chunkSize >= fileSize) chunkSize = fileSize
      }

      // Count total lines via newline scan if not read all
      let totalLines: number
      if (readAll) {
        totalLines = resultLines.length
      } else {
        totalLines = 0
        const scanBuf = Buffer.alloc(256 * 1024)
        let pos = 0
        while (pos < fileSize) {
          const n = fs.readSync(fd, scanBuf, 0, Math.min(scanBuf.length, fileSize - pos), pos)
          for (let i = 0; i < n; i++) if (scanBuf[i] === 0x0A) totalLines++
          pos += n
        }
      }

      const truncated = resultLines.length > maxLines
      const finalLines = truncated ? resultLines.slice(-maxLines) : resultLines
      return { lines: finalLines, total_bytes: fileSize, total_lines: totalLines, truncated }
    } finally {
      fs.closeSync(fd)
    }
  } catch {
    return { lines: [], total_bytes: 0, total_lines: 0, truncated: false }
  }
}

function resolveOutputPath(sessionPath: string): { path: string; isJsonl: boolean } {
  const jsonlPath = path.join(sessionPath, 'output.jsonl')
  const txtPath = path.join(sessionPath, 'output.txt')
  if (fs.existsSync(jsonlPath)) return { path: jsonlPath, isJsonl: true }
  return { path: txtPath, isJsonl: false }
}

interface JsonlTailResult {
  events: JsonlEvent[]
  total_bytes: number
  total_events: number
  truncated: boolean
  metrics: SessionMetrics | null
  append?: boolean
}

function extractMetricsFromFd(fd: number, fileSize: number, tailEvents: JsonlEvent[]): SessionMetrics | null {
  const metrics: SessionMetrics = {
    cost_usd: null,
    duration_ms: null,
    turns: null,
    model: null,
  }

  // Extract from last event in tail (result event, Codex turn.completed, or OpenCode step_finish)
  if (tailEvents.length > 0) {
    const last = tailEvents[tailEvents.length - 1]
    if (last.type === 'result') {
      metrics.cost_usd = (last as any).cost_usd ?? null
      metrics.duration_ms = (last as any).duration_ms ?? null
      metrics.turns = (last as any).turns ?? null
    } else if (last.type === 'turn.completed') {
      const usage = (last as any).usage
      if (usage) {
        metrics.turns = (usage.input_tokens ?? 0) + (usage.output_tokens ?? 0)
      }
    } else if (last.type === 'step_finish') {
      // OpenCode — aggregate tokens from all step_finish events in tail
      let totalInput = 0, totalOutput = 0, totalCost = 0
      for (const ev of tailEvents) {
        if (ev.type === 'step_finish') {
          const part = (ev as any).part
          if (part?.tokens) {
            totalInput += part.tokens.input ?? 0
            totalOutput += part.tokens.output ?? 0
          }
          if (part?.cost != null) totalCost += part.cost
        }
      }
      metrics.turns = totalInput + totalOutput
      if (totalCost > 0) metrics.cost_usd = totalCost
    }
  }

  // Read first 4KB for system event (model), Codex thread.started, or OpenCode step_start
  const headSize = Math.min(4 * 1024, fileSize)
  const headBuf = Buffer.alloc(headSize)
  fs.readSync(fd, headBuf, 0, headSize, 0)
  const headLines = headBuf.toString('utf-8').split('\n').filter(l => l.trim().length > 0)

  if (headLines.length > 0) {
    try {
      const first = JSON.parse(headLines[0])
      if (first.type === 'system') {
        metrics.model = first.model ?? null
      } else if (first.type === 'thread.started') {
        // Codex — try second line for model info, fallback to 'codex'
        metrics.model = 'codex'
        if (headLines.length > 1) {
          try {
            const second = JSON.parse(headLines[1])
            if (second.model) metrics.model = second.model
          } catch { /* skip */ }
        }
      } else if (first.type === 'step_start') {
        // OpenCode — model info not in events, use harness label
        metrics.model = 'opencode'
      }
    } catch { /* skip */ }
  }

  if (metrics.cost_usd === null && metrics.duration_ms === null && metrics.turns === null && metrics.model === null) {
    return null
  }

  return metrics
}

function countNewlines(fd: number, fileSize: number): number {
  let count = 0
  const scanBuf = Buffer.alloc(256 * 1024)
  let pos = 0
  while (pos < fileSize) {
    const n = fs.readSync(fd, scanBuf, 0, Math.min(scanBuf.length, fileSize - pos), pos)
    for (let i = 0; i < n; i++) if (scanBuf[i] === 0x0A) count++
    pos += n
  }
  return count
}

function readJsonlTailWithMetrics(filePath: string, maxEvents: number): JsonlTailResult {
  try {
    const stat = fs.statSync(filePath)
    const fileSize = stat.size
    if (fileSize === 0) {
      return { events: [], total_bytes: 0, total_events: 0, truncated: false, metrics: null }
    }

    const fd = fs.openSync(filePath, 'r')
    try {
      // Strategy: read chunks from end, doubling size until we have enough lines
      let chunkSize = 64 * 1024
      let lines: string[] = []
      let readAll = false

      while (true) {
        const position = Math.max(0, fileSize - chunkSize)
        const readSize = Math.min(chunkSize, fileSize)
        const buffer = Buffer.alloc(readSize)
        fs.readSync(fd, buffer, 0, readSize, position)
        const text = buffer.toString('utf-8')
        lines = text.split('\n').filter(l => l.trim().length > 0)

        if (position > 0 && lines.length > 0) {
          lines.shift()
        } else {
          readAll = true
        }

        if (lines.length >= maxEvents || readAll) break

        chunkSize *= 2
        if (chunkSize >= fileSize) chunkSize = fileSize
      }

      // Count total events
      let totalEvents: number
      if (readAll) {
        totalEvents = lines.length
      } else {
        totalEvents = countNewlines(fd, fileSize)
      }

      const truncated = lines.length > maxEvents
      const resultLines = truncated ? lines.slice(-maxEvents) : lines

      const events: JsonlEvent[] = []
      for (const line of resultLines) {
        try {
          events.push(JSON.parse(line))
        } catch { /* skip malformed */ }
      }

      // Fallback: if file has content but no lines parsed as JSON, treat as legacy text
      // This handles .jsonl files that contain raw terminal output (e.g. old opencode sessions)
      if (events.length === 0 && resultLines.length > 0) {
        // Strip ANSI escape codes for readability
        const clean = resultLines.map(l => l.replace(/\x1b\[[0-9;]*m/g, ''))
        events.push({ type: 'legacy' as const, lines: clean })
        return { events, total_bytes: fileSize, total_events: -1, truncated, metrics: null }
      }

      const metrics = extractMetricsFromFd(fd, fileSize, events)

      return { events, total_bytes: fileSize, total_events: totalEvents, truncated, metrics }
    } finally {
      fs.closeSync(fd)
    }
  } catch {
    return { events: [], total_bytes: 0, total_events: 0, truncated: false, metrics: null }
  }
}

function readJsonlSinceByte(filePath: string, sinceByte: number): JsonlTailResult {
  try {
    const stat = fs.statSync(filePath)
    const fileSize = stat.size

    // File was truncated/recreated — caller should do a full fetch
    if (sinceByte > fileSize) {
      return { events: [], total_bytes: fileSize, total_events: 0, truncated: false, metrics: null, append: false }
    }

    // No new data
    if (sinceByte === fileSize) {
      return { events: [], total_bytes: fileSize, total_events: 0, truncated: false, metrics: null, append: true }
    }

    const fd = fs.openSync(filePath, 'r')
    try {
      const newSize = fileSize - sinceByte
      const buffer = Buffer.alloc(newSize)
      fs.readSync(fd, buffer, 0, newSize, sinceByte)
      const text = buffer.toString('utf-8')
      const lines = text.split('\n').filter(l => l.trim().length > 0)

      // If sinceByte lands mid-line, first line is partial — discard it
      // But since we track byte boundaries cleanly, this should be rare.
      // To be safe: if sinceByte > 0 and the byte before sinceByte is not \n, discard first line
      if (sinceByte > 0 && lines.length > 0) {
        const checkBuf = Buffer.alloc(1)
        fs.readSync(fd, checkBuf, 0, 1, sinceByte - 1)
        if (checkBuf[0] !== 0x0A) {
          lines.shift()
        }
      }

      const events: JsonlEvent[] = []
      for (const line of lines) {
        try {
          events.push(JSON.parse(line))
        } catch { /* skip malformed */ }
      }

      // Fallback: non-JSON content → legacy text
      if (events.length === 0 && lines.length > 0) {
        const clean = lines.map(l => l.replace(/\x1b\[[0-9;]*m/g, ''))
        events.push({ type: 'legacy' as const, lines: clean })
        return { events, total_bytes: fileSize, total_events: -1, truncated: false, metrics: null, append: true }
      }

      const totalEvents = countNewlines(fd, fileSize)
      const metrics = extractMetricsFromFd(fd, fileSize, events)

      return { events, total_bytes: fileSize, total_events: totalEvents, truncated: false, metrics, append: true }
    } finally {
      fs.closeSync(fd)
    }
  } catch {
    return { events: [], total_bytes: 0, total_events: 0, truncated: false, metrics: null }
  }
}

// Legacy compat wrapper used by computeSessions
function readSessionMetrics(outputPath: string, isJsonl: boolean): SessionMetrics | null {
  if (!isJsonl) return null
  const result = readJsonlTailWithMetrics(outputPath, 1)
  return result.metrics
}

function readCurrentSession(runPath: string): string {
  try {
    return fs.readFileSync(path.join(runPath, '.sessions', '.current-feature'), 'utf-8').trim()
  } catch {
    // Fallback: ler feature_id do agent-harness.state
    const loopState = readLoopState(runPath)
    return loopState?.feature_id ?? ''
  }
}

function getSessionPid(sessionPath: string): number | null {
  try {
    const raw = fs.readFileSync(path.join(sessionPath, 'pid'), 'utf-8').trim()
    const pid = parseInt(raw, 10)
    return isNaN(pid) ? null : pid
  } catch {
    return null
  }
}

function detectLoopState(runPath: string, features: RawFeature[]): LoopState {
  // Ler agent-harness.pid
  let loopPid: number | null = null
  try {
    const raw = fs.readFileSync(path.join(runPath, 'agent-harness.pid'), 'utf-8').trim()
    loopPid = parseInt(raw, 10)
    if (isNaN(loopPid)) loopPid = null
  } catch { /* no agent-harness.pid */ }

  const loopAlive = loopPid !== null ? checkPidAliveCached(loopPid) : false
  const stopExists = fs.existsSync(path.join(runPath, '.stop'))
  const allPassing = features.length > 0 && features.every(f => f.status === 'passing')

  // Consultar agent-harness.state para estado autoritativo
  const loopState = readLoopState(runPath)

  // Se agent-harness.state indica exited e o processo nao esta vivo, usar estado autoritativo
  if (loopState?.status === 'exited' && !loopAlive) {
    if (loopState.exit_reason === 'completed') return 'completed'
    // stopped, deps_impossible, iteration_limit -> idle (exit_reason disponivel no detail)
    return 'idle'
  }

  // Sessao mais recente: achar a com mtime mais alto
  const sessionsDir = path.join(runPath, '.sessions')
  let agentAlive = false
  try {
    const entries = fs.readdirSync(sessionsDir, { withFileTypes: true })
    let latestMtime = 0
    let latestSessionPath = ''
    for (const entry of entries) {
      if (!entry.isDirectory()) continue
      const sp = path.join(sessionsDir, entry.name)
      try {
        const mt = fs.statSync(sp).mtimeMs
        if (mt > latestMtime) {
          latestMtime = mt
          latestSessionPath = sp
        }
      } catch { /* skip */ }
    }
    if (latestSessionPath) {
      const agentPid = getSessionPid(latestSessionPath)
      agentAlive = agentPid !== null ? checkPidAliveCached(agentPid) : false
    }
  } catch { /* no sessions dir */ }

  if (loopAlive) {
    if (stopExists) return 'stopping'
    // Usar agent-harness.state para running/between se disponivel
    if (loopState?.status === 'running') return 'running'
    if (loopState?.status === 'between') return 'between'
    // Fallback heuristico
    if (agentAlive) return 'running'
    return 'between'
  }
  if (allPassing) return 'completed'
  if (agentAlive) return 'running' // loop iniciado fora do tooling
  return 'idle'
}

// --- Monitor Cache ---

interface CachedRunSummary {
  id: string
  project: string
  milestone: string
  location: string
  is_external: boolean
  tool: 'claude-code' | 'opencode' | 'codex'
  features: { total: number; passing: number; failing: number }
  loop_state: LoopState
  iteration: number | null
}

interface CachedRunDetail {
  run: any // full run detail response object
  mtimes: { features: number; state: number; progress: number; harness: number }
}

interface CachedSessionSummary {
  id: string
  pid: number | null
  alive: boolean
  stime: string | null
  command: string | null
  has_checklist: boolean
  checklist_summary: { total: number; checked: number } | null
  output_bytes: number
  is_current: boolean
  started_at: string | null
  finished_at: string | null
  metrics: SessionMetrics | null
  _dirMtimeMs: number
}

interface MonitorCache {
  summaries: CachedRunSummary[]
  summariesReady: boolean
  details: Map<string, CachedRunDetail>
  sessions: Map<string, CachedSessionSummary[]>
  refreshedAt: number
}

function getMtimeMs(filePath: string): number {
  try {
    return fs.statSync(filePath).mtimeMs
  } catch {
    return 0
  }
}

function computeRunSummary(config: RunConfig, workspacePath: string): CachedRunSummary {
  const featuresPath = path.join(workspacePath, 'features.json')
  const features = parseFeatures(featuresPath)
  const passing = features.filter(f => f.status === 'passing').length
  const failing = features.filter(f => f.status !== 'passing').length
  const loopState = readLoopState(workspacePath)

  return {
    id: config.name,
    project: config.project,
    milestone: config.milestone,
    location: config.location,
    is_external: !config.location.startsWith('./'),
    tool: config.harness as 'claude-code' | 'opencode' | 'codex',
    features: { total: features.length, passing, failing },
    loop_state: detectLoopState(workspacePath, features),
    iteration: loopState?.iteration ?? null,
  }
}

function computeRunDetail(config: RunConfig, workspacePath: string, progressFull: boolean): CachedRunDetail {
  const featuresPath = path.join(workspacePath, 'features.json')
  const features = parseFeatures(featuresPath)
  const passing = features.filter(f => f.status === 'passing').length
  const failing = features.filter(f => f.status !== 'passing').length

  const featuresList = features.map(f => ({
    id: f.id,
    name: f.name || f.title || f.id,
    status: f.status,
    priority: f.priority,
    completed_at: f.completed_at,
    dependencies: f.dependencies ?? [],
    description: f.description ?? null,
    tests: (f.tests ?? []).map((t: any) => typeof t === 'string' ? t : (t.name ?? t.description ?? String(t))),
    prp_path: f.prp_path,
  }))

  const progressLines = progressFull ? 500 : 50
  const { text: progressText, total_lines: progressTotalLines } = readProgress(workspacePath, progressLines)

  const loopState = readLoopState(workspacePath)
  const loopStateDetail = loopState ? {
    iteration: loopState.iteration,
    max_iterations: loopState.max_iterations,
    total: loopState.total,
    done: loopState.done,
    remaining: loopState.remaining,
    feature_id: loopState.feature_id,
    started_at: loopState.started_at,
    updated_at: loopState.updated_at,
    exit_reason: loopState.exit_reason,
  } : null

  const harnessJson = readHarnessJson(workspacePath)

  const run = {
    id: config.name,
    project: config.project,
    milestone: config.milestone,
    location: config.location,
    is_external: !config.location.startsWith('./'),
    tool: config.harness as 'claude-code' | 'opencode' | 'codex',
    features: { total: features.length, passing, failing },
    loop_state: detectLoopState(workspacePath, features),
    iteration: loopState?.iteration ?? null,
    features_list: featuresList,
    progress: progressText,
    progress_total_lines: progressTotalLines,
    loop_state_detail: loopStateDetail,
    params: config.params,
    milestone_path: config.milestone_path ?? null,
    planning_path: harnessJson?.planning_path ?? null,
  }

  return {
    run,
    mtimes: {
      features: getMtimeMs(featuresPath),
      state: getMtimeMs(path.join(workspacePath, 'agent-harness.state')),
      progress: getMtimeMs(path.join(workspacePath, 'agent-progress.txt')),
      harness: getMtimeMs(path.join(workspacePath, 'agent-harness.json')),
    },
  }
}

function computeSessions(workspacePath: string): CachedSessionSummary[] {
  const sessionsDir = path.join(workspacePath, '.sessions')
  if (!fs.existsSync(sessionsDir)) return []

  const currentId = readCurrentSession(workspacePath)
  const entries = fs.readdirSync(sessionsDir, { withFileTypes: true })
  const sessions: CachedSessionSummary[] = []

  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const sid = entry.name
    const sessionPath = path.join(sessionsDir, sid)
    const pid = getSessionPid(sessionPath)
    const procInfo = pid !== null ? getProcessInfoCached(pid) : { alive: false }
    const alive = procInfo.alive

    let checklistSummary: { total: number; checked: number } | null = null
    let hasChecklist = false
    const checklistPath = path.join(sessionPath, 'checklist.md')
    try {
      const content = fs.readFileSync(checklistPath, 'utf-8')
      hasChecklist = true
      checklistSummary = parseChecklist(content)
    } catch { /* no checklist */ }

    const outputInfo = resolveOutputPath(sessionPath)
    let outputBytes = 0
    try {
      outputBytes = fs.statSync(outputInfo.path).size
    } catch { /* no output */ }

    const metrics = readSessionMetrics(outputInfo.path, outputInfo.isJsonl)

    let startedAt: string | null = null
    try {
      startedAt = fs.readFileSync(path.join(sessionPath, 'started_at'), 'utf-8').trim()
    } catch { /* no started_at */ }

    let finishedAt: string | null = null
    try {
      finishedAt = fs.readFileSync(path.join(sessionPath, 'finished_at'), 'utf-8').trim()
    } catch { /* no finished_at */ }

    let dirMtimeMs = 0
    try { dirMtimeMs = fs.statSync(sessionPath).mtimeMs } catch { /* skip */ }

    sessions.push({
      id: sid,
      pid,
      alive,
      stime: (procInfo as any).stime ?? null,
      command: (procInfo as any).command ?? null,
      has_checklist: hasChecklist,
      checklist_summary: checklistSummary,
      output_bytes: outputBytes,
      is_current: sid === currentId,
      started_at: startedAt,
      finished_at: finishedAt,
      metrics,
      _dirMtimeMs: dirMtimeMs,
    })
  }

  // Sort: current first, then by directory mtime desc
  sessions.sort((a, b) => {
    if (a.is_current && !b.is_current) return -1
    if (!a.is_current && b.is_current) return 1
    return b._dirMtimeMs - a._dirMtimeMs
  })

  return sessions
}

export function runMonitorPlugin(runsDir?: string): Plugin {
  const RUNS_DIR = runsDir ?? path.resolve(__dirname, '..', 'runs')

  // --- Cache instance ---
  const cache: MonitorCache = {
    summaries: [],
    summariesReady: false,
    details: new Map(),
    sessions: new Map(),
    refreshedAt: 0,
  }

  // Track which runs were recently requested (for selective L2/L3 refresh)
  const recentlyRequestedRuns = new Map<string, number>()
  const RECENT_REQUEST_TTL_MS = 30_000

  let refreshTimer: ReturnType<typeof setTimeout> | null = null
  let refreshing = false

  function invalidateRun(runId: string): void {
    cache.details.delete(runId)
    cache.sessions.delete(runId)
    cache.summariesReady = false // force L1 re-compute next cycle
  }

  async function refreshCycle(): Promise<void> {
    if (refreshing) return
    refreshing = true
    try {
      // L1: Refresh summaries
      const resolved = discoverRuns(RUNS_DIR)
      const summaries: CachedRunSummary[] = []
      for (const { config, workspacePath } of resolved) {
        summaries.push(computeRunSummary(config, workspacePath))
      }
      cache.summaries = summaries
      cache.summariesReady = true

      // L2 + L3: Refresh details/sessions only for active or recently-requested runs
      const now = Date.now()
      for (const { config, workspacePath } of resolved) {
        const runId = config.name
        const summary = summaries.find(s => s.id === runId)
        const isActive = summary && (summary.loop_state === 'running' || summary.loop_state === 'between' || summary.loop_state === 'stopping')
        const lastRequested = recentlyRequestedRuns.get(runId)
        const isRecentlyRequested = lastRequested != null && (now - lastRequested) < RECENT_REQUEST_TTL_MS

        if (!isActive && !isRecentlyRequested) continue

        // L2: Detail — check mtimes before re-reading
        const cached = cache.details.get(runId)
        const featuresPath = path.join(workspacePath, 'features.json')
        const currentMtimes = {
          features: getMtimeMs(featuresPath),
          state: getMtimeMs(path.join(workspacePath, 'agent-harness.state')),
          progress: getMtimeMs(path.join(workspacePath, 'agent-progress.txt')),
          harness: getMtimeMs(path.join(workspacePath, 'agent-harness.json')),
        }

        const mtimesChanged = !cached ||
          cached.mtimes.features !== currentMtimes.features ||
          cached.mtimes.state !== currentMtimes.state ||
          cached.mtimes.progress !== currentMtimes.progress ||
          cached.mtimes.harness !== currentMtimes.harness

        if (mtimesChanged) {
          cache.details.set(runId, computeRunDetail(config, workspacePath, false))
        }

        // L3: Sessions — re-read active sessions, keep finalized from cache
        const prevSessions = cache.sessions.get(runId)
        if (prevSessions) {
          // Only refresh if there are active sessions or new sessions appeared
          const hasActiveSessions = prevSessions.some(s => s.finished_at === null)
          if (hasActiveSessions || isActive) {
            cache.sessions.set(runId, computeSessions(workspacePath))
          }
        } else {
          cache.sessions.set(runId, computeSessions(workspacePath))
        }
      }

      // Evict expired PIDs
      evictExpiredPids()

      // Evict stale recent requests
      for (const [rid, ts] of recentlyRequestedRuns) {
        if ((now - ts) >= RECENT_REQUEST_TTL_MS) {
          recentlyRequestedRuns.delete(rid)
        }
      }

      cache.refreshedAt = now
    } catch (err) {
      // Silently continue — cache keeps previous data
    } finally {
      refreshing = false
      refreshTimer = setTimeout(refreshCycle, 5000)
    }
  }

  return {
    name: 'run-monitor-api',
    configureServer(server) {
      // Start background refresh loop
      refreshCycle()

      // Cleanup on server close
      server.httpServer?.on('close', () => {
        if (refreshTimer) clearTimeout(refreshTimer)
      })

      // GET /api/runs — Overview de todos os runs
      server.middlewares.use('/api/runs', (req, res, next) => {
        // Apenas responder para GET exato em /api/runs (sem subpath)
        if (req.method !== 'GET') return next()
        if (req.url && req.url !== '/' && req.url !== '') return next()

        try {
          if (cache.summariesReady) {
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ runs: cache.summaries }))
            return
          }

          // Cold cache — compute synchronously
          const resolved = discoverRuns(RUNS_DIR)
          const runs = []

          for (const { config, workspacePath } of resolved) {
            runs.push(computeRunSummary(config, workspacePath))
          }

          cache.summaries = runs
          cache.summariesReady = true

          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ runs }))
        } catch (error) {
          res.statusCode = 500
          res.end(JSON.stringify({ error: String(error) }))
        }
      })

      // GET /api/runs/:id — Detalhes de um run
      server.middlewares.use((req, res, next) => {
        const url = new URL(req.url ?? '', 'http://localhost')
        const match = url.pathname.match(/^\/api\/runs\/([^/]+)$/)
        if (!match || req.method !== 'GET') return next()

        const runId = decodeURIComponent(match[1])

        // Mark as recently requested for background refresh
        recentlyRequestedRuns.set(runId, Date.now())

        const progressFull = url.searchParams.get('progress') === 'full'

        // progress=full bypasses cache (rare, user-triggered)
        if (!progressFull) {
          const cached = cache.details.get(runId)
          if (cached) {
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ run: cached.run }))
            return
          }
        }

        // Cold cache or progress=full — compute synchronously
        const resolved = resolveRun(RUNS_DIR, runId)

        if (!resolved) {
          res.statusCode = 404
          res.end(JSON.stringify({ error: 'Run não encontrado' }))
          return
        }

        const { config, workspacePath } = resolved

        try {
          const detail = computeRunDetail(config, workspacePath, progressFull)

          // Only cache non-full-progress results
          if (!progressFull) {
            cache.details.set(runId, detail)
          }

          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ run: detail.run }))
        } catch (error) {
          res.statusCode = 500
          res.end(JSON.stringify({ error: String(error) }))
        }
      })

      // GET /api/runs/:id/sessions — Lista sessoes do run
      server.middlewares.use((req, res, next) => {
        const match = req.url?.match(/^\/api\/runs\/([^/]+)\/sessions\/?$/)
        if (!match || req.method !== 'GET') return next()

        const runId = decodeURIComponent(match[1])

        // Mark as recently requested
        recentlyRequestedRuns.set(runId, Date.now())

        // Serve from cache if available
        const cached = cache.sessions.get(runId)
        if (cached) {
          // Strip internal _dirMtimeMs before responding
          const sessions = cached.map(({ _dirMtimeMs, ...rest }) => rest)
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ sessions }))
          return
        }

        // Cold cache — compute synchronously
        const resolved = resolveRun(RUNS_DIR, runId)

        if (!resolved) {
          res.statusCode = 404
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Run não encontrado' }))
          return
        }

        const { workspacePath } = resolved

        try {
          const sessionsData = computeSessions(workspacePath)
          cache.sessions.set(runId, sessionsData)

          const sessions = sessionsData.map(({ _dirMtimeMs, ...rest }) => rest)
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ sessions }))
        } catch (error) {
          res.statusCode = 500
          res.end(JSON.stringify({ error: String(error) }))
        }
      })

      // GET /api/runs/:id/sessions/:sid/output?tail=50 — Tail do output (JSONL ou TXT legado)
      // NAO cacheia — leitura direta (backward-read ja e O(log n), live view precisa freshness)
      server.middlewares.use((req, res, next) => {
        const url = new URL(req.url ?? '', 'http://localhost')
        const match = url.pathname.match(/^\/api\/runs\/([^/]+)\/sessions\/([^/]+)\/output$/)
        if (!match || req.method !== 'GET') return next()

        const runId = decodeURIComponent(match[1])
        const sid = decodeURIComponent(match[2])

        if (!isValidSessionId(sid)) {
          res.statusCode = 400
          res.end(JSON.stringify({ error: 'ID de sessão inválido' }))
          return
        }

        const resolved = resolveRun(RUNS_DIR, runId)
        if (!resolved) {
          res.statusCode = 404
          res.end(JSON.stringify({ error: 'Run não encontrado' }))
          return
        }
        const sessionPath = path.join(resolved.workspacePath, '.sessions', sid)
        const outputInfo = resolveOutputPath(sessionPath)
        const tail = parseInt(url.searchParams.get('tail') ?? '50', 10) || 50
        const sinceByte = url.searchParams.has('since_byte')
          ? parseInt(url.searchParams.get('since_byte')!, 10)
          : null

        try {
          // Disable HTTP caching — since_byte provides efficient incremental reads,
          // and ETag can serve stale responses when backend parsing logic changes
          res.setHeader('Cache-Control', 'no-store')

          if (outputInfo.isJsonl) {
            let result: JsonlTailResult
            if (sinceByte != null && sinceByte >= 0) {
              result = readJsonlSinceByte(outputInfo.path, sinceByte)
            } else {
              result = readJsonlTailWithMetrics(outputInfo.path, tail)
            }
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({
              events: result.events,
              total_bytes: result.total_bytes,
              total_events: result.total_events,
              truncated: result.truncated,
              metrics: result.metrics,
              ...(result.append != null ? { append: result.append } : {}),
            }))
          } else {
            // Legacy output.txt → wrap in legacy event
            const result = readOutputTail(outputInfo.path, tail)
            const events: JsonlEvent[] = result.lines.length > 0
              ? [{ type: 'legacy' as const, lines: result.lines }]
              : []
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({
              events,
              total_bytes: result.total_bytes,
              total_events: result.total_lines,
              truncated: result.truncated,
              metrics: null,
            }))
          }
        } catch (error) {
          res.statusCode = 500
          res.end(JSON.stringify({ error: String(error) }))
        }
      })

      // GET /api/runs/:id/sessions/:sid/checklist — Conteudo do checklist.md
      // NAO cacheia — arquivo pequeno, leitura direta
      server.middlewares.use((req, res, next) => {
        const match = req.url?.match(/^\/api\/runs\/([^/]+)\/sessions\/([^/]+)\/checklist$/)
        if (!match || req.method !== 'GET') return next()

        const runId = decodeURIComponent(match[1])
        const sid = decodeURIComponent(match[2])

        if (!isValidSessionId(sid)) {
          res.statusCode = 400
          res.end(JSON.stringify({ error: 'ID de sessão inválido' }))
          return
        }

        const resolved = resolveRun(RUNS_DIR, runId)
        if (!resolved) {
          res.statusCode = 404
          res.end(JSON.stringify({ error: 'Run não encontrado' }))
          return
        }
        const filePath = path.join(resolved.workspacePath, '.sessions', sid, 'checklist.md')

        try {
          const content = fs.readFileSync(filePath, 'utf-8')
          const summary = parseChecklist(content)
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ content, summary }))
        } catch {
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ content: null, summary: null }))
        }
      })

      // POST /api/runs/:id/stop — Graceful stop via .stop file
      server.middlewares.use((req, res, next) => {
        const match = req.url?.match(/^\/api\/runs\/([^/]+)\/stop$/)
        if (!match || req.method !== 'POST') return next()

        const runId = decodeURIComponent(match[1])
        const resolved = resolveRun(RUNS_DIR, runId)

        if (!resolved) {
          res.statusCode = 404
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ success: false, error: 'Run não encontrado' }))
          return
        }

        const { workspacePath } = resolved

        try {
          fs.writeFileSync(path.join(workspacePath, '.stop'), '')
          // Invalidate cache for this run
          invalidateRun(runId)
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ success: true }))
        } catch (error: any) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ success: false, error: error.message ?? String(error) }))
        }
      })

      // POST /api/runs/:id/resume — Inicia agent-harness.sh em background
      server.middlewares.use((req, res, next) => {
        const match = req.url?.match(/^\/api\/runs\/([^/]+)\/resume$/)
        if (!match || req.method !== 'POST') return next()

        const runId = decodeURIComponent(match[1])
        const resolved = resolveRun(RUNS_DIR, runId)

        if (!resolved) {
          res.statusCode = 404
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ success: false, error: 'Run não encontrado' }))
          return
        }

        const { workspacePath } = resolved

        const loopScript = path.join(workspacePath, 'agent-harness.sh')
        if (!fs.existsSync(loopScript)) {
          res.statusCode = 400
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ success: false, error: 'agent-harness.sh não encontrado neste run' }))
          return
        }

        // Verificar se ja nao esta rodando
        const featuresPath = path.join(workspacePath, 'features.json')
        const features = parseFeatures(featuresPath)
        const currentState = detectLoopState(workspacePath, features)
        if (currentState !== 'idle' && currentState !== 'completed') {
          res.statusCode = 409
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ success: false, error: `Run não está idle (estado: ${currentState})` }))
          return
        }

        // Parse JSON body para extrair maxIterations
        let body = ''
        req.on('data', (chunk: Buffer) => { body += chunk.toString() })
        req.on('end', () => {
          let maxIterations = 500
          try {
            const parsed = JSON.parse(body || '{}')
            if (parsed.maxIterations && Number.isFinite(parsed.maxIterations)) {
              maxIterations = parsed.maxIterations
            }
          } catch { /* default 500 */ }

          try {
            // Remover .stop se existir
            const stopPath = path.join(workspacePath, '.stop')
            if (fs.existsSync(stopPath)) fs.unlinkSync(stopPath)

            const { pid } = spawnDetached('bash', ['./agent-harness.sh'], {
              cwd: workspacePath,
              stdio: 'ignore',
              env: { ...process.env, MAX_ITERATIONS: String(maxIterations) },
            })

            if (pid) {
              fs.writeFileSync(path.join(workspacePath, 'agent-harness.pid'), String(pid))
            }

            // Invalidate cache for this run
            invalidateRun(runId)

            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ success: true, pid: child.pid }))
          } catch (error: any) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ success: false, error: error.message ?? String(error) }))
          }
        })
      })
    },
  }
}
