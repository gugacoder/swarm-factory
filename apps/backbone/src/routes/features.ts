import { Hono } from 'hono';
import type { UserPayload } from '../services/auth-service.js';
import * as projectService from '../services/project-service.js';

type Env = { Variables: { user: UserPayload } };

const features = new Hono<Env>();

const slugPattern = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;
const featureIdPattern = /^F-\d{3}$/;

// GET /api/projects/:slug/features — features.json parseado
features.get('/:slug/features', async (c) => {
  const slug = c.req.param('slug');
  if (!slugPattern.test(slug)) {
    return c.json({ error: 'Slug inválido' }, 400);
  }

  try {
    const list = await projectService.getFeatures(slug);
    return c.json(list);
  } catch (e: any) {
    return c.json({ error: e.message }, 404);
  }
});

// POST /api/projects/:slug/features/:id/rotate — rotação de contexto
features.post('/:slug/features/:id/rotate', async (c) => {
  const slug = c.req.param('slug');
  const id = c.req.param('id');

  if (!slugPattern.test(slug)) {
    return c.json({ error: 'Slug inválido' }, 400);
  }
  if (!featureIdPattern.test(id)) {
    return c.json({ error: 'Feature ID inválido (esperado F-NNN)' }, 400);
  }

  try {
    const feature = await projectService.rotateFeature(slug, id);
    return c.json(feature);
  } catch (e: any) {
    return c.json({ error: e.message }, 404);
  }
});

export default features;
