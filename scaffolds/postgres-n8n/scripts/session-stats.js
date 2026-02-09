/**
 * Script para estatisticas de sessoes
 * Mostra resumo geral do sistema
 *
 * Uso: npm run session:stats
 */

const { Pool } = require('pg');

async function showStats() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('ERROR: DATABASE_URL nao definida');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: databaseUrl });

  try {
    // Contadores por status
    const statusResult = await pool.query(
      `SELECT
        status,
        COUNT(*) as count
      FROM service_sessions
      GROUP BY status
      ORDER BY status`
    );

    console.log('\n=== SESSOES POR STATUS ===\n');
    statusResult.rows.forEach((row) => {
      console.log(`  ${row.status.padEnd(15)} ${row.count}`);
    });

    // Total de mensagens
    const messagesResult = await pool.query(
      `SELECT COUNT(*) as total FROM session_messages`
    );

    console.log('\n=== MENSAGENS ===\n');
    console.log(`  Total: ${messagesResult.rows[0].total}`);

    // Mensagens por direcao
    const directionResult = await pool.query(
      `SELECT
        direction,
        COUNT(*) as count
      FROM session_messages
      GROUP BY direction`
    );

    directionResult.rows.forEach((row) => {
      console.log(`  ${row.direction.padEnd(10)} ${row.count}`);
    });

    // Canais ativos
    const channelsResult = await pool.query(
      `SELECT
        c.name,
        COUNT(s.id) as session_count,
        COUNT(CASE WHEN s.status = 'waiting' THEN 1 END) as waiting,
        COUNT(CASE WHEN s.status = 'in_progress' THEN 1 END) as in_progress
      FROM channels c
      LEFT JOIN service_sessions s ON s.channel_id = c.id
      WHERE c.active = true
      GROUP BY c.id, c.name`
    );

    console.log('\n=== CANAIS ===\n');
    channelsResult.rows.forEach((row) => {
      console.log(`  ${row.name}`);
      console.log(`    Total sessoes: ${row.session_count}`);
      console.log(`    Aguardando: ${row.waiting}`);
      console.log(`    Em atendimento: ${row.in_progress}`);
    });

    // Sessoes hoje
    const todayResult = await pool.query(
      `SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'abandoned' THEN 1 END) as abandoned
      FROM service_sessions
      WHERE started_at >= CURRENT_DATE`
    );

    console.log('\n=== HOJE ===\n');
    console.log(`  Sessoes iniciadas: ${todayResult.rows[0].total}`);
    console.log(`  Concluidas: ${todayResult.rows[0].completed}`);
    console.log(`  Abandonadas: ${todayResult.rows[0].abandoned}`);

    // Tempo medio de atendimento (hoje)
    const avgResult = await pool.query(
      `SELECT
        AVG(EXTRACT(EPOCH FROM (accepted_at - started_at))) as avg_wait,
        AVG(EXTRACT(EPOCH FROM (ended_at - accepted_at))) as avg_duration
      FROM service_sessions
      WHERE started_at >= CURRENT_DATE
        AND status IN ('completed', 'abandoned')
        AND accepted_at IS NOT NULL`
    );

    if (avgResult.rows[0].avg_wait !== null) {
      const avgWait = Math.round(parseFloat(avgResult.rows[0].avg_wait || 0));
      const avgDuration = Math.round(parseFloat(avgResult.rows[0].avg_duration || 0));

      console.log('\n=== TEMPO MEDIO (HOJE) ===\n');
      console.log(`  Tempo de espera: ${formatSeconds(avgWait)}`);
      console.log(`  Duracao do atendimento: ${formatSeconds(avgDuration)}`);
    }

    console.log('');
  } catch (err) {
    console.error('Erro ao consultar estatisticas:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

function formatSeconds(seconds) {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}m ${secs}s`;
}

showStats();
