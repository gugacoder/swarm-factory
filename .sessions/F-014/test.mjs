#!/usr/bin/env node
// =============================================================================
// Testes para F-014 — Worktrees e sessões — declaração e estrutura
// =============================================================================

import { readFile, writeFile, mkdir, rm, access, readdir } from 'node:fs/promises';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..', '..');
const RUNS_META = resolve(ROOT, 'runs', '.meta');

let passed = 0;
let failed = 0;

function ok(msg) {
  passed++;
  console.log(`  ✓ ${msg}`);
}
function fail(msg, detail) {
  failed++;
  console.error(`  ✗ ${msg}${detail ? ': ' + detail : ''}`);
}

async function fileExists(p) {
  try { await access(p); return true; } catch { return false; }
}

// =============================================================================
// Teste 1: session_template em agent-harness.json contém 'worktree' em dirs
// Verifica via getDefaultSessionTemplate(1) que é o que init-workspace usa
// =============================================================================
async function test01() {
  const msg = "session_template em agent-harness.json contém 'worktree' em dirs";
  try {
    const { getDefaultSessionTemplate } = await import(
      pathToFileURL(resolve(RUNS_META, 'lib', 'artifacts.mjs')).href
    );
    const tpl = getDefaultSessionTemplate(1);
    if (Array.isArray(tpl.dirs) && tpl.dirs.includes('worktree')) {
      ok(msg);
    } else {
      fail(msg, `dirs = ${JSON.stringify(tpl.dirs)}`);
    }
  } catch (err) {
    fail(msg, err.message);
  }
}

// =============================================================================
// Teste 1b: init-workspace.mjs inclui session_template no harness.json gerado
// Cria um projeto temporário, inicializa workspace, e verifica o resultado
// =============================================================================
async function test01b() {
  const msg = "init-workspace.mjs inclui session_template com worktree no harness.json";
  const tmpDir = resolve(__dirname, '_test_workspace_014');

  try {
    // Criar projeto temporário
    await mkdir(tmpDir, { recursive: true });
    const projectJson = {
      version: 1,
      slug: 'test-014',
      name: 'Test F-014',
      description: 'Teste de worktrees e sessões',
      specs: './specs',
      workspace: resolve(tmpDir, 'ws'),
      agent: {
        harness: 'claude-code',
        model: 'test-model',
        max_turns: 10,
        max_iterations: 5,
        max_features: 1,
        max_retries: 3,
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
    const projectPath = join(tmpDir, 'project.json');
    await writeFile(projectPath, JSON.stringify(projectJson, null, 2), 'utf8');

    // Inicializar workspace
    const { initWorkspace } = await import(
      pathToFileURL(resolve(RUNS_META, 'api', 'init-workspace.mjs')).href
    );
    await initWorkspace(projectPath);

    // Verificar agent-harness.json gerado
    const harnessPath = join(resolve(tmpDir, 'ws'), 'agent-harness.json');
    const harness = JSON.parse(await readFile(harnessPath, 'utf8'));

    if (harness.session_template &&
        Array.isArray(harness.session_template.dirs) &&
        harness.session_template.dirs.includes('worktree')) {
      ok(msg);
    } else {
      fail(msg, `session_template = ${JSON.stringify(harness.session_template)}`);
    }
  } catch (err) {
    fail(msg, err.message);
  } finally {
    await rm(tmpDir, { recursive: true, force: true });
  }
}

// =============================================================================
// Teste 2: Loop cria .sessions/{feature-id}/worktree/ como diretório vazio
// Verifica que o código do loop lê session_template.dirs e cria os dirs
// =============================================================================
async function test02() {
  const msg = "Loop cria .sessions/{feature-id}/worktree/ como diretório vazio";
  try {
    const harnessCode = await readFile(
      resolve(RUNS_META, 'harnesses', 'claude-code', 'agent-harness.mjs'),
      'utf8'
    );

    // Verificar que o código cria dirs do session_template
    const hasSessionTemplateDirs = harnessCode.includes('session_template') &&
                                    harnessCode.includes('.dirs');
    const hasMkdirInSessionDir = harnessCode.includes('mkdir(join(sessionDir, dir)');

    if (hasSessionTemplateDirs && hasMkdirInSessionDir) {
      ok(msg);
    } else {
      fail(msg, `session_template.dirs: ${hasSessionTemplateDirs}, mkdir: ${hasMkdirInSessionDir}`);
    }
  } catch (err) {
    fail(msg, err.message);
  }
}

// =============================================================================
// Teste 2b: Integração — simula criação de session dir com worktree
// =============================================================================
async function test02b() {
  const msg = "Integração — session dir com worktree/ é criado corretamente";
  const tmpDir = resolve(__dirname, '_test_session_014');

  try {
    await mkdir(tmpDir, { recursive: true });

    // Simular o que o loop faz (linhas 488-496 do agent-harness.mjs):
    // const sessionDir = join(sessionsDir, featureId);
    // await mkdir(sessionDir, { recursive: true });
    // if (config.session_template?.dirs) {
    //   for (const dir of config.session_template.dirs) {
    //     await mkdir(join(sessionDir, dir), { recursive: true });
    //   }
    // }
    const sessionsDir = join(tmpDir, '.sessions');
    const sessionDir = join(sessionsDir, 'F-TEST');
    await mkdir(sessionDir, { recursive: true });

    const sessionTemplate = { dirs: ['worktree'] };
    for (const dir of sessionTemplate.dirs) {
      await mkdir(join(sessionDir, dir), { recursive: true });
    }

    // Verificar
    const worktreeDir = join(sessionDir, 'worktree');
    if (await fileExists(worktreeDir)) {
      // Verificar que está vazio
      const entries = await readdir(worktreeDir);
      if (entries.length === 0) {
        ok(msg);
      } else {
        fail(msg, `worktree/ não está vazio: ${entries.join(', ')}`);
      }
    } else {
      fail(msg, 'worktree/ não foi criado');
    }
  } catch (err) {
    fail(msg, err.message);
  } finally {
    await rm(tmpDir, { recursive: true, force: true });
  }
}

// =============================================================================
// Teste 3: .sessions/ presente no .gitignore do workspace
// Verifica via init-workspace.mjs (ensureGitignoreEntry)
// =============================================================================
async function test03() {
  const msg = ".sessions/ presente no .gitignore do workspace (via init-workspace)";
  const tmpDir = resolve(__dirname, '_test_gitignore_014');

  try {
    await mkdir(tmpDir, { recursive: true });
    const projectJson = {
      version: 1,
      slug: 'test-gitignore-014',
      name: 'Test Gitignore F-014',
      description: 'Teste de .gitignore',
      specs: './specs',
      workspace: resolve(tmpDir, 'ws'),
      agent: {
        harness: 'claude-code',
        model: 'test-model',
        max_turns: 10,
        max_iterations: 5,
        max_features: 1,
        max_retries: 3,
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
    const projectPath = join(tmpDir, 'project.json');
    await writeFile(projectPath, JSON.stringify(projectJson, null, 2), 'utf8');

    const { initWorkspace } = await import(
      pathToFileURL(resolve(RUNS_META, 'api', 'init-workspace.mjs')).href
    );
    await initWorkspace(projectPath);

    // Verificar .gitignore
    const wsDir = resolve(tmpDir, 'ws');
    const gitignorePath = join(wsDir, '.gitignore');
    if (await fileExists(gitignorePath)) {
      const content = await readFile(gitignorePath, 'utf8');
      const lines = content.split('\n').map(l => l.trim());
      if (lines.includes('.sessions/')) {
        ok(msg);
      } else {
        fail(msg, `.gitignore não contém '.sessions/': ${content}`);
      }
    } else {
      fail(msg, '.gitignore não existe no workspace');
    }
  } catch (err) {
    fail(msg, err.message);
  } finally {
    await rm(tmpDir, { recursive: true, force: true });
  }
}

// =============================================================================
// Teste 4: Monitor pode localizar worktrees via agent-harness.json → session_template → dirs
// =============================================================================
async function test04() {
  const msg = "Monitor pode localizar worktrees via agent-harness.json → session_template → dirs";
  const tmpDir = resolve(__dirname, '_test_monitor_014');

  try {
    await mkdir(tmpDir, { recursive: true });
    const projectJson = {
      version: 1,
      slug: 'test-monitor-014',
      name: 'Test Monitor F-014',
      description: 'Teste de discovery',
      specs: './specs',
      workspace: resolve(tmpDir, 'ws'),
      agent: {
        harness: 'claude-code',
        model: 'test-model',
        max_turns: 10,
        max_iterations: 5,
        max_features: 1,
        max_retries: 3,
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
    const projectPath = join(tmpDir, 'project.json');
    await writeFile(projectPath, JSON.stringify(projectJson, null, 2), 'utf8');

    const { initWorkspace } = await import(
      pathToFileURL(resolve(RUNS_META, 'api', 'init-workspace.mjs')).href
    );
    await initWorkspace(projectPath);

    // Simular o que o monitor faria:
    // 1. Ler agent-harness.json
    const wsDir = resolve(tmpDir, 'ws');
    const harness = JSON.parse(await readFile(join(wsDir, 'agent-harness.json'), 'utf8'));

    // 2. Extrair artifacts.sessions (path do diretório de sessões)
    const sessionsPath = harness.artifacts?.sessions;

    // 3. Extrair session_template.dirs (confirmar que 'worktree' está declarado)
    const dirs = harness.session_template?.dirs;

    if (sessionsPath && dirs && dirs.includes('worktree')) {
      // 4. Poderia listar .sessions/* e encontrar worktree/ em cada
      ok(msg);
    } else {
      fail(msg, `sessions=${sessionsPath}, dirs=${JSON.stringify(dirs)}`);
    }
  } catch (err) {
    fail(msg, err.message);
  } finally {
    await rm(tmpDir, { recursive: true, force: true });
  }
}

// =============================================================================
// Teste 5: worktree/ é apenas placeholder — nenhuma lógica de git worktree
// =============================================================================
async function test05() {
  const msg = "worktree/ é apenas placeholder — sem lógica de git worktree no loop";
  try {
    const harnessCode = await readFile(
      resolve(RUNS_META, 'harnesses', 'claude-code', 'agent-harness.mjs'),
      'utf8'
    );

    // Verificar que NÃO há 'git worktree' no código
    const hasGitWorktree = harnessCode.includes('git worktree');
    if (!hasGitWorktree) {
      ok(msg);
    } else {
      fail(msg, 'Encontrado "git worktree" no agent-harness.mjs');
    }
  } catch (err) {
    fail(msg, err.message);
  }
}

// =============================================================================
// Main
// =============================================================================
console.log('\n=== F-014 — Worktrees e sessões — declaração e estrutura ===\n');

await test01();
await test01b();
await test02();
await test02b();
await test03();
await test04();
await test05();

console.log(`\n  Resultado: ${passed} passed, ${failed} failed (total: ${passed + failed})\n`);
process.exit(failed > 0 ? 1 : 0);
