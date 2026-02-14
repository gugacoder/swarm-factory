import { Hono } from 'hono';
import pool from '../db.js';

const settings = new Hono();

// GET /api/settings — configurações do usuário
settings.get('/', async (c) => {
  const userId = (c as any).get('userId') as string;

  const res = await pool.query(
    'SELECT key, value FROM system_settings WHERE user_id = $1',
    [userId],
  );

  const result: Record<string, string> = {};
  for (const row of res.rows) {
    result[row.key] = row.value;
  }

  return c.json(result);
});

// PATCH /api/settings — atualizar configurações
settings.patch('/', async (c) => {
  const userId = (c as any).get('userId') as string;
  const body = await c.req.json();

  for (const [key, value] of Object.entries(body)) {
    if (typeof value !== 'string') continue;
    await pool.query(
      `INSERT INTO system_settings (user_id, key, value)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, key) DO UPDATE SET value = $3, updated_at = NOW()`,
      [userId, key, value],
    );
  }

  return c.json({ ok: true });
});

// POST /api/settings/test-openrouter — testar conexão
settings.post('/test-openrouter', async (c) => {
  const body = await c.req.json();
  const apiKey = body.apiKey;

  if (!apiKey) {
    return c.json({ error: 'API key não fornecida' }, 400);
  }

  try {
    const res = await fetch('https://openrouter.ai/api/v1/models', {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!res.ok) {
      return c.json({ error: 'API key inválida' }, 400);
    }

    return c.json({ ok: true });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

export default settings;
