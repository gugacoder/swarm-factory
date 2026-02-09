import type { RunSummary, RunDetail, SessionSummary, SessionOutput, SessionChecklist } from './types'

export async function fetchRuns(): Promise<{ runs: RunSummary[] }> {
  const res = await fetch('/api/runs')
  if (!res.ok) throw new Error(`Erro ao buscar runs: ${res.statusText}`)
  return res.json()
}

export async function fetchRunDetail(id: string, progressFull?: boolean): Promise<{ run: RunDetail }> {
  const params = progressFull ? '?progress=full' : ''
  const res = await fetch(`/api/runs/${encodeURIComponent(id)}${params}`)
  if (!res.ok) throw new Error(`Erro ao buscar run ${id}: ${res.statusText}`)
  return res.json()
}

export async function fetchSessions(runId: string): Promise<{ sessions: SessionSummary[] }> {
  const res = await fetch(`/api/runs/${encodeURIComponent(runId)}/sessions`)
  if (!res.ok) throw new Error(`Erro ao buscar sessões: ${res.statusText}`)
  return res.json()
}

export async function fetchSessionOutput(runId: string, sid: string, tail: number = 50, sinceByte?: number): Promise<SessionOutput> {
  let url = `/api/runs/${encodeURIComponent(runId)}/sessions/${encodeURIComponent(sid)}/output?tail=${tail}`
  if (sinceByte != null && sinceByte > 0) url += `&since_byte=${sinceByte}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Erro ao buscar output: ${res.statusText}`)
  return res.json()
}

export async function fetchSessionChecklist(runId: string, sid: string): Promise<SessionChecklist> {
  const res = await fetch(`/api/runs/${encodeURIComponent(runId)}/sessions/${encodeURIComponent(sid)}/checklist`)
  if (!res.ok) throw new Error(`Erro ao buscar checklist: ${res.statusText}`)
  return res.json()
}

export async function stopRun(runId: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/runs/${encodeURIComponent(runId)}/stop`, { method: 'POST' })
  if (!res.ok) throw new Error(`Erro ao parar run: ${res.statusText}`)
  return res.json()
}

export async function launchRun(runId: string, maxIterations: number = 500): Promise<{ success: boolean; pid: number }> {
  const res = await fetch(`/api/runs/${encodeURIComponent(runId)}/resume`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ maxIterations }),
  })
  if (!res.ok) throw new Error(`Erro ao iniciar run: ${res.statusText}`)
  return res.json()
}
