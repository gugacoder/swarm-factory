import pool from '../db.js';
import * as projectService from './project-service.js';

let intervalId: ReturnType<typeof setInterval> | null = null;

export async function isEnabled(userId: string): Promise<boolean> {
  const res = await pool.query(
    "SELECT value FROM system_settings WHERE user_id = $1 AND key = 'kai_proactive'",
    [userId],
  );
  return res.rows.length > 0 && res.rows[0].value === 'true';
}

async function checkAndAlert() {
  try {
    // Buscar todos os usuários admin (simplificado — proativo para admins)
    const usersRes = await pool.query(
      "SELECT id FROM users WHERE role = 'admin' AND active = true",
    );

    for (const user of usersRes.rows) {
      const enabled = await isEnabled(user.id);
      if (!enabled) continue;

      const projects = await projectService.list();

      for (const proj of projects) {
        try {
          const status = await projectService.getStatus(proj.slug);

          // Loop sem progresso > 10 min
          if (status.state === 'running' && status.loop?.updated_at) {
            const lastUpdate = new Date(status.loop.updated_at).getTime();
            const now = Date.now();
            if (now - lastUpdate > 10 * 60 * 1000) {
              await createProactiveAlert(user.id, {
                type: 'loop_stalled',
                title: `Loop parado: ${proj.slug}`,
                body: `O loop do projeto ${proj.name} não fez progresso nos últimos 10 minutos. Considere parar e reiniciar.`,
                slug: proj.slug,
              });
            }
          }

          // Features com retries excessivos
          const features = await projectService.getFeatures(proj.slug).catch(() => []);
          for (const f of features) {
            if (f.retries >= (f.max_retries || 5)) {
              await createProactiveAlert(user.id, {
                type: 'feature_stuck',
                title: `Feature travada: ${f.id}`,
                body: `A feature ${f.id} (${f.title}) do projeto ${proj.name} atingiu o limite de retries. Considere rotacionar contexto ou revisar manualmente.`,
                slug: proj.slug,
                featureId: f.id,
              });
            }
          }
        } catch { /* ignora erros de projeto individual */ }
      }
    }
  } catch (e: any) {
    console.error('[PROATIVO] Erro:', e.message);
  }
}

async function createProactiveAlert(userId: string, data: {
  type: string;
  title: string;
  body: string;
  slug?: string;
  featureId?: string;
}) {
  // Evitar duplicatas recentes (últimas 30min)
  const recent = await pool.query(
    `SELECT id FROM notifications
     WHERE user_id = $1 AND type = 'kai_proactive_alert' AND title = $2
     AND created_at > NOW() - INTERVAL '30 minutes'`,
    [userId, data.title],
  );
  if (recent.rows.length > 0) return;

  await pool.query(
    `INSERT INTO notifications (user_id, type, title, body, metadata)
     VALUES ($1, 'kai_proactive_alert', $2, $3, $4)`,
    [userId, data.title, data.body, JSON.stringify({ slug: data.slug, featureId: data.featureId })],
  );
}

export function startProactiveMonitor() {
  if (intervalId) return;
  intervalId = setInterval(checkAndAlert, 5 * 60 * 1000); // 5 min
  console.log('[PROATIVO] Monitor iniciado (intervalo: 5min)');
}

export function stopProactiveMonitor() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.log('[PROATIVO] Monitor parado');
  }
}
