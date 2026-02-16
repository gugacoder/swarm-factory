#!/usr/bin/env node
// =============================================================================
// exec-agent-harness.mjs — Executor remoto do loop autônomo
// Invoca .harness/scripts/loop.mjs no workspace destino (detached).
//
// Invocação:
//   node exec-agent-harness.mjs --workspace /path/to/target [--max-turns N] [--max-features N]
//
// Parar:
//   touch /path/to/target/.stop
// =============================================================================

import { spawn } from 'node:child_process';
import { access, readFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { parseArgs } from 'node:util';
import { openSync } from 'node:fs';

async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const { values } = parseArgs({
    options: {
      workspace: { type: 'string' },
      'max-turns': { type: 'string' },
      'max-features': { type: 'string' },
    },
    strict: true,
  });

  if (!values.workspace) {
    console.error(JSON.stringify({ error: '--workspace é obrigatório' }));
    process.exit(1);
  }

  const workspace = resolve(values.workspace);

  // Ler session ativa de .harness/active
  const activePath = join(workspace, '.harness', 'active');
  if (!await fileExists(activePath)) {
    console.error(JSON.stringify({ error: `.harness/active não encontrado em ${workspace}` }));
    process.exit(1);
  }

  const session = (await readFile(activePath, 'utf8')).trim();
  if (!session) {
    console.error(JSON.stringify({ error: '.harness/active está vazio' }));
    process.exit(1);
  }

  const loopScript = join(workspace, '.harness', 'scripts', 'loop.mjs');
  if (!await fileExists(loopScript)) {
    console.error(JSON.stringify({ error: `loop.mjs não encontrado em ${workspace}/.harness/scripts/` }));
    process.exit(1);
  }

  // Preparar env overrides
  const env = { ...process.env };
  if (values['max-turns']) env.MAX_TURNS = values['max-turns'];
  if (values['max-features']) env.MAX_FEATURES = values['max-features'];

  // Preparar log file em .harness/{session}/loop-output.log
  const logPath = join(workspace, '.harness', session, 'loop-output.log');
  const logFd = openSync(logPath, 'a');

  // Spawnar detached com session como argumento
  const proc = spawn('node', [loopScript, session], {
    cwd: workspace,
    env,
    stdio: ['ignore', logFd, logFd],
    detached: true,
    shell: true,
  });

  proc.unref();

  const pid = proc.pid;
  console.log(JSON.stringify({
    pid,
    workspace,
    session,
    log: logPath,
    message: `Loop iniciado (PID ${pid}, session: ${session}). Para parar: touch ${join(workspace, '.stop')}`,
  }));
}

main().catch(err => {
  console.error(JSON.stringify({ error: err.message }));
  process.exit(1);
});
