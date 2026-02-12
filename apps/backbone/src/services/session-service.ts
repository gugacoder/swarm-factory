import { resolve } from 'node:path';
import { readFile, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import * as projectService from './project-service.js';

export interface SessionSummary {
  id: string;
  feature_id: string;
  started_at: string | null;
  finished_at: string | null;
  duration_ms: number | null;
  has_output: boolean;
}

export async function list(slug: string): Promise<SessionSummary[]> {
  const project = await projectService.get(slug);
  const workspace = project.workspace;
  const sessionsDir = resolve(workspace, '.sessions');

  if (!existsSync(sessionsDir)) {
    return [];
  }

  const entries = await readdir(sessionsDir, { withFileTypes: true });
  const sessions: SessionSummary[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith('.')) continue;

    const sessionDir = resolve(sessionsDir, entry.name);
    const startedFile = resolve(sessionDir, 'started_at');
    const finishedFile = resolve(sessionDir, 'finished_at');
    const outputFile = resolve(sessionDir, 'output.jsonl');

    let started_at: string | null = null;
    let finished_at: string | null = null;

    try {
      started_at = (await readFile(startedFile, 'utf-8')).trim();
    } catch { /* não existe */ }

    try {
      finished_at = (await readFile(finishedFile, 'utf-8')).trim();
    } catch { /* não existe */ }

    let duration_ms: number | null = null;
    if (started_at && finished_at) {
      duration_ms = new Date(finished_at).getTime() - new Date(started_at).getTime();
    }

    sessions.push({
      id: entry.name,
      feature_id: entry.name, // session dir = feature id
      started_at,
      finished_at,
      duration_ms,
      has_output: existsSync(outputFile),
    });
  }

  // Ordenar por started_at desc
  sessions.sort((a, b) => {
    if (!a.started_at) return 1;
    if (!b.started_at) return -1;
    return new Date(b.started_at).getTime() - new Date(a.started_at).getTime();
  });

  return sessions;
}

export async function get(slug: string, sessionId: string) {
  const project = await projectService.get(slug);
  const workspace = project.workspace;
  const outputFile = resolve(workspace, '.sessions', sessionId, 'output.jsonl');

  if (!existsSync(outputFile)) {
    throw new Error(`Sessão ${sessionId} não encontrada ou sem output`);
  }

  const raw = await readFile(outputFile, 'utf-8');
  const lines = raw.trim().split('\n').filter(Boolean);
  return lines.map((line) => {
    try {
      return JSON.parse(line);
    } catch {
      return { raw: line };
    }
  });
}

export async function getProgress(slug: string): Promise<string> {
  const project = await projectService.get(slug);
  const workspace = project.workspace;

  // V2 ou V1
  const harnessActive = resolve(workspace, '.harness', 'active');
  let progressPath: string;

  if (existsSync(harnessActive)) {
    const session = (await readFile(harnessActive, 'utf-8')).trim();
    progressPath = resolve(workspace, '.harness', session, 'progress.txt');
  } else {
    progressPath = resolve(workspace, 'agent-progress.txt');
  }

  if (!existsSync(progressPath)) {
    return '';
  }

  return readFile(progressPath, 'utf-8');
}
