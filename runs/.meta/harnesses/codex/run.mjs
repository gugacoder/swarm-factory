#!/usr/bin/env node
// =============================================================================
// Codex — Agent Runner (V2)
// Spawna o agente Codex para implementar uma feature.
// Exporta spawnAgent() para uso pelo loop.mjs compartilhado.
// =============================================================================

import { readFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { spawn } from 'node:child_process';
import { createWriteStream } from 'node:fs';
import { access } from 'node:fs/promises';

async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Spawna o agente Codex para uma feature.
 *
 * @param {object} params
 * @param {object} params.config - config.json da session
 * @param {string} params.featureId - ID da feature (ex: F-001)
 * @param {string} params.sessionDir - path da session (.harness/{session}/)
 * @param {string} params.runsDir - path para runs (.harness/{session}/runs/)
 * @param {string} params.promptPath - path do prompt (.harness/prompt.md)
 * @param {string} params.workspace - path do workspace root
 * @returns {Promise<{code: number, pid: number}>}
 */
export async function spawnAgent({ config, featureId, sessionDir, runsDir, promptPath, workspace }) {
  if (!await fileExists(promptPath)) {
    throw new Error(`Prompt não encontrado: ${promptPath}`);
  }

  const model = process.env.MODEL || config.agent?.model || '';

  const args = [
    'exec', '--full-auto',
    '--skip-git-repo-check',
    '--json',
    '-',
  ];
  if (model) {
    args.push('--model', model);
  }

  const outputPath = join(runsDir, `${featureId}.jsonl`);
  const outputStream = createWriteStream(outputPath, { flags: 'a' });

  return new Promise((resolvePromise, reject) => {
    const proc = spawn('codex', args, {
      cwd: resolve(workspace),
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true,
    });

    // Pipe stdin do prompt
    readFile(promptPath, 'utf8').then(content => {
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
