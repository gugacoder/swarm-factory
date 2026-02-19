/**
 * Factory Console — real-time JSONL viewer da sessão ativa.
 * Portado de sneak-peek-hub/src/panels/ConsolePanel.tsx
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useWorkspace } from '@/hooks/use-workspace';
import { usePolling } from '@/hooks/use-polling';
import { fetchSessions, fetchSessionOutput } from '@/lib/factory-api';
import { OutputViewer } from '@/components/factory/output-viewer';
import { Button } from '@/components/ui/button';
import { ArrowDown } from 'lucide-react';
import type { SessionOutput } from '@/lib/factory-types';

export function FactoryConsolePage() {
  const { slug } = useWorkspace();

  const sessionsFetcher = useCallback(
    () => fetchSessions(slug!),
    [slug],
  );
  const { data: sessionsData } = usePolling({
    fetcher: sessionsFetcher,
    interval: 5_000,
    enabled: !!slug,
  });
  const sessions = sessionsData?.sessions ?? [];

  // Auto-detect active session
  const activeSession =
    sessions.find(s => s.alive && s.is_current)
    ?? sessions.find(s => s.is_current)
    ?? sessions[sessions.length - 1];
  const sid = activeSession?.id ?? null;

  const [output, setOutput] = useState<SessionOutput | null>(null);
  const lastBytesRef = useRef(0);
  const hasInitialRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollFab, setShowScrollFab] = useState(false);

  const loadOutput = useCallback(async () => {
    if (!sid || !slug) return;
    const sinceByte = hasInitialRef.current ? lastBytesRef.current : undefined;
    try {
      const result = await fetchSessionOutput(slug, sid, 100, sinceByte);
      if (hasInitialRef.current && result.append === false) {
        const full = await fetchSessionOutput(slug, sid, 100);
        setOutput(full);
        lastBytesRef.current = full.total_bytes;
      } else if (result.append && hasInitialRef.current && result.events.length > 0) {
        setOutput(prev => {
          if (!prev) return result;
          const merged = [...prev.events, ...result.events];
          const trimmed = merged.length > 200 ? merged.slice(-200) : merged;
          return { ...result, events: trimmed };
        });
        lastBytesRef.current = result.total_bytes;
      } else if (!hasInitialRef.current) {
        setOutput(result);
        lastBytesRef.current = result.total_bytes;
        hasInitialRef.current = true;
      }
    } catch { /* silent */ }
  }, [sid, slug]);

  // Reset on session change
  useEffect(() => {
    hasInitialRef.current = false;
    lastBytesRef.current = 0;
    setOutput(null);
    if (sid) loadOutput();
  }, [sid, loadOutput]);

  // Polling — faster when alive
  useEffect(() => {
    if (!sid) return;
    const alive = activeSession?.alive ?? false;
    const ms = alive ? 3_000 : 10_000;
    intervalRef.current = setInterval(loadOutput, ms);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [sid, activeSession?.alive, loadOutput]);

  if (!sid) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
        Nenhuma sessão ativa encontrada
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-2 border-b bg-card text-xs">
        <span className="font-mono font-medium">{sid}</span>
        {activeSession?.alive && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />}
        {output && (
          <span className="text-muted-foreground ml-auto">
            {output.total_events} eventos
          </span>
        )}
      </div>

      {/* Terminal */}
      <OutputViewer
        events={output?.events ?? []}
        className="flex-1 rounded-none"
      />

      {/* FAB scroll to bottom */}
      {showScrollFab && (
        <Button
          variant="default"
          size="icon"
          className="absolute bottom-6 right-6 rounded-full shadow-lg"
          onClick={() => {
            const el = scrollContainerRef.current;
            if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
          }}
        >
          <ArrowDown className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
