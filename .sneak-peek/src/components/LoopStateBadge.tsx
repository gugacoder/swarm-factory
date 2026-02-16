import { cn } from '@/lib/utils'
import type { LoopState } from '@/lib/types'

interface LoopStateBadgeProps {
  state: LoopState
  className?: string
}

const config: Record<LoopState, { dot: string; label: string; text: string }> = {
  running:   { dot: 'bg-green-500 animate-pulse',  label: 'Rodando',       text: '' },
  between:   { dot: 'bg-amber-500 animate-pulse',  label: 'Entre sessões', text: '' },
  stopping:  { dot: 'bg-red-500 animate-pulse',    label: 'Parando...',    text: '' },
  completed: { dot: 'bg-green-500',                 label: 'Completo',      text: 'text-green-600 dark:text-green-400' },
  idle:      { dot: 'bg-zinc-400 dark:bg-zinc-600', label: 'Parado',        text: '' },
}

export function LoopStateBadge({ state, className }: LoopStateBadgeProps) {
  const c = config[state]
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium', className)}>
      <span className={cn('w-2 h-2 rounded-full shrink-0', c.dot)} />
      <span className={cn('text-muted-foreground', c.text)}>{c.label}</span>
    </span>
  )
}
