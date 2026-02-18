import type {
  HarnessConfig, Feature, LoopState, LoopStateDetail, SessionSummary, SessionOutput,
  SpecsResponse, WorkspaceInfo, HarnessInferResponse, HarnessCreateRequest,
  HarnessStartResponse, HarnessStopResponse,
  HarnessSessionInfo, StreamEvent,
} from './types'

function slugQs(slug?: string): string {
  return slug ? `?slug=${encodeURIComponent(slug)}` : ''
}

function appendSlug(url: string, slug?: string): string {
  if (!slug) return url
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}slug=${encodeURIComponent(slug)}`
}

export async function fetchConfig(slug?: string): Promise<{ config: HarnessConfig }> {
  const res = await fetch(`/api/config${slugQs(slug)}`)
  if (!res.ok) throw new Error(`Erro ao buscar config: ${res.statusText}`)
  return res.json()
}

export async function fetchState(slug?: string): Promise<{
  state: LoopState
  detail: LoopStateDetail | null
  pid: number | null
  alive: boolean
}> {
  const res = await fetch(`/api/state${slugQs(slug)}`)
  if (!res.ok) throw new Error(`Erro ao buscar state: ${res.statusText}`)
  return res.json()
}

export async function fetchFeatures(slug?: string): Promise<{
  features: Feature[]
  summary: Record<string, number>
  total: number
}> {
  const res = await fetch(`/api/features${slugQs(slug)}`)
  if (!res.ok) throw new Error(`Erro ao buscar features: ${res.statusText}`)
  return res.json()
}

export async function fetchProgress(lines: number = 200, slug?: string): Promise<{
  text: string
  total_lines: number
}> {
  const res = await fetch(appendSlug(`/api/progress?lines=${lines}`, slug))
  if (!res.ok) throw new Error(`Erro ao buscar progress: ${res.statusText}`)
  return res.json()
}

export async function fetchSessions(slug?: string): Promise<{ sessions: SessionSummary[] }> {
  const res = await fetch(`/api/sessions${slugQs(slug)}`)
  if (!res.ok) throw new Error(`Erro ao buscar sessions: ${res.statusText}`)
  return res.json()
}

export async function fetchSessionOutput(
  sid: string,
  tail: number = 50,
  sinceByte?: number,
  slug?: string
): Promise<SessionOutput> {
  let url = `/api/sessions/${encodeURIComponent(sid)}/output?tail=${tail}`
  if (sinceByte != null && sinceByte > 0) url += `&since_byte=${sinceByte}`
  if (slug) url += `&slug=${encodeURIComponent(slug)}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Erro ao buscar output: ${res.statusText}`)
  return res.json()
}

export async function fetchSpecs(subPath?: string, slug?: string): Promise<SpecsResponse> {
  let url = subPath ? `/api/specs/${subPath.split('/').map(encodeURIComponent).join('/')}` : '/api/specs'
  url = appendSlug(url, slug)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Erro ao buscar specs: ${res.statusText}`)
  return res.json()
}

export async function fetchWorkspaces(): Promise<{ workspaces: WorkspaceInfo[]; active: string }> {
  const res = await fetch('/api/workspaces')
  if (!res.ok) throw new Error(`Erro ao buscar workspaces: ${res.statusText}`)
  return res.json()
}

// --- Harness Sessions ---

export async function fetchHarnessSessions(slug?: string): Promise<{
  sessions: HarnessSessionInfo[]
  active: string
}> {
  const res = await fetch(`/api/harness/sessions${slugQs(slug)}`)
  if (!res.ok) throw new Error(`Erro ao buscar harness sessions: ${res.statusText}`)
  return res.json()
}

export async function switchSession(slug: string, session: string): Promise<{ success: boolean; session: string }> {
  const res = await fetch('/api/harness/sessions/switch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ slug, session }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || `Erro ao trocar session: ${res.statusText}`)
  }
  return res.json()
}

// --- Run Create (project.json only) ---

export async function runCreate(params: HarnessCreateRequest): Promise<{ success: boolean; slug: string }> {
  const res = await fetch('/api/runs/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || `Erro ao criar run: ${res.statusText}`)
  }
  return res.json()
}

// --- Run Status ---

export async function fetchRunStatus(slug: string): Promise<{
  exists: boolean
  slug: string
  workspace?: string
  workspace_exists?: boolean
  has_harness?: boolean
  features_count?: number
  features_passing?: number
}> {
  const res = await fetch(`/api/runs/${encodeURIComponent(slug)}/status`)
  if (!res.ok) throw new Error(`Erro ao buscar status: ${res.statusText}`)
  return res.json()
}

// --- SSE Streaming ---

export function createStream(slug: string, onEvent: (ev: StreamEvent) => void): () => void {
  const url = `/api/runs/${encodeURIComponent(slug)}/create-stream`
  const source = new EventSource(url)
  source.onmessage = (e) => {
    try {
      onEvent(JSON.parse(e.data))
    } catch { /* ignore parse errors */ }
  }
  source.onerror = () => {
    source.close()
  }
  return () => source.close()
}

export function initializeStream(slug: string, onEvent: (ev: StreamEvent) => void): () => void {
  const url = `/api/runs/${encodeURIComponent(slug)}/initialize-stream`
  const source = new EventSource(url)
  source.onmessage = (e) => {
    try {
      onEvent(JSON.parse(e.data))
    } catch { /* ignore parse errors */ }
  }
  source.onerror = () => {
    source.close()
  }
  return () => source.close()
}

// --- Harness Create Flow (legacy) ---

export async function harnessInfer(specsPath: string): Promise<HarnessInferResponse> {
  const res = await fetch('/api/harness/infer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ specsPath }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || `Erro ao inferir: ${res.statusText}`)
  }
  return res.json()
}

export async function harnessStart(slug: string, overrides?: {
  max_turns?: number | null
  max_iterations?: number | null
  max_features?: number | null
}): Promise<HarnessStartResponse> {
  const res = await fetch('/api/harness/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ slug, ...overrides }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || `Erro ao iniciar loop: ${res.statusText}`)
  }
  return res.json()
}

export async function harnessStop(slug: string): Promise<HarnessStopResponse> {
  const res = await fetch('/api/harness/stop', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ slug }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || `Erro ao parar loop: ${res.statusText}`)
  }
  return res.json()
}
