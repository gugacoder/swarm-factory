import { resolve, dirname } from 'node:path';
import { readFile, writeFile, unlink } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';

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

// RUNS_DIR resolvido a partir do root do workspace
function getRunsDir(): string {
  if (!process.env.RUNS_DIR) throw new Error('RUNS_DIR não configurada — verifique o .env');
  const raw = process.env.RUNS_DIR;
  return resolve(findWorkspaceRoot(), raw);
}

// Dynamic import da SDK MJS
async function loadSdk() {
  const runsDir = getRunsDir();
  const apiDir = resolve(runsDir, '.meta', 'api');
  const [listMod, loadMod, createMod, statusMod, initMod] = await Promise.all([
    import(/* @vite-ignore */ `file://${apiDir}/list-projects.mjs`),
    import(/* @vite-ignore */ `file://${apiDir}/load-project.mjs`),
    import(/* @vite-ignore */ `file://${apiDir}/create-project.mjs`),
    import(/* @vite-ignore */ `file://${apiDir}/get-status.mjs`),
    import(/* @vite-ignore */ `file://${apiDir}/init-workspace.mjs`),
  ]);
  return {
    listProjects: listMod.listProjects,
    loadProject: loadMod.loadProject,
    createProject: createMod.createProject,
    getStatus: statusMod.getStatus,
    initWorkspace: initMod.initWorkspace,
  };
}

// Cache da SDK (carrega uma vez)
let sdkPromise: ReturnType<typeof loadSdk> | null = null;
function getSdk() {
  if (!sdkPromise) sdkPromise = loadSdk();
  return sdkPromise;
}

export async function list() {
  const sdk = await getSdk();
  const runsDir = getRunsDir();
  return sdk.listProjects({ runsDir });
}

export async function get(slug: string) {
  const sdk = await getSdk();
  const runsDir = getRunsDir();
  return sdk.loadProject({ slug, runsDir });
}

export async function create(params: {
  slug: string;
  name: string;
  description?: string;
  workspace: string;
  specs: string;
  harness: string;
  model?: string;
  max_turns?: number;
  max_iterations?: number;
  max_features?: number;
  max_retries?: number;
  format?: string;
}) {
  const sdk = await getSdk();
  const runsDir = getRunsDir();

  // Verificar se slug já existe (qualquer formato)
  try {
    await sdk.loadProject({ slug: params.slug, runsDir });
    const err = new Error('Projeto com este slug já existe');
    (err as any).code = 'EEXIST';
    throw err;
  } catch (e: any) {
    if (e.code === 'EEXIST') throw e;
    // Slug não encontrado — ok, pode criar
  }

  return sdk.createProject({ ...params, runsDir });
}

export async function getStatus(slug: string) {
  const sdk = await getSdk();
  const runsDir = getRunsDir();
  return sdk.getStatus({ slug, runsDir });
}

export async function update(slug: string, params: {
  max_turns?: number;
  max_iterations?: number;
  max_features?: number;
  max_retries?: number;
  model?: string;
}) {
  // Carregar projeto, aplicar patch nos parametros do agent, salvar
  const sdk = await getSdk();
  const runsDir = getRunsDir();
  const project = await sdk.loadProject({ slug, runsDir });
  const source = project._source;

  // Ler JSON original
  const raw = await readFile(source, 'utf-8');
  const data = JSON.parse(raw);

  // Patch agent params
  if (params.max_turns !== undefined) data.agent.max_turns = params.max_turns;
  if (params.max_iterations !== undefined) data.agent.max_iterations = params.max_iterations;
  if (params.max_features !== undefined) data.agent.max_features = params.max_features;
  if (params.max_retries !== undefined) data.agent.max_retries = params.max_retries;
  if (params.model !== undefined) data.agent.model = params.model;

  await writeFile(source, JSON.stringify(data, null, 2), 'utf-8');
  return data;
}

export async function remove(slug: string) {
  const sdk = await getSdk();
  const runsDir = getRunsDir();
  const project = await sdk.loadProject({ slug, runsDir });
  const source = project._source;
  await unlink(source);
  return { ok: true, deleted: source };
}

export async function initWorkspace(slug: string) {
  const sdk = await getSdk();
  const runsDir = getRunsDir();
  return sdk.initWorkspace({ slug, runsDir });
}

export async function getFeatures(slug: string) {
  const sdk = await getSdk();
  const runsDir = getRunsDir();
  const project = await sdk.loadProject({ slug, runsDir });
  const workspace = project.workspace;

  // Tentar V2 primeiro, depois V1
  const { existsSync } = await import('node:fs');
  const harnessActive = resolve(workspace, '.harness', 'active');

  let featuresPath: string;
  if (existsSync(harnessActive)) {
    const session = (await readFile(harnessActive, 'utf-8')).trim();
    featuresPath = resolve(workspace, '.harness', session, 'features.json');
  } else {
    featuresPath = resolve(workspace, 'features.json');
  }

  const raw = await readFile(featuresPath, 'utf-8');
  return JSON.parse(raw);
}

export async function rotateFeature(slug: string, featureId: string) {
  const sdk = await getSdk();
  const runsDir = getRunsDir();
  const project = await sdk.loadProject({ slug, runsDir });
  const workspace = project.workspace;

  const { existsSync } = await import('node:fs');
  const harnessActive = resolve(workspace, '.harness', 'active');

  let featuresPath: string;
  if (existsSync(harnessActive)) {
    const session = (await readFile(harnessActive, 'utf-8')).trim();
    featuresPath = resolve(workspace, '.harness', session, 'features.json');
  } else {
    featuresPath = resolve(workspace, 'features.json');
  }

  const raw = await readFile(featuresPath, 'utf-8');
  const features = JSON.parse(raw);

  const feature = features.find((f: { id: string }) => f.id === featureId);
  if (!feature) {
    throw new Error(`Feature ${featureId} não encontrada`);
  }

  feature.status = 'failing';
  feature.retries = 0;

  await writeFile(featuresPath, JSON.stringify(features, null, 2), 'utf-8');
  return feature;
}
