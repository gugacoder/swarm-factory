/**
 * Testes para F-009 — API get-status.mjs
 *
 * Execução: node .sessions/F-009/test.mjs
 */
import { readFile, rm, access, mkdir, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname } from 'node:path';
import { execSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..', '..');

/** Converte path absoluto para file:// URL (necessário para import() no Windows) */
function toFileUrl(p) { return pathToFileURL(resolve(p)).href; }

let passed = 0;
let failed = 0;

function ok(name) {
  passed++;
  console.log(`  ✔ ${name}`);
}

function fail(name, err) {
  failed++;
  console.error(`  ✘ ${name}: ${err}`);
}

async function fileExists(p) {
  try { await access(p); return true; } catch { return false; }
}

// Setup: criar projeto de teste com workspace
const TEST_BASE = resolve(ROOT, '.sessions', 'F-009', '_test');
const TEST_WORKSPACE = resolve(TEST_BASE, 'workspace');
const TEST_RUNS_DIR = resolve(TEST_BASE, 'runs');
const TEST_SLUG = 'test-get-status';

const TEST_PROJECT = {
  version: 1,
  slug: TEST_SLUG,
  name: 'Test Get Status',
  description: 'Projeto de teste para F-009',
  specs: './specs',
  workspace: TEST_WORKSPACE,
  agent: {
    harness: 'claude-code',
    model: null,
    max_turns: 50,
    max_iterations: null,
    max_features: null,
    max_retries: 5,
  },
  artifacts: {
    harness_config: { type: 'file', path: './agent-harness.json' },
    harness_script: { type: 'file', path: './agent-harness.mjs' },
    setup_script:   { type: 'file', path: './agent-setup.mjs' },
    features:       { type: 'file', path: './features.json' },
    progress:       { type: 'file', path: './agent-progress.txt' },
    state:          { type: 'file', path: './agent-harness.state' },
    pid:            { type: 'file', path: './agent-harness.pid' },
    sessions:       { type: 'dir',  path: './.sessions' },
    current_milestone: { type: 'file', path: './.sessions/.current-milestone' },
  },
};

const TEST_FEATURES = [
  { id: 'F-001', title: 'Feature 1', description: 'Desc 1', status: 'passing', priority: 1, dependencies: [], retries: 0, prp_ids: [] },
  { id: 'F-002', title: 'Feature 2', description: 'Desc 2', status: 'passing', priority: 2, dependencies: [], retries: 0, prp_ids: [] },
  { id: 'F-003', title: 'Feature 3', description: 'Desc 3', status: 'failing', priority: 3, dependencies: [], retries: 0, prp_ids: [] },
  { id: 'F-004', title: 'Feature 4', description: 'Desc 4', status: 'pending', priority: 4, dependencies: ['F-003'], retries: 0, prp_ids: [] },
  { id: 'F-005', title: 'Feature 5', description: 'Desc 5', status: 'in_progress', priority: 5, dependencies: [], retries: 0, prp_ids: [] },
  { id: 'F-006', title: 'Feature 6', description: 'Desc 6', status: 'blocked', priority: 6, dependencies: [], retries: 0, prp_ids: [] },
  { id: 'F-007', title: 'Feature 7', description: 'Desc 7', status: 'skipped', priority: 7, dependencies: [], retries: 0, prp_ids: [] },
  { id: 'F-008', title: 'Feature 8', description: 'Desc 8', status: 'passing', priority: 8, dependencies: [], retries: 0, prp_ids: [] },
];

async function createProjectJson() {
  const projectDir = join(TEST_RUNS_DIR, TEST_SLUG);
  await mkdir(projectDir, { recursive: true });
  const projectPath = join(projectDir, 'project.json');
  await writeFile(projectPath, JSON.stringify(TEST_PROJECT, null, 2) + '\n', 'utf8');
  return projectPath;
}

async function createWorkspace({ withFeatures = false, withPid = null, withState = null } = {}) {
  await mkdir(TEST_WORKSPACE, { recursive: true });
  if (withFeatures) {
    await writeFile(join(TEST_WORKSPACE, 'features.json'), JSON.stringify(TEST_FEATURES, null, 2), 'utf8');
  }
  if (withPid !== null) {
    await writeFile(join(TEST_WORKSPACE, 'agent-harness.pid'), String(withPid), 'utf8');
  }
  if (withState !== null) {
    await writeFile(join(TEST_WORKSPACE, 'agent-harness.state'), JSON.stringify(withState), 'utf8');
  }
}

async function cleanup() {
  await rm(TEST_BASE, { recursive: true, force: true });
}

console.log('\n=== F-009: API get-status.mjs ===\n');

try {
  // Test 1: Arquivo existe e exporta getStatus
  console.log('[Test 1] Arquivo existe e exporta getStatus');
  const mod = await import(toFileUrl(join(ROOT, 'runs', '.meta', 'api', 'get-status.mjs')));
  if (typeof mod.getStatus === 'function') {
    ok('get-status.mjs existe e exporta getStatus');
  } else {
    fail('get-status.mjs existe e exporta getStatus', 'getStatus não é uma função');
  }

  const { getStatus } = mod;

  // Test 2: Retorna state='not_initialized' quando workspace não existe
  console.log('[Test 2] state=not_initialized quando workspace não existe');
  await cleanup();
  const projectPath = await createProjectJson();
  try {
    const status = await getStatus(projectPath);
    if (status.state === 'not_initialized' && status.slug === TEST_SLUG && status.name === 'Test Get Status') {
      ok("state='not_initialized' quando workspace não existe");
    } else {
      fail("state='not_initialized'", `state=${status.state}, slug=${status.slug}`);
    }
  } catch (e) {
    fail("state='not_initialized'", e.message);
  }

  // Test 3: Retorna state='initialized' quando workspace existe mas sem features.json
  console.log('[Test 3] state=initialized quando workspace existe mas sem features.json');
  await rm(TEST_WORKSPACE, { recursive: true, force: true });
  await createWorkspace({ withFeatures: false });
  try {
    const status = await getStatus(projectPath);
    if (status.state === 'initialized') {
      ok("state='initialized' quando workspace sem features.json");
    } else {
      fail("state='initialized'", `state=${status.state}`);
    }
  } catch (e) {
    fail("state='initialized'", e.message);
  }

  // Test 4: Retorna state='idle' quando features.json existe e loop não ativo
  console.log('[Test 4] state=idle quando features.json existe e loop não ativo');
  await rm(TEST_WORKSPACE, { recursive: true, force: true });
  await createWorkspace({ withFeatures: true });
  try {
    const status = await getStatus(projectPath);
    if (status.state === 'idle') {
      ok("state='idle' quando features.json existe e sem PID ativo");
    } else {
      fail("state='idle'", `state=${status.state}`);
    }
  } catch (e) {
    fail("state='idle'", e.message);
  }

  // Test 5: Retorna state='running' quando PID ativo detectado
  console.log('[Test 5] state=running quando PID ativo detectado');
  await rm(TEST_WORKSPACE, { recursive: true, force: true });
  // Usar o PID do processo atual (que sabemos estar rodando)
  const myPid = process.pid;
  await createWorkspace({
    withFeatures: true,
    withPid: myPid,
    withState: { status: 'running', iteration: 3, started_at: '2026-02-09T10:00:00Z', feature_id: 'F-003' },
  });
  try {
    const status = await getStatus(projectPath);
    if (status.state === 'running' && status.loop.active === true && status.loop.pid === myPid) {
      ok("state='running' quando PID ativo (usando PID do teste)");
    } else {
      fail("state='running'", `state=${status.state}, loop.active=${status.loop.active}, loop.pid=${status.loop.pid}`);
    }
  } catch (e) {
    fail("state='running'", e.message);
  }

  // Test 6: features contém contagem por status
  console.log('[Test 6] features contém contagem por status');
  try {
    const status = await getStatus(projectPath);
    const f = status.features;
    const expected = { total: 8, passing: 3, failing: 1, pending: 1, in_progress: 1, blocked: 1, skipped: 1 };
    const matches = f.total === expected.total &&
      f.passing === expected.passing &&
      f.failing === expected.failing &&
      f.pending === expected.pending &&
      f.in_progress === expected.in_progress &&
      f.blocked === expected.blocked &&
      f.skipped === expected.skipped;
    if (matches) {
      ok('features contém contagem correta por status');
    } else {
      fail('contagem por status', `Obtido: ${JSON.stringify(f)}, Esperado: ${JSON.stringify(expected)}`);
    }
  } catch (e) {
    fail('contagem por status', e.message);
  }

  // Test 7: progress é porcentagem arredondada (passing/total*100)
  console.log('[Test 7] progress é porcentagem arredondada');
  try {
    const status = await getStatus(projectPath);
    // 3 passing / 8 total * 100 = 37.5 → arredondado = 38
    const expected = Math.round((3 / 8) * 100);
    if (status.progress === expected) {
      ok(`progress = ${status.progress}% (3/8 arredondado)`);
    } else {
      fail('progress', `Esperado ${expected}, obtido ${status.progress}`);
    }
  } catch (e) {
    fail('progress', e.message);
  }

  // Test 8: Verificação de PID cross-platform (PID inexistente retorna idle)
  console.log('[Test 8] Verificação de PID cross-platform');
  await rm(TEST_WORKSPACE, { recursive: true, force: true });
  // Usar PID inexistente (99999999) — deve retornar idle
  await createWorkspace({ withFeatures: true, withPid: 99999999 });
  try {
    const status = await getStatus(projectPath);
    if (status.state === 'idle' && status.loop.active === false && status.loop.pid === null) {
      ok('PID inexistente detectado como não-ativo (cross-platform)');
    } else {
      fail('PID cross-platform', `state=${status.state}, loop.active=${status.loop.active}, pid=${status.loop.pid}`);
    }
  } catch (e) {
    fail('PID cross-platform', e.message);
  }

  // Test 9: CLI com --format table e --format json
  console.log('[Test 9] CLI com --format table e --format json');
  await rm(TEST_WORKSPACE, { recursive: true, force: true });
  await createWorkspace({ withFeatures: true });
  const apiPath = resolve(ROOT, 'runs', '.meta', 'api', 'get-status.mjs');

  // JSON format
  try {
    const output = execSync(
      `node "${apiPath}" "${projectPath}" --format json`,
      { encoding: 'utf8', cwd: ROOT }
    );
    const result = JSON.parse(output);
    if (result.slug === TEST_SLUG && result.state === 'idle' && typeof result.features.total === 'number') {
      ok('CLI --format json funciona');
    } else {
      fail('CLI --format json', `Output inesperado: ${output.substring(0, 200)}`);
    }
  } catch (e) {
    fail('CLI --format json', e.message);
  }

  // Table format
  try {
    const output = execSync(
      `node "${apiPath}" "${projectPath}" --format table`,
      { encoding: 'utf8', cwd: ROOT }
    );
    if (output.includes('Projeto:') && output.includes('Test Get Status') && output.includes('Features:')) {
      ok('CLI --format table funciona');
    } else {
      fail('CLI --format table', `Output inesperado: ${output.substring(0, 200)}`);
    }
  } catch (e) {
    fail('CLI --format table', e.message);
  }

} catch (e) {
  console.error(`\nErro fatal: ${e.message}\n${e.stack}`);
} finally {
  await cleanup();
}

console.log(`\n=== Resultado: ${passed} passed, ${failed} failed (${passed + failed} total) ===\n`);
process.exit(failed > 0 ? 1 : 0);
