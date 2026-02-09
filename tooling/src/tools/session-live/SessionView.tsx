import { useState, useEffect, useCallback, useRef } from 'react'
import type { SessionOutput, SessionChecklist } from '@/tools/run-monitor/lib/types'
import { fetchSessions, fetchSessionOutput, fetchSessionChecklist } from '@/tools/run-monitor/lib/api'
import { ProcessBadge } from './components/ProcessBadge'
import { OutputViewer } from './components/OutputViewer'
import { ChecklistPanel } from './components/ChecklistPanel'

interface SessionViewProps {
  runId: string
  sessionId: string
  onBack?: () => void
}

export function formatDurationMs(ms: number): string {
  const totalSec = Math.floor(ms / 1000)
  if (totalSec < 60) return `${totalSec}s`
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  return `${min}m${sec.toString().padStart(2, '0')}s`
}

export function SessionView({ runId, sessionId, onBack }: SessionViewProps) {
  const [output, setOutput] = useState<SessionOutput>({ events: [], total_bytes: 0, total_events: 0, truncated: false, metrics: null })
  const [checklist, setChecklist] = useState<SessionChecklist>({ content: null, summary: null })
  const [alive, setAlive] = useState(false)
  const [pid, setPid] = useState<number | null>(null)
  const [stime, setStime] = useState<string | null>(null)
  const [command, setCommand] = useState<string | null>(null)
  const [tailSize, setTailSize] = useState(50)
  const [showChecklist, setShowChecklist] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const lastBytesRef = useRef<number>(0)
  const hasInitialLoadRef = useRef(false)

  const loadData = useCallback(async () => {
    const sinceByte = hasInitialLoadRef.current ? lastBytesRef.current : undefined

    const [outputRes, checklistRes, sessionsRes] = await Promise.allSettled([
      fetchSessionOutput(runId, sessionId, tailSize, sinceByte),
      fetchSessionChecklist(runId, sessionId),
      fetchSessions(runId),
    ])

    if (outputRes.status === 'fulfilled') {
      const data = outputRes.value

      // File was truncated/recreated (since_byte > file size) — do full refetch
      if (hasInitialLoadRef.current && data.append === false) {
        hasInitialLoadRef.current = false
        lastBytesRef.current = 0
        // Refetch fully on next tick
        const fullRes = await fetchSessionOutput(runId, sessionId, tailSize).catch(() => null)
        if (fullRes) {
          setOutput(fullRes)
          lastBytesRef.current = fullRes.total_bytes
          hasInitialLoadRef.current = true
        }
      } else if (data.append && hasInitialLoadRef.current) {
        // Incremental: append new events
        if (data.events.length > 0) {
          setOutput(prev => {
            const merged = [...prev.events, ...data.events]
            // Keep only tail to avoid unbounded growth
            const trimmed = merged.length > tailSize ? merged.slice(-tailSize) : merged
            return {
              events: trimmed,
              total_bytes: data.total_bytes,
              total_events: data.total_events,
              truncated: trimmed.length < merged.length || prev.truncated,
              metrics: data.metrics ?? prev.metrics,
            }
          })
        } else {
          // No new events, but update metrics/total_events
          setOutput(prev => ({
            ...prev,
            total_bytes: data.total_bytes,
            total_events: data.total_events,
            metrics: data.metrics ?? prev.metrics,
          }))
        }
        lastBytesRef.current = data.total_bytes
      } else {
        // Full fetch (initial load)
        setOutput(data)
        lastBytesRef.current = data.total_bytes
        hasInitialLoadRef.current = true
      }
    }

    if (checklistRes.status === 'fulfilled') setChecklist(checklistRes.value)
    if (sessionsRes.status === 'fulfilled') {
      const current = sessionsRes.value.sessions.find(s => s.id === sessionId)
      if (current) {
        setAlive(current.alive)
        setPid(current.pid)
        setStime(current.stime)
        setCommand(current.command)
      }
    }
  }, [runId, sessionId, tailSize])

  // Reset incremental state when session/tail changes
  useEffect(() => {
    lastBytesRef.current = 0
    hasInitialLoadRef.current = false
  }, [runId, sessionId, tailSize])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Polling: 3s if alive, 10s if dead
  useEffect(() => {
    const ms = alive ? 3_000 : 10_000
    intervalRef.current = setInterval(loadData, ms)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [loadData, alive])

  const hasChecklist = checklist.content != null

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-3 border-b border-border bg-card shrink-0 flex-wrap">
        {onBack && (
          <button
            onClick={onBack}
            className="text-muted-foreground hover:text-foreground transition-colors"
            title="Voltar"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground truncate hidden md:inline">{runId}</span>
            <span className="text-muted-foreground hidden md:inline">&rsaquo;</span>
            <span className="font-semibold font-mono truncate">{sessionId}</span>
          </div>
        </div>

        <ProcessBadge pid={pid} alive={alive} stime={stime} command={command} />

        {/* Metrics badges when session is finished */}
        {!alive && output.metrics && (
          <div className="flex items-center gap-2 shrink-0">
            {output.metrics.cost_usd != null && (
              <span className="text-[10px] font-mono font-semibold text-green-600 dark:text-green-400 tabular-nums">
                ${output.metrics.cost_usd.toFixed(2)}
              </span>
            )}
            {output.metrics.turns != null && (
              <span className="text-[10px] font-mono text-muted-foreground tabular-nums hidden md:inline">
                {output.metrics.turns} turns
              </span>
            )}
            {output.metrics.duration_ms != null && (
              <span className="text-[10px] font-mono text-muted-foreground tabular-nums hidden md:inline">
                {formatDurationMs(output.metrics.duration_ms)}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Content: output + checklist */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        {/* Output */}
        <div className="flex-[3] relative min-w-0 min-h-0">
          <OutputViewer output={output} tailSize={tailSize} onTailSizeChange={setTailSize} />
        </div>

        {/* Checklist sidebar - desktop */}
        <div className="hidden md:block md:flex-1 border-l border-border bg-card min-w-0">
          <ChecklistPanel checklist={checklist} />
        </div>

        {/* Checklist FAB + overlay - mobile */}
        {hasChecklist && (
          <>
            <button
              onClick={() => setShowChecklist(true)}
              className="md:hidden fixed bottom-4 right-4 z-30 bg-primary text-primary-foreground rounded-full p-3 shadow-lg hover:opacity-90 transition-opacity"
              title="Abrir checklist"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              {checklist.summary && (
                <span className="absolute -top-1 -right-1 bg-primary-foreground text-primary text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {checklist.summary.checked}/{checklist.summary.total}
                </span>
              )}
            </button>

            {showChecklist && (
              <>
                <div
                  className="md:hidden fixed inset-0 z-40 bg-black/50"
                  onClick={() => setShowChecklist(false)}
                />
                <div className="md:hidden fixed inset-x-0 bottom-0 z-50 bg-card border-t border-border rounded-t-xl max-h-[70vh] flex flex-col">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
                    <span className="font-semibold text-sm">Checklist</span>
                    <button
                      onClick={() => setShowChecklist(false)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    <ChecklistPanel checklist={checklist} />
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
