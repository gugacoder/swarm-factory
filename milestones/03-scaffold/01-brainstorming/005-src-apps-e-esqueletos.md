# SRC — Apps e Esqueletos

## Ideia central

SRC sao os apps do usuario — codigo-fonte que roda fora do Docker em dev e dentro do Docker em staging/prod. Cada SRC e um projeto pre-configurado ("scaffold") que se encaixa no ecossistema Docker + Caddy sem configuracao manual.

## Dualidade dev/prod

- **Dev**: SRC roda no host (hot reload). Acessa servicos PLAT via portas publicas (`localhost:XXYY`). Containers acessam SRC via `host.docker.internal`.
- **Prod/Staging**: SRC embarcado em container Docker. Acessa servicos via rede interna (`*.internal`). Caddy roteia tudo numa porta so.

## Regra de ouro do .env

**Toda porta acessada pelo SRC deve ser mapeada DUAS vezes no .env:**

1. Na secao ROTEAMENTO — valor Docker interno (porta real do container)
2. Na secao DEV OVERRIDES — valor publico com prefixo (`${PORT_PREFIX}YY`)

Isso garante que URLs compostas (`DATABASE_URL`, `REDIS_URL`, etc.) resolvem automaticamente em qualquer ambiente sem trocar nada.

## Backport (webhooks Docker→Host)

Servicos dentro do Docker que precisam chamar SRC no host (ex: Evolution webhook) usam:

```
BACKBONE_BACKPORT=host.docker.internal
BACKBONE_WEBHOOK_URL=http://${BACKBONE_BACKPORT}:${BACKBONE_PORT}/webhook/message-received
```

Em prod, `BACKBONE_BACKPORT` vira `backbone.internal` (removido pelo DEV OVERRIDES comentado).

## Slots de porta SRC (XX00–XX09)

| Sufixo | App padrao   |
|--------|-------------|
| 00     | Hub (app)   |
| 01     | Backbone    |
| 02     | Landing     |
| 03     | Dashboard   |
| 04     | Portal      |
| 05     | Site        |
| 06–09  | Reservados  |

## Catalogo de SRC base

### 1. Hub — Vite SPA PWA Mobile-First

O app principal. Mobile-first, agentic-capable, com enhancements para web.

- **Stack**: Vite + React + shadcn/ui + PWA
- **Rota Caddy**: `/hub/*`
- **Porta**: XX00
- **Login**: `/hub/login`
- **Filosofia**: component-first, customization-last. Sem cores hardcoded — tokens semanticos. Tudo com rota bookmarkable.

### 2. Backbone — Hono (Espinha Dorsal Agentica)

API + agent runtime. Recebe webhooks, orquestra agentes, serve dados.

- **Stack**: Hono + Node.js
- **Rota Caddy**: `/backbone/*` (ou `/api/*`)
- **Porta**: XX01
- **Endpoints base**: `/backbone/health`, `/backbone/webhook/*`

### 3. Landing — Next.js + shadcn

Pagina inicial, marketing, onboarding.

- **Stack**: Next.js 15 + shadcn/ui
- **Rota Caddy**: `/landing/*` (com rewrite de `/` → `/landing`)
- **Porta**: XX02
- **Login**: `/landing/login` (se aplicavel)

### 4. Dashboard — Next.js + shadcn (opcional)

Painel analitico, metricas, relatorios.

- **Stack**: Next.js 15 + shadcn/ui
- **Rota Caddy**: `/dashboard/*`
- **Porta**: XX03
- **Login**: `/dashboard/login`

### 5. Portal — Next.js + shadcn (opcional)

Area do cliente, autoatendimento.

- **Stack**: Next.js 15 + shadcn/ui
- **Rota Caddy**: `/portal/*`
- **Porta**: XX04
- **Login**: `/portal/login`

### 6. Site — Next.js + shadcn (opcional)

Blog, conteudo, SEO.

- **Stack**: Next.js 15 + shadcn/ui
- **Rota Caddy**: `/site/*`
- **Porta**: XX05

## Esqueleto de um SRC

Cada app SRC precisa:

1. **Dockerfile** — multi-stage build (dev nao usa, prod sim)
2. **package.json** — com `dev` e `build` scripts
3. **Health endpoint** — `/{path}/health` (Caddy e compose dependem dele)
4. **Base path configuravel** — via env var, pra funcionar atras do Caddy
5. **.env awareness** — le DATABASE_URL, REDIS_URL, etc. do ambiente

## Principios de design SRC

- **Component-first, customization-last** — comecar com componentes prontos (shadcn), customizar depois
- **Tokens semanticos** — nao colorir o web; usar tokens (primary, secondary, muted, destructive...)
- **Rotas bookmarkable** — tudo tem URL propria, nada escondido em modais sem rota
- **Login por path** — cada app tem `/{path}/login` independente

## Bases de dados

O SRC geralmente usa duas bases PostgreSQL:

- **`main`** (`${POSTGRES_DB}`) — base transacional, normalizada, schema principal
- **`analytics`** (`${POSTGRES_DB_ANALYTICS}`) — warehouse desnormalizado, metricas, logs

Ambas no mesmo servidor PostgreSQL, databases separadas. Migrations e seeds ficam em:

```
database/
├── migrations/           ← DDL transacional (main)
├── seeds/                ← dados base (admin, configs, templates)
├── seeds/{environment}/  ← dados por ambiente (demo pra staging)
└── analytics/            ← DDL do warehouse (analytics)
```
