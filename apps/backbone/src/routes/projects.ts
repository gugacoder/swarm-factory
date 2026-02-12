import { Hono } from 'hono';
import { z } from 'zod';
import type { UserPayload } from '../services/auth-service.js';
import * as projectService from '../services/project-service.js';

type Env = { Variables: { user: UserPayload } };

const projects = new Hono<Env>();

// Slug: apenas kebab-case
const slugPattern = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;

const createSchema = z.object({
  slug: z.string().min(3).regex(slugPattern, 'Slug deve ser kebab-case'),
  name: z.string().min(1),
  description: z.string().optional(),
  workspace: z.string().min(1),
  specs: z.string().min(1),
  harness: z.enum(['claude-code', 'opencode', 'codex']),
  model: z.string().optional(),
  max_turns: z.number().int().positive().optional(),
  max_iterations: z.number().int().positive().optional(),
  max_features: z.number().int().positive().optional(),
  max_retries: z.number().int().positive().optional(),
  format: z.enum(['flat', 'structured']).optional(),
});

const updateSchema = z.object({
  max_turns: z.number().int().positive().optional(),
  max_iterations: z.number().int().positive().optional(),
  max_features: z.number().int().positive().optional(),
  max_retries: z.number().int().positive().optional(),
  model: z.string().optional(),
});

const slugParam = z.object({
  slug: z.string().min(1).regex(slugPattern, 'Slug inválido'),
});

// GET /api/projects — lista projetos
projects.get('/', async (c) => {
  try {
    const list = await projectService.list();
    return c.json(list);
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// POST /api/projects — cria projeto
projects.post('/', async (c) => {
  const body = await c.req.json();
  const parsed = createSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: 'Dados inválidos', details: parsed.error.flatten() }, 400);
  }

  try {
    const result = await projectService.create(parsed.data);
    return c.json(result, 201);
  } catch (e: any) {
    if (e.message?.includes('já existe') || e.message?.includes('already exists') || e.code === 'EEXIST') {
      return c.json({ error: 'Projeto com este slug já existe' }, 409);
    }
    return c.json({ error: e.message }, 500);
  }
});

// GET /api/projects/:slug — detalhes do projeto
projects.get('/:slug', async (c) => {
  const slug = c.req.param('slug');
  if (!slugPattern.test(slug)) {
    return c.json({ error: 'Slug inválido' }, 400);
  }

  try {
    const project = await projectService.get(slug);
    return c.json(project);
  } catch (e: any) {
    return c.json({ error: e.message }, 404);
  }
});

// PATCH /api/projects/:slug — atualiza parametros
projects.patch('/:slug', async (c) => {
  const slug = c.req.param('slug');
  if (!slugPattern.test(slug)) {
    return c.json({ error: 'Slug inválido' }, 400);
  }

  const body = await c.req.json();
  const parsed = updateSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: 'Dados inválidos', details: parsed.error.flatten() }, 400);
  }

  try {
    const result = await projectService.update(slug, parsed.data);
    return c.json(result);
  } catch (e: any) {
    return c.json({ error: e.message }, 404);
  }
});

// DELETE /api/projects/:slug — exclui projeto (não o workspace)
projects.delete('/:slug', async (c) => {
  const slug = c.req.param('slug');
  if (!slugPattern.test(slug)) {
    return c.json({ error: 'Slug inválido' }, 400);
  }

  try {
    const result = await projectService.remove(slug);
    return c.json(result);
  } catch (e: any) {
    return c.json({ error: e.message }, 404);
  }
});

// GET /api/projects/:slug/status — status com contagem de features
projects.get('/:slug/status', async (c) => {
  const slug = c.req.param('slug');
  if (!slugPattern.test(slug)) {
    return c.json({ error: 'Slug inválido' }, 400);
  }

  try {
    const status = await projectService.getStatus(slug);
    return c.json(status);
  } catch (e: any) {
    return c.json({ error: e.message }, 404);
  }
});

// GET /api/projects/:slug/progress — conteudo do agent-progress.txt
projects.get('/:slug/progress', async (c) => {
  const slug = c.req.param('slug');
  if (!slugPattern.test(slug)) {
    return c.json({ error: 'Slug inválido' }, 400);
  }

  try {
    const { getProgress } = await import('../services/session-service.js');
    const progress = await getProgress(slug);
    return c.text(progress);
  } catch (e: any) {
    return c.json({ error: e.message }, 404);
  }
});

export default projects;
