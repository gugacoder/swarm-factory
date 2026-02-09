-- ==============================================================================
-- SCAFFOLD - PostgreSQL Initialization (STAGING)
-- ==============================================================================
-- Executado automaticamente na criacao do container
-- Inclui dados de demonstracao para staging
--
-- Databases:
--   - main      -> Aplicacao (Portal, n8n schema)
--
-- App user: admin/Admin123
-- Demo users: manager, user / Admin123
-- ==============================================================================

-- ==============================================================================
-- EXTENSIONS (no banco main)
-- ==============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- SCHEMA: n8n (dentro de main)
-- ==============================================================================
CREATE SCHEMA IF NOT EXISTS n8n;

-- ==============================================================================
-- USERS TABLE (NextAuth.js)
-- ==============================================================================
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

-- ==============================================================================
-- USER ROLES TABLE (multi-role)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'user')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, role)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

-- ==============================================================================
-- NEXTAUTH TABLES
-- ==============================================================================
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

CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_token VARCHAR(255) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(session_token);

CREATE TABLE IF NOT EXISTS verification_tokens (
    identifier VARCHAR(255) NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires TIMESTAMPTZ NOT NULL,
    PRIMARY KEY (identifier, token)
);

-- ==============================================================================
-- COMPANY CONFIG TABLE
-- ==============================================================================
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

-- ==============================================================================
-- FUNCTIONS
-- ==============================================================================

-- Funcao para obter roles do usuario
CREATE OR REPLACE FUNCTION get_user_roles(p_user_id UUID)
RETURNS TEXT[] AS $$
BEGIN
    RETURN ARRAY(
        SELECT role FROM user_roles WHERE user_id = p_user_id
    );
END;
$$ LANGUAGE plpgsql;

-- Funcao para verificar se usuario tem role
CREATE OR REPLACE FUNCTION user_has_role(p_user_id UUID, p_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_roles WHERE user_id = p_user_id AND role = p_role
    );
END;
$$ LANGUAGE plpgsql;

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_config_updated_at
    BEFORE UPDATE ON company_config
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- SEED: Admin User (admin@mail.com / Admin123)
-- ==============================================================================
-- Hash bcrypt de "Admin123"
INSERT INTO users (id, email, password_hash, name, role, is_active)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'admin@mail.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'Administrador',
    'admin',
    TRUE
) ON CONFLICT (email) DO NOTHING;

INSERT INTO user_roles (user_id, role)
VALUES ('11111111-1111-1111-1111-111111111111', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- ==============================================================================
-- SEED: Company Config
-- ==============================================================================
INSERT INTO company_config (
    id, nome, nome_curto, slogan, email, telefone
) VALUES (
    '11111111-1111-1111-1111-111111111111',
    'Scaffold App',
    'Scaffold',
    'Preencha com o slogan',
    'contato@scaffold.example.com',
    '(00) 0000-0000'
) ON CONFLICT DO NOTHING;

-- ==============================================================================
-- STAGING DEMO USERS
-- ==============================================================================
-- Manager
INSERT INTO users (id, email, password_hash, name, role, is_active)
VALUES (
    '22222222-2222-2222-2222-222222222222',
    'manager@mail.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'Maria Manager',
    'manager',
    TRUE
) ON CONFLICT (email) DO NOTHING;

INSERT INTO user_roles (user_id, role)
VALUES ('22222222-2222-2222-2222-222222222222', 'manager')
ON CONFLICT (user_id, role) DO NOTHING;

-- User
INSERT INTO users (id, email, password_hash, name, role, is_active)
VALUES (
    '33333333-3333-3333-3333-333333333333',
    'user@mail.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'Joao User',
    'user',
    TRUE
) ON CONFLICT (email) DO NOTHING;

INSERT INTO user_roles (user_id, role)
VALUES ('33333333-3333-3333-3333-333333333333', 'user')
ON CONFLICT (user_id, role) DO NOTHING;

-- ==============================================================================
-- LOG
-- ==============================================================================
DO $$
BEGIN
    RAISE NOTICE '============================================';
    RAISE NOTICE 'PostgreSQL initialized successfully! (STAGING)';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Databases: main';
    RAISE NOTICE 'Schemas: public, n8n';
    RAISE NOTICE '';
    RAISE NOTICE 'Users:';
    RAISE NOTICE '  - admin@mail.com (admin)';
    RAISE NOTICE '  - manager@mail.com (manager)';
    RAISE NOTICE '  - user@mail.com (user)';
    RAISE NOTICE '';
    RAISE NOTICE 'Password: Admin123';
    RAISE NOTICE '============================================';
END $$;
