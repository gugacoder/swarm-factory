/**
 * Factory Progress — viewer do progress.txt em tempo real.
 */

import { useCallback } from 'react';
import { useWorkspace } from '@/hooks/use-workspace';
import { usePolling } from '@/hooks/use-polling';
import { fetchProgress } from '@/lib/factory-api';

export function FactoryProgressPage() {
  const { slug } = useWorkspace();

  const fetcher = useCallback(
    () => fetchProgress(slug!, 500),
    [slug],
  );
  const { data, loading } = usePolling({
    fetcher,
    interval: 3_000,
    enabled: !!slug,
  });

  if (loading && !data) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
        Carregando progress...
      </div>
    );
  }

  if (!data?.text) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
        Nenhum progress.txt encontrado
      </div>
    );
  }

  return (
    <pre className="flex-1 overflow-auto p-4 text-xs font-mono whitespace-pre-wrap break-words bg-zinc-950 text-zinc-300">
      {data.text}
    </pre>
  );
}
