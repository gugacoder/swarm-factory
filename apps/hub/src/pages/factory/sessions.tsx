/**
 * Factory Sessions Panel — 2-pane session viewer com sidebar + OutputViewer.
 * Portado de sneak-peek-hub/src/panels/SessionsPanel.tsx
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWorkspace } from '@/hooks/use-workspace';
import { usePolling } from '@/hooks/use-polling';
import { fetchSessions, fetchSessionOutput } from '@/lib/factory-api';
import { OutputViewer } from '@/components/factory/output-viewer';
import { cn } from '@/lib/utils';
import type { SessionOutput } from '@/lib/factory-types';

function formatDuration(startedAt: string | null, finishedAt: string | null): string {
  if (!startedAt) return '—';
  const start = new Date(startedAt).getTime();
  const end = finishedAt ? new Date(finishedAt).getTime() : Date.now();
  const diff = end - start;
  const s = Math.floor(diff / 1000) % 60;
  const m = Math.floor(diff / 60000) % 60;
  const h = Math.floor(diff / 3600000);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FactorySessionsPage() {
  const { slug, sid: routeSid } = useParams<{ slug: string; sid?: string }>();
  const navigate = useNavigate();
  const { slug: wsSlug } = useWorkspace();
  const currentSlug = wsSlug ?? slug ?? null;

  const sessionsFetcher = useCallback(
    () => fetchSessions(currentSlug!),
    [currentSlug],
  );
  const { data: sessionsData } = usePolling({
    fetcher: sessionsFetcher,
    interval: 5_000,
    enabled: !!currentSlug,
  });
  const sessions = sessionsData?.sessions ?? [];

  const [selectedId, setSelectedId] = useState<string | null>(routeSid ?? null);
  const [output, setOutput] = useState<SessionOutput | null>(null);
  const lastBytesRef = useRef(0);
  const hasInitialRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  // Sync route param
  useEffect(() => {
    if (routeSid && routeSid !== selectedId) setSelectedId(routeSid);
  }, [routeSid]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-select current or first session
  useEffect(() => {
    if (selectedId || sessions.length === 0 || !slug) return;
    const current = sessions.find(s => s.is_current) ?? sessions[0];
    if (current) {
      setSelectedId(current.id);
      navigate(`/factory/sessions/${slug}/${current.id}`, { replace: true });
    }
  }, [sessions, selectedId, navigate, slug]);

  const selectedSession = sessions.find(s => s.id === selectedId);

  const loadOutput = useCallback(async () => {
    if (!selectedId || !currentSlug) return;
    const sinceByte = hasInitialRef.current ? lastBytesRef.current : undefined;
    try {
      const result = await fetchSessionOutput(currentSlug, selectedId, 100, sinceByte);
      if (hasInitialRef.current && result.append === false) {
        const full = await fetchSessionOutput(currentSlug, selectedId, 100);
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
  }, [selectedId, currentSlug]);

  // Reset on session change
  useEffect(() => {
    hasInitialRef.current = false;
    lastBytesRef.current = 0;
    setOutput(null);
    if (selectedId) loadOutput();
  }, [selectedId, loadOutput]);

  // Polling interval — faster when alive
  useEffect(() => {
    if (!selectedId) return;
    const alive = selectedSession?.alive ?? false;
    const ms = alive ? 3_000 : 10_000;
    intervalRef.current = setInterval(loadOutput, ms);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [selectedId, selectedSession?.alive, loadOutput]);

  return (
    <div className="flex h-full">
      {/* Session list sidebar */}
      <div className="w-[260px] shrink-0 border-r overflow-auto bg-card">
        <div className="p-3 border-b">
          <h3 className="text-sm font-semibold">Sessões ({sessions.length})</h3>
        </div>
        <div className="divide-y divide-border/50">
          {sessions.map(s => (
            <button
              key={s.id}
              onClick={() => {
                setSelectedId(s.id);
                if (slug) navigate(`/factory/sessions/${slug}/${s.id}`);
              }}
              className={cn(
                'w-full text-left px-3 py-2.5 text-xs transition-colors',
                selectedId === s.id ? 'bg-muted' : 'hover:bg-muted/30',
              )}
            >
              <div className="flex items-center gap-2">
                {s.is_current && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />}
                <span className="font-mono font-medium">{s.id}</span>
                {s.alive && (
                  <span className="ml-auto text-[10px] text-green-500 font-medium">PID {s.pid}</span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                <span>{formatDuration(s.started_at, s.finished_at)}</span>
                {s.exit_code != null && (
                  <span className={s.exit_code === 0 ? 'text-green-500' : 'text-red-400'}>
                    exit:{s.exit_code}
                  </span>
                )}
                {s.retries != null && s.retries > 0 && (
                  <span className="text-amber-400">{s.retries}r</span>
                )}
                <span className="ml-auto">{formatBytes(s.output_bytes)}</span>
              </div>
              {s.metrics && (
                <div className="flex items-center gap-2 mt-0.5 text-muted-foreground">
                  {s.metrics.cost_usd != null && <span>${s.metrics.cost_usd.toFixed(3)}</span>}
                  {s.metrics.turns != null && <span>{s.metrics.turns}t</span>}
                </div>
              )}
            </button>
          ))}
          {sessions.length === 0 && (
            <div className="p-4 text-center text-sm text-muted-foreground">Nenhuma sessão encontrada</div>
          )}
        </div>
      </div>

      {/* Output viewer */}
      <div className="flex-1 flex flex-col min-w-0">
        {output ? (
          <OutputViewer events={output.events} className="flex-1 rounded-none" />
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
            {selectedId ? 'Carregando output...' : 'Selecione uma sessão'}
          </div>
        )}
      </div>
    </div>
  );
}
