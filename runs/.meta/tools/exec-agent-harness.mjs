#!/usr/bin/env node
// =============================================================================
// exec-agent-harness.mjs — Executor remoto do loop autônomo
// Invoca agent-harness.mjs no workspace destino (detached).
//
// Invocação:
//   node exec-agent-harness.mjs --workspace /path/to/target [--max-turns N] [--max-features N]
//
// Parar:
//   touch /path/to/target/.stop
// =============================================================================

import { spawn } from 'node:child_process';
import { access, writeFile, mkdir } from 'node:fs/promises';
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
  const harnessScript = join(workspace, 'agent-harness.mjs');

  if (!await fileExists(harnessScript)) {
    console.error(JSON.stringify({ error: `agent-harness.mjs não encontrado em ${workspace}` }));
    process.exit(1);
  }

  // Preparar env overrides
  const env = { ...process.env };
  if (values['max-turns']) env.MAX_TURNS = values['max-turns'];
  if (values['max-features']) env.MAX_FEATURES = values['max-features'];

  // Preparar log file
  const logsDir = join(workspace, '.sessions');
  await mkdir(logsDir, { recursive: true });
  const logPath = join(logsDir, 'loop-output.log');
  const logFd = openSync(logPath, 'a');

  // Spawnar detached
  const proc = spawn('node', [harnessScript], {
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
    log: logPath,
    message: `Loop iniciado (PID ${pid}). Para parar: touch ${join(workspace, '.stop')}`,
  }));
}

main().catch(err => {
  console.error(JSON.stringify({ error: err.message }));
  process.exit(1);
});
