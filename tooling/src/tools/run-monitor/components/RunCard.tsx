import { cn } from '@/lib/utils'
import type { RunSummary } from '../lib/types'
import { LoopStateBadge } from '@/tools/session-live/components/LoopStateBadge'

interface RunCardProps {
  run: RunSummary
  isSelected: boolean
  onClick: () => void
}

function ToolBadge({ tool }: { tool: RunSummary['tool'] }) {
  const label = tool === 'claude-code' ? 'CC' : tool === 'opencode' ? 'OC' : tool === 'codex' ? 'CX' : '??'
  const color = tool === 'claude-code'
    ? 'bg-orange-500/15 text-orange-600 dark:text-orange-400'
    : tool === 'opencode'
      ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
      : tool === 'codex'
        ? 'bg-teal-500/15 text-teal-600 dark:text-teal-400'
        : 'bg-gray-500/15 text-gray-600'

  return (
    <span className={cn('text-[9px] font-bold px-1 py-0.5 rounded uppercase shrink-0', color)}>
      {label}
    </span>
  )
}

function ProgressBar({ passing, total }: { passing: number; total: number }) {
  const pct = total > 0 ? (passing / total) * 100 : 0

  return (
    <div className="flex items-center gap-2 mt-1.5">
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300',
            pct === 100 ? 'bg-green-500' : pct > 0 ? 'bg-amber-500' : 'bg-muted-foreground/30'
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[10px] text-muted-foreground tabular-nums shrink-0">
        {passing}/{total}
      </span>
    </div>
  )
}

export function RunCard({ run, isSelected, onClick }: RunCardProps) {
  const shortName = run.project ?? run.id

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left p-2.5 rounded-lg transition-colors relative',
        isSelected
          ? 'bg-primary text-primary-foreground'
          : 'hover:bg-muted'
      )}
    >
      {(run.loop_state === 'running' || run.loop_state === 'between' || run.loop_state === 'stopping') && (
        <div className="absolute top-1.5 right-1.5 flex items-center gap-1">
          <LoopStateBadge state={run.loop_state} compact />
          {run.iteration != null && (
            <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-muted text-muted-foreground tabular-nums">
              #{run.iteration}
            </span>
          )}
        </div>
      )}
      <div className="flex items-center gap-1.5">
        <span className="font-medium text-sm flex-1 truncate">
          {shortName}
          {run.milestone && (
            <span className="font-normal text-muted-foreground"> / {run.milestone}</span>
          )}
        </span>
        <ToolBadge tool={run.tool} />
        {run.is_external && (
          <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-violet-500/15 text-violet-600 dark:text-violet-400 uppercase shrink-0">
            EXT
          </span>
        )}
      </div>
      <ProgressBar passing={run.features.passing} total={run.features.total} />
    </button>
  )
}
