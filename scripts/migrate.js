#!/usr/bin/env node

/**
 * Script de migration — executa arquivos SQL em ordem numérica contra PostgreSQL.
 *
 * Uso: node scripts/migrate.js
 *
 * Requer: DATABASE_URL no .env ou variável de ambiente.
 */

import { readdir, readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { createRequire } from 'node:module';

const MIGRATIONS_DIR = resolve(import.meta.dirname, '..', 'database', 'migrations');

async function main() {
  // Carregar DATABASE_URL
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL não definida. Defina no .env ou como variável de ambiente.');
    process.exit(1);
  }

  // Importar pg dinamicamente (instalado no backbone)
  let pg;
  try {
    const require = createRequire(import.meta.url);
    pg = require('pg');
  } catch {
    console.error('Pacote "pg" não encontrado. Execute npm install no workspace backbone.');
    process.exit(1);
  }

  // Listar migrations
  let files;
  try {
    files = await readdir(MIGRATIONS_DIR);
  } catch {
    console.log('Nenhuma migration encontrada em database/migrations/');
    return;
  }

  const sqlFiles = files.filter((f) => f.endsWith('.sql')).sort();

  if (sqlFiles.length === 0) {
    console.log('Nenhuma migration SQL encontrada.');
    return;
  }

  // Conectar
  const client = new pg.Client({ connectionString: databaseUrl });
  await client.connect();
  console.log(`Conectado a ${databaseUrl.replace(/\/\/.*@/, '//***@')}`);

  try {
    for (const file of sqlFiles) {
      const sql = await readFile(join(MIGRATIONS_DIR, file), 'utf-8');
      console.log(`Executando: ${file}...`);
      await client.query(sql);
      console.log(`  OK`);
    }
    console.log(`\n${sqlFiles.length} migration(s) executada(s) com sucesso.`);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error('Erro ao executar migrations:', err.message);
  process.exit(1);
});
