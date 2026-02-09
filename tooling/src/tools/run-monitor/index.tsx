import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import type { RunSummary, RunDetail as RunDetailType } from './lib/types'
import { fetchRuns, fetchRunDetail } from './lib/api'
import { RunCard } from './components/RunCard'
import { RunDetail } from './components/RunDetail'

const REFRESH_INTERVAL = 10_000

export default function RunMonitor() {
  const { runId } = useParams<{ runId?: string }>()
  const navigate = useNavigate()

  const [runs, setRuns] = useState<RunSummary[]>([])
  const [detail, setDetail] = useState<RunDetailType | null>(null)
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const loadRuns = useCallback(async () => {
    try {
      const { runs: data } = await fetchRuns()
      setRuns(data)
      setError(null)
    } catch (err) {
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }, [])

  const loadDetail = useCallback(async (id: string, silent = false) => {
    if (!silent) setDetailLoading(true)
    try {
      const { run } = await fetchRunDetail(id)
      setDetail(prev => {
        if (prev && JSON.stringify(prev) === JSON.stringify(run)) return prev
        return run
      })
    } catch {
      if (!silent) setDetail(null)
    } finally {
      if (!silent) setDetailLoading(false)
    }
  }, [])

  // Carrega runs ao montar
  useEffect(() => {
    loadRuns()
  }, [loadRuns])

  // Auto-refresh a cada 10s
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      loadRuns()
      if (runId) loadDetail(runId, true)
    }, REFRESH_INTERVAL)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [loadRuns, loadDetail, runId])

  // Carrega detail quando runId muda (via URL)
  useEffect(() => {
    if (runId) {
      loadDetail(runId)
    } else {
      setDetail(null)
    }
  }, [runId, loadDetail])

  const handleSelect = useCallback((id: string) => {
    navigate(`/run-monitor/${encodeURIComponent(id)}`)
  }, [navigate])

  const handleBack = useCallback(() => {
    navigate('/run-monitor')
  }, [navigate])

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">Carregando runs...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-destructive">Erro ao carregar runs</p>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button onClick={loadRuns}>Tentar novamente</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col md:flex-row h-full">
      {/* Sidebar - Lista de runs */}
      <div className={`w-full md:w-64 flex flex-col border-r border-border bg-card ${runId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-3 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-sm">Runs</h2>
            <Button variant="ghost" size="sm" onClick={loadRuns} title="Recarregar" className="h-7 w-7 p-0">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">
            {runs.length} run{runs.length !== 1 ? 's' : ''} encontrado{runs.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {runs.map((run) => (
            <RunCard
              key={run.id}
              run={run}
              isSelected={runId === run.id}
              onClick={() => handleSelect(run.id)}
            />
          ))}
        </div>
      </div>

      {/* Painel de detalhes */}
      <div className={`flex-1 flex flex-col min-w-0 ${!runId ? 'hidden md:flex' : 'flex'}`}>
        {runId && detail ? (
          <RunDetail run={detail} loading={detailLoading} onRefresh={() => { loadRuns(); if (runId) loadDetail(runId, true) }} onBack={handleBack} />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-sm">Selecione um run para ver detalhes</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
