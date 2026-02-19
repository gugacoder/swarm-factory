import { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import type { StreamEvent } from '@/lib/factory-types';

interface StreamLogProps {
  events: StreamEvent[];
  className?: string;
}

export function StreamLog({ events, className }: StreamLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [events]);

  return (
    <div
      ref={scrollRef}
      className={cn('bg-zinc-950 text-zinc-300 font-mono text-xs overflow-auto p-3 rounded-md max-h-64', className)}
    >
      {events.length === 0 && <p className="text-zinc-600 italic">Aguardando...</p>}
      {events.map((ev, i) => {
        if (ev.type === 'log') return <div key={i} className="whitespace-pre-wrap">{ev.text}</div>;
        if (ev.type === 'done') return <div key={i} className="text-green-400 mt-1">Concluído (código {ev.exitCode})</div>;
        if (ev.type === 'error') return <div key={i} className="text-red-400 mt-1">{ev.error}</div>;
        return null;
      })}
    </div>
  );
}
