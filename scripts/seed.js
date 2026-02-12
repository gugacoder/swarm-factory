#!/usr/bin/env node

/**
 * Script de seed — executa arquivos SQL de database/seeds/ em ordem numérica.
 *
 * Uso: node scripts/seed.js
 *
 * Requer: DATABASE_URL no .env ou variável de ambiente.
 */

import { readdir, readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { createRequire } from 'node:module';

const SEEDS_DIR = resolve(import.meta.dirname, '..', 'database', 'seeds');

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL não definida. Defina no .env ou como variável de ambiente.');
    process.exit(1);
  }

  let pg;
  try {
    const require = createRequire(import.meta.url);
    pg = require('pg');
  } catch {
    console.error('Pacote "pg" não encontrado. Execute npm install no workspace backbone.');
    process.exit(1);
  }

  let files;
  try {
    files = await readdir(SEEDS_DIR);
  } catch {
    console.log('Nenhum seed encontrado em database/seeds/');
    return;
  }

  const sqlFiles = files.filter((f) => f.endsWith('.sql')).sort();

  if (sqlFiles.length === 0) {
    console.log('Nenhum seed SQL encontrado.');
    return;
  }

  const client = new pg.Client({ connectionString: databaseUrl });
  await client.connect();
  console.log(`Conectado a ${databaseUrl.replace(/\/\/.*@/, '//***@')}`);

  try {
    for (const file of sqlFiles) {
      const sql = await readFile(join(SEEDS_DIR, file), 'utf-8');
      console.log(`Executando seed: ${file}...`);
      await client.query(sql);
      console.log(`  OK`);
    }
    console.log(`\n${sqlFiles.length} seed(s) executado(s) com sucesso.`);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error('Erro ao executar seeds:', err.message);
  process.exit(1);
});
