#!/usr/bin/env node
/**
 * PostgreSQL Initialization Script
 *
 * Garante que o banco esta no estado correto independente do estado anterior.
 * - Cria databases se nao existirem
 * - Cria schemas se nao existirem
 * - Cria extensoes necessarias
 * - Executa migrations em ordem (database/migrations/*.sql)
 * - Executa seed basico
 * - Se ENVIRONMENT=staging, executa seed completo de demonstracao
 *
 * Uso: node init-postgres.mjs
 *
 * Env vars:
 *   POSTGRES_HOST (default: postgres.internal)
 *   POSTGRES_COMMON_PORT (default: 5432)
 *   POSTGRES_USER (default: admin)
 *   POSTGRES_PASSWORD (default: Admin123)
 *   ENVIRONMENT (default: development) - se "staging", carrega demo data
 */

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = {
  host: process.env.POSTGRES_HOST || 'postgres.internal',
  port: parseInt(process.env.POSTGRES_COMMON_PORT || '5432'),
  // Superuser padrão do PostgreSQL para bootstrap
  superuser: 'postgres',
  superuserPassword: process.env.POSTGRES_PASSWORD || 'Admin123',
  // Usuário do sistema (será criado pelo script)
  user: process.env.POSTGRES_USER || 'admin',
  password: process.env.POSTGRES_PASSWORD || 'Admin123',
  environment: process.env.ENVIRONMENT || 'development',
};

const DATABASES = ['main'];
const SCHEMAS = { main: ['public', 'n8n'] };
const EXTENSIONS = ['uuid-ossp', 'pgcrypto'];

// SQL para criar tabelas
const TABLES_SQL = `
-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified TIMESTAMPTZ,
    password_hash VARCHAR(255),
    name VARCHAR(255),
    image TEXT,
    role VARCHAR(50) DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    must_change_password BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);

-- User roles table (multi-role)
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'user')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, role)
);
CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

-- Accounts table
CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(255) NOT NULL,
    provider VARCHAR(255) NOT NULL,
    provider_account_id VARCHAR(255) NOT NULL,
    refresh_token TEXT,
    access_token TEXT,
    expires_at BIGINT,
    token_type VARCHAR(255),
    scope TEXT,
    id_token TEXT,
    session_state TEXT,
    UNIQUE(provider, provider_account_id)
);
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_token VARCHAR(255) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(session_token);

-- Verification tokens table
CREATE TABLE IF NOT EXISTS verification_tokens (
    identifier VARCHAR(255) NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires TIMESTAMPTZ NOT NULL,
    PRIMARY KEY (identifier, token)
);

-- Company config table
CREATE TABLE IF NOT EXISTS company_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(200) NOT NULL,
    nome_curto VARCHAR(50),
    slogan VARCHAR(200),
    logo_url VARCHAR(500),
    email VARCHAR(200),
    telefone VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_company_config_nome ON company_config(nome_curto);

-- Functions
CREATE OR REPLACE FUNCTION get_user_roles(p_user_id UUID)
RETURNS TEXT[] AS $$
BEGIN
    RETURN ARRAY(SELECT role FROM user_roles WHERE user_id = p_user_id);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION user_has_role(p_user_id UUID, p_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (SELECT 1 FROM user_roles WHERE user_id = p_user_id AND role = p_role);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers (drop first to avoid duplicates)
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_company_config_updated_at ON company_config;
CREATE TRIGGER update_company_config_updated_at
    BEFORE UPDATE ON company_config
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
`;

// Seed basico (usuarios de teste + company config)
// Hash bcrypt de "12345678"
const BCRYPT_HASH = '$2b$10$KBRyeq41bzUNMZMF99yoSuoGV28d0DJPkgOPBabNj4d0D.WxUdYhG';

const SEED_SQL = `
-- Admin user
INSERT INTO users (id, email, password_hash, name, role, is_active)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'admin@mail.com',
    '${BCRYPT_HASH}',
    'Admin',
    'admin',
    TRUE
) ON CONFLICT (email) DO NOTHING;

INSERT INTO user_roles (user_id, role)
VALUES ('11111111-1111-1111-1111-111111111111', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Manager user
INSERT INTO users (id, email, password_hash, name, role, is_active)
VALUES (
    '22222222-2222-2222-2222-222222222222',
    'manager@mail.com',
    '${BCRYPT_HASH}',
    'Manager',
    'manager',
    TRUE
) ON CONFLICT (email) DO NOTHING;

INSERT INTO user_roles (user_id, role)
VALUES ('22222222-2222-2222-2222-222222222222', 'manager')
ON CONFLICT (user_id, role) DO NOTHING;

-- Regular user
INSERT INTO users (id, email, password_hash, name, role, is_active)
VALUES (
    '33333333-3333-3333-3333-333333333333',
    'user@mail.com',
    '${BCRYPT_HASH}',
    'User',
    'user',
    TRUE
) ON CONFLICT (email) DO NOTHING;

INSERT INTO user_roles (user_id, role)
VALUES ('33333333-3333-3333-3333-333333333333', 'user')
ON CONFLICT (user_id, role) DO NOTHING;

-- Company config
INSERT INTO company_config (
    id, nome, nome_curto, slogan, email, telefone
) VALUES (
    '11111111-1111-1111-1111-111111111111',
    'App',
    'App',
    '',
    'contato@example.com',
    '(00) 0000-0000'
) ON CONFLICT DO NOTHING;
`;

async function connect(database = 'postgres', asSuperuser = false) {
  const client = new pg.Client({
    host: config.host,
    port: config.port,
    user: asSuperuser ? config.superuser : config.user,
    password: asSuperuser ? config.superuserPassword : config.password,
    database,
  });
  await client.connect();
  return client;
}

async function executeSqlFile(client, filePath) {
  const sql = fs.readFileSync(filePath, 'utf8');
  await client.query(sql);
}

async function databaseExists(client, dbname) {
  const result = await client.query(
    `SELECT 1 FROM pg_database WHERE datname = $1`,
    [dbname]
  );
  return result.rows.length > 0;
}

async function schemaExists(client, schemaName) {
  const result = await client.query(
    `SELECT 1 FROM information_schema.schemata WHERE schema_name = $1`,
    [schemaName]
  );
  return result.rows.length > 0;
}

async function extensionExists(client, extName) {
  const result = await client.query(
    `SELECT 1 FROM pg_extension WHERE extname = $1`,
    [extName]
  );
  return result.rows.length > 0;
}

async function tableExists(client, tableName) {
  const result = await client.query(
    `SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1`,
    [tableName]
  );
  return result.rows.length > 0;
}

async function waitForPostgres(maxAttempts = 30) {
  console.log(`Aguardando PostgreSQL em ${config.host}:${config.port}...`);

  for (let i = 0; i < maxAttempts; i++) {
    try {
      const client = await connect('postgres', true); // conecta como superuser
      await client.end();
      console.log('PostgreSQL esta pronto!');
      return true;
    } catch (e) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      process.stdout.write('.');
    }
  }

  console.error('\nPostgreSQL nao ficou pronto a tempo');
  return false;
}

async function main() {
  console.log('='.repeat(50));
  console.log('  PostgreSQL Initialization');
  console.log('='.repeat(50));
  console.log(`\nHost: ${config.host}:${config.port}`);
  console.log(`User: ${config.user}`);
  console.log(`Environment: ${config.environment}\n`);

  // Aguardar PostgreSQL
  const ready = await waitForPostgres();
  if (!ready) {
    process.exit(1);
  }

  let client;

  try {
    // Criar usuário admin como superuser (conecta como postgres)
    console.log('\n[1/6] Creating admin user...');
    client = await connect('postgres', true); // superuser

    const userExists = await client.query(
      `SELECT 1 FROM pg_roles WHERE rolname = $1`,
      [config.user]
    );

    if (userExists.rows.length > 0) {
      console.log(`      User "${config.user}": exists`);
      // Atualiza senha caso tenha mudado
      await client.query(`ALTER USER "${config.user}" WITH PASSWORD '${config.password}'`);
    } else {
      await client.query(`
        CREATE USER "${config.user}" WITH
          PASSWORD '${config.password}'
          SUPERUSER
          CREATEDB
          CREATEROLE
          LOGIN
      `);
      console.log(`      User "${config.user}": created (superuser)`);
    }

    await client.end();

    // Criar databases (conecta como superuser)
    console.log('\n[2/6] Checking databases...');
    client = await connect('postgres', true);

    for (const dbname of DATABASES) {
      process.stdout.write(`      ${dbname}: `);
      if (await databaseExists(client, dbname)) {
        console.log('exists');
      } else {
        await client.query(`CREATE DATABASE "${dbname}" OWNER "${config.user}"`);
        console.log('created');
      }
      // Garante ownership
      await client.query(`ALTER DATABASE "${dbname}" OWNER TO "${config.user}"`);
    }

    await client.end();

    // Criar extensoes em cada database (como admin, que agora é superuser)
    console.log('\n[3/6] Creating extensions...');
    for (const dbname of DATABASES) {
      console.log(`      Database: ${dbname}`);
      client = await connect(dbname);

      for (const ext of EXTENSIONS) {
        process.stdout.write(`        ${ext}: `);
        if (await extensionExists(client, ext)) {
          console.log('exists');
        } else {
          await client.query(`CREATE EXTENSION IF NOT EXISTS "${ext}"`);
          console.log('created');
        }
      }

      await client.end();
    }

    // Criar schemas
    console.log('\n[4/6] Creating schemas...');
    for (const [dbname, schemas] of Object.entries(SCHEMAS)) {
      console.log(`      Database: ${dbname}`);
      client = await connect(dbname);

      for (const schema of schemas) {
        if (schema === 'public') continue;

        process.stdout.write(`        ${schema}: `);
        if (await schemaExists(client, schema)) {
          console.log('exists');
        } else {
          await client.query(`CREATE SCHEMA "${schema}"`);
          console.log('created');
        }
      }

      await client.end();
    }

    // Executar migrations
    console.log('\n[5/6] Running migrations...');
    client = await connect('main');

    const migrationsDir = path.join(__dirname, 'migrations');
    if (fs.existsSync(migrationsDir)) {
      const files = fs.readdirSync(migrationsDir)
        .filter(f => f.endsWith('.sql'))
        .sort();

      for (const file of files) {
        process.stdout.write(`      ${file}... `);
        try {
          await executeSqlFile(client, path.join(migrationsDir, file));
          console.log('ok');
        } catch (err) {
          // Ignorar erros de objetos duplicados (migration ja executada)
          if (err.code === '42P07' || err.code === '42710' || err.code === '23505') {
            console.log('skipped (already exists)');
          } else {
            console.log(`error: ${err.message}`);
          }
        }
      }
    } else {
      // Fallback: criar tabelas inline se migrations nao existirem
      console.log('      Migrations dir not found, using inline SQL...');
      if (!(await tableExists(client, 'users'))) {
        await client.query(TABLES_SQL);
        console.log('      Base tables created');
      }
    }

    await client.end();

    // [6/6] Running seeds
    console.log('\n[6/6] Running seeds...');
    client = await connect('main');

    // Seed inline (bootstrap minimo - usuarios base)
    console.log('      Running base seed...');
    await client.query(SEED_SQL);
    console.log('      Base seed complete');

    // Seed files universais (database/seeds/*.sql)
    const seedsDir = path.join(__dirname, 'seeds');
    if (fs.existsSync(seedsDir)) {
      const seedFiles = fs.readdirSync(seedsDir)
        .filter(f => f.endsWith('.sql'))
        .sort();

      for (const file of seedFiles) {
        process.stdout.write(`      ${file}... `);
        try {
          await executeSqlFile(client, path.join(seedsDir, file));
          console.log('ok');
        } catch (err) {
          if (err.code === '42P07' || err.code === '42710' || err.code === '23505') {
            console.log('skipped (already exists)');
          } else {
            console.log(`error: ${err.message}`);
          }
        }
      }
    }

    // Seed files de demo (apenas em development)
    if (config.environment === 'development') {
      const stagingSeedsDir = path.join(__dirname, 'seeds-staging');
      if (fs.existsSync(stagingSeedsDir)) {
        console.log('      Running demo seeds...');
        const stagingFiles = fs.readdirSync(stagingSeedsDir)
          .filter(f => f.endsWith('.sql'))
          .sort();

        for (const file of stagingFiles) {
          process.stdout.write(`      ${file}... `);
          try {
            await executeSqlFile(client, path.join(stagingSeedsDir, file));
            console.log('ok');
          } catch (err) {
            if (err.code === '42P07' || err.code === '42710' || err.code === '23505') {
              console.log('skipped (already exists)');
            } else {
              console.log(`error: ${err.message}`);
            }
          }
        }
      }
    }

    await client.end();

    console.log('\n' + '='.repeat(50));
    console.log('  PostgreSQL initialized successfully!');
    console.log('='.repeat(50));
    console.log(`\nDatabases: ${DATABASES.join(', ')}`);
    console.log(`Schemas: ${Object.values(SCHEMAS).flat().join(', ')}`);
    console.log(`Environment: ${config.environment}`);

    console.log('\nUsers:');
    console.log('  - admin@mail.com (admin)');
    console.log('  - manager@mail.com (manager)');
    console.log('  - user@mail.com (user)');

    console.log('\nPassword: 12345678');

    console.log('');

  } catch (err) {
    console.error(`\nError: ${err.message}`);
    process.exit(1);
  }
}

main();
