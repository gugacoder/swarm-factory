import { resolve, join } from 'node:path';
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync, writeFileSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import * as projectService from './project-service.js';

export async function start(slug: string, options?: { maxTurns?: number; model?: string }) {
  const project = await projectService.get(slug);
  const workspace = project.workspace;

  // Verificar se já há um loop rodando
  const status = await projectService.getStatus(slug);
  if (status.state === 'running') {
    throw new Error('Loop já está em execução para este projeto');
  }

  // Determinar script do harness
  // V1: agent-harness.mjs no workspace
  const harnessScript = resolve(workspace, 'agent-harness.mjs');
  if (!existsSync(harnessScript)) {
    throw new Error('Workspace não inicializado — execute init primeiro');
  }

  // Montar env vars
  const env: Record<string, string> = { ...process.env as Record<string, string> };
  if (options?.maxTurns) env.MAX_TURNS = String(options.maxTurns);
  if (options?.model) env.MODEL = options.model;
  env.MAX_FEATURES = '1'; // Uma feature por dispatch (loop manual)

  // Spawnar processo independente sem janela
  let pid: number | undefined;

  if (process.platform === 'win32') {
    const vbsPath = join(tmpdir(), 'swarm-run-hidden.vbs');
    if (!existsSync(vbsPath)) {
      writeFileSync(vbsPath, 'CreateObject("Wscript.Shell").Run WScript.Arguments(0), 0, False\n');
    }
    const fullCmd = [process.execPath, harnessScript].map(a => a.includes(' ') ? `"${a}"` : a).join(' ');
    spawn('wscript.exe', [vbsPath, fullCmd], { cwd: workspace, env: env as any, stdio: 'ignore' });
  } else {
    const child = spawn('node', [harnessScript], {
      cwd: workspace,
      env,
      stdio: 'ignore',
      detached: true,
    });
    child.unref();
    pid = child.pid;
  }

  return { pid, workspace };
}

export async function stop(slug: string, force?: boolean) {
  const project = await projectService.get(slug);
  const workspace = project.workspace;

  if (force) {
    // Ler PID e matar
    const status = await projectService.getStatus(slug);
    if (status.loop.pid) {
      try {
        process.kill(status.loop.pid, 'SIGTERM');
      } catch {
        // Processo já morreu
      }
    }
    return { ok: true, method: 'force' };
  }

  // Graceful stop — criar .stop
  const stopFile = resolve(workspace, '.stop');
  await writeFile(stopFile, new Date().toISOString(), 'utf-8');
  return { ok: true, method: 'graceful' };
}

export async function getLogs(slug: string, tail?: number) {
  const project = await projectService.get(slug);
  const workspace = project.workspace;

  // V2 ou V1
  const harnessActive = resolve(workspace, '.harness', 'active');
  let progressPath: string;

  if (existsSync(harnessActive)) {
    const session = (await readFile(harnessActive, 'utf-8')).trim();
    progressPath = resolve(workspace, '.harness', session, 'progress.txt');
  } else {
    progressPath = resolve(workspace, 'agent-progress.txt');
  }

  if (!existsSync(progressPath)) {
    return '';
  }

  const content = await readFile(progressPath, 'utf-8');

  if (tail && tail > 0) {
    const lines = content.split('\n');
    return lines.slice(-tail).join('\n');
  }

  return content;
}
