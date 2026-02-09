import { cn } from '@/lib/utils'

interface ProcessBadgeProps {
  pid: number | null
  alive: boolean
  stime?: string | null
  command?: string | null
  className?: string
}

export function ProcessBadge({ pid, alive, stime, command, className }: ProcessBadgeProps) {
  const basename = command ? command.split('/').pop() : null

  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium', className)}>
      <span
        className={cn(
          'w-2 h-2 rounded-full shrink-0',
          alive
            ? 'bg-green-500 animate-pulse'
            : 'bg-zinc-400 dark:bg-zinc-600'
        )}
      />
      {alive ? (
        <>
          <span className="text-green-600 dark:text-green-400 tabular-nums">PID {pid}</span>
          {stime && <span className="text-muted-foreground">&middot; {stime}</span>}
          {basename && <span className="text-muted-foreground">&middot; {basename}</span>}
        </>
      ) : (
        <span className="text-muted-foreground">Finalizado</span>
      )}
    </span>
  )
}
