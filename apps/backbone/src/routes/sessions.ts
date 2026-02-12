import { Hono } from 'hono';
import type { UserPayload } from '../services/auth-service.js';
import * as sessionService from '../services/session-service.js';

type Env = { Variables: { user: UserPayload } };

const sessions = new Hono<Env>();

const slugPattern = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;

// GET /api/projects/:slug/sessions — lista sessões
sessions.get('/:slug/sessions', async (c) => {
  const slug = c.req.param('slug');
  if (!slugPattern.test(slug)) {
    return c.json({ error: 'Slug inválido' }, 400);
  }

  try {
    const list = await sessionService.list(slug);
    return c.json(list);
  } catch (e: any) {
    return c.json({ error: e.message }, 404);
  }
});

// GET /api/projects/:slug/sessions/:id — replay de sessão
sessions.get('/:slug/sessions/:id', async (c) => {
  const slug = c.req.param('slug');
  const id = c.req.param('id');
  if (!slugPattern.test(slug)) {
    return c.json({ error: 'Slug inválido' }, 400);
  }

  try {
    const events = await sessionService.get(slug, id);
    return c.json(events);
  } catch (e: any) {
    return c.json({ error: e.message }, 404);
  }
});

export default sessions;
