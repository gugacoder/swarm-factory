import { cn } from '@/lib/utils'

interface ProgressBarProps {
  done: number
  total: number
  className?: string
  showLabel?: boolean
}

export function ProgressBar({ done, total, className, showLabel = true }: ProgressBarProps) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            pct === 100 ? 'bg-green-500' : pct > 0 ? 'bg-primary' : 'bg-transparent'
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-mono text-muted-foreground whitespace-nowrap">
          {done}/{total}
        </span>
      )}
    </div>
  )
}
