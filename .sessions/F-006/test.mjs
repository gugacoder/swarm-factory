/**
 * Testes para F-006 — API load-project.mjs
 * Executa: node .sessions/F-006/test.mjs
 */
import { loadProject } from '../../runs/.meta/api/load-project.mjs';
import { createProject } from '../../runs/.meta/api/create-project.mjs';
import { readFile, rm, mkdir, writeFile, access } from 'node:fs/promises';
import { join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const WORKSPACE_ROOT = resolve(__dirname, '..', '..');
const API_PATH = resolve(WORKSPACE_ROOT, 'runs', '.meta', 'api', 'load-project.mjs');

let passed = 0;
let failed = 0;

function ok(name) {
  passed++;
  console.log(`  \u2713 ${name}`);
}

function fail(name, err) {
  failed++;
  console.error(`  \u2717 ${name}: ${err}`);
}

// Diretorio temporario para testes
const TMP_RUNS = resolve(__dirname, '_tmp_runs');
const TMP_WORKSPACE = process.platform === 'win32'
  ? 'C:\\Users\\test\\my-project'
  : '/home/user/my-project';

async function cleanup() {
  try { await rm(TMP_RUNS, { recursive: true, force: true }); } catch {}
}

async function setup() {
  await cleanup();
  await mkdir(TMP_RUNS, { recursive: true });
}

/**
 * Cria um project.json valido no diretorio temporario.
 */
async function createTestProject(slug, format = 'structured') {
  await createProject({
    slug,
    name: `Test ${slug}`,
    workspace: TMP_WORKSPACE,
    specs: './docs/specs',
    harness: 'claude-code',
    format,
    runsDir: TMP_RUNS,
  });
}

console.log('\n=== Testes F-006 \u2014 API load-project.mjs ===\n');

await setup();

// --- Teste 1: Arquivo existe e exporta loadProject ---
try {
  await access(API_PATH);
  if (typeof loadProject === 'function') {
    ok('Arquivo existe e exporta loadProject');
  } else {
    fail('Arquivo existe e exporta loadProject', 'loadProject nao e funcao');
  }
} catch (e) {
  fail('Arquivo existe e exporta loadProject', e.message);
}

// --- Teste 2: loadProject(path) le, valida e retorna objeto com _source e _resolved ---
try {
  await createTestProject('test-path', 'structured');
  const projectPath = join(TMP_RUNS, 'test-path', 'project.json');
  const project = await loadProject(projectPath);

  const checks = [];
  if (!project._source) checks.push('_source ausente');
  if (!project._resolved) checks.push('_resolved ausente');
  if (!project._resolved?.specs) checks.push('_resolved.specs ausente');
  if (!project._resolved?.artifacts) checks.push('_resolved.artifacts ausente');
  if (project.slug !== 'test-path') checks.push(`slug=${project.slug}`);
  if (project.version !== 1) checks.push(`version=${project.version}`);

  if (checks.length === 0) {
    ok('loadProject(path) le, valida e retorna objeto com _source e _resolved');
  } else {
    fail('loadProject(path) le, valida e retorna objeto com _source e _resolved', checks.join('; '));
  }
} catch (e) {
  fail('loadProject(path) le, valida e retorna objeto com _source e _resolved', e.message);
}
await cleanup(); await setup();

// --- Teste 3: loadProject({ slug, runsDir }) encontra projeto via discovery e carrega ---
try {
  await createTestProject('test-slug', 'structured');
  const project = await loadProject({ slug: 'test-slug', runsDir: TMP_RUNS });

  const checks = [];
  if (project.slug !== 'test-slug') checks.push(`slug=${project.slug}`);
  if (!project._source) checks.push('_source ausente');
  if (!project._resolved) checks.push('_resolved ausente');

  if (checks.length === 0) {
    ok('loadProject({ slug, runsDir }) encontra projeto via discovery e carrega');
  } else {
    fail('loadProject({ slug, runsDir }) encontra projeto via discovery e carrega', checks.join('; '));
  }
} catch (e) {
  fail('loadProject({ slug, runsDir }) encontra projeto via discovery e carrega', e.message);
}
await cleanup(); await setup();

// --- Teste 4: _resolved.specs contem path absoluto resolvido ---
try {
  await createTestProject('test-specs', 'structured');
  const projectPath = join(TMP_RUNS, 'test-specs', 'project.json');
  const project = await loadProject(projectPath);

  // specs='./docs/specs' resolvido a partir de workspace
  // Usar resolvePath para obter o valor esperado (mesma logica do modulo)
  const { resolvePath: rp } = await import('../../runs/.meta/lib/paths.mjs');
  const expectedSpecs = rp(TMP_WORKSPACE, './docs/specs');

  if (project._resolved.specs === expectedSpecs) {
    ok('_resolved.specs contem path absoluto resolvido');
  } else {
    fail('_resolved.specs contem path absoluto resolvido', `got ${project._resolved.specs}, expected ${expectedSpecs}`);
  }
} catch (e) {
  fail('_resolved.specs contem path absoluto resolvido', e.message);
}
await cleanup(); await setup();

// --- Teste 5: _resolved.artifacts contem todos os paths absolutos dos artefatos ---
try {
  await createTestProject('test-arts', 'structured');
  const projectPath = join(TMP_RUNS, 'test-arts', 'project.json');
  const project = await loadProject(projectPath);

  const artifacts = project._resolved.artifacts;
  const checks = [];

  // Deve ter todos os artefatos resolvidos
  const rawJson = JSON.parse(await readFile(projectPath, 'utf8'));
  const expectedKeys = Object.keys(rawJson.artifacts);

  for (const key of expectedKeys) {
    if (!(key in artifacts)) {
      checks.push(`${key} ausente`);
    } else {
      const val = artifacts[key];
      // Deve ser string (path resolvido) e nao path relativo
      if (typeof val !== 'string') {
        checks.push(`${key}: nao e string`);
      }
    }
  }

  if (checks.length === 0) {
    ok('_resolved.artifacts contem todos os paths absolutos dos artefatos');
  } else {
    fail('_resolved.artifacts contem todos os paths absolutos dos artefatos', checks.join('; '));
  }
} catch (e) {
  fail('_resolved.artifacts contem todos os paths absolutos dos artefatos', e.message);
}
await cleanup(); await setup();

// --- Teste 6: Lanca erro se JSON invalido com detalhes de validacao ---
try {
  // Criar JSON invalido no disco (sem campo obrigatorio 'agent')
  const invalidDir = join(TMP_RUNS, 'test-invalid');
  await mkdir(invalidDir, { recursive: true });
  const invalidPath = join(invalidDir, 'project.json');
  await writeFile(invalidPath, JSON.stringify({
    version: 1,
    slug: 'test-invalid',
    name: 'Test Invalid',
    specs: './docs',
    workspace: '/home/user/test',
    // Faltam: agent, artifacts
  }, null, 2), 'utf8');

  try {
    await loadProject(invalidPath);
    fail('Lanca erro se JSON invalido com detalhes de validacao', 'Nao lancou erro');
  } catch (err) {
    if (err.message.includes('inv\u00E1lido') || err.message.includes('invalid')) {
      ok('Lanca erro se JSON invalido com detalhes de validacao');
    } else {
      fail('Lanca erro se JSON invalido com detalhes de validacao', `Mensagem inesperada: ${err.message}`);
    }
  }
} catch (e) {
  fail('Lanca erro se JSON invalido com detalhes de validacao', e.message);
}
await cleanup(); await setup();

// --- Teste 7: Lanca erro se slug nao encontrado ---
try {
  try {
    await loadProject({ slug: 'slug-inexistente', runsDir: TMP_RUNS });
    fail('Lanca erro se slug nao encontrado', 'Nao lancou erro');
  } catch (err) {
    if (err.message.includes('n\u00E3o encontrado') || err.message.includes('not found')) {
      ok('Lanca erro se slug nao encontrado');
    } else {
      fail('Lanca erro se slug nao encontrado', `Mensagem inesperada: ${err.message}`);
    }
  }
} catch (e) {
  fail('Lanca erro se slug nao encontrado', e.message);
}
await cleanup(); await setup();

// --- Teste 8: Funciona como CLI ---
try {
  await createTestProject('test-cli', 'structured');
  const projectPath = join(TMP_RUNS, 'test-cli', 'project.json');

  const { stdout } = await execFileAsync('node', [API_PATH, projectPath]);
  const output = JSON.parse(stdout);

  const checks = [];
  if (output.slug !== 'test-cli') checks.push(`slug=${output.slug}`);
  if (!output._source) checks.push('_source ausente');
  if (!output._resolved) checks.push('_resolved ausente');

  if (checks.length === 0) {
    ok('Funciona como CLI: node load-project.mjs <path>');
  } else {
    fail('Funciona como CLI: node load-project.mjs <path>', checks.join('; '));
  }
} catch (e) {
  fail('Funciona como CLI: node load-project.mjs <path>', e.message);
}

// Limpeza final
await cleanup();

console.log(`\n=== Resultado: ${passed}/${passed + failed} testes passing ===\n`);
process.exit(failed > 0 ? 1 : 0);
