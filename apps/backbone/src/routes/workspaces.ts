import { Hono } from 'hono';
import type { UserPayload } from '../services/auth-service.js';
import * as projectService from '../services/project-service.js';

type Env = { Variables: { user: UserPayload } };

const workspaces = new Hono<Env>();

const slugPattern = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;

// POST /api/projects/:slug/init — inicializa workspace
workspaces.post('/:slug/init', async (c) => {
  const slug = c.req.param('slug');
  if (!slugPattern.test(slug)) {
    return c.json({ error: 'Slug inválido' }, 400);
  }

  try {
    const result = await projectService.initWorkspace(slug);
    return c.json(result);
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

export default workspaces;
