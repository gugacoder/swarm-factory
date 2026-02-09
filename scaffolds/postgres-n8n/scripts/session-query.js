/**
 * Script de consulta de sessoes
 * Consulta sessoes por status
 *
 * Uso: npm run session:query <status>
 * Status: waiting | in_progress | completed | abandoned | all
 */

const { Pool } = require('pg');

const VALID_STATUSES = ['waiting', 'in_progress', 'completed', 'abandoned', 'all'];

async function querySessionsByStatus() {
  const status = process.argv[2];

  if (!status) {
    console.error('Uso: npm run session:query <status>');
    console.error('Status validos:', VALID_STATUSES.join(', '));
    process.exit(1);
  }

  if (!VALID_STATUSES.includes(status)) {
    console.error(`Status invalido: ${status}`);
    console.error('Status validos:', VALID_STATUSES.join(', '));
    process.exit(1);
  }

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('ERROR: DATABASE_URL nao definida');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: databaseUrl });

  try {
    // Query base
    let whereClause = '';
    const params = [];

    if (status !== 'all') {
      whereClause = 'WHERE s.status = $1';
      params.push(status);
    }

    const result = await pool.query(
      `SELECT
        s.id,
        s.status,
        c.name as channel_name,
        s.client_phone,
        cl.nome as client_name,
        u.name as attendant_name,
        s.started_at,
        s.accepted_at,
        s.ended_at,
        s.outcome,
        s.close_reason,
        (
          SELECT COUNT(*) FROM session_messages sm
          WHERE sm.session_id = s.id
        ) as message_count,
        (
          SELECT content FROM session_messages sm
          WHERE sm.session_id = s.id
          ORDER BY sm.sent_at DESC
          LIMIT 1
        ) as last_message,
        (
          SELECT sent_at FROM session_messages sm
          WHERE sm.session_id = s.id
          ORDER BY sm.sent_at DESC
          LIMIT 1
        ) as last_message_at
      FROM service_sessions s
      JOIN channels c ON c.id = s.channel_id
      LEFT JOIN clients cl ON cl.id = s.client_id
      LEFT JOIN users u ON u.id = s.attendant_id
      ${whereClause}
      ORDER BY s.started_at DESC
      LIMIT 50`,
      params
    );

    if (result.rows.length === 0) {
      console.log(`\nNenhuma sessao encontrada com status: ${status}\n`);
      return;
    }

    console.log(`\n=== SESSOES (${status.toUpperCase()}) ===\n`);
    console.log(`Total: ${result.rows.length}\n`);

    result.rows.forEach((session, index) => {
      const startedAt = new Date(session.started_at).toLocaleString('pt-BR');
      const acceptedAt = session.accepted_at
        ? new Date(session.accepted_at).toLocaleString('pt-BR')
        : '-';
      const endedAt = session.ended_at
        ? new Date(session.ended_at).toLocaleString('pt-BR')
        : '-';

      const lastMessage = session.last_message
        ? truncate(session.last_message, 60)
        : '-';

      console.log(`[${index + 1}] ${session.id}`);
      console.log(`    Status: ${session.status}`);
      console.log(`    Canal: ${session.channel_name}`);
      console.log(`    Cliente: ${session.client_phone} (${session.client_name || 'sem nome'})`);
      console.log(`    Atendente: ${session.attendant_name || '-'}`);
      console.log(`    Iniciada: ${startedAt}`);
      console.log(`    Aceita: ${acceptedAt}`);
      console.log(`    Encerrada: ${endedAt}`);
      console.log(`    Mensagens: ${session.message_count}`);
      console.log(`    Ultima msg: ${lastMessage}`);

      if (session.outcome) {
        console.log(`    Resultado: ${session.outcome}`);
      }

      if (session.close_reason) {
        console.log(`    Motivo: ${session.close_reason}`);
      }

      console.log('');
    });

    console.log(`Total de sessoes: ${result.rows.length}\n`);
  } catch (err) {
    console.error('Erro ao consultar sessoes:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

function truncate(str, maxLen) {
  if (!str) return '';
  if (str.length <= maxLen) return str;
  return str.substring(0, maxLen) + '...';
}

querySessionsByStatus();
