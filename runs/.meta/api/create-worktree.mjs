import { access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join, basename } from 'node:path';
import { parseArgs } from 'node:util';
import { execSync } from 'node:child_process';
import { createProject } from './create-project.mjs';
import { initWorkspace } from './init-workspace.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Verifica se um diretório/arquivo existe.
 * @param {string} p
 * @returns {Promise<boolean>}
 */
async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

/**
 * Verifica se target é um repositório git.
 * @param {string} target
 * @returns {boolean}
 */
function isGitRepo(target) {
  try {
    execSync('git rev-parse --git-dir', { cwd: target, stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Verifica se working tree está limpa.
 * @param {string} target
 * @returns {boolean}
 */
function isWorkingTreeClean(target) {
  try {
    const output = execSync('git status --porcelain', { cwd: target, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    return output.trim() === '';
  } catch {
    return false;
  }
}

/**
 * Cria um git worktree + run config + .harness/ num passo.
 *
 * @param {object} params
 * @param {string} params.target - path do repositório principal
 * @param {string} params.milestone - nome do milestone (ex: '08-precificacao')
 * @param {boolean} [params.force=false] - pular check de working tree limpa
 * @param {string} [params.harness='claude-code'] - harness a usar
 * @param {string} [params.project] - nome do projeto (derivado de target se omitido)
 * @param {string} [params.specs] - path para specs (relativo ao worktree)
 * @param {string} [params.model] - modelo do agente
 * @param {number} [params.max_turns] - turns por sessão
 * @param {string} [params.runsDir] - diretório runs da fábrica
 * @param {string} [params.worktreeDir] - diretório base para worktrees (default: '../')
 * @returns {Promise<object>} resultado com { slug, worktree_path, branch, run_config_path, init_result }
 */
export async function createWorktree(params) {
  const {
    target,
    milestone,
    force = false,
    harness = 'claude-code',
    project: projectName,
    specs,
    model,
    max_turns,
    runsDir,
    worktreeDir,
  } = params;

  const targetAbs = resolve(target);

  // 1. Validar target
  if (!await exists(targetAbs)) {
    throw new Error(`Target não encontrado: ${targetAbs}`);
  }

  if (!isGitRepo(targetAbs)) {
    throw new Error(`Target não é um repositório git: ${targetAbs}`);
  }

  // 2. Check working tree
  if (!force && !isWorkingTreeClean(targetAbs)) {
    throw new Error('Working tree não está limpa. Use --force para ignorar ou commite/stashe suas mudanças.');
  }

  // 3. Derivar nomes
  const repoName = projectName || basename(targetAbs);
  const slug = `${repoName}-${milestone}-${harness.replace('claude-code', 'cc').replace('codex', 'cx')}`;
  const branch = `milestone/${milestone}`;
  const worktreeBase = worktreeDir ? resolve(targetAbs, worktreeDir) : resolve(targetAbs, '..');
  const worktreePath = resolve(worktreeBase, milestone);
  const specsPath = specs || `milestones/${milestone}`;

  // 4. Criar worktree
  try {
    execSync(`git worktree add "${worktreePath}" -b "${branch}"`, {
      cwd: targetAbs,
      stdio: 'pipe',
    });
  } catch (err) {
    // Se a branch já existe, tentar sem -b
    try {
      execSync(`git worktree add "${worktreePath}" "${branch}"`, {
        cwd: targetAbs,
        stdio: 'pipe',
      });
    } catch (err2) {
      throw new Error(`Falha ao criar worktree: ${err2.message}`);
    }
  }

  // 5. Criar run config (project.json)
  const projectConfig = await createProject({
    slug,
    name: `${repoName} — ${milestone}`,
    workspace: worktreePath,
    specs: specsPath,
    harness,
    model: model || null,
    max_turns: max_turns || 50,
    format: 'flat',
    ...(runsDir ? { runsDir } : {}),
  });

  // 6. Inicializar workspace com .harness/
  const initResult = await initWorkspace({
    slug,
    session_name: milestone,
    ...(runsDir ? { runsDir } : {}),
  });

  return {
    slug,
    worktree_path: worktreePath,
    branch,
    run_config_path: `runs/${slug}.json`,
    init_result: initResult,
  };
}

// --- CLI ---
const isMainModule = process.argv[1] &&
  resolve(process.argv[1]) === __filename;

if (isMainModule) {
  const { values } = parseArgs({
    options: {
      target:          { type: 'string' },
      milestone:       { type: 'string' },
      force:           { type: 'boolean', default: false },
      harness:         { type: 'string', default: 'claude-code' },
      project:         { type: 'string' },
      specs:           { type: 'string' },
      model:           { type: 'string' },
      'max-turns':     { type: 'string' },
      'runs-dir':      { type: 'string' },
      'worktree-dir':  { type: 'string' },
    },
    strict: true,
  });

  if (!values.target || !values.milestone) {
    console.error('Uso: node create-worktree.mjs --target <path> --milestone <name> [--harness claude-code|codex] [--force] [--project <name>] [--specs <path>] [--model <model>] [--max-turns <n>] [--worktree-dir <dir>]');
    process.exit(1);
  }

  try {
    const result = await createWorktree({
      target: values.target,
      milestone: values.milestone,
      force: values.force,
      harness: values.harness,
      project: values.project,
      specs: values.specs,
      model: values.model,
      max_turns: values['max-turns'] ? parseInt(values['max-turns'], 10) : undefined,
      runsDir: values['runs-dir'] ? resolve(values['runs-dir']) : undefined,
      worktreeDir: values['worktree-dir'],
    });

    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error(`Erro: ${err.message}`);
    process.exit(1);
  }
}
