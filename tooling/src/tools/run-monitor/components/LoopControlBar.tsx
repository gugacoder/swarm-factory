import { useState, useCallback, useEffect } from 'react'
import { cn } from '@/lib/utils'
import type { LoopState, LoopStateDetail } from '../lib/types'
import { launchRun, stopRun } from '../lib/api'
import { LoopStateBadge } from '@/tools/session-live/components/LoopStateBadge'

interface LoopControlBarProps {
  runId: string
  loopState: LoopState
  loopDetail?: LoopStateDetail | null
  onAction?: () => void
}

const PRESETS = [0, 10, 50, 200, 500, 1000] as const

const EXIT_REASON_LABELS: Record<string, { label: string; color: string }> = {
  completed: { label: 'Todas as features concluidas', color: 'text-green-600 dark:text-green-400' },
  stopped: { label: 'Parado pelo usuario', color: 'text-muted-foreground' },
  deps_impossible: { label: 'Dependencias impossiveis', color: 'text-red-600 dark:text-red-400' },
  iteration_limit: { label: 'Limite de iteracoes atingido', color: 'text-amber-600 dark:text-amber-400' },
}

function formatElapsed(startedAt: string): string {
  const start = new Date(startedAt).getTime()
  const now = Date.now()
  const diffMs = Math.max(0, now - start)
  const totalMinutes = Math.floor(diffMs / 60_000)
  if (totalMinutes < 60) return `${totalMinutes}m`
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${hours}h${minutes.toString().padStart(2, '0')}m`
}

export function LoopControlBar({ runId, loopState, loopDetail, onAction }: LoopControlBarProps) {
  const [maxIterations, setMaxIterations] = useState(0)
  const [loading, setLoading] = useState(false)
  const [, setTick] = useState(0)

  // Re-render every 30s to update elapsed time
  useEffect(() => {
    if ((loopState === 'running' || loopState === 'between') && loopDetail?.started_at) {
      const interval = setInterval(() => setTick(t => t + 1), 30_000)
      return () => clearInterval(interval)
    }
  }, [loopState, loopDetail?.started_at])

  const handleLaunch = useCallback(async () => {
    setLoading(true)
    try {
      await launchRun(runId, maxIterations)
      onAction?.()
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [runId, maxIterations, onAction])

  const handleStop = useCallback(async () => {
    setLoading(true)
    try {
      await stopRun(runId)
      onAction?.()
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [runId, onAction])

  // idle | completed: pills + Iniciar
  if (loopState === 'idle' || loopState === 'completed') {
    const exitInfo = loopDetail?.exit_reason ? EXIT_REASON_LABELS[loopDetail.exit_reason] : null

    return (
      <div className="mt-3 space-y-1.5">
        {exitInfo && loopState === 'idle' && (
          <div className={cn('text-xs px-3', exitInfo.color)}>
            {exitInfo.label}
          </div>
        )}
        <div className="flex items-center gap-2 bg-muted/30 rounded-lg px-3 py-2">
          {loopState === 'completed' && (
            <span className="text-xs font-medium text-green-600 dark:text-green-400 mr-1">Completo!</span>
          )}
          {PRESETS.map((n) => (
            <button
              key={n}
              onClick={() => setMaxIterations(n)}
              className={cn(
                'px-3 py-1 rounded-md text-xs font-medium transition-colors',
                maxIterations === n
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted'
              )}
            >
              {n === 0 ? '\u221e' : n}
            </button>
          ))}
          <button
            onClick={handleLaunch}
            disabled={loading}
            className="ml-auto px-3 py-1 text-xs font-medium rounded-md border border-green-500/30 text-green-600 dark:text-green-400 hover:bg-green-500/10 transition-colors disabled:opacity-50"
          >
            Iniciar Loop
          </button>
        </div>
      </div>
    )
  }

  // running | between: badge + info line + Parar
  if (loopState === 'running' || loopState === 'between') {
    const d = loopDetail
    const limitLabel = d?.max_iterations === 0 ? '\u221e' : String(d?.max_iterations ?? '?')
    const infoLine = d ? `Iteracao ${d.iteration}/${limitLabel} \u00b7 ${d.feature_id} \u00b7 ${d.done}/${d.total} features` : null
    const elapsed = d?.started_at ? formatElapsed(d.started_at) : null

    return (
      <div className="mt-3 space-y-1">
        {infoLine && (
          <div className="text-xs text-muted-foreground tabular-nums px-3">
            {infoLine}{elapsed ? ` \u00b7 rodando ha ${elapsed}` : ''}
          </div>
        )}
        <div className="flex items-center gap-2 bg-muted/30 rounded-lg px-3 py-2">
          <LoopStateBadge state={loopState} />
          <button
            onClick={handleStop}
            disabled={loading}
            className="ml-auto px-3 py-1 text-xs font-medium rounded-md border border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
          >
            Parar
          </button>
        </div>
      </div>
    )
  }

  // stopping: badge only
  if (loopState === 'stopping') {
    return (
      <div className="mt-3 flex items-center gap-2 bg-muted/30 rounded-lg px-3 py-2">
        <LoopStateBadge state={loopState} />
        <span className="text-xs text-muted-foreground">aguardando sessao finalizar</span>
      </div>
    )
  }

  return null
}
