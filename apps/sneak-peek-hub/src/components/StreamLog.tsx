import { useRef, useEffect } from 'react'
import type { StreamEvent } from '@/lib/types'

interface StreamLogProps {
  lines: StreamEvent[]
  className?: string
}

export function StreamLog({ lines, className }: StreamLogProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [lines.length])

  if (lines.length === 0) return null

  return (
    <div
      ref={containerRef}
      className={`rounded-md border border-border bg-zinc-950 overflow-auto max-h-[400px] p-3 font-mono text-xs ${className ?? ''}`}
    >
      {lines.map((line, i) => {
        if (line.type === 'log') {
          return (
            <div key={i} className="text-zinc-300 whitespace-pre-wrap">
              <span className="text-zinc-600 select-none">{'> '}</span>
              {line.text}
            </div>
          )
        }
        if (line.type === 'done') {
          return (
            <div key={i} className="text-green-400 mt-1">
              Concluído (exit code: {line.exitCode})
            </div>
          )
        }
        if (line.type === 'error') {
          return (
            <div key={i} className="text-red-400 mt-1">
              Erro: {line.error}
            </div>
          )
        }
        return null
      })}
    </div>
  )
}
