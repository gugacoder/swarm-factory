/**
 * Script para visualizar mensagens de uma sessao
 * Mostra o historico completo de conversas
 *
 * Uso: npm run session:messages <session_id>
 */

const { Pool } = require('pg');

async function showSessionMessages() {
  const sessionId = process.argv[2];

  if (!sessionId) {
    console.error('Uso: npm run session:messages <session_id>');
    process.exit(1);
  }

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('ERROR: DATABASE_URL nao definida');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: databaseUrl });

  try {
    // Buscar info da sessao
    const sessionResult = await pool.query(
      `SELECT
        s.id,
        s.status,
        c.name as channel_name,
        s.client_phone,
        cl.nome as client_name,
        u.name as attendant_name,
        s.started_at,
        s.accepted_at,
        s.ended_at
      FROM service_sessions s
      JOIN channels c ON c.id = s.channel_id
      LEFT JOIN clients cl ON cl.id = s.client_id
      LEFT JOIN users u ON u.id = s.attendant_id
      WHERE s.id = $1`,
      [sessionId]
    );

    if (sessionResult.rows.length === 0) {
      console.error(`Sessao nao encontrada: ${sessionId}`);
      process.exit(1);
    }

    const session = sessionResult.rows[0];

    console.log('\n=== SESSAO ===\n');
    console.log(`ID: ${session.id}`);
    console.log(`Status: ${session.status}`);
    console.log(`Canal: ${session.channel_name}`);
    console.log(`Cliente: ${session.client_phone} (${session.client_name || 'sem nome'})`);
    console.log(`Atendente: ${session.attendant_name || '-'}`);
    console.log(`Iniciada: ${new Date(session.started_at).toLocaleString('pt-BR')}`);
    if (session.accepted_at) {
      console.log(`Aceita: ${new Date(session.accepted_at).toLocaleString('pt-BR')}`);
    }
    if (session.ended_at) {
      console.log(`Encerrada: ${new Date(session.ended_at).toLocaleString('pt-BR')}`);
    }

    // Buscar mensagens
    const messagesResult = await pool.query(
      `SELECT
        id,
        direction,
        content,
        message_type,
        evolution_message_id,
        sent_at
      FROM session_messages
      WHERE session_id = $1
      ORDER BY sent_at ASC`,
      [sessionId]
    );

    console.log(`\n=== MENSAGENS (${messagesResult.rows.length}) ===\n`);

    if (messagesResult.rows.length === 0) {
      console.log('Nenhuma mensagem nesta sessao.\n');
      return;
    }

    messagesResult.rows.forEach((msg, index) => {
      const time = new Date(msg.sent_at).toLocaleTimeString('pt-BR');
      const direction = msg.direction === 'incoming' ? '📥 CLIENTE' : '📤 ATENDENTE';
      const content = msg.content || `[${msg.message_type}]`;

      console.log(`[${index + 1}] ${time} ${direction}`);
      console.log(`    ${content}`);
      if (msg.evolution_message_id) {
        console.log(`    (Evolution ID: ${msg.evolution_message_id})`);
      }
      console.log('');
    });
  } catch (err) {
    console.error('Erro ao consultar mensagens:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

showSessionMessages();
