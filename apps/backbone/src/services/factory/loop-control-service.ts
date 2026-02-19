/**
 * LoopControlService — controles de loop e SSE streaming.
 * Portado de apps/sneak-peek-hub/src/plugin.ts (linhas 586-956)
 */

import { resolve, basename, dirname, relative, isAbsolute } from 'node:path';
import { existsSync, readFileSync, writeFileSync, unlinkSync, openSync, closeSync } from 'node:fs';
import { spawn, execSync } from 'node:child_process';
import type { Context } from 'hono';
import type { HarnessInferResponse } from './types.js';
import {
  resolveSlug, resolveHarnessSession, readJsonSafe,
  checkPidAliveCached, invalidatePidCache, invalidateDiscoverCache,
} from './workspace-service.js';

const IS_WIN = process.platform === 'win32';

// --- SSE Helpers ---
function sseEncode(event: { type: string; [k: string]: unknown }): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

// --- Loop Start ---
export async function startLoop(
  wsPath: string,
  slug: string,
  runsDir: string,
  options?: { max_turns?: number | null; max_iterations?: number | null; max_features?: number | null },
): Promise<{ pid: number | undefined; workspace: string; log: string; message: string }> {
  const hp = resolveHarnessSession(wsPath, slug);
  if (!hp) throw new Error(`.harness/${slug}/ não encontrado`);

  const loopScript = resolve(wsPath, '.harness', 'scripts', 'loop.mjs');
  if (!existsSync(loopScript)) {
    throw new Error(`loop.mjs não encontrado em ${wsPath}/.harness/scripts/`);
  }

  // Check if already running via loop.json PID
  const existingLoop = readJsonSafe(hp.loopJsonPath);
  const existingPid = existingLoop?.pid ?? null;
  if (existingPid && checkPidAliveCached(existingPid)) {
    throw new Error(`Loop já está rodando (PID ${existingPid})`);
  }

  // Remove stale .stop file
  const stopFile = resolve(wsPath, '.stop');
  if (existsSync(stopFile)) {
    unlinkSync(stopFile);
  }

  // Log to .harness/{session}/loop-output.log
  const logPath = resolve(wsPath, '.harness', hp.session, 'loop-output.log');
  const logFd = openSync(logPath, 'a');

  // Env overrides
  const loopEnv: Record<string, string> = { ...(process.env as Record<string, string>) };
  if (options?.max_turns != null) loopEnv.MAX_TURNS = String(options.max_turns);
  if (options?.max_iterations != null) loopEnv.MAX_ITERATIONS = String(options.max_iterations);
  if (options?.max_features != null) loopEnv.MAX_FEATURES = String(options.max_features);

  // Spawn loop.mjs with session arg
  const proc = spawn(process.execPath, [loopScript, hp.session], {
    cwd: wsPath,
    stdio: ['ignore', logFd, logFd],
    detached: true,
    windowsHide: true,
    env: loopEnv,
  });

  const pid = proc.pid;
  proc.unref();
  closeSync(logFd);

  if (pid) invalidatePidCache(pid);

  return {
    pid,
    workspace: wsPath,
    log: logPath,
    message: `Loop iniciado (PID ${pid})`,
  };
}

// --- Loop Stop ---
export async function stopLoop(
  wsPath: string,
  slug: string,
): Promise<{ success: boolean; workspace: string; pid: number | null; signalSent: boolean }> {
  // Write .stop file for graceful shutdown
  const stopFile = resolve(wsPath, '.stop');
  writeFileSync(stopFile, new Date().toISOString(), 'utf-8');

  // Read PID from loop.json
  const hp = resolveHarnessSession(wsPath, slug);
  const loopState = hp ? readJsonSafe(hp.loopJsonPath) : null;
  const pid = loopState?.pid ?? null;
  let signalSent = false;

  if (pid) {
    try {
      if (IS_WIN) {
        execSync(`taskkill /PID ${pid} /T /F`, { timeout: 5000, stdio: 'ignore', windowsHide: true });
        signalSent = true;
      } else {
        process.kill(pid, 'SIGTERM');
        signalSent = true;
      }
    } catch { /* process may already be gone */ }
    invalidatePidCache(pid);
  }

  return { success: true, workspace: wsPath, pid, signalSent };
}

// --- SSE: Create Harness Stream ---
export function createHarnessStream(c: Context, slug: string, runsDir: string): Response {
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();

  function write(text: string) {
    writer.write(encoder.encode(text)).catch(() => {});
  }

  write(sseEncode({ type: 'log', text: `Criando .harness/ para ${slug}...` }));

  const metaDir = resolve(runsDir, '.meta');
  const script = resolve(metaDir, 'api', 'init-workspace.mjs');

  const proc = spawn(process.execPath, [script, '--slug', slug, '--runs-dir', runsDir], {
    cwd: runsDir,
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });

  proc.stdout.on('data', (d: Buffer) => {
    const text = d.toString().trim();
    if (text) write(sseEncode({ type: 'log', text }));
  });
  proc.stderr.on('data', (d: Buffer) => {
    const text = d.toString().trim();
    if (text) write(sseEncode({ type: 'log', text }));
  });

  proc.on('close', (code: number | null) => {
    invalidateDiscoverCache();
    if (code === 0) {
      write(sseEncode({ type: 'done', exitCode: 0 }));
    } else {
      write(sseEncode({ type: 'error', error: `Criação falhou com código ${code ?? 1}` }));
    }
    writer.close().catch(() => {});
  });

  proc.on('error', (err) => {
    write(sseEncode({ type: 'error', error: err.message }));
    writer.close().catch(() => {});
  });

  c.req.raw.signal.addEventListener('abort', () => {
    proc.kill();
    writer.close().catch(() => {});
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}

// --- SSE: Initialize Harness Stream ---
export function initializeHarnessStream(c: Context, slug: string, wsPath: string, runsDir: string): Response {
  const hp = resolveHarnessSession(wsPath, slug);
  if (!hp) {
    return new Response(JSON.stringify({ error: `.harness/${slug}/ não encontrado em ${wsPath}` }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Resolve initialize-harness.mjs
  const config = readJsonSafe(hp.configPath);
  const resolved = resolveSlug(runsDir, slug);
  const harnessType = config?.agent?.harness || resolved?.config?.agent?.harness || 'claude-code';
  const harnessDir = resolve(runsDir, '.meta', 'harnesses', harnessType);
  const initScript = resolve(harnessDir, 'initialize-harness.mjs');
  if (!existsSync(initScript)) {
    return new Response(JSON.stringify({ error: `initialize-harness.mjs não encontrado para harness "${harnessType}"` }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();

  function write(text: string) {
    writer.write(encoder.encode(text)).catch(() => {});
  }

  write(sseEncode({ type: 'log', text: `Inicializando ${slug} (session: ${hp.session})...` }));

  // Limpar features e progress antes de executar
  try {
    writeFileSync(hp.featuresPath, '[]', 'utf-8');
    writeFileSync(hp.progressPath, '', 'utf-8');
    write(sseEncode({ type: 'log', text: 'features.json e progress resetados.' }));
  } catch { /* ok */ }

  const proc = spawn('node', [initScript, '--session', hp.session, '--force'], {
    cwd: wsPath,
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true,
    windowsHide: true,
  });

  proc.stdout.on('data', (d: Buffer) => {
    const text = d.toString().trim();
    if (text) write(sseEncode({ type: 'log', text }));
  });
  proc.stderr.on('data', (d: Buffer) => {
    const text = d.toString().trim();
    if (text) write(sseEncode({ type: 'log', text }));
  });

  proc.on('close', (code: number | null) => {
    invalidateDiscoverCache();
    if (code === 0) {
      write(sseEncode({ type: 'done', exitCode: 0 }));
    } else {
      write(sseEncode({ type: 'error', error: `Inicialização falhou com código ${code ?? 1}` }));
    }
    writer.close().catch(() => {});
  });

  proc.on('error', (err) => {
    write(sseEncode({ type: 'error', error: err.message }));
    writer.close().catch(() => {});
  });

  c.req.raw.signal.addEventListener('abort', () => {
    proc.kill();
    writer.close().catch(() => {});
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}

// --- Infer from Specs Path ---
export async function inferFromSpecs(specsPath: string): Promise<HarnessInferResponse> {
  if (!specsPath) throw new Error('specsPath é obrigatório');

  const normalizedPath = specsPath.replace(/\\/g, '/');
  if (!existsSync(normalizedPath)) {
    throw new Error(`Caminho não encontrado: ${specsPath}`);
  }

  const { statSync } = await import('node:fs');
  const stat = statSync(normalizedPath);
  const specsDir = stat.isFile()
    ? dirname(normalizedPath).replace(/\\/g, '/')
    : normalizedPath;

  const parts = specsDir.replace(/\/$/, '').split('/');
  const milestone = parts[parts.length - 1];

  let repoRoot: string | null = null;
  try {
    repoRoot = execSync(`git -C "${specsDir}" rev-parse --show-toplevel`, {
      encoding: 'utf-8', timeout: 5000, windowsHide: true,
    }).trim().replace(/\\/g, '/');
  } catch { /* git não disponível — continua */ }

  const baseDir = repoRoot || dirname(specsDir).replace(/\\/g, '/');
  const repoBasename = basename(baseDir).toLowerCase().replace(/[^a-z0-9]/g, '');
  const suggestedSlug = `${repoBasename}-${milestone}--cc`;
  const suggestedName = `${basename(baseDir)} — ${milestone}`;
  const specs = repoRoot
    ? relative(repoRoot, specsDir).replace(/\\/g, '/')
    : specsDir;

  return {
    specsPath: normalizedPath,
    workspace: repoRoot || '',
    repoRoot: repoRoot || '',
    milestone,
    suggestedSlug,
    suggestedName,
    specs,
  };
}

// --- Create Run (project.json) ---
export async function createRun(
  params: {
    slug: string;
    name: string;
    workspace: string;
    specs: string;
    harness: string;
    max_turns?: number | null;
    max_iterations?: number | null;
    max_features?: number | null;
  },
  runsDir: string,
): Promise<{ success: boolean; slug: string }> {
  const { slug, name, workspace, specs, harness, max_turns, max_iterations, max_features } = params;

  if (!slug || !name || !workspace || !specs || !harness) {
    throw new Error('slug, name, workspace, specs e harness são obrigatórios');
  }

  const metaDir = resolve(runsDir, '.meta');
  const script = resolve(metaDir, 'api', 'create-project.mjs');

  const args = [
    script,
    '--slug', slug,
    '--name', name,
    '--workspace', workspace.replace(/\\/g, '/'),
    '--specs', specs,
    '--harness', harness,
    '--format', 'structured',
  ];
  args.push('--max-turns', String(max_turns ?? 0));
  if (max_iterations != null) args.push('--max-iterations', String(max_iterations));
  if (max_features != null) args.push('--max-features', String(max_features));

  await new Promise<string>((resolve, reject) => {
    const proc = spawn(process.execPath, args, {
      cwd: runsDir,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...(process.env as Record<string, string>), RUNS_DIR: runsDir },
      windowsHide: true,
    });
    let stdout = '';
    let stderr = '';
    proc.stdout.on('data', (d: Buffer) => { stdout += d.toString(); });
    proc.stderr.on('data', (d: Buffer) => { stderr += d.toString(); });
    proc.on('close', (code: number | null) => {
      if (code === 0) resolve(stdout);
      else reject(new Error(stderr.trim() || `Saiu com código ${code}`));
    });
    proc.on('error', reject);
  });

  return { success: true, slug };
}
