import type {
  HarnessConfig, Feature, LoopState, LoopStateDetail, SessionSummary, SessionOutput,
  SpecsResponse, WorkspaceInfo, HarnessInferResponse, HarnessCreateRequest,
  HarnessCreateResponse, HarnessSetupResponse, HarnessStartResponse, HarnessStopResponse,
} from './types'

export async function fetchConfig(): Promise<{ config: HarnessConfig }> {
  const res = await fetch('/api/config')
  if (!res.ok) throw new Error(`Erro ao buscar config: ${res.statusText}`)
  return res.json()
}

export async function fetchState(): Promise<{
  state: LoopState
  detail: LoopStateDetail | null
  pid: number | null
  alive: boolean
}> {
  const res = await fetch('/api/state')
  if (!res.ok) throw new Error(`Erro ao buscar state: ${res.statusText}`)
  return res.json()
}

export async function fetchFeatures(): Promise<{
  features: Feature[]
  summary: Record<string, number>
  total: number
}> {
  const res = await fetch('/api/features')
  if (!res.ok) throw new Error(`Erro ao buscar features: ${res.statusText}`)
  return res.json()
}

export async function fetchProgress(lines: number = 200): Promise<{
  text: string
  total_lines: number
}> {
  const res = await fetch(`/api/progress?lines=${lines}`)
  if (!res.ok) throw new Error(`Erro ao buscar progress: ${res.statusText}`)
  return res.json()
}

export async function fetchSessions(): Promise<{ sessions: SessionSummary[] }> {
  const res = await fetch('/api/sessions')
  if (!res.ok) throw new Error(`Erro ao buscar sessions: ${res.statusText}`)
  return res.json()
}

export async function fetchSessionOutput(
  sid: string,
  tail: number = 50,
  sinceByte?: number
): Promise<SessionOutput> {
  let url = `/api/sessions/${encodeURIComponent(sid)}/output?tail=${tail}`
  if (sinceByte != null && sinceByte > 0) url += `&since_byte=${sinceByte}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Erro ao buscar output: ${res.statusText}`)
  return res.json()
}

export async function fetchSpecs(subPath?: string): Promise<SpecsResponse> {
  const url = subPath ? `/api/specs/${subPath.split('/').map(encodeURIComponent).join('/')}` : '/api/specs'
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Erro ao buscar specs: ${res.statusText}`)
  return res.json()
}

export async function fetchWorkspaces(): Promise<{ workspaces: WorkspaceInfo[]; active: string }> {
  const res = await fetch('/api/workspaces')
  if (!res.ok) throw new Error(`Erro ao buscar workspaces: ${res.statusText}`)
  return res.json()
}

export async function switchWorkspace(workspace: string): Promise<{ success: boolean; workspace: string }> {
  const res = await fetch('/api/workspace', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ workspace }),
  })
  if (!res.ok) throw new Error(`Erro ao trocar workspace: ${res.statusText}`)
  return res.json()
}

// --- Harness Create Flow ---

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

export async function harnessCreate(params: HarnessCreateRequest): Promise<HarnessCreateResponse> {
  const res = await fetch('/api/harness/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || `Erro ao criar harness: ${res.statusText}`)
  }
  return res.json()
}

export async function harnessSetup(workspace: string): Promise<HarnessSetupResponse> {
  const res = await fetch('/api/harness/setup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ workspace }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || `Erro ao setup: ${res.statusText}`)
  }
  return res.json()
}

export async function harnessStart(workspace: string): Promise<HarnessStartResponse> {
  const res = await fetch('/api/harness/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ workspace }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || `Erro ao iniciar loop: ${res.statusText}`)
  }
  return res.json()
}

export async function harnessStop(workspace: string): Promise<HarnessStopResponse> {
  const res = await fetch('/api/harness/stop', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ workspace }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || `Erro ao parar loop: ${res.statusText}`)
  }
  return res.json()
}
