import { Hono } from 'hono';
import pool from '../db.js';

const notifications = new Hono();

// GET /api/notifications — lista notificações do usuário
notifications.get('/', async (c) => {
  const userId = (c as any).get('userId') as string;

  const res = await pool.query(
    `SELECT id, type, title, body, read, metadata, created_at
     FROM notifications
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT 50`,
    [userId],
  );

  return c.json(res.rows);
});

// PATCH /api/notifications/:id/read — marcar como lida
notifications.patch('/:id/read', async (c) => {
  const userId = (c as any).get('userId') as string;
  const id = c.req.param('id');

  await pool.query(
    'UPDATE notifications SET read = true WHERE id = $1 AND user_id = $2',
    [id, userId],
  );

  return c.json({ ok: true });
});

// PATCH /api/notifications/read-all — marcar todas como lidas
notifications.patch('/read-all', async (c) => {
  const userId = (c as any).get('userId') as string;

  await pool.query(
    'UPDATE notifications SET read = true WHERE user_id = $1 AND read = false',
    [userId],
  );

  return c.json({ ok: true });
});

// POST /api/notifications/subscribe — registrar push subscription
notifications.post('/subscribe', async (c) => {
  const userId = (c as any).get('userId') as string;
  const body = await c.req.json();

  // Salvar subscription em notification_preferences
  await pool.query(
    `INSERT INTO notification_preferences (user_id, channel, enabled, config)
     VALUES ($1, 'push', true, $2)
     ON CONFLICT (user_id, channel) DO UPDATE SET config = $2, enabled = true`,
    [userId, JSON.stringify(body)],
  );

  return c.json({ ok: true });
});

export default notifications;
