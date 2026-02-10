import { readFile, writeFile, mkdir, access, readdir, copyFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join, isAbsolute } from 'node:path';
import { parseArgs } from 'node:util';
import { loadProject } from './load-project.mjs';
import { getDefaultSessionTemplate, ensureArtifactDirs } from '../lib/artifacts.mjs';
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
 * @param {string} entry - entrada a adicionar (ex: '.sessions/')
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
 * Inicializa o workspace de um projeto.
 *
 * @param {string|object} pathOrOptions - path direto para project.json ou { slug, runsDir }
 * @returns {Promise<object>} resultado com { workspace, harness_json_path, artifacts_created }
 */
export async function initWorkspace(pathOrOptions) {
  // 1. Carregar projeto (valida e resolve paths)
  const project = await loadProject(pathOrOptions);
  const workspace = resolve(project.workspace);
  const harness = project.agent.harness;
  const version = project.version;

  // 2. Criar workspace se não existir
  await mkdir(workspace, { recursive: true });

  // 3. Gerar agent-harness.json com paths resolvidos
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

  // 4. Copiar agent-harness.mjs do template do harness (se existir)
  const harnessScriptSrc = join(HARNESSES_DIR, harness, 'agent-harness.mjs');
  const harnessScriptDest = join(workspace, 'agent-harness.mjs');
  if (await fileExists(harnessScriptSrc)) {
    await copyFile(harnessScriptSrc, harnessScriptDest);
  }

  // 5. Gerar commands do harness no workspace
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

  // 6. Criar diretórios de artefatos (tipo dir)
  await ensureArtifactDirs(workspace, project.artifacts);

  // 7. Criar .sessions/.current-milestone com o slug
  const sessionsDir = join(workspace, '.sessions');
  await mkdir(sessionsDir, { recursive: true });
  await writeFile(join(sessionsDir, '.current-milestone'), project.slug + '\n', 'utf8');

  // 8. Adicionar .sessions/ ao .gitignore
  await ensureGitignoreEntry(workspace, '.sessions/');

  // 9. Criar agent-progress.txt vazio se não existir
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
      slug:       { type: 'string' },
      'runs-dir': { type: 'string' },
    },
    allowPositionals: true,
    strict: true,
  });

  try {
    let result;

    if (positionals.length > 0) {
      result = await initWorkspace(positionals[0]);
    } else if (values.slug) {
      const opts = { slug: values.slug };
      if (values['runs-dir']) opts.runsDir = resolve(values['runs-dir']);
      result = await initWorkspace(opts);
    } else {
      console.error('Uso: node init-workspace.mjs <path> | --slug <slug> [--runs-dir <dir>]');
      process.exit(1);
    }

    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error(`Erro: ${err.message}`);
    process.exit(1);
  }
}
