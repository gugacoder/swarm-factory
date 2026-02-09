import { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import type { RunDetail as RunDetailType } from '../lib/types'
import { fetchRunDetail } from '../lib/api'
import { FeatureList } from './FeatureList'
import { SessionList } from './SessionList'
import { LoopStateBadge } from '@/tools/session-live/components/LoopStateBadge'
import { LoopControlBar } from './LoopControlBar'
import { SessionView } from '@/tools/session-live/SessionView'

interface RunDetailProps {
  run: RunDetailType
  loading: boolean
  onRefresh?: () => void
  onBack?: () => void
}

type Tab = 'features' | 'progress' | 'sessions'

function ToolLabel({ tool }: { tool: RunDetailType['tool'] }) {
  const labels = {
    'claude-code': 'Claude Code',
    'opencode': 'OpenCode',
    'unknown': 'Desconhecido',
  }
  return <span>{labels[tool]}</span>
}

export function RunDetail({ run, loading, onRefresh, onBack }: RunDetailProps) {
  const [tab, setTab] = useState<Tab>('features')
  const [progressFull, setProgressFull] = useState(false)
  const [fullProgress, setFullProgress] = useState<string | null>(null)
  const [loadingProgress, setLoadingProgress] = useState(false)
  const [sessionModal, setSessionModal] = useState<string | null>(null)

  const handleToggleProgress = useCallback(async () => {
    if (progressFull) {
      setProgressFull(false)
      setFullProgress(null)
      return
    }
    setLoadingProgress(true)
    try {
      const { run: fullRun } = await fetchRunDetail(run.id, true)
      setFullProgress(fullRun.progress)
      setProgressFull(true)
    } catch { /* ignore */ }
    finally { setLoadingProgress(false) }
  }, [progressFull, run.id])

  const pct = run.features.total > 0
    ? Math.round((run.features.passing / run.features.total) * 100)
    : 0

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-border bg-card shrink-0">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              {onBack && (
                <button
                  onClick={onBack}
                  className="md:hidden text-muted-foreground hover:text-foreground transition-colors shrink-0"
                  title="Voltar"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              <h2 className="font-bold truncate">{run.id}</h2>
              <LoopStateBadge state={run.loop_state} />
              {loading && (
                <div className="w-3 h-3 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5 flex-wrap">
              <ToolLabel tool={run.tool} />
              <span className={cn(
                'text-[9px] font-bold px-1 py-0.5 rounded uppercase',
                run.is_external
                  ? 'bg-violet-500/15 text-violet-600 dark:text-violet-400'
                  : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
              )}>
                {run.is_external ? 'Projeto externo' : 'Workspace local'}
              </span>
              {run.milestone && <span className="hidden md:inline">Milestone: {run.milestone}</span>}
            </div>
            <div className="hidden md:flex items-center gap-3 text-[10px] text-muted-foreground mt-1 flex-wrap">
              <span title={run.location} className="truncate max-w-[300px]">
                {run.location}
              </span>
              {run.planning_path && (
                <span title={run.planning_path} className="truncate max-w-[250px]">
                  Planning: ...{run.planning_path.split(/[/\\]/).slice(-2).join('/')}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={cn(
              'text-lg font-bold tabular-nums',
              pct === 100 ? 'text-green-500' : pct > 50 ? 'text-amber-500' : 'text-red-500'
            )}>
              {pct}%
            </span>
            <div className="text-[10px] text-muted-foreground text-right">
              <div className="text-green-600">{run.features.passing} passing</div>
              <div className="text-red-500">{run.features.failing} failing</div>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 rounded-full bg-muted overflow-hidden mt-2">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              pct === 100 ? 'bg-green-500' : pct > 0 ? 'bg-amber-500' : 'bg-muted-foreground/30'
            )}
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Loop control */}
        <LoopControlBar runId={run.id} loopState={run.loop_state} loopDetail={run.loop_state_detail} onAction={onRefresh} />

        {/* Tabs */}
        <div className="flex gap-1 mt-3">
          {(['features', 'progress', 'sessions'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'px-3 py-1 rounded-md text-xs font-medium transition-colors',
                tab === t
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted'
              )}
            >
              {t === 'features' ? 'Features' : t === 'progress' ? 'Progresso' : 'Sessoes'}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {tab === 'features' && (
          <FeatureList
            features={run.features_list ?? []}
            runId={run.id}
            currentFeatureId={run.loop_state_detail?.feature_id}
            onOpenSession={setSessionModal}
          />
        )}
        {tab === 'progress' && (
          <div className="text-sm">
            {run.progress ? (
              <>
                {run.progress_total_lines > 50 && (
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {progressFull ? `${run.progress_total_lines} linhas` : `Ultimas 50 de ${run.progress_total_lines} linhas`}
                    </span>
                    <button
                      onClick={handleToggleProgress}
                      disabled={loadingProgress}
                      className="text-xs text-primary hover:underline disabled:opacity-50"
                    >
                      {loadingProgress ? 'Carregando...' : progressFull ? 'Ver resumo' : 'Ver completo'}
                    </button>
                  </div>
                )}
                <pre className="whitespace-pre-wrap font-mono text-xs text-muted-foreground bg-muted/50 rounded-lg p-3 leading-relaxed">
                  {progressFull && fullProgress ? fullProgress : run.progress}
                </pre>
              </>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Nenhum progresso registrado
              </p>
            )}
          </div>
        )}
        {tab === 'sessions' && (
          <SessionList runId={run.id} />
        )}
      </div>

      {/* Session modal */}
      {sessionModal && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60"
            onClick={() => setSessionModal(null)}
          />
          <div className="fixed inset-4 z-50 bg-card rounded-xl border border-border overflow-hidden flex flex-col">
            {/* Modal header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
              <span className="font-semibold text-sm truncate">
                Sessao: {sessionModal}
              </span>
              <button
                onClick={() => setSessionModal(null)}
                className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                title="Fechar"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* Modal body */}
            <div className="flex-1 min-h-0">
              <SessionView runId={run.id} sessionId={sessionModal} />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
