import { Hono } from 'hono';
import { z } from 'zod';
import type { UserPayload } from '../services/auth-service.js';
import * as loopService from '../services/loop-service.js';

type Env = { Variables: { user: UserPayload } };

const loops = new Hono<Env>();

const slugPattern = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;

const startSchema = z.object({
  maxTurns: z.number().int().positive().optional(),
  model: z.string().optional(),
});

const stopSchema = z.object({
  force: z.boolean().optional(),
});

// POST /api/projects/:slug/loop/start — inicia loop autonomo
loops.post('/:slug/loop/start', async (c) => {
  const slug = c.req.param('slug');
  if (!slugPattern.test(slug)) {
    return c.json({ error: 'Slug inválido' }, 400);
  }

  const body = await c.req.json().catch(() => ({}));
  const parsed = startSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: 'Dados inválidos', details: parsed.error.flatten() }, 400);
  }

  try {
    const result = await loopService.start(slug, parsed.data);
    return c.json(result);
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// POST /api/projects/:slug/loop/stop — para loop
loops.post('/:slug/loop/stop', async (c) => {
  const slug = c.req.param('slug');
  if (!slugPattern.test(slug)) {
    return c.json({ error: 'Slug inválido' }, 400);
  }

  const body = await c.req.json().catch(() => ({}));
  const parsed = stopSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: 'Dados inválidos', details: parsed.error.flatten() }, 400);
  }

  try {
    const result = await loopService.stop(slug, parsed.data.force);
    return c.json(result);
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// GET /api/projects/:slug/loop/logs — logs (agent-progress.txt)
loops.get('/:slug/loop/logs', async (c) => {
  const slug = c.req.param('slug');
  if (!slugPattern.test(slug)) {
    return c.json({ error: 'Slug inválido' }, 400);
  }

  const tail = parseInt(c.req.query('tail') || '0') || undefined;

  try {
    const logs = await loopService.getLogs(slug, tail);
    return c.text(logs);
  } catch (e: any) {
    return c.json({ error: e.message }, 404);
  }
});

export default loops;
