import { Hono } from 'hono';
import pool from '../db.js';

const onboarding = new Hono();

// GET /api/onboarding/progress — steps completados
onboarding.get('/progress', async (c) => {
  const userId = (c as any).get('userId') as string;

  const res = await pool.query(
    'SELECT step_completed, completed_at FROM onboarding_progress WHERE user_id = $1 ORDER BY completed_at',
    [userId],
  );

  return c.json({
    steps: res.rows.map((r: any) => r.step_completed),
    details: res.rows,
  });
});

// POST /api/onboarding/complete — marcar step como completo
onboarding.post('/complete', async (c) => {
  const userId = (c as any).get('userId') as string;
  const body = await c.req.json();
  const step = body.step;

  if (!step) {
    return c.json({ error: 'step é obrigatório' }, 400);
  }

  await pool.query(
    `INSERT INTO onboarding_progress (user_id, step_completed)
     VALUES ($1, $2)
     ON CONFLICT (user_id, step_completed) DO NOTHING`,
    [userId, step],
  );

  return c.json({ ok: true });
});

// POST /api/onboarding/reset — resetar onboarding
onboarding.post('/reset', async (c) => {
  const userId = (c as any).get('userId') as string;

  await pool.query(
    'DELETE FROM onboarding_progress WHERE user_id = $1',
    [userId],
  );

  return c.json({ ok: true });
});

export default onboarding;
