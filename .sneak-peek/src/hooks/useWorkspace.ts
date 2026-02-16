import { createContext, useContext, useCallback } from 'react'
import { usePolling } from './usePolling'
import { fetchConfig, fetchState, fetchFeatures } from '@/lib/api'
import type { HarnessConfig, Feature, LoopState, LoopStateDetail } from '@/lib/types'

interface WorkspaceData {
  config: HarnessConfig | null
  state: LoopState
  stateDetail: LoopStateDetail | null
  pid: number | null
  alive: boolean
  features: Feature[]
  summary: Record<string, number>
  total: number
  loading: boolean
  error: Error | null
}

const defaultValue: WorkspaceData = {
  config: null,
  state: 'idle',
  stateDetail: null,
  pid: null,
  alive: false,
  features: [],
  summary: {},
  total: 0,
  loading: true,
  error: null,
}

export const WorkspaceContext = createContext<WorkspaceData>(defaultValue)

export function useWorkspace() {
  return useContext(WorkspaceContext)
}

export function useWorkspaceProvider(refreshKey: number) {
  // refreshKey in dependency forces new fetcher → usePolling re-fetches
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const configFetcher = useCallback(() => fetchConfig(), [refreshKey])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stateFetcher = useCallback(() => fetchState(), [refreshKey])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const featuresFetcher = useCallback(() => fetchFeatures(), [refreshKey])

  const configPoll = usePolling({ fetcher: configFetcher, interval: 30_000 })
  const statePoll = usePolling({ fetcher: stateFetcher, interval: 3_000 })
  const featuresPoll = usePolling({ fetcher: featuresFetcher, interval: 5_000 })

  const config = configPoll.data?.config ?? null
  const state = (statePoll.data?.state as LoopState) ?? 'idle'
  const stateDetail = statePoll.data?.detail ?? null
  const pid = statePoll.data?.pid ?? null
  const alive = statePoll.data?.alive ?? false
  const features = featuresPoll.data?.features ?? []
  const summary = featuresPoll.data?.summary ?? {}
  const total = featuresPoll.data?.total ?? 0

  const loading = configPoll.loading || statePoll.loading || featuresPoll.loading
  const error = configPoll.error || statePoll.error || featuresPoll.error

  return {
    config,
    state,
    stateDetail,
    pid,
    alive,
    features,
    summary,
    total,
    loading,
    error,
  }
}
