/**
 * Testes para F-007 — API list-projects.mjs
 * Executa: node .sessions/F-007/test.mjs
 */
import { listProjects } from '../../runs/.meta/api/list-projects.mjs';
import { createProject } from '../../runs/.meta/api/create-project.mjs';
import { rm, mkdir, writeFile, access } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const WORKSPACE_ROOT = resolve(__dirname, '..', '..');
const API_PATH = resolve(WORKSPACE_ROOT, 'runs', '.meta', 'api', 'list-projects.mjs');

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

console.log('\n=== Testes F-007 \u2014 API list-projects.mjs ===\n');

await setup();

// --- Teste 1: Arquivo existe e exporta listProjects ---
try {
  await access(API_PATH);
  if (typeof listProjects === 'function') {
    ok('Arquivo existe e exporta listProjects');
  } else {
    fail('Arquivo existe e exporta listProjects', 'listProjects nao e funcao');
  }
} catch (e) {
  fail('Arquivo existe e exporta listProjects', e.message);
}

// --- Teste 2: listProjects() retorna array de ProjectSummary ---
try {
  // Criar projetos em formatos flat e structured
  await createProject({
    slug: 'proj-flat',
    name: 'Projeto Flat',
    workspace: TMP_WORKSPACE,
    specs: './docs/specs',
    harness: 'claude-code',
    format: 'flat',
    runsDir: TMP_RUNS,
  });
  await createProject({
    slug: 'proj-struct',
    name: 'Projeto Structured',
    workspace: TMP_WORKSPACE,
    specs: './docs/specs',
    harness: 'opencode',
    format: 'structured',
    runsDir: TMP_RUNS,
  });

  const projects = await listProjects({ runsDir: TMP_RUNS });
  const checks = [];

  if (!Array.isArray(projects)) {
    checks.push('nao e array');
  } else if (projects.length < 2) {
    checks.push(`esperado >= 2 projetos, got ${projects.length}`);
  } else {
    // Verificar campos de ProjectSummary
    for (const p of projects) {
      const fields = ['slug', 'name', 'workspace', 'harness', 'format', '_source'];
      for (const f of fields) {
        if (!(f in p)) checks.push(`campo ${f} ausente em ${p.slug || '?'}`);
      }
    }

    // Verificar que encontrou ambos os formatos
    const flat = projects.find(p => p.slug === 'proj-flat');
    const struct = projects.find(p => p.slug === 'proj-struct');
    if (!flat) checks.push('proj-flat nao encontrado');
    if (!struct) checks.push('proj-struct nao encontrado');
    if (flat && flat.format !== 'flat') checks.push(`proj-flat format=${flat.format}`);
    if (struct && struct.format !== 'structured') checks.push(`proj-struct format=${struct.format}`);
    if (flat && flat.harness !== 'claude-code') checks.push(`proj-flat harness=${flat.harness}`);
    if (struct && struct.harness !== 'opencode') checks.push(`proj-struct harness=${struct.harness}`);
  }

  if (checks.length === 0) {
    ok('listProjects() retorna array de ProjectSummary com slug, name, workspace, harness, format');
  } else {
    fail('listProjects() retorna array de ProjectSummary com slug, name, workspace, harness, format', checks.join('; '));
  }
} catch (e) {
  fail('listProjects() retorna array de ProjectSummary com slug, name, workspace, harness, format', e.message);
}
await cleanup(); await setup();

// --- Teste 3: Projetos com JSON invalido aparecem com _error ---
try {
  // Criar um projeto valido
  await createProject({
    slug: 'proj-ok',
    name: 'Projeto OK',
    workspace: TMP_WORKSPACE,
    specs: './docs/specs',
    harness: 'claude-code',
    format: 'flat',
    runsDir: TMP_RUNS,
  });

  // Criar um projeto invalido (formato flat, JSON sem campos obrigatorios)
  await writeFile(
    join(TMP_RUNS, 'proj-bad.json'),
    JSON.stringify({ name: 'Only Name' }, null, 2),
    'utf8'
  );

  const projects = await listProjects({ runsDir: TMP_RUNS });
  const checks = [];

  const good = projects.find(p => p.slug === 'proj-ok');
  const bad = projects.find(p => p.slug === 'proj-bad');

  if (!good) checks.push('proj-ok nao encontrado');
  if (!bad) checks.push('proj-bad nao encontrado (deveria aparecer com _error)');
  if (good && good._error) checks.push('proj-ok nao deveria ter _error');
  if (bad && !bad._error) checks.push('proj-bad deveria ter _error');

  if (checks.length === 0) {
    ok('Projetos com JSON invalido aparecem com _error, nao sao ignorados');
  } else {
    fail('Projetos com JSON invalido aparecem com _error, nao sao ignorados', checks.join('; '));
  }
} catch (e) {
  fail('Projetos com JSON invalido aparecem com _error, nao sao ignorados', e.message);
}
await cleanup(); await setup();

// --- Teste 4: CLI --format table imprime tabela formatada ---
try {
  await createProject({
    slug: 'proj-table',
    name: 'Projeto Table',
    workspace: TMP_WORKSPACE,
    specs: './docs/specs',
    harness: 'claude-code',
    format: 'flat',
    runsDir: TMP_RUNS,
  });

  const { stdout } = await execFileAsync('node', [
    API_PATH, '--runs-dir', TMP_RUNS, '--format', 'table'
  ]);

  const checks = [];
  // Deve ter header com "Slug"
  if (!stdout.includes('Slug')) checks.push('header Slug ausente');
  if (!stdout.includes('proj-table')) checks.push('slug proj-table ausente');
  if (!stdout.includes('Projeto Table')) checks.push('name ausente');

  if (checks.length === 0) {
    ok('CLI --format table imprime tabela formatada');
  } else {
    fail('CLI --format table imprime tabela formatada', checks.join('; '));
  }
} catch (e) {
  fail('CLI --format table imprime tabela formatada', e.message);
}
await cleanup(); await setup();

// --- Teste 5: CLI --format json imprime JSON array ---
try {
  await createProject({
    slug: 'proj-json',
    name: 'Projeto JSON',
    workspace: TMP_WORKSPACE,
    specs: './docs/specs',
    harness: 'claude-code',
    format: 'structured',
    runsDir: TMP_RUNS,
  });

  const { stdout } = await execFileAsync('node', [
    API_PATH, '--runs-dir', TMP_RUNS, '--format', 'json'
  ]);

  const checks = [];
  let parsed;
  try {
    parsed = JSON.parse(stdout);
  } catch {
    checks.push('output nao e JSON valido');
  }

  if (parsed) {
    if (!Array.isArray(parsed)) checks.push('nao e array');
    else if (parsed.length === 0) checks.push('array vazio');
    else {
      const p = parsed.find(x => x.slug === 'proj-json');
      if (!p) checks.push('proj-json nao encontrado');
      if (p && p.format !== 'structured') checks.push(`format=${p.format}`);
    }
  }

  if (checks.length === 0) {
    ok('CLI --format json imprime JSON array');
  } else {
    fail('CLI --format json imprime JSON array', checks.join('; '));
  }
} catch (e) {
  fail('CLI --format json imprime JSON array', e.message);
}
await cleanup(); await setup();

// --- Teste 6: Exclui .meta/ e workspaces/ do discovery ---
try {
  // Criar diretórios que devem ser excluídos
  await mkdir(join(TMP_RUNS, '.meta'), { recursive: true });
  await mkdir(join(TMP_RUNS, 'workspaces'), { recursive: true });
  await writeFile(
    join(TMP_RUNS, '.meta', 'should-ignore.json'),
    JSON.stringify({ version: 1, slug: 'meta-internal' }),
    'utf8'
  );
  await writeFile(
    join(TMP_RUNS, 'workspaces', 'should-ignore.json'),
    JSON.stringify({ version: 1, slug: 'workspace-internal' }),
    'utf8'
  );

  // Criar um projeto valido
  await createProject({
    slug: 'proj-real',
    name: 'Projeto Real',
    workspace: TMP_WORKSPACE,
    specs: './docs/specs',
    harness: 'claude-code',
    format: 'flat',
    runsDir: TMP_RUNS,
  });

  const projects = await listProjects({ runsDir: TMP_RUNS });
  const checks = [];

  // Deve encontrar apenas proj-real
  const meta = projects.find(p => p.slug === 'meta-internal' || p.slug === 'should-ignore');
  const ws = projects.find(p => p.slug === 'workspace-internal');
  const real = projects.find(p => p.slug === 'proj-real');

  if (meta) checks.push('.meta/ nao foi excluido');
  if (ws) checks.push('workspaces/ nao foi excluido');
  if (!real) checks.push('proj-real nao encontrado');

  if (checks.length === 0) {
    ok('Exclui .meta/ e workspaces/ do discovery');
  } else {
    fail('Exclui .meta/ e workspaces/ do discovery', checks.join('; '));
  }
} catch (e) {
  fail('Exclui .meta/ e workspaces/ do discovery', e.message);
}

// Limpeza final
await cleanup();

console.log(`\n=== Resultado: ${passed}/${passed + failed} testes passing ===\n`);
process.exit(failed > 0 ? 1 : 0);
