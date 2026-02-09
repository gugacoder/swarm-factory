#!/usr/bin/env node
// =============================================================================
// Ralph Wiggum Loop — Claude Code (MJS)
// Script autocontido do loop unificado. Apenas node: built-ins.
//
// Invocação:
//   node agent-harness.mjs
//
// Env overrides:
//   MAX_TURNS, MAX_ITERATIONS, MAX_FEATURES, MODEL
//
// Graceful stop:
//   touch .stop
// =============================================================================

import { readFile, writeFile, mkdir, access, unlink, readdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { spawn } from 'node:child_process';
import { createWriteStream } from 'node:fs';

// --- Cores ---
const RED = '\x1b[0;31m';
const GREEN = '\x1b[0;32m';
const YELLOW = '\x1b[1;33m';
const CYAN = '\x1b[0;36m';
const NC = '\x1b[0m';

// --- Utilitários ---
function now() {
  return new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readJson(filePath) {
  const raw = await readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

async function writeJson(filePath, data) {
  await writeFile(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

// --- Carregar config ---
async function loadConfig() {
  const configPath = resolve('agent-harness.json');
  if (!await fileExists(configPath)) {
    throw new Error('agent-harness.json não encontrado no diretório corrente.');
  }
  return readJson(configPath);
}

// --- Features ---
async function loadFeatures(featuresPath) {
  const data = await readJson(featuresPath);
  return Array.isArray(data) ? data : data.features;
}

async function saveFeatures(featuresPath, features) {
  await writeJson(featuresPath, features);
}

function selectNextFeature(features) {
  const passingIds = new Set(
    features.filter(f => f.status === 'passing').map(f => f.id)
  );

  const eligible = features
    .filter(f => f.status === 'pending' || f.status === 'failing')
    .filter(f => !f.dependencies || f.dependencies.every(d => passingIds.has(d)))
    .sort((a, b) => (a.priority || 999) - (b.priority || 999));

  return eligible[0] || null;
}

function computeBlocked(features) {
  const passingIds = new Set(
    features.filter(f => f.status === 'passing').map(f => f.id)
  );

  for (const f of features) {
    if (f.status === 'pending' || f.status === 'failing') {
      if (f.dependencies && f.dependencies.length > 0) {
        const depsOk = f.dependencies.every(d => passingIds.has(d));
        if (!depsOk) {
          f.status = 'blocked';
        }
      }
    }
  }
}

function countByStatus(features) {
  const counts = { pending: 0, in_progress: 0, failing: 0, blocked: 0, skipped: 0, passing: 0 };
  for (const f of features) {
    counts[f.status] = (counts[f.status] || 0) + 1;
  }
  return counts;
}

// --- State (observabilidade) ---
async function writeState(statePath, data) {
  await writeJson(statePath, data);
}

function makeState(overrides) {
  return {
    status: 'starting',
    iteration: 0,
    max_iterations: null,
    total: 0,
    done: 0,
    remaining: 0,
    feature_id: '',
    features_done: 0,
    max_features: null,
    started_at: '',
    updated_at: now(),
    exit_reason: '',
    ...overrides,
  };
}

// --- Spawn do agente ---
async function spawnAgent(config, featureId, sessionDir) {
  const commandPath = resolve('.claude', 'commands', 'vibe', 'code.md');
  if (!await fileExists(commandPath)) {
    throw new Error(`Command file não encontrado: ${commandPath}`);
  }

  const maxTurns = process.env.MAX_TURNS
    ? parseInt(process.env.MAX_TURNS, 10)
    : (config.agent.max_turns || 0);
  const model = process.env.MODEL || config.agent.model || '';

  const args = [
    '-p', '-',
    '--verbose',
    '--output-format', 'stream-json',
    '--allowedTools', 'Edit,Write,Bash,Read,Glob,Grep',
  ];
  if (maxTurns > 0) {
    args.push('--max-turns', String(maxTurns));
  }
  if (model) {
    args.push('--model', model);
  }

  const outputPath = join(sessionDir, 'output.jsonl');
  const outputStream = createWriteStream(outputPath, { flags: 'a' });

  return new Promise((resolvePromise, reject) => {
    const proc = spawn('claude', args, {
      cwd: resolve('.'),
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true,
    });

    // Escrever PID da sessão
    writeFile(join(sessionDir, 'pid'), String(proc.pid) + '\n', 'utf8').catch(() => {});

    // Pipe stdin do command file
    readFile(commandPath, 'utf8').then(content => {
      proc.stdin.write(content);
      proc.stdin.end();
    }).catch(err => {
      proc.kill();
      reject(err);
    });

    // Capturar output
    proc.stdout.pipe(outputStream);
    proc.stderr.pipe(outputStream);

    proc.on('close', (code) => {
      outputStream.end();
      resolvePromise({ code, pid: proc.pid });
    });

    proc.on('error', (err) => {
      outputStream.end();
      reject(err);
    });
  });
}

// --- Main ---
async function main() {
  // 1. Carregar config
  const config = await loadConfig();
  const featuresPath = config.artifacts?.features || resolve('features.json');
  const statePath = config.artifacts?.state || resolve('agent-harness.state');
  const pidPath = config.artifacts?.pid || resolve('agent-harness.pid');
  const sessionsDir = config.artifacts?.sessions || resolve('.sessions');
  const stopFile = resolve('.stop');

  // Env overrides
  const maxIterations = process.env.MAX_ITERATIONS
    ? parseInt(process.env.MAX_ITERATIONS, 10)
    : (config.agent.max_iterations || 0);
  const maxFeatures = process.env.MAX_FEATURES
    ? parseInt(process.env.MAX_FEATURES, 10)
    : (config.agent.max_features || 0);
  const sleepBetween = parseInt(process.env.SLEEP_BETWEEN || '5', 10);

  // 2. Verificar features.json
  if (!await fileExists(featuresPath)) {
    console.error(`${RED}features.json não encontrado: ${featuresPath}${NC}`);
    process.exit(1);
  }

  // 3. .stop residual — remover com aviso
  if (await fileExists(stopFile)) {
    console.log(`${YELLOW}AVISO: .stop residual encontrado. Removendo para iniciar.${NC}`);
    await unlink(stopFile);
  }

  // 4. Escrever PID
  await writeFile(pidPath, String(process.pid) + '\n', 'utf8');

  // 5. Estado inicial
  const loopStartedAt = now();
  let features = await loadFeatures(featuresPath);
  const total = features.length;
  const counts = countByStatus(features);

  const limitLabel = maxIterations === 0 ? '∞' : String(maxIterations);
  const featuresLimitLabel = maxFeatures === 0 ? '∞' : String(maxFeatures);

  console.log(`${CYAN}=======================================${NC}`);
  console.log(`${CYAN}  Ralph Wiggum Loop — Claude Code (MJS)${NC}`);
  console.log(`${CYAN}  Projeto: ${config.name || config.slug}${NC}`);
  console.log(`${CYAN}  Iterações: ${limitLabel}${NC}`);
  console.log(`${CYAN}  Max features: ${featuresLimitLabel}${NC}`);
  console.log(`${CYAN}  Para parar: touch .stop${NC}`);
  console.log(`${CYAN}=======================================${NC}`);
  console.log('');

  await writeState(statePath, makeState({
    status: 'starting',
    max_iterations: maxIterations || null,
    max_features: maxFeatures || null,
    total,
    done: counts.passing,
    remaining: total - counts.passing,
    started_at: loopStartedAt,
  }));

  // 6. Loop principal
  let iteration = 0;
  let featuresDone = 0;

  while (true) {
    iteration++;

    // 6a. Limite de iterações (0 = ilimitado)
    if (maxIterations > 0 && iteration > maxIterations) {
      console.log(`${RED}Limite de ${maxIterations} iterações atingido.${NC}`);
      await writeState(statePath, makeState({
        status: 'exited',
        iteration: iteration - 1,
        max_iterations: maxIterations || null,
        max_features: maxFeatures || null,
        total,
        done: countByStatus(features).passing,
        remaining: total - countByStatus(features).passing,
        features_done: featuresDone,
        started_at: loopStartedAt,
        exit_reason: 'iteration_limit',
      }));
      process.exit(1);
    }

    // 6b. Limite de features (0 = ilimitado)
    if (maxFeatures > 0 && featuresDone >= maxFeatures) {
      console.log(`${GREEN}Limite de ${maxFeatures} feature(s) completada(s) atingido.${NC}`);
      await writeState(statePath, makeState({
        status: 'exited',
        iteration: iteration - 1,
        max_iterations: maxIterations || null,
        max_features: maxFeatures || null,
        total,
        done: countByStatus(features).passing,
        remaining: total - countByStatus(features).passing,
        features_done: featuresDone,
        started_at: loopStartedAt,
        exit_reason: 'feature_limit',
      }));
      process.exit(0);
    }

    // 6c. Graceful stop check
    if (await fileExists(stopFile)) {
      console.log(`${YELLOW}Loop encerrado por .stop após iteração ${iteration - 1}.${NC}`);
      await writeState(statePath, makeState({
        status: 'exited',
        iteration: iteration - 1,
        max_iterations: maxIterations || null,
        max_features: maxFeatures || null,
        total,
        done: countByStatus(features).passing,
        remaining: total - countByStatus(features).passing,
        features_done: featuresDone,
        started_at: loopStartedAt,
        exit_reason: 'stopped',
      }));
      await unlink(stopFile).catch(() => {});
      process.exit(0);
    }

    // 6d. Recarregar features.json
    features = await loadFeatures(featuresPath);

    // 6e. Computar blocked
    computeBlocked(features);

    // 6f. Selecionar próxima feature elegível
    const next = selectNextFeature(features);

    if (!next) {
      // Verificar se todas estão passing
      const c = countByStatus(features);
      if (c.passing === features.length) {
        console.log('');
        console.log(`${GREEN}=======================================${NC}`);
        console.log(`${GREEN}  TODAS AS FEATURES IMPLEMENTADAS!${NC}`);
        console.log(`${GREEN}  Total: ${features.length} features${NC}`);
        console.log(`${GREEN}  Iterações: ${iteration - 1}${NC}`);
        console.log(`${GREEN}=======================================${NC}`);
        await writeState(statePath, makeState({
          status: 'exited',
          iteration: iteration - 1,
          max_iterations: maxIterations || null,
          max_features: maxFeatures || null,
          total,
          done: c.passing,
          remaining: 0,
          features_done: featuresDone,
          started_at: loopStartedAt,
          exit_reason: 'completed',
        }));
        process.exit(0);
      }

      console.log(`${RED}Nenhuma feature elegível (deps não satisfeitas). Abortando.${NC}`);
      await writeState(statePath, makeState({
        status: 'exited',
        iteration: iteration - 1,
        max_iterations: maxIterations || null,
        max_features: maxFeatures || null,
        total,
        done: c.passing,
        remaining: total - c.passing,
        features_done: featuresDone,
        started_at: loopStartedAt,
        exit_reason: 'deps_impossible',
      }));
      process.exit(1);
    }

    const featureId = next.id;
    const currentCounts = countByStatus(features);
    const done = currentCounts.passing;
    const remaining = total - done;

    console.log(`${YELLOW}--- Iteração ${iteration}/${limitLabel} | ${featureId} | Features: ${done}/${total} (faltam ${remaining}) ---${NC}`);

    // 6g. Marcar feature como in_progress
    next.status = 'in_progress';
    await saveFeatures(featuresPath, features);

    // 6h. Criar session dir
    const sessionDir = join(sessionsDir, featureId);
    await mkdir(sessionDir, { recursive: true });

    // Criar dirs do session_template (worktree, etc.)
    if (config.session_template?.dirs) {
      for (const dir of config.session_template.dirs) {
        await mkdir(join(sessionDir, dir), { recursive: true });
      }
    }

    // 6i. Registrar started_at
    const startedAt = now();
    await writeFile(join(sessionDir, 'started_at'), startedAt + '\n', 'utf8');

    // Escrever .current-feature
    const currentFeaturePath = join(sessionsDir, '.current-feature');
    await writeFile(currentFeaturePath, featureId + '\n', 'utf8');

    // 6j. Atualizar state → running
    await writeState(statePath, makeState({
      status: 'running',
      iteration,
      max_iterations: maxIterations || null,
      max_features: maxFeatures || null,
      total,
      done,
      remaining,
      feature_id: featureId,
      features_done: featuresDone,
      started_at: loopStartedAt,
    }));

    // 6k. Spawnar agente
    let agentResult;
    try {
      agentResult = await spawnAgent(config, featureId, sessionDir);
    } catch (err) {
      console.error(`${RED}Erro ao spawnar agente para ${featureId}: ${err.message}${NC}`);
      agentResult = { code: 1, pid: 0 };
    }

    // 6l. Registrar finished_at
    const finishedAt = now();
    await writeFile(join(sessionDir, 'finished_at'), finishedAt + '\n', 'utf8');

    // 6m. Reler features.json — verificar status
    features = await loadFeatures(featuresPath);
    const updatedFeature = features.find(f => f.id === featureId);

    if (updatedFeature && updatedFeature.status === 'passing') {
      featuresDone++;
      console.log(`${GREEN}Feature ${featureId} → passing${NC}`);
    } else {
      // Incrementar retries (gutter detection será PRP-009)
      if (updatedFeature) {
        updatedFeature.retries = (updatedFeature.retries || 0) + 1;
        await saveFeatures(featuresPath, features);
      }
      console.log(`${RED}Feature ${featureId} → ${updatedFeature?.status || 'unknown'} (retries: ${updatedFeature?.retries || 0})${NC}`);
    }

    // 6n. Atualizar state → between
    await writeState(statePath, makeState({
      status: 'between',
      iteration,
      max_iterations: maxIterations || null,
      max_features: maxFeatures || null,
      total,
      done: countByStatus(features).passing,
      remaining: total - countByStatus(features).passing,
      feature_id: featureId,
      features_done: featuresDone,
      started_at: loopStartedAt,
    }));

    // 6o. Verificar .stop após agente
    if (await fileExists(stopFile)) {
      console.log(`${YELLOW}Loop encerrado por .stop após feature ${featureId}.${NC}`);
      await writeState(statePath, makeState({
        status: 'exited',
        iteration,
        max_iterations: maxIterations || null,
        max_features: maxFeatures || null,
        total,
        done: countByStatus(features).passing,
        remaining: total - countByStatus(features).passing,
        features_done: featuresDone,
        started_at: loopStartedAt,
        exit_reason: 'stopped',
      }));
      await unlink(stopFile).catch(() => {});
      process.exit(0);
    }

    // 6p. Aguardar entre iterações com check de .stop
    console.log(`${CYAN}Sessão ${iteration} concluída. Aguardando ${sleepBetween}s...${NC}`);
    for (let s = 0; s < sleepBetween; s++) {
      if (await fileExists(stopFile)) {
        console.log(`${YELLOW}Loop encerrado por .stop durante intervalo.${NC}`);
        await writeState(statePath, makeState({
          status: 'exited',
          iteration,
          max_iterations: maxIterations || null,
          max_features: maxFeatures || null,
          total,
          done: countByStatus(features).passing,
          remaining: total - countByStatus(features).passing,
          features_done: featuresDone,
          started_at: loopStartedAt,
          exit_reason: 'stopped',
        }));
        await unlink(stopFile).catch(() => {});
        process.exit(0);
      }
      await sleep(1000);
    }
  }
}

// --- Entry point ---
main().catch(err => {
  console.error(`${RED}Erro fatal no loop: ${err.message}${NC}`);
  console.error(err.stack);
  process.exit(1);
});
