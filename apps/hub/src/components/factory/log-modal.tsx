/**
 * LogModal — overlay fullscreen com terminal JSONL para features in_progress.
 * Portado de sneak-peek-hub/src/components/LogModal.tsx
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OutputViewer } from './output-viewer';
import { fetchSessionOutput } from '@/lib/factory-api';
import type { JsonlEvent } from '@/lib/factory-types';

interface LogModalProps {
  slug: string;
  sessionId: string;
  onClose: () => void;
}

export function LogModal({ slug, sessionId, onClose }: LogModalProps) {
  const [events, setEvents] = useState<JsonlEvent[]>([]);
  const [totalBytes, setTotalBytes] = useState(0);
  const mountedRef = useRef(true);

  const loadOutput = useCallback(async () => {
    try {
      if (totalBytes > 0) {
        const result = await fetchSessionOutput(slug, sessionId, 0, totalBytes);
        if (!mountedRef.current) return;
        if (result.append && result.events.length > 0) {
          setEvents(prev => [...prev, ...result.events]);
        }
        setTotalBytes(result.total_bytes);
      } else {
        const result = await fetchSessionOutput(slug, sessionId, 200);
        if (!mountedRef.current) return;
        setEvents(result.events);
        setTotalBytes(result.total_bytes);
      }
    } catch { /* ok */ }
  }, [slug, sessionId, totalBytes]);

  useEffect(() => {
    mountedRef.current = true;
    loadOutput();
    const timer = setInterval(loadOutput, 3000);
    return () => {
      mountedRef.current = false;
      clearInterval(timer);
    };
  }, [loadOutput]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex flex-col">
      <div className="flex items-center justify-between p-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono text-zinc-300">{sessionId}</span>
          <span className="text-xs text-zinc-500">{events.length} eventos</span>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-zinc-400 hover:text-zinc-200">
          <X className="h-4 w-4" />
        </Button>
      </div>
      <OutputViewer events={events} className="flex-1 rounded-none" />
    </div>
  );
}
