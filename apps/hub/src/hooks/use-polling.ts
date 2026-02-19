/**
 * Hook genérico de polling — portado de sneak-peek-hub/src/hooks/usePolling.ts
 */

import { useState, useEffect, useRef, useCallback } from 'react';

interface UsePollingOptions<T> {
  fetcher: () => Promise<T>;
  interval: number;
  enabled?: boolean;
}

export function usePolling<T>({ fetcher, interval, enabled = true }: UsePollingOptions<T>) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);
  const mountedRef = useRef(true);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const result = await fetcher();
      if (mountedRef.current) {
        setData(result);
        setError(null);
      }
    } catch (e: any) {
      if (mountedRef.current) setError(e);
    } finally {
      if (mountedRef.current && !silent) setLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    mountedRef.current = true;
    if (!enabled) return;

    load();
    const timer = setInterval(() => load(true), interval);

    return () => {
      mountedRef.current = false;
      clearInterval(timer);
    };
  }, [load, interval, enabled]);

  const refresh = useCallback(() => load(false), [load]);

  return { data, error, loading, refresh };
}
