/**
 * Script de seed do banco de dados
 * Aplica todos os seeds em ordem numérica (idempotente)
 *
 * Seeds usam INSERT ... ON CONFLICT para serem seguros de re-executar.
 *
 * Uso: npm run migrate:seed
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const SEEDS_DIR = path.join(__dirname, '..', 'database', 'seeds');
const SEEDS_STAGING_DIR = path.join(__dirname, '..', 'database', 'seeds-staging');

// Flag --demo força execução de seeds de demo independente do ambiente
const forceDemo = process.argv.includes('--demo');

// Cores ANSI
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  bgRed: '\x1b[41m\x1b[37m',
};

const isDev = process.env.NODE_ENV === 'development';

async function testConnection(pool) {
  try {
    await pool.query('SELECT 1');
    return true;
  } catch (err) {
    return false;
  }
}

function buildDatabaseUrl() {
  const host = process.env.POSTGRES_HOST || 'localhost';
  const port = process.env.EXPORT_POSTGRES_PORT || process.env.POSTGRES_PORT || '5432';
  const user = process.env.POSTGRES_USER || process.env.SYSUSER || 'admin';
  const pass = process.env.POSTGRES_PASSWORD || process.env.SYSPASS || 'Admin123';
  const db = process.env.POSTGRES_DB_MAIN || 'main';
  return `postgres://${user}:${pass}@${host}:${port}/${db}`;
}

async function seed() {
  const databaseUrl = buildDatabaseUrl();

  const pool = new Pool({
    connectionString: databaseUrl,
    connectionTimeoutMillis: 5000,
  });

  try {
    // ========================================
    // TESTE DE CONEXÃO
    // ========================================
    console.log('Testando conexão com o banco...');

    const connected = await testConnection(pool);

    if (!connected) {
      console.log('');
      console.log(`${colors.bgRed}                                                  ${colors.reset}`);
      console.log(`${colors.bgRed}  ⚠️  BASE DE DADOS FORA DO AR                    ${colors.reset}`);
      console.log(`${colors.bgRed}                                                  ${colors.reset}`);
      console.log('');
      console.log(`${colors.yellow}Verifique se o Docker está rodando:${colors.reset}`);
      console.log(`  ${colors.bold}npm run platform:up${colors.reset}`);
      console.log('');
      process.exit(1);
    }

    console.log(`${colors.green}✓ Conexão estabelecida${colors.reset}\n`);

    // ========================================
    // VERIFICAR DIRETÓRIO
    // ========================================
    if (!fs.existsSync(SEEDS_DIR)) {
      console.log(`${colors.yellow}Diretório de seeds não encontrado: ${SEEDS_DIR}${colors.reset}`);
      process.exit(0);
    }

    // ========================================
    // LISTAR E APLICAR SEEDS
    // ========================================
    const files = fs.readdirSync(SEEDS_DIR)
      .filter(f => f.endsWith('.sql'))
      .sort();

    console.log(`Encontrados ${files.length} seeds\n`);

    let hasErrors = false;

    for (const file of files) {
      const filePath = path.join(SEEDS_DIR, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      process.stdout.write(`Aplicando ${file}... `);

      try {
        await pool.query(sql);
        console.log(`${colors.green}OK${colors.reset}`);
      } catch (err) {
        // Ignorar erros de "já existe" / conflito de unique
        if (err.code === '23505' || err.code === '42P07' || err.code === '42710') {
          console.log(`${colors.yellow}SKIP${colors.reset} (já existe)`);
        } else {
          console.log(`${colors.red}${colors.bold}FAIL${colors.reset}`);
          console.log(`  ${colors.red}${err.message}${colors.reset}`);
          hasErrors = true;
        }
      }
    }

    // ========================================
    // SEEDS DEMO (development ou --demo flag)
    // ========================================
    if ((forceDemo || process.env.NODE_ENV === 'development') && fs.existsSync(SEEDS_STAGING_DIR)) {
      const stagingFiles = fs.readdirSync(SEEDS_STAGING_DIR)
        .filter(f => f.endsWith('.sql'))
        .sort();

      if (stagingFiles.length > 0) {
        console.log(`\nEncontrados ${stagingFiles.length} seeds demo\n`);

        for (const file of stagingFiles) {
          const filePath = path.join(SEEDS_STAGING_DIR, file);
          const sql = fs.readFileSync(filePath, 'utf8');

          process.stdout.write(`Aplicando ${file}... `);

          try {
            await pool.query(sql);
            console.log(`${colors.green}OK${colors.reset}`);
          } catch (err) {
            if (err.code === '23505' || err.code === '42P07' || err.code === '42710') {
              console.log(`${colors.yellow}SKIP${colors.reset} (já existe)`);
            } else {
              console.log(`${colors.red}${colors.bold}FAIL${colors.reset}`);
              console.log(`  ${colors.red}${err.message}${colors.reset}`);
              hasErrors = true;
            }
          }
        }
      }
    }

    console.log('');

    // ========================================
    // RESULTADO FINAL
    // ========================================
    if (hasErrors) {
      if (isDev) {
        console.log(`${colors.yellow}⚠️  Alguns seeds falharam (modo dev - não bloqueante)${colors.reset}`);
        console.log('');
        process.exit(0);
      } else {
        console.log(`${colors.red}${colors.bold}✗ Seeds falharam${colors.reset}`);
        console.log('');
        process.exit(1);
      }
    } else {
      console.log(`${colors.green}${colors.bold}✓ Seeds concluídos com sucesso!${colors.reset}`);
      console.log('');
      process.exit(0);
    }
  } catch (err) {
    console.log('');
    console.log(`${colors.red}${colors.bold}Erro inesperado:${colors.reset} ${err.message}`);
    console.log('');
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
