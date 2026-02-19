/**
 * WorkspaceContext — provê dados de config/state/features para um slug.
 * Portado de sneak-peek-hub/src/hooks/useWorkspace.ts
 */

import { createContext, useContext, useCallback, useMemo } from 'react';
import { usePolling } from './use-polling';
import { fetchConfig, fetchState, fetchFeatures } from '@/lib/factory-api';
import type { HarnessConfig, Feature, LoopState, LoopStateDetail } from '@/lib/factory-types';

export interface WorkspaceData {
  slug: string | null;
  config: HarnessConfig | null;
  state: LoopState;
  stateDetail: LoopStateDetail | null;
  pid: number | null;
  alive: boolean;
  features: Feature[];
  summary: Record<string, number>;
  total: number;
  loading: boolean;
  error: Error | null;
  refreshState: () => void;
  refreshFeatures: () => void;
}

const defaultValue: WorkspaceData = {
  slug: null,
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
  refreshState: () => {},
  refreshFeatures: () => {},
};

export const WorkspaceContext = createContext<WorkspaceData>(defaultValue);

export function useWorkspace() {
  return useContext(WorkspaceContext);
}

export function useWorkspaceProvider(slug: string | null): WorkspaceData {
  const enabled = !!slug;

  const configFetcher = useCallback(() => fetchConfig(slug!), [slug]);
  const stateFetcher = useCallback(() => fetchState(slug!), [slug]);
  const featuresFetcher = useCallback(() => fetchFeatures(slug!), [slug]);

  const configPoll = usePolling({ fetcher: configFetcher, interval: 30_000, enabled });
  const statePoll = usePolling({ fetcher: stateFetcher, interval: 3_000, enabled });
  const featuresPoll = usePolling({ fetcher: featuresFetcher, interval: 5_000, enabled });

  return useMemo(() => ({
    slug,
    config: configPoll.data?.config ?? null,
    state: (statePoll.data?.state ?? 'idle') as LoopState,
    stateDetail: statePoll.data?.detail ?? null,
    pid: statePoll.data?.pid ?? null,
    alive: statePoll.data?.alive ?? false,
    features: featuresPoll.data?.features ?? [],
    summary: featuresPoll.data?.summary ?? {},
    total: featuresPoll.data?.total ?? 0,
    loading: configPoll.loading || statePoll.loading || featuresPoll.loading,
    error: configPoll.error || statePoll.error || featuresPoll.error,
    refreshState: statePoll.refresh,
    refreshFeatures: featuresPoll.refresh,
  }), [
    slug,
    configPoll.data, configPoll.loading, configPoll.error,
    statePoll.data, statePoll.loading, statePoll.error, statePoll.refresh,
    featuresPoll.data, featuresPoll.loading, featuresPoll.error, featuresPoll.refresh,
  ]);
}
