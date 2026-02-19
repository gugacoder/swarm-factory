/**
 * SessionReaderService — leitura de JSONL com suporte a carregamento incremental.
 * Portado de apps/sneak-peek-hub/src/plugin.ts (linhas 79-137, 468-583)
 */

import { resolve } from 'node:path';
import { readFileSync, existsSync, readdirSync, statSync, openSync, readSync, closeSync } from 'node:fs';
import type { SessionSummary, SessionMetrics, SessionOutput, JsonlEvent } from './types.js';
import { resolveHarnessSession, readJsonSafe, checkPidAliveCached } from './workspace-service.js';

// --- JSONL Readers ---

export function readJsonlTailWithMetrics(filePath: string, tail: number): {
  events: JsonlEvent[];
  metrics: SessionMetrics;
  total_bytes: number;
  total_events: number;
} {
  const metrics: SessionMetrics = { cost_usd: null, duration_ms: null, turns: null, model: null };
  try {
    const stat = statSync(filePath);
    const total_bytes = stat.size;
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').filter(l => l.trim());
    const total_events = lines.length;
    const selected = tail > 0 ? lines.slice(-tail) : lines;
    const events: JsonlEvent[] = [];

    for (const line of selected) {
      try {
        events.push(JSON.parse(line));
      } catch {
        events.push({ type: 'legacy', lines: [line] });
      }
    }

    for (const ev of events) {
      if ((ev as any).type === 'result') {
        const r = ev as any;
        if (r.cost_usd != null) metrics.cost_usd = r.cost_usd;
        if (r.duration_ms != null) metrics.duration_ms = r.duration_ms;
        if (r.turns != null) metrics.turns = r.turns;
      }
      if ((ev as any).type === 'system' && (ev as any).model) {
        metrics.model = (ev as any).model;
      }
    }

    return { events, metrics, total_bytes, total_events };
  } catch {
    return { events: [], metrics, total_bytes: 0, total_events: 0 };
  }
}

export function readJsonlSinceByte(filePath: string, sinceByte: number): {
  events: JsonlEvent[];
  total_bytes: number;
  append: boolean;
} {
  try {
    const stat = statSync(filePath);
    const total_bytes = stat.size;
    if (sinceByte > total_bytes) return { events: [], total_bytes, append: false };
    if (sinceByte >= total_bytes) return { events: [], total_bytes, append: true };

    const fd = openSync(filePath, 'r');
    const buf = Buffer.alloc(total_bytes - sinceByte);
    readSync(fd, buf, 0, buf.length, sinceByte);
    closeSync(fd);

    const chunk = buf.toString('utf-8');
    const lines = chunk.split('\n').filter(l => l.trim());
    const events: JsonlEvent[] = [];
    for (const line of lines) {
      try { events.push(JSON.parse(line)); } catch { events.push({ type: 'legacy', lines: [line] }); }
    }
    return { events, total_bytes, append: true };
  } catch {
    return { events: [], total_bytes: 0, append: false };
  }
}

// --- Session Listing ---

export function listSessions(wsPath: string, slug: string): SessionSummary[] {
  const hp = resolveHarnessSession(wsPath, slug);
  if (!hp) return [];

  const featureRunsDir = hp.runsDir;
  if (!existsSync(featureRunsDir)) return [];

  // Read loop.json for current feature
  const loopState = readJsonSafe(hp.loopJsonPath);
  const currentFeatureId = loopState?.feature_id || '';

  const sessions: SessionSummary[] = [];
  const seenIds = new Set<string>();

  try {
    const entries = readdirSync(featureRunsDir).filter(e => e.endsWith('.json') && !e.endsWith('.jsonl'));
    for (const entry of entries) {
      const metaPath = resolve(featureRunsDir, entry);
      const meta = readJsonSafe(metaPath);
      if (!meta) continue;

      const featureId = entry.replace('.json', '');
      seenIds.add(featureId);
      const jsonlPath = resolve(featureRunsDir, `${featureId}.jsonl`);
      let outputBytes = 0;
      try { outputBytes = statSync(jsonlPath).size; } catch { /* ok */ }

      let metrics: SessionMetrics | null = null;
      if (meta.finished_at && outputBytes > 0) {
        metrics = readJsonlTailWithMetrics(jsonlPath, 5).metrics;
      }

      const agentPid = meta.agent_pid ?? meta.pid ?? null;
      const isCurrent = featureId === currentFeatureId;
      const effectivePid = agentPid || (isCurrent && loopState?.pid ? loopState.pid : null);
      const alive = effectivePid ? checkPidAliveCached(effectivePid) : false;

      sessions.push({
        id: featureId,
        pid: agentPid,
        alive: !meta.finished_at ? alive : false,
        started_at: meta.started_at ?? null,
        finished_at: meta.finished_at ?? null,
        output_bytes: outputBytes,
        is_current: isCurrent,
        metrics,
        exit_code: meta.exit_code ?? null,
        retries: meta.retries ?? null,
      });
    }
  } catch { /* ok */ }

  // Fallback: .jsonl sem .json correspondente
  try {
    const jsonlEntries = readdirSync(featureRunsDir).filter(e => e.endsWith('.jsonl'));
    for (const entry of jsonlEntries) {
      const featureId = entry.replace('.jsonl', '');
      if (seenIds.has(featureId)) continue;
      const jsonlPath = resolve(featureRunsDir, entry);
      let outputBytes = 0;
      try { outputBytes = statSync(jsonlPath).size; } catch { /* ok */ }
      const isCurrent = featureId === currentFeatureId;
      const loopPid = isCurrent && loopState?.pid ? loopState.pid : null;
      sessions.push({
        id: featureId,
        pid: null,
        alive: loopPid ? checkPidAliveCached(loopPid) : false,
        started_at: loopState?.started_at ?? null,
        finished_at: null,
        output_bytes: outputBytes,
        is_current: isCurrent,
        metrics: null,
        exit_code: null,
        retries: null,
      });
    }
  } catch { /* ok */ }

  sessions.sort((a, b) => {
    if (a.is_current && !b.is_current) return -1;
    if (!a.is_current && b.is_current) return 1;
    return (a.started_at || '').localeCompare(b.started_at || '');
  });

  return sessions;
}

// --- Session Output ---

export function readSessionOutput(
  wsPath: string,
  slug: string,
  sid: string,
  tail: number = 50,
  sinceByte?: number,
): SessionOutput {
  const hp = resolveHarnessSession(wsPath, slug);
  if (!hp) throw new Error(`.harness/${slug}/ não encontrado`);

  const outputPath = resolve(hp.runsDir, `${sid}.jsonl`);

  if (sinceByte != null && sinceByte > 0) {
    const result = readJsonlSinceByte(outputPath, sinceByte);
    return {
      events: result.events,
      total_bytes: result.total_bytes,
      total_events: result.events.length,
      truncated: false,
      metrics: null,
      append: result.append,
    };
  } else {
    const result = readJsonlTailWithMetrics(outputPath, tail);
    return {
      events: result.events,
      total_bytes: result.total_bytes,
      total_events: result.total_events,
      truncated: result.total_events > tail,
      metrics: result.metrics,
      append: false,
    };
  }
}
