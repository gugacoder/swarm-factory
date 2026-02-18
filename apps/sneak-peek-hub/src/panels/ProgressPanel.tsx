import { useEffect, useRef, useCallback } from 'react'
import { usePolling } from '@/hooks/usePolling'
import { fetchProgress } from '@/lib/api'
import { useWorkspace } from '@/hooks/useWorkspace'

export function ProgressPanel() {
  const { slug, alive } = useWorkspace()
  const interval = alive ? 5_000 : 15_000
  const fetcher = useCallback(() => fetchProgress(500, slug ?? undefined), [slug])
  const { data } = usePolling({ fetcher, interval })
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [data?.text])

  return (
    <div ref={containerRef} className="h-full overflow-auto p-4">
      <pre className="text-xs font-mono whitespace-pre-wrap break-words">
        {data?.text ?? 'Carregando...'}
      </pre>
      {data && (
        <div className="mt-2 text-[10px] text-muted-foreground">
          {data.total_lines} linhas
        </div>
      )}
    </div>
  )
}
