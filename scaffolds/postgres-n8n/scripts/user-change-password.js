/**
 * Script para alterar senha de usuario
 *
 * Uso: npm run user:change-password <email> <nova-senha>
 */

const { Pool } = require('pg');

async function changePassword() {
  const email = process.argv[2];
  const newPassword = process.argv[3];

  if (!email || !newPassword) {
    console.error('Uso: npm run user:change-password <email> <nova-senha>');
    console.error('Exemplo: npm run user:change-password admin@mail.com 12345678');
    process.exit(1);
  }

  if (newPassword.length < 6) {
    console.error('Erro: senha deve ter no minimo 6 caracteres');
    process.exit(1);
  }

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('ERROR: DATABASE_URL nao definida');
    process.exit(1);
  }

  // bcryptjs precisa ser resolvido do portal (workspace)
  let bcrypt;
  try {
    bcrypt = require('bcryptjs');
  } catch {
    console.error('ERROR: bcryptjs nao encontrado. Instale com: npm install bcryptjs --save-dev');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: databaseUrl });

  try {
    // Buscar usuario
    const userResult = await pool.query(
      'SELECT id, email, name, role FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      console.error(`\nUsuario nao encontrado: ${email}\n`);

      // Listar usuarios disponiveis
      const allUsers = await pool.query(
        'SELECT email, name, role FROM users ORDER BY role, name'
      );

      if (allUsers.rows.length > 0) {
        console.log('Usuarios disponiveis:');
        allUsers.rows.forEach((u) => {
          console.log(`  - ${u.email} (${u.name} | ${u.role})`);
        });
        console.log('');
      }

      process.exit(1);
    }

    const user = userResult.rows[0];

    // Gerar hash
    const hash = await bcrypt.hash(newPassword, 10);

    // Atualizar senha
    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [hash, user.id]
    );

    console.log(`\nSenha alterada com sucesso!`);
    console.log(`  Usuario: ${user.name} (${user.email})`);
    console.log(`  Role: ${user.role}`);
    console.log('');
  } catch (err) {
    console.error('Erro ao alterar senha:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

changePassword();
