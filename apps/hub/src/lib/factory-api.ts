/**
 * Factory API — funções de acesso aos endpoints /api/factory/*
 * Usa o wrapper api.ts existente para auth automática.
 */

import { api } from './api';
import type {
  HarnessConfig, Feature, LoopState, LoopStateDetail,
  SessionSummary, SessionOutput, SpecsResponse,
  WorkspaceInfo, HarnessSessionInfo, HarnessInferResponse,
  StreamEvent, RunPhase,
} from './factory-types';
import { getAccessToken } from './auth';

// --- Workspaces ---
export function fetchWorkspaces() {
  return api.get<{ workspaces: WorkspaceInfo[] }>('/api/factory/workspaces');
}

// --- Config ---
export function fetchConfig(slug: string) {
  return api.get<{ config: HarnessConfig }>(`/api/factory/runs/${encodeURIComponent(slug)}/config`);
}

// --- State ---
export function fetchState(slug: string) {
  return api.get<{
    state: LoopState;
    detail: LoopStateDetail | null;
    pid: number | null;
    alive: boolean;
  }>(`/api/factory/runs/${encodeURIComponent(slug)}/state`);
}

// --- Features ---
export function fetchFeatures(slug: string) {
  return api.get<{
    features: Feature[];
    summary: Record<string, number>;
    total: number;
  }>(`/api/factory/runs/${encodeURIComponent(slug)}/features`);
}

// --- Status ---
export function fetchRunStatus(slug: string) {
  return api.get<{
    exists: boolean;
    slug: string;
    workspace?: string;
    workspace_exists?: boolean;
    has_harness?: boolean;
    phase?: RunPhase;
    features_count?: number;
    features_passing?: number;
  }>(`/api/factory/runs/${encodeURIComponent(slug)}/status`);
}

// --- Progress ---
export function fetchProgress(slug: string, lines: number = 200) {
  return api.get<{ text: string; total_lines: number }>(
    `/api/factory/runs/${encodeURIComponent(slug)}/progress?lines=${lines}`,
  );
}

// --- Sessions ---
export function fetchSessions(slug: string) {
  return api.get<{ sessions: SessionSummary[] }>(
    `/api/factory/runs/${encodeURIComponent(slug)}/sessions`,
  );
}

export function fetchSessionOutput(
  slug: string,
  sid: string,
  tail: number = 50,
  sinceByte?: number,
) {
  let url = `/api/factory/runs/${encodeURIComponent(slug)}/sessions/${encodeURIComponent(sid)}/output?tail=${tail}`;
  if (sinceByte != null && sinceByte > 0) url += `&since_byte=${sinceByte}`;
  return api.get<SessionOutput>(url);
}

// --- Harness Sessions ---
export function fetchHarnessSessions(slug: string) {
  return api.get<{ sessions: HarnessSessionInfo[]; active: string }>(
    `/api/factory/runs/${encodeURIComponent(slug)}/harness-sessions`,
  );
}

export function switchHarnessSession(slug: string, session: string) {
  return api.post<{ success: boolean; session: string }>(
    `/api/factory/runs/${encodeURIComponent(slug)}/harness-sessions/switch`,
    { session },
  );
}

// --- Loop Control ---
export function startLoop(slug: string, overrides?: {
  max_turns?: number | null;
  max_iterations?: number | null;
  max_features?: number | null;
}) {
  return api.post<{ pid: number; workspace: string; log: string; message: string }>(
    `/api/factory/runs/${encodeURIComponent(slug)}/loop/start`,
    overrides || {},
  );
}

export function stopLoop(slug: string) {
  return api.post<{ success: boolean; workspace: string; pid: number | null; signalSent: boolean }>(
    `/api/factory/runs/${encodeURIComponent(slug)}/loop/stop`,
  );
}

// --- SSE Streaming ---
export function createStream(slug: string, onEvent: (ev: StreamEvent) => void): () => void {
  const token = getAccessToken();
  const url = `/api/factory/runs/${encodeURIComponent(slug)}/create-stream${token ? `?token=${token}` : ''}`;
  const source = new EventSource(url);
  source.onmessage = (e) => {
    try { onEvent(JSON.parse(e.data)); } catch { /* ignore */ }
  };
  source.onerror = () => { source.close(); };
  return () => source.close();
}

export function initializeStream(slug: string, onEvent: (ev: StreamEvent) => void): () => void {
  const token = getAccessToken();
  const url = `/api/factory/runs/${encodeURIComponent(slug)}/initialize-stream${token ? `?token=${token}` : ''}`;
  const source = new EventSource(url);
  source.onmessage = (e) => {
    try { onEvent(JSON.parse(e.data)); } catch { /* ignore */ }
  };
  source.onerror = () => { source.close(); };
  return () => source.close();
}

// --- Infer ---
export function inferFromSpecs(specsPath: string) {
  return api.post<HarnessInferResponse>('/api/factory/infer', { specsPath });
}

// --- Create Run ---
export function createRun(params: {
  slug: string;
  name: string;
  workspace: string;
  specs: string;
  harness: string;
  max_turns?: number | null;
  max_iterations?: number | null;
  max_features?: number | null;
}) {
  return api.post<{ success: boolean; slug: string }>('/api/factory/runs', params);
}

// --- Specs Browser ---
export function fetchSpecs(slug: string, subPath?: string) {
  const base = `/api/factory/runs/${encodeURIComponent(slug)}/specs`;
  const url = subPath
    ? `${base}/${subPath.split('/').map(encodeURIComponent).join('/')}`
    : base;
  return api.get<SpecsResponse>(url);
}
