import { cn } from '@/lib/utils'
import type { LoopState } from '@/tools/run-monitor/lib/types'

interface LoopStateBadgeProps {
  state: LoopState
  compact?: boolean
  className?: string
}

const config: Record<LoopState, { dot: string; label: string }> = {
  running:   { dot: 'bg-green-500 animate-pulse',  label: 'Rodando' },
  between:   { dot: 'bg-amber-500 animate-pulse',  label: 'Entre sessões' },
  stopping:  { dot: 'bg-red-500 animate-pulse',    label: 'Parando...' },
  completed: { dot: 'bg-green-500',                 label: 'Completo' },
  idle:      { dot: 'bg-zinc-400 dark:bg-zinc-600', label: 'Parado' },
}

export function LoopStateBadge({ state, compact = false, className }: LoopStateBadgeProps) {
  const { dot, label } = config[state]

  if (compact) {
    return (
      <span
        className={cn('w-2 h-2 rounded-full shrink-0', dot, className)}
        title={label}
      />
    )
  }

  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium', className)}>
      <span className={cn('w-2 h-2 rounded-full shrink-0', dot)} />
      {state === 'completed' ? (
        <span className="text-green-600 dark:text-green-400">{label}</span>
      ) : (
        <span className="text-muted-foreground">{label}</span>
      )}
    </span>
  )
}
