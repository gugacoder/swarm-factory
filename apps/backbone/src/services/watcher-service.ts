import { resolve, dirname } from 'node:path';
import { readFile, readdir } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import { watch, type FSWatcher } from 'chokidar';
import { eventService } from './event-service.js';
import pool from '../db.js';

interface FeatureSnapshot {
  id: string;
  status: string;
}

interface StateSnapshot {
  status?: string;
  iteration?: number;
  feature_id?: string;
  pid?: number;
}

// Debounce por path — evita flooding
const debounceTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();

function debounce(key: string, fn: () => void, ms = 500) {
  const existing = debounceTimers.get(key);
  if (existing) clearTimeout(existing);
  debounceTimers.set(
    key,
    setTimeout(() => {
      debounceTimers.delete(key);
      fn();
    }, ms),
  );
}

// Cache de snapshots
const featuresCache: Map<string, FeatureSnapshot[]> = new Map();
const stateCache: Map<string, StateSnapshot> = new Map();

// Watchers ativos
let watcher: FSWatcher | null = null;
const watchedWorkspaces: Set<string> = new Set();

// Detectar root do monorepo (subir até achar package.json com workspaces)
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

function getRunsDir(): string {
  const raw = process.env.RUNS_DIR || './runs';
  return resolve(findWorkspaceRoot(), raw);
}

// Descobrir workspaces de todos os projetos
async function discoverWorkspaces(): Promise<Map<string, string>> {
  const runsDir = getRunsDir();
  const workspaces = new Map<string, string>();

  if (!existsSync(runsDir)) return workspaces;

  const entries = await readdir(runsDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith('.') || entry.name === 'workspaces') continue;

    // Formato flat: runs/{slug}.json
    if (entry.isFile() && entry.name.endsWith('.json')) {
      try {
        const raw = await readFile(resolve(runsDir, entry.name), 'utf-8');
        const data = JSON.parse(raw);
        if (data.workspace && data.slug) {
          workspaces.set(data.slug, data.workspace);
        }
      } catch {
        // Ignorar JSON inválido
      }
    }

    // Formato structured: runs/{slug}/project.json
    if (entry.isDirectory()) {
      const projectFile = resolve(runsDir, entry.name, 'project.json');
      if (existsSync(projectFile)) {
        try {
          const raw = await readFile(projectFile, 'utf-8');
          const data = JSON.parse(raw);
          if (data.workspace && data.slug) {
            workspaces.set(data.slug, data.workspace);
          }
        } catch {
          // Ignorar
        }
      }
    }
  }

  return workspaces;
}

// Resolver path do features.json (V2 ou V1)
function resolveFeaturesPath(workspace: string): string {
  const harnessActive = resolve(workspace, '.harness', 'active');
  if (existsSync(harnessActive)) {
    try {
      const session = readFileSync(harnessActive, 'utf-8').trim();
      return resolve(workspace, '.harness', session, 'features.json');
    } catch {
      // Fallback V1
    }
  }
  return resolve(workspace, 'features.json');
}

// Resolver path do state file (V2 ou V1)
function resolveStatePath(workspace: string): string {
  const harnessActive = resolve(workspace, '.harness', 'active');
  if (existsSync(harnessActive)) {
    try {
      const session = readFileSync(harnessActive, 'utf-8').trim();
      return resolve(workspace, '.harness', session, 'loop.json');
    } catch {
      // Fallback V1
    }
  }
  return resolve(workspace, 'agent-harness.state');
}

// Derivar slug do workspace a partir do path
function slugFromPath(filePath: string, workspaceMap: Map<string, string>): string | null {
  for (const [slug, ws] of workspaceMap) {
    if (filePath.startsWith(ws)) return slug;
  }
  return null;
}

async function handleFeaturesChange(filePath: string, slug: string) {
  try {
    const raw = await readFile(filePath, 'utf-8');
    const features: FeatureSnapshot[] = JSON.parse(raw);
    const cacheKey = `features:${slug}`;
    const previous = featuresCache.get(cacheKey) || [];

    // Computar diff
    for (const feature of features) {
      const prev = previous.find((p) => p.id === feature.id);
      if (prev && prev.status !== feature.status) {
        eventService.broadcast('feature:status', {
          slug,
          featureId: feature.id,
          oldStatus: prev.status,
          newStatus: feature.status,
        });

        // Criar notificação no banco quando feature passa ou falha definitivamente
        if (feature.status === 'passing' || feature.status === 'skipped') {
          await createNotification(slug, feature.id, feature.status);
        }
      }
    }

    // Atualizar cache
    featuresCache.set(
      cacheKey,
      features.map((f) => ({ id: f.id, status: f.status })),
    );
  } catch {
    // Arquivo pode estar sendo escrito — ignorar
  }
}

async function handleStateChange(filePath: string, slug: string) {
  try {
    const raw = await readFile(filePath, 'utf-8');
    const state: StateSnapshot = JSON.parse(raw);
    const cacheKey = `state:${slug}`;
    const previous = stateCache.get(cacheKey);

    // Detectar loop:start (PID apareceu)
    if (state.pid && (!previous || !previous.pid)) {
      eventService.broadcast('loop:start', {
        slug,
        pid: state.pid,
        iteration: state.iteration || 0,
      });
      await createNotification(slug, null, 'loop_start');
    }

    // Detectar loop:stop (PID desapareceu)
    if (previous && previous.pid && !state.pid) {
      eventService.broadcast('loop:stop', {
        slug,
        reason: state.status || 'unknown',
      });
      await createNotification(slug, null, 'loop_stop');
    }

    // Detectar progresso
    if (state.iteration && (!previous || state.iteration !== previous.iteration)) {
      eventService.broadcast('loop:progress', {
        slug,
        iteration: state.iteration,
        feature: state.feature_id || null,
      });
    }

    stateCache.set(cacheKey, { ...state });
  } catch {
    // Arquivo pode estar sendo escrito — ignorar
  }
}

async function createNotification(slug: string, featureId: string | null, type: string) {
  try {
    // Buscar todos os admins para enviar notificação
    const { rows: users } = await pool.query(
      'SELECT id FROM users WHERE active = true',
    );

    const title =
      type === 'passing'
        ? `Feature ${featureId} concluída`
        : type === 'skipped'
          ? `Feature ${featureId} pulada`
          : type === 'loop_start'
            ? `Loop iniciado em ${slug}`
            : `Loop parado em ${slug}`;

    const body =
      type === 'passing'
        ? `A feature ${featureId} do projeto ${slug} foi concluída com sucesso.`
        : type === 'skipped'
          ? `A feature ${featureId} do projeto ${slug} foi pulada após atingir o limite de retries.`
          : type === 'loop_start'
            ? `O loop autônomo do projeto ${slug} foi iniciado.`
            : `O loop autônomo do projeto ${slug} foi parado.`;

    const notifType =
      type === 'passing' || type === 'skipped'
        ? 'feature_status_change'
        : type === 'loop_start'
          ? 'loop_start'
          : 'loop_stop';

    for (const user of users) {
      await pool.query(
        `INSERT INTO notifications (user_id, type, title, body, metadata)
         VALUES ($1, $2::notification_type, $3, $4, $5)`,
        [
          user.id,
          notifType,
          title,
          body,
          JSON.stringify({ slug, featureId, eventType: type }),
        ],
      );
    }
  } catch {
    // Notificações são best-effort
  }
}

// Carregar snapshot inicial de um workspace
async function loadInitialSnapshots(slug: string, workspace: string) {
  const featuresPath = resolveFeaturesPath(workspace);
  if (existsSync(featuresPath)) {
    try {
      const raw = await readFile(featuresPath, 'utf-8');
      const features: FeatureSnapshot[] = JSON.parse(raw);
      featuresCache.set(
        `features:${slug}`,
        features.map((f) => ({ id: f.id, status: f.status })),
      );
    } catch {
      // Ignorar
    }
  }

  const statePath = resolveStatePath(workspace);
  if (existsSync(statePath)) {
    try {
      const raw = await readFile(statePath, 'utf-8');
      const state: StateSnapshot = JSON.parse(raw);
      stateCache.set(`state:${slug}`, { ...state });
    } catch {
      // Ignorar
    }
  }
}

export async function startWatching() {
  const workspaces = await discoverWorkspaces();

  if (workspaces.size === 0) {
    console.log('[watcher] Nenhum workspace encontrado para monitorar');
    return;
  }

  // Carregar snapshots iniciais
  for (const [slug, workspace] of workspaces) {
    if (existsSync(workspace)) {
      await loadInitialSnapshots(slug, workspace);
      watchedWorkspaces.add(workspace);
    }
  }

  // Coletar paths para monitorar
  const watchPaths: string[] = [];
  for (const workspace of watchedWorkspaces) {
    // Monitorar features.json e state no workspace
    watchPaths.push(resolve(workspace, 'features.json'));
    watchPaths.push(resolve(workspace, 'agent-harness.state'));
    // V2 paths
    const harnessDir = resolve(workspace, '.harness');
    if (existsSync(harnessDir)) {
      watchPaths.push(resolve(harnessDir, '**', 'features.json'));
      watchPaths.push(resolve(harnessDir, '**', 'loop.json'));
    }
  }

  if (watchPaths.length === 0) {
    console.log('[watcher] Nenhum arquivo para monitorar');
    return;
  }

  watcher = watch(watchPaths, {
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 200,
      pollInterval: 100,
    },
  });

  watcher.on('change', (changedPath) => {
    const normalizedPath = changedPath.replace(/\\/g, '/');
    const slug = slugFromPath(changedPath, workspaces);
    if (!slug) return;

    const basename = normalizedPath.split('/').pop() || '';

    if (basename === 'features.json') {
      debounce(`features:${slug}`, () => handleFeaturesChange(changedPath, slug));
    } else if (basename === 'agent-harness.state' || basename === 'loop.json') {
      debounce(`state:${slug}`, () => handleStateChange(changedPath, slug));
    }
  });

  console.log(
    `[watcher] Monitorando ${watchedWorkspaces.size} workspace(s): ${[...workspaces.keys()].join(', ')}`,
  );
}

export async function stopWatching() {
  if (watcher) {
    await watcher.close();
    watcher = null;
  }
  watchedWorkspaces.clear();
  featuresCache.clear();
  stateCache.clear();
  for (const timer of debounceTimers.values()) {
    clearTimeout(timer);
  }
  debounceTimers.clear();
  console.log('[watcher] Monitoramento parado');
}
