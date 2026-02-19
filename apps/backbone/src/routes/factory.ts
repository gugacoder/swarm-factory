/**
 * Factory Routes — /api/factory/*
 * Namespace isolado para endpoints de monitoramento/controle de workspaces.
 * Portado de apps/sneak-peek-hub/src/plugin.ts
 */

import { Hono } from 'hono';
import type { UserPayload } from '../services/auth-service.js';
import * as ws from '../services/factory/workspace-service.js';

type Env = { Variables: { user: UserPayload } };

const factory = new Hono<Env>();

// --- Helpers ---
function getRunsDir() {
  return ws.getRunsDir();
}

function resolveCtx(slug: string) {
  const runsDir = getRunsDir();
  const resolved = ws.resolveSlug(runsDir, slug);
  if (!resolved) return null;
  return { config: resolved.config, workspace: resolved.workspace, slug };
}

// ============================================================
// PRP-001: Workspace Discovery e State Endpoints
// ============================================================

// GET /api/factory/workspaces — listar todos os workspaces/runs
factory.get('/workspaces', (c) => {
  try {
    const runsDir = getRunsDir();
    const workspaces = ws.discoverWorkspaces(runsDir);
    return c.json({ workspaces });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// GET /api/factory/runs/:slug/state — loop state com PID alive
factory.get('/runs/:slug/state', (c) => {
  const slug = c.req.param('slug');
  const ctx = resolveCtx(slug);
  if (!ctx) return c.json({ error: `Slug "${slug}" não encontrado` }, 404);

  const { state, detail, alive, pid } = ws.detectLoopState(ctx.workspace, slug);
  return c.json({ state, detail, pid, alive });
});

// GET /api/factory/runs/:slug/features — features com contagens
factory.get('/runs/:slug/features', (c) => {
  const slug = c.req.param('slug');
  const ctx = resolveCtx(slug);
  if (!ctx) return c.json({ error: `Slug "${slug}" não encontrado` }, 404);

  const result = ws.readFeatures(ctx.workspace, slug);
  return c.json(result);
});

// GET /api/factory/runs/:slug/config — harness config
factory.get('/runs/:slug/config', (c) => {
  const slug = c.req.param('slug');
  const ctx = resolveCtx(slug);
  if (!ctx) return c.json({ error: `Slug "${slug}" não encontrado` }, 404);

  const config = ws.readConfig(ctx.workspace, slug);
  if (!config) return c.json({ error: 'config.json não encontrado' }, 404);
  return c.json({ config });
});

// GET /api/factory/runs/:slug/status — fase do run (pending/created/initialized/executed)
factory.get('/runs/:slug/status', (c) => {
  const slug = c.req.param('slug');
  const runsDir = getRunsDir();
  const result = ws.getRunStatus(runsDir, slug);
  return c.json(result);
});

// GET /api/factory/runs/:slug/progress — progress.txt
factory.get('/runs/:slug/progress', async (c) => {
  const slug = c.req.param('slug');
  const ctx = resolveCtx(slug);
  if (!ctx) return c.json({ error: `Slug "${slug}" não encontrado` }, 404);

  const lines = parseInt(c.req.query('lines') || '200', 10);
  const result = await ws.readProgress(ctx.workspace, slug, lines);
  return c.json(result);
});

// ============================================================
// PRP-002: Session JSONL Reading (será adicionado aqui)
// ============================================================

// GET /api/factory/runs/:slug/sessions — listar feature runs com metadata e métricas
factory.get('/runs/:slug/sessions', async (c) => {
  const slug = c.req.param('slug');
  const ctx = resolveCtx(slug);
  if (!ctx) return c.json({ error: `Slug "${slug}" não encontrado` }, 404);

  try {
    const { listSessions } = await import('../services/factory/session-reader-service.js');
    const sessions = listSessions(ctx.workspace, slug);
    return c.json({ sessions });
  } catch (e: any) {
    return c.json({ sessions: [] });
  }
});

// GET /api/factory/runs/:slug/sessions/:sid/output — output JSONL incremental
factory.get('/runs/:slug/sessions/:sid/output', async (c) => {
  const slug = c.req.param('slug');
  const sid = c.req.param('sid');

  if (!ws.isValidSessionId(sid)) return c.json({ error: 'ID de sessão inválido' }, 400);

  const ctx = resolveCtx(slug);
  if (!ctx) return c.json({ error: `Slug "${slug}" não encontrado` }, 404);

  try {
    const { readSessionOutput } = await import('../services/factory/session-reader-service.js');
    const tail = parseInt(c.req.query('tail') || '50', 10);
    const sinceByte = c.req.query('since_byte');
    const result = readSessionOutput(ctx.workspace, slug, sid, tail, sinceByte ? parseInt(sinceByte, 10) : undefined);
    return c.json(result);
  } catch (e: any) {
    return c.json({ error: e.message }, 404);
  }
});

// GET /api/factory/runs/:slug/harness-sessions — listar sessions do .harness/
factory.get('/runs/:slug/harness-sessions', (c) => {
  const slug = c.req.param('slug');
  const ctx = resolveCtx(slug);
  if (!ctx) return c.json({ error: `Slug "${slug}" não encontrado` }, 404);

  const result = ws.listHarnessSessions(ctx.workspace);
  return c.json(result);
});

// POST /api/factory/runs/:slug/harness-sessions/switch — trocar session ativa
factory.post('/runs/:slug/harness-sessions/switch', async (c) => {
  const slug = c.req.param('slug');
  const ctx = resolveCtx(slug);
  if (!ctx) return c.json({ error: `Slug "${slug}" não encontrado` }, 404);

  const body = await c.req.json();
  const { session } = body;
  if (!session) return c.json({ error: 'session é obrigatório' }, 400);

  const { writeFileSync, existsSync } = await import('node:fs');
  const { resolve } = await import('node:path');
  const sessionDir = resolve(ctx.workspace, '.harness', session);
  if (!existsSync(sessionDir)) {
    return c.json({ error: `Session "${session}" não encontrada em .harness/` }, 404);
  }

  writeFileSync(resolve(ctx.workspace, '.harness', 'active'), session, 'utf-8');
  ws.invalidateDiscoverCache();

  return c.json({ success: true, session });
});

// ============================================================
// PRP-003: Loop Control e SSE Streaming (será adicionado aqui)
// ============================================================

// POST /api/factory/runs/:slug/loop/start
factory.post('/runs/:slug/loop/start', async (c) => {
  const slug = c.req.param('slug');
  const ctx = resolveCtx(slug);
  if (!ctx) return c.json({ error: `Slug "${slug}" não encontrado` }, 404);

  try {
    const { startLoop } = await import('../services/factory/loop-control-service.js');
    const body = await c.req.json().catch(() => ({}));
    const result = await startLoop(ctx.workspace, slug, getRunsDir(), body);
    return c.json(result);
  } catch (e: any) {
    const status = e.message?.includes('já está rodando') ? 409 : 500;
    return c.json({ error: e.message }, status);
  }
});

// POST /api/factory/runs/:slug/loop/stop
factory.post('/runs/:slug/loop/stop', async (c) => {
  const slug = c.req.param('slug');
  const ctx = resolveCtx(slug);
  if (!ctx) return c.json({ error: `Slug "${slug}" não encontrado` }, 404);

  try {
    const { stopLoop } = await import('../services/factory/loop-control-service.js');
    const result = await stopLoop(ctx.workspace, slug);
    return c.json(result);
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// GET /api/factory/runs/:slug/create-stream — SSE para criação de .harness/
factory.get('/runs/:slug/create-stream', async (c) => {
  const slug = c.req.param('slug');
  const ctx = resolveCtx(slug);
  if (!ctx) return c.json({ error: `Slug "${slug}" não encontrado` }, 404);

  try {
    const { createHarnessStream } = await import('../services/factory/loop-control-service.js');
    return createHarnessStream(c, slug, getRunsDir());
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// GET /api/factory/runs/:slug/initialize-stream — SSE para geração de features.json
factory.get('/runs/:slug/initialize-stream', async (c) => {
  const slug = c.req.param('slug');
  const ctx = resolveCtx(slug);
  if (!ctx) return c.json({ error: `Slug "${slug}" não encontrado` }, 404);

  try {
    const { initializeHarnessStream } = await import('../services/factory/loop-control-service.js');
    return initializeHarnessStream(c, slug, ctx.workspace, getRunsDir());
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// POST /api/factory/infer — inferir workspace/milestone/slug de path de specs
factory.post('/infer', async (c) => {
  try {
    const { inferFromSpecs } = await import('../services/factory/loop-control-service.js');
    const body = await c.req.json();
    const result = await inferFromSpecs(body.specsPath);
    return c.json(result);
  } catch (e: any) {
    return c.json({ error: e.message }, e.message?.includes('não encontrado') ? 404 : 500);
  }
});

// POST /api/factory/runs — criar project.json
factory.post('/runs', async (c) => {
  try {
    const { createRun } = await import('../services/factory/loop-control-service.js');
    const body = await c.req.json();
    const result = await createRun(body, getRunsDir());
    ws.invalidateDiscoverCache();
    return c.json(result);
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// ============================================================
// PRP-004: Specs File Browser API (será adicionado aqui)
// ============================================================

// GET /api/factory/runs/:slug/specs — listar raiz do diretório specs
// GET /api/factory/runs/:slug/specs/*path — navegar subdiretórios ou ler conteúdo
factory.get('/runs/:slug/specs/*', async (c) => {
  const slug = c.req.param('slug');
  const ctx = resolveCtx(slug);
  if (!ctx) return c.json({ error: `Slug "${slug}" não encontrado` }, 404);

  try {
    const { readSpecs } = await import('../services/factory/specs-service.js');
    const subPath = c.req.param('*') || '';
    const result = readSpecs(ctx.workspace, slug, subPath);
    return c.json(result);
  } catch (e: any) {
    return c.json({ error: e.message }, 404);
  }
});

factory.get('/runs/:slug/specs', async (c) => {
  const slug = c.req.param('slug');
  const ctx = resolveCtx(slug);
  if (!ctx) return c.json({ error: `Slug "${slug}" não encontrado` }, 404);

  try {
    const { readSpecs } = await import('../services/factory/specs-service.js');
    const result = readSpecs(ctx.workspace, slug, '');
    return c.json(result);
  } catch (e: any) {
    return c.json({ error: e.message }, 404);
  }
});

export default factory;
