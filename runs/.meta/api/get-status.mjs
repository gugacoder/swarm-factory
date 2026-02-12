import { readFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join, isAbsolute } from 'node:path';
import { parseArgs } from 'node:util';
import { execSync } from 'node:child_process';
import { platform } from 'node:os';
import { loadProject } from './load-project.mjs';
import { validateFeatures } from '../lib/validate.mjs';
import { readArtifact } from '../lib/artifacts.mjs';

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
 * Verifica se um PID está ativo (cross-platform).
 * @param {number} pid
 * @returns {boolean}
 */
function isPidRunning(pid) {
  const os = platform();
  try {
    if (os === 'win32') {
      const output = execSync(`tasklist /FI "PID eq ${pid}" /NH`, {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe'],
      });
      // tasklist retorna a linha do processo se existir, ou "INFO: No tasks..." se não
      return output.includes(String(pid));
    } else {
      // Unix: kill -0 verifica sem matar
      process.kill(pid, 0);
      return true;
    }
  } catch {
    return false;
  }
}

/**
 * Tenta ler features e loop state da estrutura V2 (.harness/).
 * @param {string} workspace
 * @returns {Promise<{version: number, features: string|null, loopState: object|null, session: string|null}|null>}
 */
async function readV2Artifacts(workspace) {
  const harnessDir = join(workspace, '.harness');
  const activePath = join(harnessDir, 'active');

  if (!await exists(activePath)) return null;

  const session = (await readFile(activePath, 'utf8')).trim();
  if (!session) return null;

  const sessionDir = join(harnessDir, session);
  if (!await exists(sessionDir)) return null;

  // Ler features.json
  let featuresContent = null;
  const featuresPath = join(sessionDir, 'features.json');
  if (await exists(featuresPath)) {
    try {
      featuresContent = await readFile(featuresPath, 'utf8');
    } catch { /* ignore */ }
  }

  // Ler loop.json
  let loopState = null;
  const loopPath = join(sessionDir, 'loop.json');
  if (await exists(loopPath)) {
    try {
      loopState = JSON.parse(await readFile(loopPath, 'utf8'));
    } catch { /* ignore */ }
  }

  return { version: 2, features: featuresContent, loopState, session };
}

/**
 * Obtém o status completo de um projeto.
 *
 * @param {string|object} pathOrOptions - path direto para project.json ou { slug, runsDir }
 * @returns {Promise<object>} objeto de status
 */
export async function getStatus(pathOrOptions) {
  // 1. Carregar projeto
  const project = await loadProject(pathOrOptions);
  const workspace = resolve(project.workspace);
  const artifacts = project.artifacts;

  // 2. Verificar se workspace existe
  if (!await exists(workspace)) {
    return {
      slug: project.slug,
      name: project.name,
      workspace,
      state: 'not_initialized',
      loop: { active: false, pid: null, iteration: null, started_at: null },
      features: { total: 0, pending: 0, in_progress: 0, failing: 0, blocked: 0, skipped: 0, passing: 0 },
      progress: 0,
    };
  }

  // 3. Tentar V2 primeiro, fallback para V1
  const v2 = await readV2Artifacts(workspace);

  let featuresContent;
  let loopPid = null;
  let loopActive = false;
  let loopIteration = null;
  let loopStartedAt = null;

  if (v2) {
    // V2 — ler de .harness/{session}/
    featuresContent = v2.features;

    if (v2.loopState) {
      const pid = v2.loopState.pid;
      if (pid && isPidRunning(pid)) {
        loopActive = true;
        loopPid = pid;
      }
      loopIteration = v2.loopState.iteration ?? null;
      loopStartedAt = v2.loopState.started_at ?? null;
    }
  } else {
    // V1 — ler do root
    featuresContent = await readArtifact(workspace, artifacts, 'features');

    // PID do loop
    const pidContent = await readArtifact(workspace, artifacts, 'pid');
    if (pidContent !== null) {
      const parsed = parseInt(pidContent.trim(), 10);
      if (!isNaN(parsed) && isPidRunning(parsed)) {
        loopActive = true;
        loopPid = parsed;
      }
    }

    // Estado do loop
    const stateContent = await readArtifact(workspace, artifacts, 'state');
    if (stateContent !== null) {
      try {
        const stateData = JSON.parse(stateContent);
        loopIteration = stateData.iteration ?? null;
        loopStartedAt = stateData.started_at ?? null;
      } catch { /* ignore */ }
    }
  }

  if (featuresContent === null) {
    return {
      slug: project.slug,
      name: project.name,
      workspace,
      state: 'initialized',
      session: v2?.session || null,
      loop: { active: false, pid: null, iteration: null, started_at: null },
      features: { total: 0, pending: 0, in_progress: 0, failing: 0, blocked: 0, skipped: 0, passing: 0 },
      progress: 0,
    };
  }

  // 4. Parsear e validar features.json
  let featuresData;
  try {
    featuresData = JSON.parse(featuresContent);
  } catch (err) {
    throw new Error(`features.json inválido (JSON parse): ${err.message}`);
  }

  const validation = await validateFeatures(featuresData);
  if (!validation.valid) {
    throw new Error(`features.json inválido:\n  - ${validation.errors.join('\n  - ')}`);
  }

  // 5. Computar contagem por status
  const counts = { pending: 0, in_progress: 0, failing: 0, blocked: 0, skipped: 0, passing: 0 };
  for (const f of featuresData) {
    if (f.status in counts) {
      counts[f.status]++;
    }
  }
  const total = featuresData.length;
  const progress = total > 0 ? Math.round((counts.passing / total) * 100) : 0;

  // 6. Determinar state
  const state = loopActive ? 'running' : 'idle';

  return {
    slug: project.slug,
    name: project.name,
    workspace,
    state,
    session: v2?.session || null,
    loop: {
      active: loopActive,
      pid: loopPid,
      iteration: loopIteration,
      started_at: loopStartedAt,
    },
    features: {
      total,
      ...counts,
    },
    progress,
  };
}

/**
 * Formata status como tabela para CLI.
 * @param {object} status - objeto retornado por getStatus
 * @returns {string}
 */
function formatTable(status) {
  const lines = [];
  lines.push(`Projeto: ${status.name} (${status.slug})`);
  lines.push(`Workspace: ${status.workspace}`);
  if (status.session) {
    lines.push(`Session: ${status.session}`);
  }

  if (status.state === 'not_initialized') {
    lines.push(`Estado: not_initialized`);
  } else if (status.state === 'initialized') {
    lines.push(`Estado: initialized (sem features.json)`);
  } else if (status.state === 'running') {
    const parts = [`PID ${status.loop.pid}`];
    if (status.loop.iteration !== null) parts.push(`iteração ${status.loop.iteration}`);
    if (status.loop.started_at) parts.push(`desde ${status.loop.started_at}`);
    lines.push(`Estado: running (${parts.join(', ')})`);
  } else {
    lines.push(`Estado: idle`);
  }

  if (status.features.total > 0) {
    lines.push('');
    lines.push('Features:');

    const total = status.features.total;
    const passing = status.features.passing;
    const barLen = 16;
    const filled = total > 0 ? Math.round((passing / total) * barLen) : 0;
    const bar = '█'.repeat(filled) + '░'.repeat(barLen - filled);

    lines.push(`  Total:       ${String(total).padStart(2)}`);
    lines.push(`  Passing:     ${String(passing).padStart(2)} ${bar}  ${status.progress}%`);
    lines.push(`  Failing:     ${String(status.features.failing).padStart(2)}`);
    lines.push(`  In Progress: ${String(status.features.in_progress).padStart(2)}`);
    lines.push(`  Pending:     ${String(status.features.pending).padStart(2)}`);
    lines.push(`  Blocked:     ${String(status.features.blocked).padStart(2)}`);
    lines.push(`  Skipped:     ${String(status.features.skipped).padStart(2)}`);
  }

  return lines.join('\n');
}

// --- CLI ---
const isMainModule = process.argv[1] &&
  resolve(process.argv[1]) === __filename;

if (isMainModule) {
  const { values, positionals } = parseArgs({
    options: {
      slug:       { type: 'string' },
      'runs-dir': { type: 'string' },
      format:     { type: 'string', default: 'table' },
    },
    allowPositionals: true,
    strict: true,
  });

  try {
    let status;

    if (positionals.length > 0) {
      status = await getStatus(positionals[0]);
    } else if (values.slug) {
      const opts = { slug: values.slug };
      if (values['runs-dir']) opts.runsDir = resolve(values['runs-dir']);
      status = await getStatus(opts);
    } else {
      console.error('Uso: node get-status.mjs <path> | --slug <slug> [--runs-dir <dir>] [--format table|json]');
      process.exit(1);
    }

    if (values.format === 'json') {
      console.log(JSON.stringify(status, null, 2));
    } else {
      console.log(formatTable(status));
    }
  } catch (err) {
    console.error(`Erro: ${err.message}`);
    process.exit(1);
  }
}
