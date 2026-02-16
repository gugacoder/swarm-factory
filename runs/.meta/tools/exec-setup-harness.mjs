#!/usr/bin/env node
// =============================================================================
// exec-setup-harness.mjs — Executor remoto do setup-harness
// Invoca setup-harness.mjs no workspace destino.
//
// Invocação:
//   node exec-setup-harness.mjs --workspace /path/to/target [--force]
// =============================================================================

import { spawn } from 'node:child_process';
import { access } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { parseArgs } from 'node:util';

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
      force: { type: 'boolean', default: false },
    },
    strict: true,
  });

  if (!values.workspace) {
    console.error(JSON.stringify({ error: '--workspace é obrigatório' }));
    process.exit(1);
  }

  const workspace = resolve(values.workspace);
  const setupScript = join(workspace, 'setup-harness.mjs');

  if (!await fileExists(setupScript)) {
    console.error(JSON.stringify({ error: `setup-harness.mjs não encontrado em ${workspace}` }));
    process.exit(1);
  }

  const args = [setupScript];
  if (values.force) args.push('--force');

  const proc = spawn('node', args, {
    cwd: workspace,
    stdio: ['inherit', 'inherit', 'inherit'],
    shell: true,
  });

  const exitCode = await new Promise((resolvePromise) => {
    proc.on('close', (code) => resolvePromise(code ?? 1));
    proc.on('error', (err) => {
      console.error(JSON.stringify({ error: err.message }));
      resolvePromise(1);
    });
  });

  process.exit(exitCode);
}

main().catch(err => {
  console.error(JSON.stringify({ error: err.message }));
  process.exit(1);
});
