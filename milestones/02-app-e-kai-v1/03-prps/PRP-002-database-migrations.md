# PRP-002 — Database Migrations e Seeds

## Objetivo

Criar todas as migrations SQL e seed do usuario admin para o banco E-Kai.

## Execution Mode

`implementar`

## Contexto

O PRP-001 criou a estrutura base com PostgreSQL 16 rodando via Docker (porta 9032, banco `ekai`). O script `scripts/migrate.js` executa arquivos SQL em ordem numerica. O modelo de dados esta definido em `er.md` com 9 entidades + 1 tabela de onboarding. O scaffold usa o padrao: UUID PKs com `gen_random_uuid()`, `TIMESTAMPTZ` para datas, triggers de `updated_at`, migrations idempotentes com `IF NOT EXISTS`.

## Especificacao

### Migrations (database/migrations/)

Criar os arquivos SQL na ordem abaixo. Cada migration deve ser idempotente (`CREATE TABLE IF NOT EXISTS`, `DO $$ ... IF NOT EXISTS ... $$`).

**001_extensions.sql**
- Ativar extensoes `uuid-ossp` e `pgcrypto`

**002_enums.sql**
- Criar enums conforme `er.md` secao Enums: `user_role`, `message_role`, `tool_call_status`, `notification_type`
- Usar `DO $$ ... IF NOT EXISTS ... $$` para idempotencia de enums

**003_users.sql**
- Tabela `users` conforme `er.md` secao users
- Trigger `set_updated_at` (criar a function se nao existir)

**004_refresh_tokens.sql**
- Tabela `refresh_tokens` conforme `er.md`
- Indices: `idx_refresh_tokens_user_active` (parcial), `idx_refresh_tokens_jti` (unique)

**005_kai_conversations.sql**
- Tabela `kai_conversations` conforme `er.md`
- Trigger `set_updated_at`
- Indice `idx_kai_conversations_user_updated`

**006_kai_messages.sql**
- Tabela `kai_messages` conforme `er.md`
- Indice `idx_kai_messages_conversation_created`

**007_kai_tool_calls.sql**
- Tabela `kai_tool_calls` conforme `er.md`
- Indice `idx_kai_tool_calls_message`

**008_kai_executions.sql**
- Tabela `kai_executions` conforme `er.md`
- Indice `idx_kai_executions_conversation`

**009_notifications.sql**
- Tabela `notifications` conforme `er.md`
- Indice `idx_notifications_user_unread` (parcial)

**010_notification_preferences.sql**
- Tabela `notification_preferences` conforme `er.md`
- Trigger `set_updated_at`
- Constraint UNIQUE(user_id, type)

**011_system_settings.sql**
- Tabela `system_settings` conforme `er.md`
- Trigger `set_updated_at`
- Indice `idx_system_settings_user_key` (unique)

**012_onboarding_progress.sql**
- Tabela `onboarding_progress` conforme `onboarding.md` secao 6
- Indice `idx_onboarding_progress_user`

### Seeds (database/seeds/)

**001_admin_user.sql**
- Inserir usuario admin com email `admin@mail.com`, senha `12345678` (hash bcrypt cost 12), role `admin`, active true
- Usar `ON CONFLICT (email) DO NOTHING` para idempotencia

### Verificacao

`npm run migrate` executa todas as migrations sem erro. `npm run migrate:seed` insere o admin. Tabelas e indices verificaveis via `\dt` e `\di` no psql.

## Limites

- Nao criar tabelas que nao estejam no er.md ou onboarding.md
- Nao alterar o script migrate.js do PRP-001 (apenas criar os arquivos SQL)
- Nao usar ORMs — SQL puro
- Nao criar seeds de dados demo (apenas o admin)
