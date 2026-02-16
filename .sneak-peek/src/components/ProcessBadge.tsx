import { cn } from '@/lib/utils'

interface ProcessBadgeProps {
  pid: number | null
  alive: boolean
  className?: string
}

export function ProcessBadge({ pid, alive, className }: ProcessBadgeProps) {
  if (!pid) return null
  return (
    <span className={cn('inline-flex items-center gap-1 text-[11px] font-mono text-muted-foreground', className)}>
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', alive ? 'bg-green-500' : 'bg-zinc-400 dark:bg-zinc-600')} />
      PID {pid}
    </span>
  )
}
