import { useEffect, useRef, useCallback } from 'react';
import { getAccessToken } from '@/lib/auth';

type SSEHandler = (event: { type: string; data: any }) => void;

export function useSSE(url: string, onEvent: SSEHandler) {
  const retryRef = useRef(0);
  const maxRetry = 30000;
  const handlerRef = useRef(onEvent);
  handlerRef.current = onEvent;

  useEffect(() => {
    let es: EventSource | null = null;
    let timeout: ReturnType<typeof setTimeout>;
    let unmounted = false;

    function connect() {
      if (unmounted) return;

      const token = getAccessToken();
      // EventSource não suporta headers, usar query param
      const separator = url.includes('?') ? '&' : '?';
      const fullUrl = token ? `${url}${separator}token=${token}` : url;

      es = new EventSource(fullUrl);

      es.onopen = () => {
        retryRef.current = 0;
      };

      es.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          handlerRef.current({ type: 'message', data });
        } catch {
          // ignora parsing errors
        }
      };

      // Eventos tipados
      for (const eventType of ['feature:status', 'loop:start', 'loop:stop', 'loop:progress', 'project:created']) {
        es.addEventListener(eventType, (e: any) => {
          try {
            const data = JSON.parse(e.data);
            handlerRef.current({ type: eventType, data });
          } catch {
            // ignora
          }
        });
      }

      es.onerror = () => {
        es?.close();
        if (unmounted) return;

        // Backoff exponencial: 1s, 2s, 4s, 8s, ... max 30s
        const delay = Math.min(1000 * Math.pow(2, retryRef.current), maxRetry);
        retryRef.current++;
        timeout = setTimeout(connect, delay);
      };
    }

    connect();

    return () => {
      unmounted = true;
      es?.close();
      clearTimeout(timeout);
    };
  }, [url]);
}
