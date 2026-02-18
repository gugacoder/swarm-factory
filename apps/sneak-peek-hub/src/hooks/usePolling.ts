import { useEffect, useRef, useCallback, useState } from 'react'

interface UsePollingOptions<T> {
  fetcher: () => Promise<T>
  interval: number
  enabled?: boolean
}

export function usePolling<T>({ fetcher, interval, enabled = true }: UsePollingOptions<T>) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(true)
  const intervalRef = useRef<ReturnType<typeof setInterval>>()
  const mountedRef = useRef(true)

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const result = await fetcher()
      if (mountedRef.current) {
        setData(result)
        setError(null)
      }
    } catch (e) {
      if (mountedRef.current) setError(e as Error)
    } finally {
      if (mountedRef.current && !silent) setLoading(false)
    }
  }, [fetcher])

  useEffect(() => {
    mountedRef.current = true
    if (!enabled) return
    load()
    return () => { mountedRef.current = false }
  }, [load, enabled])

  useEffect(() => {
    if (!enabled) return
    intervalRef.current = setInterval(() => load(true), interval)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [load, interval, enabled])

  return { data, error, loading, refresh: () => load(false) }
}
