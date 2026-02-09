/**
 * Script para verificar inconsistencia entre usuarios e sessoes
 */

const { Pool } = require('pg');

async function checkUserSessions() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('ERROR: DATABASE_URL nao definida');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: databaseUrl });

  try {
    // Buscar usuario admin
    const userResult = await pool.query(
      `SELECT id, name, email FROM users WHERE email = 'admin@mail.com'`
    );

    if (userResult.rows.length === 0) {
      console.log('Usuario admin@mail.com nao encontrado');
      return;
    }

    const adminUser = userResult.rows[0];
    console.log('\n=== USUARIO LOGADO ===');
    console.log(`ID: ${adminUser.id}`);
    console.log(`Nome: ${adminUser.name}`);
    console.log(`Email: ${adminUser.email}`);

    // Buscar sessoes ativas
    const sessionsResult = await pool.query(
      `SELECT id, attendant_id, client_phone, status, started_at
       FROM service_sessions
       WHERE status = 'in_progress'
       ORDER BY started_at DESC`
    );

    console.log('\n=== SESSOES IN_PROGRESS ===');
    console.log(`Total: ${sessionsResult.rows.length}\n`);

    sessionsResult.rows.forEach((session, i) => {
      const match = session.attendant_id === adminUser.id ? '✓ MATCH' : '✗ MISMATCH';
      console.log(`[${i + 1}] ${session.id}`);
      console.log(`    Attendant ID: ${session.attendant_id} ${match}`);
      console.log(`    Cliente: ${session.client_phone}`);
      console.log(`    Iniciada: ${new Date(session.started_at).toLocaleString('pt-BR')}`);
      console.log('');
    });

    // Verificar se há mismatch
    const mismatches = sessionsResult.rows.filter(s => s.attendant_id !== adminUser.id);

    if (mismatches.length > 0) {
      console.log(`\n⚠️  PROBLEMA: ${mismatches.length} sessao(es) com attendant_id diferente`);
      console.log('   Essas sessoes nao aparecem na interface do usuario logado.\n');
      console.log('   Solucao: Atualizar attendant_id das sessoes:');
      console.log(`   UPDATE service_sessions SET attendant_id = '${adminUser.id}' WHERE status = 'in_progress';\n`);
    } else {
      console.log('✓ Todas as sessoes estao atribuidas ao usuario correto.\n');
    }

  } catch (err) {
    console.error('Erro:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

checkUserSessions();
