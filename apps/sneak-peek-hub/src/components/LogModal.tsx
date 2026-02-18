import { useState, useEffect, useCallback, useRef } from 'react'
import { useWorkspace } from '@/hooks/useWorkspace'
import { fetchSessions, fetchSessionOutput } from '@/lib/api'
import { cn } from '@/lib/utils'
import type { JsonlEvent, JsonlContent, JsonlToolResult, SessionOutput } from '@/lib/types'

interface DisplayItem {
  kind: 'system' | 'text' | 'tool_call' | 'result' | 'legacy'
  model?: string
  toolsCount?: number
  text?: string
  toolName?: string
  toolInput?: string
  toolResult?: string
  toolIsError?: boolean
  cost?: number
  duration?: number
  turns?: number
  lines?: string[]
}

function groupEvents(events: JsonlEvent[]): DisplayItem[] {
  const toolResults = new Map<string, { content: string; is_error?: boolean }>()
  const items: DisplayItem[] = []

  for (const ev of events) {
    if (ev.type === 'user' && 'message' in ev && ev.message?.content) {
      for (const c of ev.message.content) {
        const tr = c as JsonlToolResult
        if (tr.type === 'tool_result' && tr.tool_use_id) {
          const text = typeof tr.content === 'string' ? tr.content : (tr.content?.map((x: any) => x.text).join('\n') ?? '')
          toolResults.set(tr.tool_use_id, { content: text, is_error: tr.is_error })
        }
      }
    }
  }

  for (const ev of events) {
    if (ev.type === 'system') {
      items.push({ kind: 'system', model: ev.model, toolsCount: ev.tools?.length })
    } else if (ev.type === 'assistant' && 'message' in ev) {
      for (const c of (ev.message.content as JsonlContent[])) {
        if (c.type === 'text') {
          items.push({ kind: 'text', text: c.text })
        } else if (c.type === 'tool_use') {
          const r = toolResults.get(c.id)
          items.push({ kind: 'tool_call', toolName: c.name, toolInput: JSON.stringify(c.input, null, 2).slice(0, 500), toolResult: r?.content?.slice(0, 1000), toolIsError: r?.is_error })
        }
      }
    } else if (ev.type === 'result') {
      items.push({ kind: 'result', cost: ev.cost_usd, duration: ev.duration_ms, turns: ev.turns })
    } else if (ev.type === 'legacy' && 'lines' in ev) {
      items.push({ kind: 'legacy', lines: ev.lines })
    }
  }
  return items
}

export function LogModal({ onClose }: { onClose: () => void }) {
  const { slug } = useWorkspace()
  const [output, setOutput] = useState<SessionOutput | null>(null)
  const [sid, setSid] = useState<string | null>(null)
  const [alive, setAlive] = useState(false)
  const lastBytesRef = useRef(0)
  const hasInitialRef = useRef(false)
  const intervalRef = useRef<ReturnType<typeof setInterval>>()
  const containerRef = useRef<HTMLDivElement>(null)
  const [expandedTools, setExpandedTools] = useState<Set<number>>(new Set())

  // Detect active session
  useEffect(() => {
    fetchSessions(slug ?? undefined).then(data => {
      const sessions = data.sessions
      const active = sessions.find(s => s.alive && s.is_current) ?? sessions.find(s => s.is_current) ?? sessions[sessions.length - 1]
      if (active) {
        setSid(active.id)
        setAlive(active.alive)
      }
    }).catch(() => {})
  }, [slug])

  const loadOutput = useCallback(async () => {
    if (!sid) return
    const sinceByte = hasInitialRef.current ? lastBytesRef.current : undefined
    try {
      const result = await fetchSessionOutput(sid, 100, sinceByte, slug ?? undefined)
      if (hasInitialRef.current && result.append === false) {
        const full = await fetchSessionOutput(sid, 100, undefined, slug ?? undefined)
        setOutput(full)
        lastBytesRef.current = full.total_bytes
      } else if (result.append && hasInitialRef.current && result.events.length > 0) {
        setOutput(prev => {
          if (!prev) return result
          const merged = [...prev.events, ...result.events]
          const trimmed = merged.length > 200 ? merged.slice(-200) : merged
          return { ...result, events: trimmed }
        })
        lastBytesRef.current = result.total_bytes
      } else if (!hasInitialRef.current) {
        setOutput(result)
        lastBytesRef.current = result.total_bytes
        hasInitialRef.current = true
      }
    } catch { /* silent */ }
  }, [sid, slug])

  useEffect(() => {
    if (!sid) return
    loadOutput()
  }, [sid, loadOutput])

  useEffect(() => {
    if (!sid) return
    const ms = alive ? 3_000 : 10_000
    intervalRef.current = setInterval(loadOutput, ms)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [sid, alive, loadOutput])

  // Auto-scroll
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [output?.events.length])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const items = output ? groupEvents(output.events) : []

  const toggleTool = (idx: number) => {
    setExpandedTools(prev => {
      const next = new Set(prev)
      next.has(idx) ? next.delete(idx) : next.add(idx)
      return next
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Modal */}
      <div
        className="relative w-[90vw] max-w-4xl h-[80vh] flex flex-col rounded-lg overflow-hidden shadow-2xl border border-border"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-2.5 bg-zinc-900 border-b border-zinc-700 text-xs text-zinc-300 shrink-0">
          <span className="font-mono font-medium">{sid ?? '...'}</span>
          {alive && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />}
          {output && <span className="text-zinc-500 ml-auto">{output.total_events} events</span>}
          <button onClick={onClose} className="ml-2 p-1 rounded hover:bg-zinc-700 transition-colors text-zinc-400 hover:text-zinc-200">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Terminal content */}
        <div ref={containerRef} className="flex-1 overflow-auto p-3 space-y-2 bg-zinc-950 text-zinc-200 font-mono text-xs">
          {items.length === 0 && (
            <div className="flex items-center justify-center h-full text-zinc-500">
              {sid ? 'Carregando...' : 'Nenhuma sessão ativa'}
            </div>
          )}
          {items.map((item, i) => {
            if (item.kind === 'system') {
              return (
                <div key={i} className="flex items-center gap-2 text-zinc-500">
                  <span className="px-1.5 py-0.5 bg-zinc-800 rounded text-[10px]">SYSTEM</span>
                  {item.model && <span>model: {item.model}</span>}
                  {item.toolsCount != null && <span>{item.toolsCount} tools</span>}
                </div>
              )
            }
            if (item.kind === 'text') {
              return <div key={i} className="pl-2 border-l-2 border-blue-500/40 whitespace-pre-wrap break-words">{item.text}</div>
            }
            if (item.kind === 'tool_call') {
              const expanded = expandedTools.has(i)
              return (
                <div key={i} className="border border-zinc-700 rounded overflow-hidden">
                  <button
                    onClick={() => toggleTool(i)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 bg-zinc-900 hover:bg-zinc-800 transition-colors text-left"
                  >
                    <span className="text-[10px] px-1 py-0.5 bg-zinc-700 rounded">TOOL</span>
                    <span className="text-blue-400 font-medium">{item.toolName}</span>
                    {item.toolIsError && <span className="text-red-400 text-[10px]">ERROR</span>}
                    {!item.toolIsError && item.toolResult != null && <span className="text-green-400 text-[10px]">OK</span>}
                    <span className="ml-auto text-zinc-600">{expanded ? '▼' : '▶'}</span>
                  </button>
                  {expanded && (
                    <div className="px-2 py-1.5 space-y-1.5 bg-zinc-900/50 border-t border-zinc-700">
                      {item.toolInput && (
                        <div>
                          <span className="text-zinc-500">input:</span>
                          <pre className="mt-0.5 whitespace-pre-wrap break-all text-zinc-400 max-h-40 overflow-auto">{item.toolInput}</pre>
                        </div>
                      )}
                      {item.toolResult != null && (
                        <div>
                          <span className="text-zinc-500">result:</span>
                          <pre className={cn('mt-0.5 whitespace-pre-wrap break-all max-h-40 overflow-auto', item.toolIsError ? 'text-red-400' : 'text-zinc-400')}>{item.toolResult}</pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            }
            if (item.kind === 'result') {
              return (
                <div key={i} className="flex items-center gap-3 text-zinc-500 border-t border-zinc-800 pt-2 mt-2">
                  <span className="px-1.5 py-0.5 bg-green-900/30 text-green-400 rounded text-[10px]">RESULT</span>
                  {item.cost != null && <span>${item.cost.toFixed(4)}</span>}
                  {item.duration != null && <span>{(item.duration / 1000).toFixed(1)}s</span>}
                  {item.turns != null && <span>{item.turns} turns</span>}
                </div>
              )
            }
            if (item.kind === 'legacy') {
              return <div key={i} className="text-zinc-500 whitespace-pre-wrap">{item.lines?.join('\n')}</div>
            }
            return null
          })}
        </div>
      </div>
    </div>
  )
}
