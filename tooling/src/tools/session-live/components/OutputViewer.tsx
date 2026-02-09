import { useRef, useEffect, useState, useCallback, useMemo } from 'react'
import { cn } from '@/lib/utils'
import type { SessionOutput, JsonlEvent, JsonlContent, JsonlToolResult } from '@/tools/run-monitor/lib/types'

interface OutputViewerProps {
  output: SessionOutput
  tailSize: number
  onTailSizeChange: (size: number) => void
}

const TAIL_OPTIONS = [50, 100, 200]

// --- DisplayItem types ---

type DisplayItem =
  | { kind: 'system'; model?: string; tools_count?: number }
  | { kind: 'text'; text: string }
  | { kind: 'tool_call'; name: string; summary: string; result?: string; is_error?: boolean }
  | { kind: 'result'; cost_usd?: number; duration_ms?: number; turns?: number }
  | { kind: 'legacy'; lines: string[] }

// --- Helpers ---

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s
  return s.slice(0, max) + `\u2026 (${formatBytes(s.length)})`
}

function summarizeToolInput(name: string, input: Record<string, any>): string {
  switch (name) {
    case 'Bash':
      return truncate(String(input.command ?? ''), 120)
    case 'Edit':
    case 'Write':
    case 'Read':
      return String(input.file_path ?? '')
    case 'Glob':
      return String(input.pattern ?? '')
    case 'Grep':
      return truncate(String(input.pattern ?? ''), 120)
    case 'WebFetch':
      return truncate(String(input.url ?? ''), 120)
    case 'Task':
      return truncate(String(input.description ?? ''), 120)
    default:
      return name
  }
}

function groupEventsToDisplayItems(events: JsonlEvent[]): DisplayItem[] {
  const items: DisplayItem[] = []

  // Build a map: tool_use_id -> tool_result for matching
  const toolResultMap = new Map<string, { content: string; is_error?: boolean }>()
  for (const ev of events) {
    if (ev.type === 'user' && ev.message?.content) {
      for (const c of ev.message.content) {
        const tr = c as JsonlToolResult
        if (tr.type === 'tool_result' && tr.tool_use_id) {
          const content = Array.isArray(tr.content)
            ? tr.content.map(b => b.text ?? '').join('\n')
            : String(tr.content ?? '')
          toolResultMap.set(tr.tool_use_id, { content, is_error: tr.is_error })
        }
      }
    }
  }

  for (const ev of events) {
    if (ev.type === 'system') {
      items.push({
        kind: 'system',
        model: ev.model,
        tools_count: ev.tools?.length,
      })
    } else if (ev.type === 'assistant') {
      const content = ev.message?.content as JsonlContent[] | undefined
      if (!content) continue
      for (const c of content) {
        if (c.type === 'text' && c.text.trim()) {
          items.push({ kind: 'text', text: c.text })
        } else if (c.type === 'tool_use') {
          const summary = summarizeToolInput(c.name, c.input)
          const match = toolResultMap.get(c.id)
          items.push({
            kind: 'tool_call',
            name: c.name,
            summary,
            result: match?.content,
            is_error: match?.is_error,
          })
        }
      }
    } else if (ev.type === 'result') {
      items.push({
        kind: 'result',
        cost_usd: ev.cost_usd,
        duration_ms: ev.duration_ms,
        turns: ev.turns,
      })
    } else if (ev.type === 'legacy') {
      items.push({ kind: 'legacy', lines: ev.lines })
    }
    // 'user' events are consumed via toolResultMap, not rendered directly
  }

  return items
}

function formatDurationMs(ms: number): string {
  const totalSec = Math.floor(ms / 1000)
  if (totalSec < 60) return `${totalSec}s`
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  return `${min}m${sec.toString().padStart(2, '0')}s`
}

// --- Sub-components ---

function SystemItem({ item }: { item: DisplayItem & { kind: 'system' } }) {
  const parts: string[] = []
  if (item.model) parts.push(item.model)
  if (item.tools_count != null) parts.push(`${item.tools_count} ferramentas`)
  return (
    <div className="text-[10px] text-zinc-500 px-2 py-1 bg-zinc-900/50 rounded">
      {parts.join(' \u00b7 ') || 'system'}
    </div>
  )
}

function TextItem({ item }: { item: DisplayItem & { kind: 'text' } }) {
  return (
    <div className="border-l-2 border-blue-500/50 pl-3 py-1 whitespace-pre-wrap font-mono text-xs text-zinc-300 break-words">
      {truncate(item.text, 500)}
    </div>
  )
}

function ToolCallItem({ item }: { item: DisplayItem & { kind: 'tool_call' } }) {
  const [expanded, setExpanded] = useState(false)
  const hasResult = item.result != null && item.result.length > 0

  return (
    <div className="space-y-0.5">
      <div
        className={cn(
          'flex items-start gap-2 text-xs',
          item.is_error ? 'text-red-400' : 'text-zinc-400',
        )}
      >
        <span className={cn(
          'shrink-0 font-mono font-semibold',
          item.is_error ? 'text-red-500' : 'text-amber-500/80',
        )}>
          [{item.name}]
        </span>
        <span className="font-mono break-all">{item.summary}</span>
      </div>
      {hasResult && (
        <div className="ml-4">
          {!expanded ? (
            <button
              onClick={() => setExpanded(true)}
              className="text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors"
            >
              {truncate(item.result!, 300)}
              {item.result!.length > 300 && ' [expandir]'}
            </button>
          ) : (
            <div className="relative">
              <pre className="text-[10px] text-zinc-500 whitespace-pre-wrap break-all max-h-96 overflow-y-auto">
                {item.result}
              </pre>
              <button
                onClick={() => setExpanded(false)}
                className="text-[10px] text-zinc-600 hover:text-zinc-400 mt-1 transition-colors"
              >
                [recolher]
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ResultItem({ item }: { item: DisplayItem & { kind: 'result' } }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2 bg-green-500/10 rounded text-xs">
      {item.cost_usd != null && (
        <span className="text-green-400 font-mono font-semibold">${item.cost_usd.toFixed(2)}</span>
      )}
      {item.turns != null && (
        <span className="text-zinc-400 font-mono">{item.turns} turns</span>
      )}
      {item.duration_ms != null && (
        <span className="text-zinc-400 font-mono">{formatDurationMs(item.duration_ms)}</span>
      )}
    </div>
  )
}

function LegacyItem({ item }: { item: DisplayItem & { kind: 'legacy' } }) {
  return (
    <>
      {item.lines.map((line, i) => (
        <div key={i} className="whitespace-pre-wrap break-all min-h-[1.2em]">
          {line || '\u00A0'}
        </div>
      ))}
    </>
  )
}

// --- Main Component ---

export function OutputViewer({ output, tailSize, onTailSizeChange }: OutputViewerProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [autoScroll, setAutoScroll] = useState(true)
  const prevEventsLenRef = useRef(0)

  const displayItems = useMemo(() => groupEventsToDisplayItems(output.events), [output.events])

  // Auto-scroll when new events arrive
  useEffect(() => {
    if (autoScroll && scrollRef.current && output.events.length !== prevEventsLenRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
    prevEventsLenRef.current = output.events.length
  }, [output.events, autoScroll])

  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40
    setAutoScroll(atBottom)
  }, [])

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
      setAutoScroll(true)
    }
  }, [])

  const eventsLabel = output.total_events === -1 ? '?' : output.total_events.toLocaleString()

  return (
    <div className="flex flex-col h-full">
      {/* Terminal area */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto bg-zinc-950 text-zinc-300 font-mono text-sm md:text-xs p-3 leading-relaxed space-y-2"
      >
        {output.truncated && (
          <div className="text-zinc-500 italic mb-2 text-center text-[10px]">
            ... eventos anteriores omitidos ...
          </div>
        )}
        {displayItems.length === 0 ? (
          <div className="text-zinc-600 text-center py-8">Aguardando output...</div>
        ) : (
          displayItems.map((item, i) => {
            switch (item.kind) {
              case 'system': return <SystemItem key={i} item={item} />
              case 'text': return <TextItem key={i} item={item} />
              case 'tool_call': return <ToolCallItem key={i} item={item} />
              case 'result': return <ResultItem key={i} item={item} />
              case 'legacy': return <LegacyItem key={i} item={item} />
            }
          })
        )}
      </div>

      {/* FAB scroll-to-bottom */}
      {!autoScroll && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-14 right-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-full p-2 shadow-lg transition-colors"
          title="Ir para o final"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between flex-wrap gap-2 px-3 py-1.5 bg-zinc-900 border-t border-zinc-800 text-[10px] text-zinc-500 shrink-0">
        <span>{eventsLabel} eventos | {formatBytes(output.total_bytes)}</span>
        <div className="flex items-center gap-1.5">
          <span>Tail:</span>
          {TAIL_OPTIONS.map(opt => (
            <button
              key={opt}
              onClick={() => onTailSizeChange(opt)}
              className={cn(
                'px-1.5 py-0.5 rounded transition-colors',
                tailSize === opt
                  ? 'bg-zinc-700 text-zinc-200'
                  : 'hover:bg-zinc-800 text-zinc-500'
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
