import { cn } from '@/lib/utils';
import type { LoopState } from '@/lib/factory-types';

interface LoopStateBadgeProps {
  state: LoopState | string;
  className?: string;
}

const stateStyles: Record<string, { bg: string; text: string; pulse?: boolean }> = {
  idle:      { bg: 'bg-zinc-100 dark:bg-zinc-800', text: 'text-zinc-600 dark:text-zinc-400' },
  running:   { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', pulse: true },
  between:   { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', pulse: true },
  stopping:  { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400' },
  completed: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400' },
};

export function LoopStateBadge({ state, className }: LoopStateBadgeProps) {
  const style = stateStyles[state] ?? stateStyles.idle;
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-medium rounded-full',
      style.bg, style.text,
      className,
    )}>
      <span className={cn('h-1.5 w-1.5 rounded-full', style.text.replace('text-', 'bg-'), style.pulse && 'animate-pulse')} />
      {state}
    </span>
  );
}
