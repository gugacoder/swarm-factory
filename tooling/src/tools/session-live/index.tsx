import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import type { RunSummary, SessionSummary } from '@/tools/run-monitor/lib/types'
import { fetchRuns, fetchSessions } from '@/tools/run-monitor/lib/api'
import { LoopStateBadge } from './components/LoopStateBadge'
import { ProcessBadge } from './components/ProcessBadge'
import { SessionView } from './SessionView'

export default function SessionLive() {
  const { runId, sessionId } = useParams<{ runId?: string; sessionId?: string }>()
  const navigate = useNavigate()

  if (runId && sessionId) {
    return <SessionView runId={runId} sessionId={sessionId} onBack={() => navigate('/session-live')} />
  }

  return <Dashboard navigate={navigate} />
}

// --- Dashboard (no params) ---

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function ToolBadge({ tool }: { tool: RunSummary['tool'] }) {
  const label = tool === 'claude-code' ? 'CC' : tool === 'opencode' ? 'OC' : '??'
  const color = tool === 'claude-code'
    ? 'bg-orange-500/15 text-orange-600 dark:text-orange-400'
    : tool === 'opencode'
      ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
      : 'bg-gray-500/15 text-gray-600'

  return (
    <span className={cn('text-[9px] font-bold px-1 py-0.5 rounded uppercase shrink-0', color)}>
      {label}
    </span>
  )
}

interface RunWithSessions {
  run: RunSummary
  sessions: SessionSummary[]
}

function Dashboard({ navigate }: { navigate: ReturnType<typeof useNavigate> }) {
  const [data, setData] = useState<RunWithSessions[]>([])
  const [loading, setLoading] = useState(true)
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const toggleCollapse = useCallback((runId: string) => {
    setCollapsed(prev => {
      const next = new Set(prev)
      if (next.has(runId)) next.delete(runId)
      else next.add(runId)
      return next
    })
  }, [])

  const loadAll = useCallback(async (silent = false) => {
    try {
      const { runs } = await fetchRuns()
      const results = await Promise.allSettled(
        runs.map(async (run) => {
          const { sessions } = await fetchSessions(run.id)
          return { run, sessions } as RunWithSessions
        })
      )
      setData(
        results
          .filter((r): r is PromiseFulfilledResult<RunWithSessions> => r.status === 'fulfilled')
          .map(r => r.value)
      )
    } catch { /* ignore */ }
    finally { if (!silent) setLoading(false) }
  }, [])

  useEffect(() => {
    loadAll()
    intervalRef.current = setInterval(() => loadAll(true), 10_000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [loadAll])

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Carregando dashboard...</p>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p className="text-sm">Nenhum run encontrado</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto p-3 md:p-6 space-y-4">
      {data.map(({ run, sessions }) => {
        const shortName = run.project ?? run.id
        const pct = run.features.total > 0 ? Math.round((run.features.passing / run.features.total) * 100) : 0
        const isCollapsed = collapsed.has(run.id)

        return (
          <div key={run.id} className="border border-border rounded-lg bg-card overflow-hidden">
            {/* Run header — clickable to collapse */}
            <button
              type="button"
              onClick={() => toggleCollapse(run.id)}
              className={cn(
                'w-full text-left px-3 md:px-4 py-3 hover:bg-muted/30 transition-colors',
                !isCollapsed && 'border-b border-border'
              )}
            >
              <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                <svg
                  className={cn(
                    'w-3 h-3 shrink-0 text-muted-foreground transition-transform duration-200',
                    !isCollapsed && 'rotate-90'
                  )}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="font-semibold text-sm truncate">{shortName}</span>
                <LoopStateBadge state={run.loop_state} />
                <ToolBadge tool={run.tool} />
                <span className="text-xs text-muted-foreground tabular-nums ml-auto shrink-0">
                  {run.features.passing}/{run.features.total} features
                </span>
                <span className={cn(
                  'text-xs font-bold tabular-nums shrink-0',
                  pct === 100 ? 'text-green-500' : pct > 0 ? 'text-amber-500' : 'text-muted-foreground'
                )}>
                  {pct}%
                </span>
              </div>
              {/* Progress bar */}
              <div className="h-1 rounded-full bg-muted overflow-hidden mt-2">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-300',
                    pct === 100 ? 'bg-green-500' : pct > 0 ? 'bg-amber-500' : 'bg-muted-foreground/30'
                  )}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </button>

            {/* Sessions list — collapsible */}
            {!isCollapsed && (
              <div className="divide-y divide-border">
                {sessions.length === 0 ? (
                  <div className="px-3 md:px-4 py-3 text-xs text-muted-foreground">Nenhuma sessao</div>
                ) : (
                  sessions.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2.5 hover:bg-muted/30 transition-colors"
                    >
                      {/* Current indicator */}
                      <span className={cn(
                        'w-1.5 h-1.5 rounded-full shrink-0',
                        s.is_current ? 'bg-blue-500' : 'bg-transparent'
                      )} />

                      {/* Session ID */}
                      <span className="font-mono text-xs font-medium min-w-0 truncate">
                        {s.id}
                      </span>

                      {/* Process badge */}
                      <ProcessBadge pid={s.pid} alive={s.alive} stime={s.stime} command={s.command} />

                      {/* Checklist progress - hidden on small mobile */}
                      {s.alive && s.checklist_summary && (
                        <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] text-muted-foreground tabular-nums">
                            {s.checklist_summary.checked}/{s.checklist_summary.total}
                          </span>
                        </div>
                      )}

                      {/* Metrics - hidden on small mobile */}
                      {s.metrics && (
                        <div className="hidden sm:flex items-center gap-1.5 shrink-0">
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
                        </div>
                      )}

                      {/* Output size */}
                      <span className="text-[10px] text-muted-foreground tabular-nums shrink-0 ml-auto">
                        {formatBytes(s.output_bytes)}
                      </span>

                      {/* Navigate button */}
                      <button
                        onClick={() => navigate(`/session-live/${encodeURIComponent(run.id)}/${encodeURIComponent(s.id)}`)}
                        className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                        title="Abrir sessao"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

