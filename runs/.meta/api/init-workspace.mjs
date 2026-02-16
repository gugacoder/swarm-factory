import { readFile, writeFile, mkdir, access, readdir, copyFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join, isAbsolute } from 'node:path';
import { parseArgs } from 'node:util';
import { loadProject } from './load-project.mjs';
import { getDefaultSessionTemplate, ensureArtifactDirs, resolveSessionArtifacts } from '../lib/artifacts.mjs';
import { resolveArtifacts } from '../lib/paths.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const HARNESSES_DIR = resolve(__dirname, '..', 'harnesses');

/**
 * Verifica se um arquivo existe.
 * @param {string} filePath
 * @returns {Promise<boolean>}
 */
async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Copia recursivamente todos os arquivos de srcDir para destDir,
 * preservando a estrutura de subdiretórios.
 * @param {string} srcDir
 * @param {string} destDir
 */
async function copyDirRecursive(srcDir, destDir) {
  await mkdir(destDir, { recursive: true });
  const entries = await readdir(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = join(srcDir, entry.name);
    const destPath = join(destDir, entry.name);
    if (entry.isDirectory()) {
      await copyDirRecursive(srcPath, destPath);
    } else {
      await copyFile(srcPath, destPath);
    }
  }
}

/**
 * Adiciona uma entrada ao .gitignore se não estiver presente.
 * Cria o .gitignore se não existir.
 * @param {string} workspace - caminho absoluto do workspace
 * @param {string} entry - entrada a adicionar (ex: '.harness/')
 */
async function ensureGitignoreEntry(workspace, entry) {
  const gitignorePath = join(workspace, '.gitignore');
  let content = '';

  if (await fileExists(gitignorePath)) {
    content = await readFile(gitignorePath, 'utf8');
    // Verificar se a entrada já está presente (linha exata)
    const lines = content.split('\n').map(l => l.trim());
    if (lines.includes(entry.trim())) {
      return; // já existe
    }
    // Adicionar newline final se necessário
    if (content.length > 0 && !content.endsWith('\n')) {
      content += '\n';
    }
  }

  content += entry.trim() + '\n';
  await writeFile(gitignorePath, content, 'utf8');
}

/**
 * Inicializa o workspace de um projeto (V2 — estrutura .harness/).
 *
 * @param {string|object} pathOrOptions - path direto para project.json ou { slug, runsDir, session_name, force }
 * @returns {Promise<object>} resultado com { workspace, session_name, config_path, artifacts_created }
 */
export async function initWorkspace(pathOrOptions) {
  // 1. Carregar projeto (valida e resolve paths)
  const project = await loadProject(pathOrOptions);
  const workspace = resolve(project.workspace);
  const harness = project.agent.harness;
  const version = project.version;

  // 2. Extrair session_name
  let sessionName;
  if (typeof pathOrOptions === 'object' && pathOrOptions.session_name) {
    sessionName = pathOrOptions.session_name;
  } else {
    // Derivar do slug: "agiliza-08-precificacao-cc" → "08-precificacao"
    // Ou usar o milestone se disponível no projeto
    sessionName = project.slug;
  }

  // 3. Criar workspace se não existir
  await mkdir(workspace, { recursive: true });

  // 4. Determinar se é V1 ou V2 com base na versão
  if (version >= 2) {
    return await initWorkspaceV2(project, workspace, harness, sessionName);
  }

  // V1 — manter backward compat
  return await initWorkspaceV1(project, workspace, harness);
}

/**
 * Inicialização V2 — estrutura .harness/.
 */
async function initWorkspaceV2(project, workspace, harness, sessionName) {
  const harnessDir = join(workspace, '.harness');
  const scriptsDir = join(harnessDir, 'scripts');
  const sessionDir = join(harnessDir, sessionName);
  const runsDir = join(sessionDir, 'runs');

  // 4a. Criar estrutura de diretórios
  await mkdir(scriptsDir, { recursive: true });
  await mkdir(sessionDir, { recursive: true });
  await mkdir(runsDir, { recursive: true });

  // 4b. Copiar scripts do harness para .harness/scripts/
  // Loop compartilhado
  const sharedLoopSrc = join(HARNESSES_DIR, 'shared', 'loop.mjs');
  if (await fileExists(sharedLoopSrc)) {
    await copyFile(sharedLoopSrc, join(scriptsDir, 'loop.mjs'));
  }

  // Runner do harness
  const runSrc = join(HARNESSES_DIR, harness, 'run.mjs');
  if (await fileExists(runSrc)) {
    await copyFile(runSrc, join(scriptsDir, 'run.mjs'));
  }

  // Init do harness
  const initSrc = join(HARNESSES_DIR, harness, 'init.mjs');
  if (await fileExists(initSrc)) {
    await copyFile(initSrc, join(scriptsDir, 'init.mjs'));
  }

  // 4c. Copiar prompt compartilhado
  const promptSrc = join(HARNESSES_DIR, 'shared', 'prompt.md');
  const promptDest = join(harnessDir, 'prompt.md');
  if (await fileExists(promptSrc)) {
    await copyFile(promptSrc, promptDest);
  }

  // 4d. Gerar config.json da session
  const configJson = {
    slug: project.slug,
    project: project.name,
    session_name: sessionName,
    specs: project._resolved?.specs || project.specs,
    agent: {
      harness,
      model: project.agent.model || null,
      max_turns: project.agent.max_turns || null,
      max_iterations: project.agent.max_iterations || null,
      max_retries: project.agent.max_retries || 5,
      rollback: project.agent.rollback || 'stash',
    },
    notifications: [],
  };

  const configPath = join(sessionDir, 'config.json');
  await writeFile(configPath, JSON.stringify(configJson, null, 2) + '\n', 'utf8');

  // 4e. Escrever .harness/active
  await writeFile(join(harnessDir, 'active'), sessionName + '\n', 'utf8');

  // 4f. Copiar commands do harness no workspace (initialize.md para usar com slash commands)
  const commandsMap = {
    'claude-code': {
      src: join(HARNESSES_DIR, 'claude-code', 'templates'),
      dest: join(workspace, '.claude', 'commands', 'vibe'),
    },
    'opencode': {
      src: join(HARNESSES_DIR, 'opencode'),
      dest: join(workspace, '.opencode', 'commands'),
    },
    'codex': {
      src: join(HARNESSES_DIR, 'codex', 'templates'),
      dest: join(workspace, '.claude', 'commands', 'vibe'),
    },
  };

  const commandsConfig = commandsMap[harness];
  if (commandsConfig && await fileExists(commandsConfig.src)) {
    await copyDirRecursive(commandsConfig.src, commandsConfig.dest);
  }

  // 4g. Adicionar .harness/ ao .gitignore
  await ensureGitignoreEntry(workspace, '.harness/');

  // 4h. Criar progress.txt vazio se não existir
  const progressPath = join(sessionDir, 'progress.txt');
  if (!await fileExists(progressPath)) {
    await writeFile(progressPath, '', 'utf8');
  }

  return {
    workspace,
    session_name: sessionName,
    config_path: configPath,
    slug: project.slug,
    name: project.name,
    harness,
    artifacts_created: [
      '.harness/scripts/loop.mjs',
      '.harness/scripts/run.mjs',
      '.harness/scripts/init.mjs',
      '.harness/prompt.md',
      '.harness/active',
      `.harness/${sessionName}/config.json`,
      `.harness/${sessionName}/runs/`,
    ],
  };
}

/**
 * Inicialização V1 — backward compat (estrutura flat no root).
 */
async function initWorkspaceV1(project, workspace, harness) {
  const version = project.version;
  const resolvedArtifacts = resolveArtifacts(workspace, project.artifacts);
  const sessionTemplate = getDefaultSessionTemplate(version);

  const harnessJson = {
    _version: version,
    slug: project.slug,
    name: project.name,
    specs: project._resolved.specs,
    workspace,
    agent: { ...project.agent },
    artifacts: resolvedArtifacts,
    session_template: sessionTemplate,
    notifications: [],
  };

  const harnessJsonPath = join(workspace, 'agent-harness.json');
  await writeFile(harnessJsonPath, JSON.stringify(harnessJson, null, 2) + '\n', 'utf8');

  // Copiar agent-harness.mjs do template do harness
  const harnessScriptSrc = join(HARNESSES_DIR, harness, 'agent-harness.mjs');
  const harnessScriptDest = join(workspace, 'agent-harness.mjs');
  if (await fileExists(harnessScriptSrc)) {
    await copyFile(harnessScriptSrc, harnessScriptDest);
  }

  // Copiar setup-harness.mjs do template do harness
  const setupScriptSrc = join(HARNESSES_DIR, harness, 'setup-harness.mjs');
  const setupScriptDest = join(workspace, 'setup-harness.mjs');
  if (await fileExists(setupScriptSrc)) {
    await copyFile(setupScriptSrc, setupScriptDest);
  }

  // Gerar commands do harness no workspace
  const commandsMap = {
    'claude-code': {
      src: join(HARNESSES_DIR, 'claude-code', 'templates'),
      dest: join(workspace, '.claude', 'commands', 'vibe'),
    },
    'opencode': {
      src: join(HARNESSES_DIR, 'opencode'),
      dest: join(workspace, '.opencode', 'commands'),
    },
    'codex': {
      src: join(HARNESSES_DIR, 'codex', 'templates'),
      dest: join(workspace, '.claude', 'commands', 'vibe'),
    },
  };

  const commandsConfig = commandsMap[harness];
  if (commandsConfig && await fileExists(commandsConfig.src)) {
    await copyDirRecursive(commandsConfig.src, commandsConfig.dest);
  }

  // Criar diretórios de artefatos
  await ensureArtifactDirs(workspace, project.artifacts);

  // Criar .sessions/.current-milestone
  const sessionsDir = join(workspace, '.sessions');
  await mkdir(sessionsDir, { recursive: true });
  await writeFile(join(sessionsDir, '.current-milestone'), project.slug + '\n', 'utf8');

  // Adicionar .sessions/ ao .gitignore
  await ensureGitignoreEntry(workspace, '.sessions/');

  // Criar agent-progress.txt vazio se não existir
  const progressPath = join(workspace, 'agent-progress.txt');
  if (!await fileExists(progressPath)) {
    await writeFile(progressPath, '', 'utf8');
  }

  return {
    workspace,
    harness_json_path: harnessJsonPath,
    slug: project.slug,
    name: project.name,
    harness,
    artifacts_created: Object.keys(resolvedArtifacts),
  };
}

// --- CLI ---
const isMainModule = process.argv[1] &&
  resolve(process.argv[1]) === __filename;

if (isMainModule) {
  const { values, positionals } = parseArgs({
    options: {
      slug:           { type: 'string' },
      'runs-dir':     { type: 'string' },
      'session-name': { type: 'string' },
      force:          { type: 'boolean', default: false },
    },
    allowPositionals: true,
    strict: true,
  });

  try {
    let result;

    if (positionals.length > 0) {
      const opts = { _path: positionals[0] };
      if (values['session-name']) opts.session_name = values['session-name'];
      result = await initWorkspace(positionals[0]);
    } else if (values.slug) {
      const opts = { slug: values.slug };
      if (values['runs-dir']) opts.runsDir = resolve(values['runs-dir']);
      if (values['session-name']) opts.session_name = values['session-name'];
      result = await initWorkspace(opts);
    } else {
      console.error('Uso: node init-workspace.mjs <path> | --slug <slug> [--runs-dir <dir>] [--session-name <name>]');
      process.exit(1);
    }

    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error(`Erro: ${err.message}`);
    process.exit(1);
  }
}
