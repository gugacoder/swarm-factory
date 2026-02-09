/**
 * Testes para F-008 — API init-workspace.mjs
 *
 * Execução: node .sessions/F-008/test.mjs
 */
import { readFile, rm, access, mkdir, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname } from 'node:path';

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

// Setup: criar projeto de teste
const TEST_WORKSPACE = resolve(ROOT, '.sessions', 'F-008', '_test_workspace');
const TEST_RUNS_DIR = resolve(ROOT, '.sessions', 'F-008', '_test_runs');
const TEST_SLUG = 'test-init-ws';

async function setup() {
  // Limpar teste anterior
  await rm(TEST_WORKSPACE, { recursive: true, force: true });
  await rm(TEST_RUNS_DIR, { recursive: true, force: true });

  // Criar project.json de teste (formato structured)
  const projectDir = join(TEST_RUNS_DIR, TEST_SLUG);
  await mkdir(projectDir, { recursive: true });

  const project = {
    version: 1,
    slug: TEST_SLUG,
    name: 'Test Init Workspace',
    description: 'Projeto de teste para F-008',
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

  await writeFile(join(projectDir, 'project.json'), JSON.stringify(project, null, 2) + '\n', 'utf8');
  return join(projectDir, 'project.json');
}

async function cleanup() {
  await rm(TEST_WORKSPACE, { recursive: true, force: true });
  await rm(TEST_RUNS_DIR, { recursive: true, force: true });
}

console.log('\n=== F-008: API init-workspace.mjs ===\n');

try {
  // Test 1: Arquivo existe e exporta initWorkspace
  console.log('[Test 1] Arquivo existe e exporta initWorkspace');
  try {
    const mod = await import(toFileUrl(join(ROOT, 'runs', '.meta', 'api', 'init-workspace.mjs')));
    if (typeof mod.initWorkspace === 'function') {
      ok('init-workspace.mjs existe e exporta initWorkspace');
    } else {
      fail('init-workspace.mjs existe e exporta initWorkspace', 'initWorkspace não é uma função');
    }
  } catch (e) {
    fail('init-workspace.mjs existe e exporta initWorkspace', e.message);
  }

  // Setup test project
  const projectPath = await setup();
  const { initWorkspace } = await import(toFileUrl(join(ROOT, 'runs', '.meta', 'api', 'init-workspace.mjs')));

  // Test 2: Gera agent-harness.json com paths resolvidos e _version:1
  console.log('[Test 2] Gera agent-harness.json com paths resolvidos e _version:1');
  try {
    const result = await initWorkspace(projectPath);
    const harnessJson = JSON.parse(await readFile(join(TEST_WORKSPACE, 'agent-harness.json'), 'utf8'));

    const checks = [
      harnessJson._version === 1,
      harnessJson.slug === TEST_SLUG,
      harnessJson.name === 'Test Init Workspace',
      typeof harnessJson.specs === 'string' && harnessJson.specs.length > 0,
      typeof harnessJson.workspace === 'string' && harnessJson.workspace.length > 0,
      typeof harnessJson.agent === 'object',
      typeof harnessJson.artifacts === 'object',
      Array.isArray(harnessJson.notifications),
      harnessJson.notifications.length === 0,
      typeof harnessJson.session_template === 'object',
      // Verificar que artifacts são strings (paths resolvidos, não objetos)
      typeof harnessJson.artifacts.harness_config === 'string',
      typeof harnessJson.artifacts.sessions === 'string',
    ];

    if (checks.every(Boolean)) {
      ok('agent-harness.json gerado com paths resolvidos, _version:1, notifications:[]');
    } else {
      fail('agent-harness.json', `Algum campo inválido: _version=${harnessJson._version}, has notifications=${Array.isArray(harnessJson.notifications)}, artifacts.harness_config type=${typeof harnessJson.artifacts.harness_config}`);
    }
  } catch (e) {
    fail('agent-harness.json gerado', e.message);
  }

  // Test 3: Copia agent-harness.mjs do template (se existir)
  console.log('[Test 3] Copia agent-harness.mjs do template do harness');
  try {
    const harnessScriptSrc = resolve(ROOT, 'runs', '.meta', 'harnesses', 'claude-code', 'agent-harness.mjs');
    const harnessScriptDest = join(TEST_WORKSPACE, 'agent-harness.mjs');

    if (await fileExists(harnessScriptSrc)) {
      // Se o template existe, deve ter sido copiado
      if (await fileExists(harnessScriptDest)) {
        ok('agent-harness.mjs copiado do template');
      } else {
        fail('agent-harness.mjs copiado do template', 'Template existe mas não foi copiado');
      }
    } else {
      // Template ainda não existe (será F-010) — comportamento correto é não falhar
      if (!await fileExists(harnessScriptDest)) {
        ok('agent-harness.mjs não copiado (template ainda não existe — F-010)');
      } else {
        fail('agent-harness.mjs', 'Arquivo criado sem template existente');
      }
    }
  } catch (e) {
    fail('agent-harness.mjs', e.message);
  }

  // Test 4: Gera .claude/commands/vibe/ para harness claude-code
  console.log('[Test 4] Gera .claude/commands/vibe/ para harness claude-code');
  try {
    const vibeDir = join(TEST_WORKSPACE, '.claude', 'commands', 'vibe');
    const initMd = join(vibeDir, 'initialize.md');
    const codeMd = join(vibeDir, 'code.md');

    if (await fileExists(vibeDir) && await fileExists(initMd) && await fileExists(codeMd)) {
      // Verificar que conteúdo foi copiado literalmente
      const srcInit = await readFile(resolve(ROOT, 'runs', '.meta', 'harnesses', 'claude-code', 'templates', 'initialize.md'), 'utf8');
      const destInit = await readFile(initMd, 'utf8');
      if (srcInit === destInit) {
        ok('.claude/commands/vibe/ gerado com initialize.md e code.md (cópia literal)');
      } else {
        fail('.claude/commands/vibe/', 'Conteúdo de initialize.md difere do template');
      }
    } else {
      fail('.claude/commands/vibe/', `vibeDir=${await fileExists(vibeDir)}, init=${await fileExists(initMd)}, code=${await fileExists(codeMd)}`);
    }
  } catch (e) {
    fail('.claude/commands/vibe/', e.message);
  }

  // Test 5: Cria diretório .sessions/
  console.log('[Test 5] Cria diretório .sessions/');
  try {
    const sessionsDir = join(TEST_WORKSPACE, '.sessions');
    if (await fileExists(sessionsDir)) {
      ok('.sessions/ criado');
    } else {
      fail('.sessions/', 'Diretório não existe');
    }
  } catch (e) {
    fail('.sessions/', e.message);
  }

  // Test 6: Cria .sessions/.current-milestone com o slug
  console.log('[Test 6] Cria .sessions/.current-milestone com o slug');
  try {
    const milestoneFile = join(TEST_WORKSPACE, '.sessions', '.current-milestone');
    const content = await readFile(milestoneFile, 'utf8');
    if (content.trim() === TEST_SLUG) {
      ok('.current-milestone contém slug correto');
    } else {
      fail('.current-milestone', `Esperado "${TEST_SLUG}", obtido "${content.trim()}"`);
    }
  } catch (e) {
    fail('.current-milestone', e.message);
  }

  // Test 7: Adiciona .sessions/ ao .gitignore
  console.log('[Test 7] Adiciona .sessions/ ao .gitignore');
  try {
    const gitignore = await readFile(join(TEST_WORKSPACE, '.gitignore'), 'utf8');
    const lines = gitignore.split('\n').map(l => l.trim());
    if (lines.includes('.sessions/')) {
      ok('.sessions/ no .gitignore');
    } else {
      fail('.gitignore', `.sessions/ não encontrado nas linhas: ${JSON.stringify(lines)}`);
    }
  } catch (e) {
    fail('.gitignore', e.message);
  }

  // Test 8: Cria agent-progress.txt vazio se não existir
  console.log('[Test 8] Cria agent-progress.txt vazio se não existir');
  try {
    const progressPath = join(TEST_WORKSPACE, 'agent-progress.txt');
    if (await fileExists(progressPath)) {
      const content = await readFile(progressPath, 'utf8');
      if (content === '') {
        ok('agent-progress.txt criado vazio');
      } else {
        fail('agent-progress.txt', `Esperado vazio, obtido ${content.length} chars`);
      }
    } else {
      fail('agent-progress.txt', 'Arquivo não existe');
    }
  } catch (e) {
    fail('agent-progress.txt', e.message);
  }

  // Test 9: Reinicialização preserva features.json e progress
  console.log('[Test 9] Reinicialização preserva features.json e progress');
  try {
    // Criar features.json e progress com conteúdo
    const featuresPath = join(TEST_WORKSPACE, 'features.json');
    const progressPath = join(TEST_WORKSPACE, 'agent-progress.txt');
    const testFeatures = '[{"id":"F-001","title":"Test","status":"passing"}]';
    const testProgress = '# Progress existente\nSession 1: algo feito';

    await writeFile(featuresPath, testFeatures, 'utf8');
    await writeFile(progressPath, testProgress, 'utf8');

    // Re-executar initWorkspace
    await initWorkspace(projectPath);

    // Verificar que features.json e progress foram preservados
    const featuresAfter = await readFile(featuresPath, 'utf8');
    const progressAfter = await readFile(progressPath, 'utf8');

    // Verificar que harness.json foi sobrescrito (campo _version deve existir)
    const harnessAfter = JSON.parse(await readFile(join(TEST_WORKSPACE, 'agent-harness.json'), 'utf8'));

    if (featuresAfter === testFeatures && progressAfter === testProgress && harnessAfter._version === 1) {
      ok('Reinicialização preserva features.json e progress, sobrescreve harness.json');
    } else {
      fail('Reinicialização', `features preserved=${featuresAfter === testFeatures}, progress preserved=${progressAfter === testProgress}`);
    }
  } catch (e) {
    fail('Reinicialização', e.message);
  }

  // Test 10: Funciona como CLI
  console.log('[Test 10] Funciona como CLI');
  try {
    // Limpar workspace para testar CLI
    await rm(TEST_WORKSPACE, { recursive: true, force: true });

    const { execSync } = await import('node:child_process');
    const apiPath = resolve(ROOT, 'runs', '.meta', 'api', 'init-workspace.mjs');
    const output = execSync(
      `node "${apiPath}" --slug ${TEST_SLUG} --runs-dir "${TEST_RUNS_DIR}"`,
      { encoding: 'utf8', cwd: ROOT }
    );

    const result = JSON.parse(output);
    if (result.slug === TEST_SLUG && result.workspace) {
      ok('CLI funciona com --slug');
    } else {
      fail('CLI', `Output inesperado: ${output}`);
    }
  } catch (e) {
    fail('CLI', e.message);
  }

  // Test 10b: CLI com path posicional
  console.log('[Test 10b] CLI com path posicional');
  try {
    await rm(TEST_WORKSPACE, { recursive: true, force: true });

    const { execSync } = await import('node:child_process');
    const apiPath = resolve(ROOT, 'runs', '.meta', 'api', 'init-workspace.mjs');
    const output = execSync(
      `node "${apiPath}" "${join(TEST_RUNS_DIR, TEST_SLUG, 'project.json')}"`,
      { encoding: 'utf8', cwd: ROOT }
    );

    const result = JSON.parse(output);
    if (result.slug === TEST_SLUG) {
      ok('CLI funciona com path posicional');
    } else {
      fail('CLI posicional', `Output inesperado: ${output}`);
    }
  } catch (e) {
    fail('CLI posicional', e.message);
  }

} catch (e) {
  console.error(`\nErro fatal: ${e.message}\n${e.stack}`);
} finally {
  await cleanup();
}

console.log(`\n=== Resultado: ${passed} passed, ${failed} failed (${passed + failed} total) ===\n`);
process.exit(failed > 0 ? 1 : 0);
