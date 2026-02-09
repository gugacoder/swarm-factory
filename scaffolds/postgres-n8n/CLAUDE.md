# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Sobre o Projeto

**PontoFacil** — Sistema de cartão de ponto inteligente para gestão de entregas e motoboys. Monorepo com portal (Next.js), backbone (LangGraph agents), banco PostgreSQL, e infraestrutura Docker.

- Tenant fixo: `11111111-1111-1111-1111-111111111111`
- Staging: `h.pontofacil.chega.la`
- Idioma do projeto: pt-BR (commits, docs, mensagens)

## Comandos Essenciais

### Desenvolvimento
```bash
npm run dev:all          # Sobe portal (9000) + backbone (9090) juntos
npm run dev:portal       # Só o frontend (Next.js na porta 9000)
npm run dev:backbone     # Só o backend (LangGraph na porta 9090)
```

### Infraestrutura (Docker)
```bash
npm run platform:up      # Sobe PostgreSQL + n8n (serviços de plataforma com portas dev)
npm run platform:down    # Derruba plataforma
npm run docker:up        # Stack completa (app + backbone + caddy + plataforma)
npm run docker:down      # Derruba stack completa
npm run docker:logs      # Logs de todos os containers
```

### Database
```bash
npm run migrate          # Aplica migrations + seeds
npm run migrate:main     # Só migrations (sem seeds)
npm run migrate:seed     # Só seeds
npm run migrate:seed:demo  # Seeds + dados de demonstração (staging)
npm run migrate:hotfix   # Migrations de hotfix emergencial
```

### Utilitários
```bash
npm run user:change-password   # Resetar senha de usuário
npm run session:query          # Consultar sessões
npm run session:messages       # Ver mensagens de sessão
npm run session:stats          # Estatísticas de sessões
npm run build:all              # Build portal + backbone
```

## Arquitetura

```
gestao-pessoas/
├── portal/              # Frontend Next.js (workspace) — porta 9000
├── backbone/            # Backend LangGraph agents (workspace) — porta 9090
├── database/
│   ├── migrations/      # 63 arquivos SQL ordenados (001_users.sql ... 063_*.sql)
│   ├── seeds/           # Dados base (admin, empresa, templates)
│   └── seeds-staging/   # Dados demo para staging
├── scripts/             # Utilitários Node.js (migrate, session-query, etc.)
├── docker/              # Dockerfiles e configs (caddy, postgres-init)
├── .planning/           # Specs, PRPs e referências por onda de desenvolvimento
│   ├── .template/       # Templates de referência
│   ├── .what-is/        # Docs do agent harness
│   └── 01-mvp-cartao-de-ponto/  # MVP atual
└── .claude/             # Commands e skills do Claude Code
```

### Fluxo de Requisições (Produção)
```
Caddy (reverse proxy)
├── /api/backbone/*  → backbone:9090
├── /workflows/*     → n8n:5678
└── /*               → portal:9000
```

### Serviços de Plataforma (Docker)
| Serviço   | Porta interna | Porta dev | Descrição                    |
|-----------|---------------|-----------|------------------------------|
| PostgreSQL| 5432          | 9032      | Banco principal (`main`)     |
| n8n       | 5678          | 9070      | Workflows auxiliares         |
| Redis     | 6379          | 9079      | Cache/sessões                |
| Evolution | 8080          | 9080      | Integração WhatsApp          |
| Whisper   | 8000          | 9095      | Transcrição de áudio         |

### Ambiente Dev Local
- Portal e backbone rodam direto na máquina (`npm run dev:all`)
- Serviços de plataforma rodam via Docker (`npm run platform:up`)
- Hosts apontam para `localhost` (override no `.env`)
- `host.docker.internal` para containers acessarem serviços do host

## Database

- PostgreSQL 16 com extensões `uuid-ossp` e `pgcrypto`
- UUIDs como chave primária em todas as tabelas
- Migrations SQL numeradas e idempotentes (`IF NOT EXISTS`)
- Triggers automáticos para `updated_at`
- Audit trail via tabelas `state_transitions` e `delivery_field_changes`
- Schema `n8n` separado no mesmo banco `main`
- Roles: admin, gestor, atendente, motoboy (multi-role por usuário)

## Convenções

### Commits (Conventional Commits em pt-BR)
```
<tipo>(<escopo>): <resumo direto da mudança>
```
Tipos: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`
Escopos: `system`, `commands`, `blueprint`, `template`, `domain`, `feature`, `task`, `deps`

Use `/git-commit` para commits temáticos agrupados automaticamente.

### Naming (Database)
- Tabelas: `snake_case`, plural (`users`, `deliveries`)
- Colunas: `snake_case` (`created_at`, `updated_at`)
- Índices: `idx_tabela_coluna`
- Triggers: `trigger_tabela_acao`
- Enums: lowercase (`delivery_status`, `conversation_state`)

### Código
- ES Modules (`.mjs` para scripts Node.js)
- Zod para validação de schemas (nos agents)
- Async/await
- Variáveis de ambiente via `dotenv-cli`

## Agent Harness (Sessões Longas)

O projeto usa um sistema de agent harness para desenvolvimento incremental:
- `/vibe:initialize <onda>` — Inicializa harness para uma onda de desenvolvimento
- `/vibe:code` — Sessão de coding incremental (uma feature por sessão)
- `features.json` — Tracking de features (status: failing → passing)
- `agent-progress.txt` — Progresso acumulado entre sessões
- `.planning/<onda>/` — Specs, PRPs e referências da onda

## Setup Inicial

1. Copiar `.env.example` para `.env` e preencher secrets marcados com `<[dado sensível]>`
2. `npm install`
3. `npm run platform:up` (sobe PostgreSQL e n8n via Docker)
4. `npm run migrate` (aplica schema e seeds)
5. `npm run dev:all` (inicia portal + backbone)
