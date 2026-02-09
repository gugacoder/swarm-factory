/**
 * Testes para F-005 — API create-project.mjs
 * Executa: node .sessions/F-005/test.mjs
 */
import { createProject } from '../../runs/.meta/api/create-project.mjs';
import { validateProject } from '../../runs/.meta/lib/validate.mjs';
import { readFile, rm, access, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const WORKSPACE_ROOT = resolve(__dirname, '..', '..');
const API_PATH = resolve(WORKSPACE_ROOT, 'runs', '.meta', 'api', 'create-project.mjs');

let passed = 0;
let failed = 0;
const results = [];

function ok(name) {
  passed++;
  results.push({ name, ok: true });
  console.log(`  ✓ ${name}`);
}

function fail(name, err) {
  failed++;
  results.push({ name, ok: false, error: err });
  console.error(`  ✗ ${name}: ${err}`);
}

// Diretório temporário para testes
const TMP_RUNS = resolve(WORKSPACE_ROOT, '.sessions', 'F-005', '_tmp_runs');

async function cleanup() {
  try { await rm(TMP_RUNS, { recursive: true, force: true }); } catch {}
}

async function setup() {
  await cleanup();
  await mkdir(TMP_RUNS, { recursive: true });
}

console.log('\n=== Testes F-005 — API create-project.mjs ===\n');

await setup();

// --- Teste 1: Arquivo existe e exporta createProject ---
try {
  await access(API_PATH);
  if (typeof createProject === 'function') {
    ok('Arquivo existe e exporta createProject');
  } else {
    fail('Arquivo existe e exporta createProject', 'createProject não é função');
  }
} catch (e) {
  fail('Arquivo existe e exporta createProject', e.message);
}

// --- Teste 2: createProject cria project.json válido ---
try {
  const project = await createProject({
    slug: 'test-basic',
    name: 'Test Basic',
    workspace: '/home/user/test',
    specs: './docs/specs',
    harness: 'claude-code',
    runsDir: TMP_RUNS,
  });
  const result = await validateProject(project);
  if (result.valid) {
    ok('createProject cria project.json válido');
  } else {
    fail('createProject cria project.json válido', `Validação: ${result.errors.join(', ')}`);
  }
} catch (e) {
  fail('createProject cria project.json válido', e.message);
}
await cleanup(); await setup();

// --- Teste 3: JSON contém version:1, campos obrigatórios e artifacts padrão ---
try {
  const project = await createProject({
    slug: 'test-fields',
    name: 'Test Fields',
    workspace: '/home/user/test',
    specs: './docs/specs',
    harness: 'claude-code',
    runsDir: TMP_RUNS,
  });

  const checks = [];
  if (project.version !== 1) checks.push('version !== 1');
  if (!project.slug) checks.push('slug missing');
  if (!project.name) checks.push('name missing');
  if (!project.specs) checks.push('specs missing');
  if (!project.workspace) checks.push('workspace missing');
  if (!project.agent?.harness) checks.push('agent.harness missing');
  if (!project.artifacts) checks.push('artifacts missing');
  // Verificar 9 artefatos padrão
  const artKeys = Object.keys(project.artifacts);
  if (artKeys.length !== 9) checks.push(`artifacts: ${artKeys.length} (expected 9)`);

  if (checks.length === 0) {
    ok('JSON contém version:1, campos obrigatórios e artifacts padrão');
  } else {
    fail('JSON contém version:1, campos obrigatórios e artifacts padrão', checks.join('; '));
  }
} catch (e) {
  fail('JSON contém version:1, campos obrigatórios e artifacts padrão', e.message);
}
await cleanup(); await setup();

// --- Teste 4: Formato structured cria runs/{slug}/project.json ---
try {
  await createProject({
    slug: 'test-structured',
    name: 'Test Structured',
    workspace: '/home/user/test',
    specs: './docs/specs',
    harness: 'claude-code',
    format: 'structured',
    runsDir: TMP_RUNS,
  });

  const expectedPath = join(TMP_RUNS, 'test-structured', 'project.json');
  await access(expectedPath);
  const content = JSON.parse(await readFile(expectedPath, 'utf8'));
  if (content.slug === 'test-structured') {
    ok('Formato structured: cria runs/{slug}/project.json com mkdir');
  } else {
    fail('Formato structured: cria runs/{slug}/project.json com mkdir', 'slug não confere');
  }
} catch (e) {
  fail('Formato structured: cria runs/{slug}/project.json com mkdir', e.message);
}
await cleanup(); await setup();

// --- Teste 5: Formato flat cria runs/{slug}.json ---
try {
  await createProject({
    slug: 'test-flat',
    name: 'Test Flat',
    workspace: '/home/user/test',
    specs: './docs/specs',
    harness: 'claude-code',
    format: 'flat',
    runsDir: TMP_RUNS,
  });

  const expectedPath = join(TMP_RUNS, 'test-flat.json');
  await access(expectedPath);
  const content = JSON.parse(await readFile(expectedPath, 'utf8'));
  if (content.slug === 'test-flat') {
    ok('Formato flat: cria runs/{slug}.json');
  } else {
    fail('Formato flat: cria runs/{slug}.json', 'slug não confere');
  }
} catch (e) {
  fail('Formato flat: cria runs/{slug}.json', e.message);
}
await cleanup(); await setup();

// --- Teste 6: Lança erro se arquivo já existir ---
try {
  const params = {
    slug: 'test-exists',
    name: 'Test Exists',
    workspace: '/home/user/test',
    specs: './docs/specs',
    harness: 'claude-code',
    format: 'flat',
    runsDir: TMP_RUNS,
  };
  await createProject(params);
  try {
    await createProject(params);
    fail('Lança erro se arquivo já existir', 'Não lançou erro');
  } catch (err) {
    if (err.message.includes('já existe')) {
      ok('Lança erro se arquivo já existir');
    } else {
      fail('Lança erro se arquivo já existir', `Mensagem inesperada: ${err.message}`);
    }
  }
} catch (e) {
  fail('Lança erro se arquivo já existir', e.message);
}
await cleanup(); await setup();

// --- Teste 7: Lança erro se validação falhar ---
try {
  await createProject({
    slug: 'test-invalid',
    name: 'Test Invalid',
    workspace: '/home/user/test',
    specs: './docs/specs',
    harness: 'invalido',  // harness inválido
    runsDir: TMP_RUNS,
  });
  fail('Lança erro se validação falhar', 'Não lançou erro');
} catch (err) {
  if (err.message.includes('Validação falhou') || err.message.includes('validação') || err.message.includes('alid')) {
    ok('Lança erro se validação falhar');
  } else {
    fail('Lança erro se validação falhar', `Mensagem inesperada: ${err.message}`);
  }
}
await cleanup(); await setup();

// --- Teste 8: Funciona como CLI ---
try {
  const { stdout } = await execFileAsync('node', [
    API_PATH,
    '--slug', 'test-cli',
    '--name', 'Test CLI',
    '--workspace', '/home/user/test',
    '--specs', './docs/specs',
    '--harness', 'claude-code',
    '--format', 'flat',
  ], { env: { ...process.env, RUNS_DIR: TMP_RUNS } });

  // CLI usa RUNS_DIR? Não — precisa de outro approach.
  // Na verdade a CLI usa RUNS_DIR fixo. Vamos verificar se o output é JSON válido.
  const output = JSON.parse(stdout);
  if (output.slug === 'test-cli') {
    ok('Funciona como CLI');
  } else {
    fail('Funciona como CLI', 'Output inesperado');
  }
} catch (e) {
  // A CLI pode ter criado o arquivo no runs/ real — limpar
  try { await rm(join(WORKSPACE_ROOT, 'runs', 'test-cli.json'), { force: true }); } catch {}
  fail('Funciona como CLI', e.message);
}

// --- Teste 9: CLI aceita --max-turns (dash) ---
try {
  const { stdout } = await execFileAsync('node', [
    API_PATH,
    '--slug', 'test-dash',
    '--name', 'Test Dash',
    '--workspace', '/home/user/test',
    '--specs', './docs/specs',
    '--harness', 'claude-code',
    '--max-turns', '100',
    '--format', 'flat',
  ]);

  const output = JSON.parse(stdout);
  if (output.agent.max_turns === 100) {
    ok('CLI aceita --max-turns (dash) como alias de max_turns');
  } else {
    fail('CLI aceita --max-turns (dash) como alias de max_turns', `max_turns=${output.agent.max_turns}`);
  }
} catch (e) {
  fail('CLI aceita --max-turns (dash) como alias de max_turns', e.message);
}

// Limpeza final
await cleanup();
// Limpar arquivos gerados pela CLI no runs/ real
try { await rm(join(WORKSPACE_ROOT, 'runs', 'test-cli.json'), { force: true }); } catch {}
try { await rm(join(WORKSPACE_ROOT, 'runs', 'test-dash.json'), { force: true }); } catch {}

console.log(`\n=== Resultado: ${passed}/${passed + failed} testes passing ===\n`);
process.exit(failed > 0 ? 1 : 0);
