import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import type { SessionSummary } from '../lib/types'
import { fetchSessions } from '../lib/api'
import { ProcessBadge } from '@/tools/session-live/components/ProcessBadge'

interface SessionListProps {
  runId: string
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return '??:??'
  }
}

function formatDuration(startIso: string, endIso?: string): string {
  const start = new Date(startIso).getTime()
  const end = endIso ? new Date(endIso).getTime() : Date.now()
  const diffMs = Math.max(0, end - start)
  const totalMinutes = Math.floor(diffMs / 60_000)
  if (totalMinutes < 60) return `${totalMinutes}m`
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${hours}h${minutes.toString().padStart(2, '0')}m`
}

function formatDurationMs(ms: number): string {
  const totalSec = Math.floor(ms / 1000)
  if (totalSec < 60) return `${totalSec}s`
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  return `${min}m${sec.toString().padStart(2, '0')}s`
}

function SessionTimestamp({ startedAt, finishedAt }: { startedAt: string | null; finishedAt: string | null }) {
  if (!startedAt) return null

  if (finishedAt) {
    return (
      <span className="text-[10px] text-muted-foreground tabular-nums shrink-0">
        {formatTime(startedAt)} → {formatTime(finishedAt)} ({formatDuration(startedAt, finishedAt)})
      </span>
    )
  }

  return (
    <span className="text-[10px] text-muted-foreground tabular-nums shrink-0">
      {formatTime(startedAt)} → ... ({formatDuration(startedAt)})
    </span>
  )
}

export function SessionList({ runId }: SessionListProps) {
  const navigate = useNavigate()
  const [sessions, setSessions] = useState<SessionSummary[]>([])
  const [loading, setLoading] = useState(true)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const load = useCallback(async (silent = false) => {
    try {
      const { sessions: data } = await fetchSessions(runId)
      setSessions(data)
    } catch {
      // silent
    } finally {
      if (!silent) setLoading(false)
    }
  }, [runId])

  useEffect(() => {
    load()
    intervalRef.current = setInterval(() => load(true), 10_000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [load])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground text-sm">Carregando sessões...</p>
      </div>
    )
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <p className="text-sm">Nenhuma sessão encontrada</p>
      </div>
    )
  }

  return (
    <div className="space-y-1.5">
      {sessions.map((s) => (
        <div
          key={s.id}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-muted/30 hover:bg-muted/60 transition-colors"
        >
          {/* Session ID + badge */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono font-medium text-sm">{s.id}</span>
              {s.is_current && (
                <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-blue-500/15 text-blue-600 dark:text-blue-400 uppercase">
                  atual
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-0.5">
              <ProcessBadge pid={s.pid} alive={s.alive} />
              <SessionTimestamp startedAt={s.started_at} finishedAt={s.finished_at} />
            </div>
          </div>

          {/* Checklist progress */}
          {s.checklist_summary && (
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-green-500 transition-all duration-300"
                  style={{ width: `${s.checklist_summary.total > 0 ? (s.checklist_summary.checked / s.checklist_summary.total) * 100 : 0}%` }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground tabular-nums">
                {s.checklist_summary.checked}/{s.checklist_summary.total}
              </span>
            </div>
          )}

          {/* Metrics */}
          {s.metrics && (
            <div className="flex items-center gap-2 shrink-0">
              {s.metrics.cost_usd != null && (
                <span className="text-[10px] text-green-600 dark:text-green-400 font-mono tabular-nums">
                  ${s.metrics.cost_usd.toFixed(2)}
                </span>
              )}
              {s.metrics.turns != null && (
                <span className="text-[10px] text-muted-foreground font-mono tabular-nums">
                  {s.metrics.turns}t
                </span>
              )}
              {s.metrics.duration_ms != null && (
                <span className="text-[10px] text-muted-foreground font-mono tabular-nums">
                  {formatDurationMs(s.metrics.duration_ms)}
                </span>
              )}
            </div>
          )}

          {/* Output size */}
          <span className="text-[10px] text-muted-foreground tabular-nums shrink-0">
            {formatBytes(s.output_bytes)}
          </span>

          {/* Open button */}
          <button
            onClick={() => navigate(`/session-live/${encodeURIComponent(runId)}/${encodeURIComponent(s.id)}`)}
            className="px-2.5 py-1 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shrink-0"
          >
            Abrir
          </button>
        </div>
      ))}
    </div>
  )
}
