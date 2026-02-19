import { cn } from '@/lib/utils';
import type { FeatureStatus } from '@/lib/factory-types';

interface StatusBadgeProps {
  status: FeatureStatus | string;
  className?: string;
}

const styles: Record<string, string> = {
  passing:     'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  failing:     'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  pending:     'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
  blocked:     'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  skipped:     'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const style = styles[status] ?? styles.pending;
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded-full', style, className)}>
      {status}
    </span>
  );
}
