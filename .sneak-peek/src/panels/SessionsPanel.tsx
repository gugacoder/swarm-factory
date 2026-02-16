import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { usePolling } from '@/hooks/usePolling'
import { useWorkspace } from '@/hooks/useWorkspace'
import { fetchSessions, fetchSessionOutput } from '@/lib/api'
import { ProcessBadge } from '@/components/ProcessBadge'
import { cn } from '@/lib/utils'
import type { JsonlEvent, JsonlContent, JsonlToolResult, SessionOutput } from '@/lib/types'

function formatDuration(startedAt: string | null, finishedAt: string | null): string {
  if (!startedAt) return '—'
  const start = new Date(startedAt).getTime()
  const end = finishedAt ? new Date(finishedAt).getTime() : Date.now()
  const diff = end - start
  const s = Math.floor(diff / 1000) % 60
  const m = Math.floor(diff / 60000) % 60
  const h = Math.floor(diff / 3600000)
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// --- Output Viewer ---
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
  resultText?: string
  lines?: string[]
}

function groupEventsToDisplayItems(events: JsonlEvent[]): DisplayItem[] {
  const toolResultMap = new Map<string, { content: string; is_error?: boolean }>()
  const items: DisplayItem[] = []

  // Build tool result map
  for (const ev of events) {
    if (ev.type === 'user' && 'message' in ev && ev.message?.content) {
      for (const c of ev.message.content) {
        const tr = c as JsonlToolResult
        if (tr.type === 'tool_result' && tr.tool_use_id) {
          const text = typeof tr.content === 'string' ? tr.content : (tr.content?.map((x: any) => x.text).join('\n') ?? '')
          toolResultMap.set(tr.tool_use_id, { content: text, is_error: tr.is_error })
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
          const result = toolResultMap.get(c.id)
          items.push({
            kind: 'tool_call',
            toolName: c.name,
            toolInput: JSON.stringify(c.input, null, 2).slice(0, 500),
            toolResult: result?.content?.slice(0, 1000),
            toolIsError: result?.is_error,
          })
        }
      }
    } else if (ev.type === 'result') {
      items.push({
        kind: 'result',
        cost: ev.cost_usd,
        duration: ev.duration_ms,
        turns: ev.turns,
        resultText: ev.result,
      })
    } else if (ev.type === 'legacy' && 'lines' in ev) {
      items.push({ kind: 'legacy', lines: ev.lines })
    }
  }

  return items
}

function OutputViewer({ events }: { events: JsonlEvent[] }) {
  const items = groupEventsToDisplayItems(events)
  const containerRef = useRef<HTMLDivElement>(null)
  const [autoScroll, setAutoScroll] = useState(true)
  const [expandedTools, setExpandedTools] = useState<Set<number>>(new Set())

  useEffect(() => {
    if (autoScroll && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [items.length, autoScroll])

  const handleScroll = () => {
    if (!containerRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current
    setAutoScroll(scrollHeight - scrollTop - clientHeight < 50)
  }

  const toggleTool = (idx: number) => {
    setExpandedTools(prev => {
      const next = new Set(prev)
      next.has(idx) ? next.delete(idx) : next.add(idx)
      return next
    })
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-auto p-3 space-y-2 bg-zinc-950 dark:bg-zinc-950 text-zinc-200 font-mono text-xs"
    >
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
          return (
            <div key={i} className="pl-2 border-l-2 border-blue-500/40 whitespace-pre-wrap break-words">
              {item.text}
            </div>
          )
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
          return (
            <div key={i} className="text-zinc-500 whitespace-pre-wrap">
              {item.lines?.join('\n')}
            </div>
          )
        }
        return null
      })}

      {!autoScroll && (
        <button
          onClick={() => {
            setAutoScroll(true)
            containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'smooth' })
          }}
          className="fixed bottom-20 right-6 p-2 rounded-full bg-primary text-primary-foreground shadow-lg hover:opacity-90 z-10"
          title="Scroll to bottom"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
      )}
    </div>
  )
}

// --- Main Panel ---
export function SessionsPanel() {
  const { slug, sid: routeSid } = useParams<{ slug: string; sid?: string }>()
  const navigate = useNavigate()
  const { slug: wsSlug } = useWorkspace()
  const currentSlug = wsSlug ?? slug ?? null

  const sessionsFetcher = useCallback(() => fetchSessions(currentSlug ?? undefined), [currentSlug])
  const { data: sessionsData } = usePolling({ fetcher: sessionsFetcher, interval: 5_000 })
  const sessions = sessionsData?.sessions ?? []
  const [selectedId, setSelectedId] = useState<string | null>(routeSid ?? null)
  const [output, setOutput] = useState<SessionOutput | null>(null)
  const lastBytesRef = useRef(0)
  const hasInitialRef = useRef(false)
  const intervalRef = useRef<ReturnType<typeof setInterval>>()

  // Sync route param → selectedId
  useEffect(() => {
    if (routeSid && routeSid !== selectedId) setSelectedId(routeSid)
  }, [routeSid]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-select current or first session
  useEffect(() => {
    if (selectedId || sessions.length === 0) return
    const current = sessions.find(s => s.is_current) ?? sessions[0]
    if (current && slug) {
      setSelectedId(current.id)
      navigate(`/sessions/${slug}/${current.id}`, { replace: true })
    }
  }, [sessions, selectedId, navigate, slug])

  const selectedSession = sessions.find(s => s.id === selectedId)

  const loadOutput = useCallback(async () => {
    if (!selectedId) return
    const sinceByte = hasInitialRef.current ? lastBytesRef.current : undefined
    try {
      const result = await fetchSessionOutput(selectedId, 100, sinceByte, currentSlug ?? undefined)
      if (hasInitialRef.current && result.append === false) {
        const full = await fetchSessionOutput(selectedId, 100, undefined, currentSlug ?? undefined)
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
  }, [selectedId, currentSlug])

  useEffect(() => {
    hasInitialRef.current = false
    lastBytesRef.current = 0
    setOutput(null)
    if (!selectedId) return
    loadOutput()
  }, [selectedId, loadOutput])

  useEffect(() => {
    if (!selectedId) return
    const alive = selectedSession?.alive ?? false
    const ms = alive ? 3_000 : 10_000
    intervalRef.current = setInterval(loadOutput, ms)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [selectedId, selectedSession?.alive, loadOutput])

  return (
    <div className="flex h-full">
      {/* Session list */}
      <div className="w-[260px] shrink-0 border-r border-border overflow-auto bg-card">
        <div className="p-3 border-b border-border">
          <h3 className="text-sm font-semibold">Sessões ({sessions.length})</h3>
        </div>
        <div className="divide-y divide-border/50">
          {sessions.map(s => (
            <button
              key={s.id}
              onClick={() => { setSelectedId(s.id); if (slug) navigate(`/sessions/${slug}/${s.id}`) }}
              className={cn(
                'w-full text-left px-3 py-2.5 text-xs transition-colors',
                selectedId === s.id ? 'bg-muted' : 'hover:bg-muted/30'
              )}
            >
              <div className="flex items-center gap-2">
                {s.is_current && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />}
                <span className="font-mono font-medium">{s.id}</span>
                <ProcessBadge pid={s.pid} alive={s.alive} className="ml-auto" />
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
          <OutputViewer events={output.events} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
            {selectedId ? 'Carregando output...' : 'Selecione uma sessão'}
          </div>
        )}
      </div>
    </div>
  )
}
