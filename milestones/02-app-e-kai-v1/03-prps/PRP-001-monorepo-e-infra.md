# PRP-001 — Monorepo e Infraestrutura

## Objetivo

Criar a estrutura do monorepo E-Kai com apps hub (React) e backbone (Hono), configuracao Docker para PostgreSQL, e ambiente de desenvolvimento funcional.

## Execution Mode

`implementar`

## Contexto

Este e um projeto greenfield. O scaffold `postgres-n8n` define a estrutura base de monorepo com `apps/hub` (React 19 + Vite + Tailwind 4) e `apps/backbone` (Hono + Node.js). A SDK de gestao de projetos existe em `runs/.meta/api/` como modulos `.mjs` — o backbone vai importar essas funcoes.

O `package.json` raiz do scaffold usa npm workspaces com `"workspaces": ["apps/*"]` e scripts como `dev:all`, `dev:hub`, `dev:backbone`, `platform:up`, `platform:down`, `migrate`. Portas padrao: hub=9000, backbone=9090, PostgreSQL=9032.

## Especificacao

### Monorepo root

- `package.json` com workspaces `apps/*`, scripts conforme scaffold (dev:all, dev:hub, dev:backbone, platform:up/down, migrate, build:all)
- `.env.example` com variaveis: `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `OPENROUTER_API_KEY`, `RUNS_DIR` (path absoluto para runs/), `HUB_PORT=9000`, `BACKBONE_PORT=9090`, `DB_PORT=9032`
- `docker-compose.platform.yml` com PostgreSQL 16 (porta 9032, banco `ekai`, extensoes uuid-ossp e pgcrypto)
- devDependencies raiz: `concurrently`, `dotenv-cli`

### Hub (apps/hub)

- React 19 + Vite + Tailwind 4
- `package.json` com dependencias: react, react-dom, react-router-dom ^7, @tanstack/react-virtual ^3, react-hook-form ^7, zod ^3, recharts ^2, framer-motion ^11, lucide-react, sonner
- Vite config com proxy de `/api` para `http://localhost:9090`
- Tailwind configurado com shadcn/ui (theme Mira, base Gray, accent Fuchsia, font Inter, radius medium)
- Inicializar shadcn/ui e instalar componentes base: button, card, input, label, form, dialog, drawer, sheet, tabs, badge, skeleton, toast (sonner), separator, breadcrumb, dropdown-menu, avatar, scroll-area, command, popover, tooltip, table, select, switch, progress
- Estrutura de pastas: `src/components/ui/`, `src/components/layout/`, `src/hooks/`, `src/lib/`, `src/pages/`
- `src/app.tsx` com BrowserRouter e rotas placeholder
- `src/lib/api.ts` — fetch wrapper que injeta Authorization header e trata refresh automatico

### Backbone (apps/backbone)

- Hono ^4 + Node.js
- `package.json` com dependencias: hono, @hono/node-server, jose ^5, bcryptjs ^3, zod ^3, chokidar ^4, pg ^8
- `src/app.ts` — instancia Hono com CORS (origin do hub), logger middleware, rota health (`GET /api/health` retorna `{ status: "ok", timestamp }`)
- `src/middleware/logger.ts` — loga metodo, rota, status, duracao (RNF019)
- Pasta `src/routes/`, `src/services/`, `src/middleware/`, `src/kai/`
- Dev server rodando na porta 9090

### Database

- Pasta `database/migrations/` vazia (PRPs seguintes adicionam migrations)
- Pasta `database/seeds/` vazia
- Script `scripts/migrate.js` que executa arquivos SQL em ordem numerica contra PostgreSQL

### Verificacao

Ao final, `npm run platform:up` sobe PostgreSQL, `npm run dev:all` sobe hub e backbone, `GET /api/health` retorna 200, e a pagina do hub carrega no browser.

## Limites

- Nao criar componentes de UI alem do skeleton/placeholder de cada rota
- Nao implementar logica de negocio nos services (apenas estrutura)
- Nao instalar dependencias do LangGraph (sera feito no PRP-006)
- Nao criar migrations de banco (sera feito no PRP-002)
- Manter as mesmas portas do scaffold (9000, 9090, 9032)
