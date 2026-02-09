/**
 * Script de hotfix do banco de dados
 * Executa scripts de manutencao pontuais
 *
 * Uso: npm run migrate:hotfix 001
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const HOTFIX_DIR = path.join(__dirname, '..', 'database', 'migrations', 'hotfix');

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

async function runHotfix() {
  const hotfixId = process.argv[2];

  if (!hotfixId) {
    console.log(`${colors.yellow}Uso: npm run migrate:hotfix <id>${colors.reset}`);
    console.log(`Exemplo: npm run migrate:hotfix 001`);
    console.log('');
    listAvailableHotfixes();
    process.exit(1);
  }

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error(`${colors.red}${colors.bold}ERROR: DATABASE_URL não definida${colors.reset}`);
    process.exit(1);
  }

  // Encontrar pasta do hotfix
  const hotfixFolder = findHotfixFolder(hotfixId);

  if (!hotfixFolder) {
    console.error(`${colors.red}ERROR: Hotfix ${hotfixId} não encontrado${colors.reset}`);
    console.error('');
    listAvailableHotfixes();
    process.exit(1);
  }

  const hotfixPath = path.join(HOTFIX_DIR, hotfixFolder);

  // Listar scripts SQL em ordem
  const scripts = fs.readdirSync(hotfixPath)
    .filter(f => f.endsWith('.sql'))
    .sort();

  if (scripts.length === 0) {
    console.error(`${colors.red}ERROR: Nenhum script SQL encontrado em ${hotfixFolder}${colors.reset}`);
    process.exit(1);
  }

  console.log(`\n${colors.bold}=== HOTFIX ${hotfixId}: ${hotfixFolder} ===${colors.reset}\n`);

  // Mostrar README se existir
  const readmePath = path.join(hotfixPath, 'README.md');
  if (fs.existsSync(readmePath)) {
    const readme = fs.readFileSync(readmePath, 'utf8');
    const problemSection = readme.match(/## Problema\n\n([\s\S]*?)(?=\n##|$)/);
    if (problemSection) {
      console.log('Problema:', problemSection[1].trim());
      console.log('');
    }
  }

  console.log(`Scripts a executar: ${scripts.length}`);
  scripts.forEach(s => console.log(`  - ${s}`));
  console.log('');

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
      console.log(`  ${colors.bold}docker compose -f docker-compose.dev.yml up -d${colors.reset}`);
      console.log('');
      process.exit(1);
    }

    console.log(`${colors.green}✓ Conexão estabelecida${colors.reset}\n`);

    // ========================================
    // EXECUTAR SCRIPTS
    // ========================================
    let hasErrors = false;

    for (const script of scripts) {
      const scriptPath = path.join(hotfixPath, script);
      const sql = fs.readFileSync(scriptPath, 'utf8');

      process.stdout.write(`Executando ${script}... `);

      try {
        await pool.query(sql);
        console.log(`${colors.green}OK${colors.reset}`);
      } catch (err) {
        // Erros esperados (ja existe, nao existe, etc)
        if (err.code === '42P07' || err.code === '42710' || err.code === '42P01') {
          console.log(`${colors.yellow}SKIP${colors.reset} (estado já correto)`);
        } else {
          console.log(`${colors.red}${colors.bold}FAIL${colors.reset}`);
          hasErrors = true;
        }
      }
    }

    console.log('');

    // ========================================
    // RESULTADO FINAL
    // ========================================
    if (hasErrors) {
      if (isDev) {
        console.log(`${colors.yellow}⚠️  Alguns scripts falharam (modo dev - não bloqueante)${colors.reset}`);
        console.log('');
        process.exit(0);
      } else {
        console.log(`${colors.red}${colors.bold}✗ Hotfix falhou${colors.reset}`);
        console.log('');
        process.exit(1);
      }
    } else {
      console.log(`${colors.green}${colors.bold}✓ Hotfix concluído com sucesso!${colors.reset}`);
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

function findHotfixFolder(id) {
  if (!fs.existsSync(HOTFIX_DIR)) return null;

  const folders = fs.readdirSync(HOTFIX_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  // Busca exata ou por prefixo
  return folders.find(f => f === id || f.startsWith(`${id}_`));
}

function listAvailableHotfixes() {
  if (!fs.existsSync(HOTFIX_DIR)) {
    console.log('Nenhum hotfix disponivel.');
    return;
  }

  const folders = fs.readdirSync(HOTFIX_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)
    .sort();

  if (folders.length === 0) {
    console.log('Nenhum hotfix disponivel.');
    return;
  }

  console.log('Hotfixes disponiveis:');
  folders.forEach(f => {
    const id = f.split('_')[0];
    console.log(`  ${id} - ${f}`);
  });
}

runHotfix();
