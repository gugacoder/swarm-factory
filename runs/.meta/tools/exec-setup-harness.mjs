#!/usr/bin/env node
// =============================================================================
// exec-setup-harness.mjs — Executor remoto do initialize-harness
// Resolve initialize-harness.mjs de runs/.meta/harnesses/{harness}/ e invoca no workspace.
//
// Invocação:
//   node exec-setup-harness.mjs --workspace /path/to/target [--force]
// =============================================================================

import { spawn } from 'node:child_process';
import { access, readFile } from 'node:fs/promises';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const __dirname = dirname(fileURLToPath(import.meta.url));

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

  // Ler config da session para obter harness type
  const configPath = join(workspace, '.harness', session, 'config.json');
  if (!await fileExists(configPath)) {
    console.error(JSON.stringify({ error: `.harness/${session}/config.json não encontrado em ${workspace}` }));
    process.exit(1);
  }

  const config = await readJson(configPath);
  const harnessType = config.agent?.harness || 'claude-code';

  // Resolver initialize-harness.mjs de runs/.meta/harnesses/{harness}/
  const metaDir = resolve(__dirname, '..');
  const initScript = join(metaDir, 'harnesses', harnessType, 'initialize-harness.mjs');

  if (!await fileExists(initScript)) {
    console.error(JSON.stringify({ error: `initialize-harness.mjs não encontrado para harness "${harnessType}" em ${initScript}` }));
    process.exit(1);
  }

  const args = [initScript];
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
