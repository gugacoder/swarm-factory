/**
 * WorkspaceService — descoberta de workspaces e leitura de state/features/config.
 * Portado de apps/sneak-peek-hub/src/plugin.ts
 */

import { resolve, dirname, basename, isAbsolute } from 'node:path';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { execSync } from 'node:child_process';
import type {
  HarnessPaths, HarnessConfig, Feature, LoopState, LoopStateDetail,
  WorkspaceInfo, HarnessSessionInfo, RunPhase,
} from './types.js';

const IS_WIN = process.platform === 'win32';

// --- PID Cache (8s TTL) ---
const PID_TTL_MS = 8000;
const pidCache = new Map<number, { alive: boolean; checkedAt: number }>();

export function checkPidAliveCached(pid: number): boolean {
  const now = Date.now();
  const cached = pidCache.get(pid);
  if (cached && (now - cached.checkedAt) < PID_TTL_MS) return cached.alive;
  const alive = checkPidAliveRaw(pid);
  pidCache.set(pid, { alive, checkedAt: now });
  return alive;
}

function checkPidAliveRaw(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (e: any) {
    if (e.code === 'EPERM') return true;
    if (IS_WIN && e.code === 'ESRCH') {
      try {
        const out = execSync(`tasklist /FI "PID eq ${pid}" /NH`, { encoding: 'utf-8', timeout: 3000, windowsHide: true });
        if (out.includes(String(pid))) return true;
      } catch { /* continue */ }
      try {
        const out = execSync(`ps -p ${pid}`, { encoding: 'utf-8', timeout: 3000, windowsHide: true });
        return out.trim().split('\n').length >= 2;
      } catch { /* not found */ }
    }
    return false;
  }
}

export function invalidatePidCache(pid: number) {
  pidCache.delete(pid);
}

// --- File I/O Helpers ---
export function readJsonSafe(filePath: string): any {
  try {
    return JSON.parse(readFileSync(filePath, 'utf-8'));
  } catch {
    return null;
  }
}

export function readTextSafe(filePath: string): string {
  try {
    return readFileSync(filePath, 'utf-8');
  } catch {
    return '';
  }
}

// --- Workspace Root Detection ---
function findWorkspaceRoot(): string {
  let dir = process.cwd();
  while (true) {
    const pkg = resolve(dir, 'package.json');
    if (existsSync(pkg)) {
      try {
        const data = JSON.parse(readFileSync(pkg, 'utf-8'));
        if (data.workspaces) return dir;
      } catch { /* ignora */ }
    }
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return process.cwd();
}

export function getRunsDir(): string {
  if (!process.env.RUNS_DIR) throw new Error('RUNS_DIR não configurada — verifique o .env');
  const raw = process.env.RUNS_DIR;
  return resolve(findWorkspaceRoot(), raw);
}

// --- Harness Path Resolution ---
export function resolveHarnessSession(ws: string, session: string): HarnessPaths | null {
  const sessionDir = resolve(ws, '.harness', session);
  if (!existsSync(sessionDir)) return null;

  return {
    session,
    configPath: resolve(sessionDir, 'config.json'),
    featuresPath: resolve(sessionDir, 'features.json'),
    progressPath: resolve(sessionDir, 'progress.txt'),
    loopJsonPath: resolve(sessionDir, 'loop.json'),
    runsDir: resolve(sessionDir, 'runs'),
  };
}

export function isValidSessionId(sid: string): boolean {
  return /^[a-zA-Z0-9_.-]+$/.test(sid);
}

// --- Workspace Path Resolution ---
function resolveWorkspacePath(runsDir: string, rawWorkspace: string): string {
  const normalized = (rawWorkspace || '').replace(/\\/g, '/');
  if (!normalized) return '';
  if (!isAbsolute(normalized)) {
    return resolve(runsDir, normalized).replace(/\\/g, '/');
  }
  return normalized;
}

// --- Slug Resolution ---
export function resolveSlug(runsDir: string, slug: string): { config: any; workspace: string } | null {
  // Structured: runs/{slug}/project.json
  let projPath = resolve(runsDir, slug, 'project.json');
  if (existsSync(projPath)) {
    const config = JSON.parse(readFileSync(projPath, 'utf-8'));
    return { config, workspace: resolveWorkspacePath(runsDir, config.workspace) };
  }
  // Flat: runs/{slug}.json
  projPath = resolve(runsDir, `${slug}.json`);
  if (existsSync(projPath)) {
    const config = JSON.parse(readFileSync(projPath, 'utf-8'));
    return { config, workspace: resolveWorkspacePath(runsDir, config.workspace) };
  }
  // Fallback: search discovered workspaces
  const workspaces = discoverWorkspaces(runsDir);
  const match = workspaces.find(w => w.slug === slug);
  if (match) return { config: { slug: match.slug, name: match.name, workspace: match.workspace }, workspace: match.workspace };
  return null;
}

// --- Workspace Discovery (5s cache) ---
const DISCOVER_TTL_MS = 5000;
let discoverCache: { data: WorkspaceInfo[]; ts: number } | null = null;

export function invalidateDiscoverCache() {
  discoverCache = null;
}

export function discoverWorkspaces(runsDir: string): WorkspaceInfo[] {
  const now = Date.now();
  if (discoverCache && (now - discoverCache.ts) < DISCOVER_TTL_MS) return discoverCache.data;

  const results = discoverWorkspacesRaw(runsDir);
  discoverCache = { data: results, ts: now };
  return results;
}

function discoverWorkspacesRaw(runsDir: string): WorkspaceInfo[] {
  if (!existsSync(runsDir)) return [];
  const results: WorkspaceInfo[] = [];

  // Scan flat .json files in runs/
  try {
    const entries = readdirSync(runsDir);
    for (const entry of entries) {
      if (!entry.endsWith('.json')) continue;
      const filePath = resolve(runsDir, entry);
      try {
        const stat = statSync(filePath);
        if (!stat.isFile()) continue;
        const config = JSON.parse(readFileSync(filePath, 'utf-8'));
        if (!config.workspace) continue;
        const wsPath = resolveWorkspacePath(runsDir, config.workspace);
        if (!wsPath || !existsSync(wsPath)) continue;
        if (!existsSync(resolve(wsPath, '.harness'))) continue;
        const slug = config.slug || entry.replace('.json', '');

        const hp = resolveHarnessSession(wsPath, slug);
        const featuresRaw = hp ? readJsonSafe(hp.featuresPath) : null;
        const features = Array.isArray(featuresRaw) ? featuresRaw : (featuresRaw?.features ?? []);
        const passing = features.filter((f: any) => f.status === 'passing').length;

        const loopStateStr = detectLoopStateStr(wsPath, hp);

        results.push({
          slug,
          name: config.name || config.slug || entry.replace('.json', ''),
          workspace: wsPath,
          harness: config.agent?.harness || 'unknown',
          features: { total: features.length, passing },
          activeSession: hp?.session || '',
          loop_state: loopStateStr as LoopState,
        });
      } catch { /* skip */ }
    }
  } catch { /* ok */ }

  // Scan subdirs with project.json
  try {
    const entries = readdirSync(runsDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory() || entry.name === '.meta' || entry.name === 'workspaces' || entry.name === 'worktrees') continue;
      const projPath = resolve(runsDir, entry.name, 'project.json');
      if (!existsSync(projPath)) continue;
      try {
        const config = JSON.parse(readFileSync(projPath, 'utf-8'));
        if (!config.workspace) continue;
        const wsPath = resolveWorkspacePath(runsDir, config.workspace);
        if (!wsPath || !existsSync(wsPath)) continue;
        if (!existsSync(resolve(wsPath, '.harness'))) continue;
        const slug = config.slug || entry.name;
        if (results.some(r => r.slug === slug)) continue;

        const hp = resolveHarnessSession(wsPath, slug);
        const featuresRaw = hp ? readJsonSafe(hp.featuresPath) : null;
        const features = Array.isArray(featuresRaw) ? featuresRaw : (featuresRaw?.features ?? []);
        const passing = features.filter((f: any) => f.status === 'passing').length;

        const loopStateStr = detectLoopStateStr(wsPath, hp);

        results.push({
          slug,
          name: config.name || config.slug || entry.name,
          workspace: wsPath,
          harness: config.agent?.harness || 'unknown',
          features: { total: features.length, passing },
          activeSession: hp?.session || '',
          loop_state: loopStateStr as LoopState,
        });
      } catch { /* skip */ }
    }
  } catch { /* ok */ }

  return results;
}

// --- Loop State Detection ---
function detectLoopStateStr(wsPath: string, hp: HarnessPaths | null): string {
  if (!hp) return 'idle';
  const loopJson = readJsonSafe(hp.loopJsonPath);
  const lpid = loopJson?.pid ?? null;
  const lalive = lpid ? checkPidAliveCached(lpid) : false;
  const lstopping = existsSync(resolve(wsPath, '.stop'));

  if (lstopping && lalive) return 'stopping';
  if (loopJson?.status === 'running' && lalive) return 'running';
  if (loopJson?.status === 'between' && lalive) return 'between';
  if (loopJson?.status === 'completed' || loopJson?.exit_reason === 'completed') return 'completed';
  return 'idle';
}

export function detectLoopState(ws: string, slug: string | null): {
  state: string;
  detail: LoopStateDetail | null;
  alive: boolean;
  pid: number | null;
} {
  if (!slug) return { state: 'idle', detail: null, alive: false, pid: null };
  const hp = resolveHarnessSession(ws, slug);
  if (!hp) return { state: 'idle', detail: null, alive: false, pid: null };

  const loopState = readJsonSafe(hp.loopJsonPath);
  const pid = loopState?.pid ?? null;
  const alive = pid ? checkPidAliveCached(pid) : false;
  const stopping = existsSync(resolve(ws, '.stop'));

  let state = 'idle';
  if (stopping && alive) state = 'stopping';
  else if (loopState?.status === 'running' && alive) state = 'running';
  else if (loopState?.status === 'between' && alive) state = 'between';
  else if (loopState?.status === 'completed' || loopState?.exit_reason === 'completed') state = 'completed';

  return { state, detail: loopState, alive, pid };
}

// --- Features ---
export function readFeatures(ws: string, slug: string): { features: Feature[]; summary: Record<string, number>; total: number } {
  const hp = resolveHarnessSession(ws, slug);
  const raw = hp ? readJsonSafe(hp.featuresPath) : null;
  const features: Feature[] = Array.isArray(raw) ? raw : (raw?.features ?? []);
  const summary: Record<string, number> = {};
  for (const f of features) {
    summary[f.status] = (summary[f.status] || 0) + 1;
  }
  return { features, summary, total: features.length };
}

// --- Config ---
export function readConfig(ws: string, slug: string): HarnessConfig | null {
  const hp = resolveHarnessSession(ws, slug);
  if (!hp) return null;
  return readJsonSafe(hp.configPath);
}

// --- Run Status/Phase ---
export function getRunStatus(runsDir: string, slug: string): {
  exists: boolean;
  slug: string;
  workspace?: string;
  workspace_exists?: boolean;
  has_harness?: boolean;
  phase?: RunPhase;
  features_count?: number;
  features_passing?: number;
} {
  const resolved = resolveSlug(runsDir, slug);
  if (!resolved) return { exists: false, slug };

  const wsPath = resolved.workspace;
  const wsExists = existsSync(wsPath);
  const hp = wsExists ? resolveHarnessSession(wsPath, slug) : null;
  const hasHarness = !!hp;
  const featuresRaw = hp ? readJsonSafe(hp.featuresPath) : null;
  const features = featuresRaw ? (Array.isArray(featuresRaw) ? featuresRaw : (featuresRaw?.features ?? [])) : [];

  let hasRuns = false;
  if (hp) {
    try {
      const runEntries = readdirSync(hp.runsDir);
      hasRuns = runEntries.some(e => e.endsWith('.json'));
    } catch { /* runs/ pode não existir */ }
  }

  let phase: RunPhase = 'pending';
  if (hasRuns) phase = 'executed';
  else if (features.length > 0) phase = 'initialized';
  else if (hasHarness) phase = 'created';

  return {
    exists: true,
    slug,
    workspace: wsPath,
    workspace_exists: wsExists,
    has_harness: hasHarness,
    phase,
    features_count: features.length,
    features_passing: features.filter((f: any) => f.status === 'passing').length,
  };
}

// --- Harness Sessions ---
const HARNESS_INTERNAL = new Set(['scripts', 'active', 'prompt.md', 'learnings.md']);

export function listHarnessSessions(ws: string): { sessions: HarnessSessionInfo[]; active: string } {
  const harnessDir = resolve(ws, '.harness');
  const activeSession = readTextSafe(resolve(harnessDir, 'active')).trim();

  if (!existsSync(harnessDir)) return { sessions: [], active: '' };

  const sessions: HarnessSessionInfo[] = [];
  try {
    const entries = readdirSync(harnessDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (HARNESS_INTERNAL.has(entry.name)) continue;
      const sessionDir = resolve(harnessDir, entry.name);
      const featuresRaw = readJsonSafe(resolve(sessionDir, 'features.json'));
      const features = Array.isArray(featuresRaw) ? featuresRaw : (featuresRaw?.features ?? []);
      const passing = features.filter((f: any) => f.status === 'passing').length;

      sessions.push({
        name: entry.name,
        isActive: entry.name === activeSession,
        hasFeatures: features.length > 0,
        featuresCount: features.length,
        featuresPassingCount: passing,
      });
    }
  } catch { /* ok */ }

  return { sessions, active: activeSession };
}

// --- Progress ---
export async function readProgress(ws: string, slug: string, lines: number = 200): Promise<{ text: string; total_lines: number }> {
  const hp = resolveHarnessSession(ws, slug);
  const progressPath = hp?.progressPath;
  if (!progressPath || !existsSync(progressPath)) {
    return { text: '', total_lines: 0 };
  }
  try {
    const content = await readFile(progressPath, 'utf-8');
    const allLines = content.split('\n');
    return {
      text: lines > 0 ? allLines.slice(-lines).join('\n') : content,
      total_lines: allLines.length,
    };
  } catch {
    return { text: '', total_lines: 0 };
  }
}
