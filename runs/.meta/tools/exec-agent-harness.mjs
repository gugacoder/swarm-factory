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
import { openSync, existsSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';

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
      session: { type: 'string' },
      'max-turns': { type: 'string' },
      'max-features': { type: 'string' },
    },
    strict: true,
  });

  if (!values.workspace) {
    console.error(JSON.stringify({ error: '--workspace é obrigatório' }));
    process.exit(1);
  }
  if (!values.session) {
    console.error(JSON.stringify({ error: '--session é obrigatório' }));
    process.exit(1);
  }

  const workspace = resolve(values.workspace);
  const session = values.session;

  const loopScript = join(workspace, '.harness', 'scripts', 'loop.mjs');
  if (!await fileExists(loopScript)) {
    console.error(JSON.stringify({ error: `loop.mjs não encontrado em ${workspace}/.harness/scripts/` }));
    process.exit(1);
  }

  // Preparar env overrides
  const env = { ...process.env };
  if (values['max-turns']) env.MAX_TURNS = values['max-turns'];
  if (values['max-features']) env.MAX_FEATURES = values['max-features'];

  // Spawnar detached com session como argumento
  const logPath = join(workspace, '.harness', session, 'loop-output.log');
  let pid;

  if (process.platform === 'win32') {
    // Windows: wscript.exe + VBS para evitar janela de console
    const vbsPath = join(tmpdir(), 'swarm-run-hidden.vbs');
    if (!existsSync(vbsPath)) {
      writeFileSync(vbsPath, 'CreateObject("Wscript.Shell").Run WScript.Arguments(0), 0, False\n');
    }
    const fullCmd = [process.execPath, loopScript, session].map(a => a.includes(' ') ? `"${a}"` : a).join(' ');
    spawn('wscript.exe', [vbsPath, fullCmd], { cwd: workspace, env, stdio: 'ignore' });
    // PID real será reportado pelo loop.mjs em loop.json
  } else {
    const logFd = openSync(logPath, 'a');
    const proc = spawn('node', [loopScript, session], {
      cwd: workspace,
      env,
      stdio: ['ignore', logFd, logFd],
      detached: true,
    });
    proc.unref();
    pid = proc.pid;
  }

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
