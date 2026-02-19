/**
 * OutputViewer — componente compartilhado para renderização de eventos JSONL.
 * Usado por SessionsPanel, ConsolePanel e LogModal.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { JsonlEvent, JsonlContent, JsonlToolResult } from '@/lib/factory-types';

interface OutputViewerProps {
  events: JsonlEvent[];
  className?: string;
  autoScroll?: boolean;
}

interface DisplayItem {
  type: 'system' | 'text' | 'tool_call' | 'result' | 'legacy';
  content: any;
  toolResult?: { content: string; is_error?: boolean };
}

function groupEventsToDisplayItems(events: JsonlEvent[]): DisplayItem[] {
  const items: DisplayItem[] = [];
  const toolResultMap = new Map<string, { content: string; is_error?: boolean }>();

  // First pass: collect tool results from user messages
  for (const ev of events) {
    if (ev.type === 'user' && 'message' in ev) {
      const msg = ev.message as { content: JsonlToolResult[] };
      if (Array.isArray(msg.content)) {
        for (const r of msg.content) {
          if (r.type === 'tool_result' && r.tool_use_id) {
            const text = typeof r.content === 'string'
              ? r.content
              : Array.isArray(r.content)
                ? r.content.map((c: any) => c.text || '').join('\n')
                : '';
            toolResultMap.set(r.tool_use_id, { content: text, is_error: r.is_error });
          }
        }
      }
    }
  }

  // Second pass: build display items
  for (const ev of events) {
    if (ev.type === 'system') {
      items.push({ type: 'system', content: ev });
    } else if (ev.type === 'assistant' && 'message' in ev) {
      const msg = ev.message as { content: JsonlContent[] };
      if (Array.isArray(msg.content)) {
        for (const c of msg.content) {
          if (c.type === 'text') {
            items.push({ type: 'text', content: c.text });
          } else if (c.type === 'tool_use') {
            const result = toolResultMap.get(c.id);
            items.push({ type: 'tool_call', content: c, toolResult: result });
          }
        }
      }
    } else if (ev.type === 'result') {
      items.push({ type: 'result', content: ev });
    } else if (ev.type === 'legacy') {
      items.push({ type: 'legacy', content: ev });
    }
    // user messages are handled via toolResultMap
  }

  return items;
}

function ToolCallItem({ item }: { item: DisplayItem }) {
  const [expanded, setExpanded] = useState(false);
  const tool = item.content;
  const result = item.toolResult;

  return (
    <div className="border-l-2 border-blue-500/30 pl-3 my-1">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-mono"
      >
        {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        <span className="font-semibold">{tool.name}</span>
        {result?.is_error && <span className="text-red-400 ml-1">(erro)</span>}
      </button>
      {expanded && (
        <div className="mt-1 space-y-1">
          <pre className="text-[11px] text-zinc-500 whitespace-pre-wrap break-all max-h-40 overflow-auto">
            {JSON.stringify(tool.input, null, 2)}
          </pre>
          {result && (
            <pre className={cn(
              'text-[11px] whitespace-pre-wrap break-all max-h-60 overflow-auto border-t border-zinc-800 pt-1',
              result.is_error ? 'text-red-400' : 'text-zinc-400',
            )}>
              {result.content.slice(0, 2000)}{result.content.length > 2000 ? '...' : ''}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

export function OutputViewer({ events, className, autoScroll = true }: OutputViewerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const userScrolledRef = useRef(false);

  const items = groupEventsToDisplayItems(events);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 50;
    userScrolledRef.current = !atBottom;
  }, []);

  useEffect(() => {
    if (autoScroll && !userScrolledRef.current) {
      const el = scrollRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    }
  }, [events, autoScroll]);

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className={cn(
        'bg-zinc-950 text-zinc-300 font-mono text-xs overflow-auto p-3 rounded-md',
        className,
      )}
    >
      {items.length === 0 && (
        <p className="text-zinc-600 italic">Sem eventos.</p>
      )}
      {items.map((item, i) => {
        if (item.type === 'system') {
          const ev = item.content;
          return (
            <div key={i} className="text-zinc-600 text-[10px] my-1">
              [system{ev.subtype ? `:${ev.subtype}` : ''}]
              {ev.model && <span className="ml-1 text-zinc-500">{ev.model}</span>}
            </div>
          );
        }
        if (item.type === 'text') {
          return (
            <div key={i} className="whitespace-pre-wrap my-1 text-zinc-200">
              {item.content}
            </div>
          );
        }
        if (item.type === 'tool_call') {
          return <ToolCallItem key={i} item={item} />;
        }
        if (item.type === 'result') {
          const r = item.content;
          return (
            <div key={i} className="text-emerald-400 text-[10px] mt-2 pt-1 border-t border-zinc-800">
              [result]
              {r.cost_usd != null && <span className="ml-2">${r.cost_usd.toFixed(4)}</span>}
              {r.duration_ms != null && <span className="ml-2">{Math.round(r.duration_ms / 1000)}s</span>}
              {r.turns != null && <span className="ml-2">{r.turns} turns</span>}
            </div>
          );
        }
        if (item.type === 'legacy') {
          return (
            <div key={i} className="text-zinc-500 whitespace-pre-wrap my-1">
              {item.content.lines?.join('\n')}
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}
