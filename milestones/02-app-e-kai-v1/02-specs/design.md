# E-Kai - Design e Arquitetura

Decisoes tecnicas e arquiteturais do app de gestao PWA Mobile-First com copilot agentico Kai.

---

## Stack Principal

| Camada | Tecnologia | Justificativa |
|--------|------------|---------------|
| Frontend (hub) | React 19 + Vite + Tailwind 4 | Stack do scaffold postgres-n8n, performance e DX |
| UI Components | shadcn/ui (Mira theme) | Componentes acessiveis, customizaveis, sem lock-in |
| Backend (backbone) | Hono + Node.js | Leve, Web Standards, TypeScript nativo, compativel com scaffold |
| Database | PostgreSQL 16 | Robusto, extensoes UUID e pgcrypto, migrations idiomponenttes |
| Agent (Kai) | LangGraph.js | Graph-based agent com tool calling, estado tipado, condicional edges |
| LLM Provider | OpenRouter | Multi-model (Gemini Flash, Claude Haiku), fallback, custo otimizado |
| Real-time | SSE (Server-Sent Events) | Unidirecional server→client, mais simples que WebSocket, funciona com HTTP/2 |
| Auth | JWT + Refresh Token | Stateless, HTTP-only cookie para refresh, access token em memoria |
| Validacao | Zod | Schema validation compartilhado entre frontend e backend |
| PWA | Workbox | Service worker, cache strategies, precaching |

---

## Estrutura do Monorepo

```
e-kai/
├── apps/
│   ├── hub/                      # Frontend React (porta 9000)
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── layout/       # Shell, Sidebar, BottomNav, Breadcrumb
│   │   │   │   ├── projects/     # Cards, Forms, Detail
│   │   │   │   ├── monitoring/   # FeatureTable, ProgressChart, StatusCards
│   │   │   │   ├── sessions/     # Timeline, EventCard, Replay
│   │   │   │   ├── kai/          # ChatWindow, MessageBubble, ToolCallCard
│   │   │   │   └── ui/           # shadcn/ui components
│   │   │   ├── hooks/
│   │   │   │   ├── use-sse.ts            # Hook para SSE connection
│   │   │   │   ├── use-projects.ts       # CRUD e queries de projetos
│   │   │   │   ├── use-kai.ts            # Chat streaming com Kai
│   │   │   │   └── use-media-query.ts    # Breakpoint detection
│   │   │   ├── lib/
│   │   │   │   ├── api.ts                # Fetch wrapper com auth
│   │   │   │   ├── auth.ts               # JWT management
│   │   │   │   └── validators.ts         # Zod schemas compartilhados
│   │   │   ├── pages/
│   │   │   │   ├── dashboard.tsx
│   │   │   │   ├── projects/
│   │   │   │   │   ├── list.tsx
│   │   │   │   │   ├── create.tsx
│   │   │   │   │   └── [slug]/
│   │   │   │   │       ├── detail.tsx
│   │   │   │   │       ├── features.tsx
│   │   │   │   │       ├── sessions.tsx
│   │   │   │   │       └── logs.tsx
│   │   │   │   ├── kai.tsx
│   │   │   │   ├── settings.tsx
│   │   │   │   └── login.tsx
│   │   │   └── app.tsx
│   │   ├── public/
│   │   │   ├── manifest.json
│   │   │   └── sw.js
│   │   └── package.json
│   │
│   └── backbone/                 # Backend Hono (porta 9090)
│       ├── src/
│       │   ├── routes/
│       │   │   ├── auth.ts               # Login, refresh, logout
│       │   │   ├── projects.ts           # CRUD projetos
│       │   │   ├── workspaces.ts         # Init, status
│       │   │   ├── loops.ts              # Start, stop, logs
│       │   │   ├── sessions.ts           # List, replay
│       │   │   ├── kai.ts                # Chat endpoint (SSE streaming)
│       │   │   ├── events.ts             # SSE global events
│       │   │   └── health.ts             # Health check
│       │   ├── services/
│       │   │   ├── project-service.ts    # Bridge para SDK .mjs
│       │   │   ├── loop-service.ts       # Spawn/kill de processos
│       │   │   ├── session-service.ts    # Leitura de .sessions/
│       │   │   ├── watcher-service.ts    # FSWatcher para mudancas
│       │   │   └── auth-service.ts       # JWT, bcrypt, refresh
│       │   ├── kai/
│       │   │   ├── agent.ts              # LangGraph graph definition
│       │   │   ├── tools/
│       │   │   │   ├── list-projects.ts
│       │   │   │   ├── get-status.ts
│       │   │   │   ├── start-loop.ts
│       │   │   │   ├── stop-loop.ts
│       │   │   │   ├── create-project.ts
│       │   │   │   ├── init-workspace.ts
│       │   │   │   ├── read-features.ts
│       │   │   │   ├── read-session.ts
│       │   │   │   ├── read-progress.ts
│       │   │   │   ├── read-logs.ts
│       │   │   │   ├── adjust-params.ts
│       │   │   │   └── rotate-context.ts
│       │   │   ├── prompts.ts            # System prompts da Kai
│       │   │   └── config.ts             # Modelo, fallback, OpenRouter
│       │   ├── middleware/
│       │   │   ├── auth.ts               # JWT validation
│       │   │   ├── rate-limit.ts         # Rate limiting
│       │   │   └── logger.ts             # Request logging
│       │   └── app.ts
│       └── package.json
│
├── database/
│   ├── migrations/               # SQL idempotentes
│   └── seeds/                    # Dados base
│
├── docker-compose.platform.yml   # PostgreSQL, Redis
├── package.json                  # Monorepo root
└── .env.example
```

---

## Infraestrutura

### Servicos

| Servico | Porta Dev | Descricao |
|---------|-----------|-----------|
| hub (React) | 9000 | Frontend PWA |
| backbone (Hono) | 9090 | API REST + SSE + Kai |
| PostgreSQL | 9032 | Banco principal |
| Redis | 9079 | Cache de sessoes JWT (opcional) |

### Fluxo de Requisicoes (Dev)

```
Browser/PWA
├── /api/*           → backbone:9090 (proxy via Vite)
├── /api/events      → backbone:9090 (SSE stream)
├── /api/kai/chat    → backbone:9090 (SSE streaming)
└── /*               → hub:9000 (SPA)
```

### Fluxo de Requisicoes (Producao)

```
Caddy (reverse proxy)
├── /api/*           → backbone:9090
└── /*               → hub:9000 (static files)
```

---

## Autenticacao

### Fluxo

1. Usuario envia email + senha via POST /api/auth/login
2. backbone valida credenciais contra PostgreSQL (bcrypt)
3. Gera access token JWT (15min, em memoria no client)
4. Gera refresh token JWT (7d, HTTP-only cookie)
5. Client envia access token em header `Authorization: Bearer <token>`
6. Quando access token expira, POST /api/auth/refresh com cookie
7. Logout invalida refresh token no banco

### Tokens

| Token | Duracao | Armazenamento | Conteudo |
|-------|---------|---------------|----------|
| Access | 15 min | Memoria (JS) | user_id, email |
| Refresh | 7 dias | HTTP-only cookie | user_id, jti |

---

## Kai - Arquitetura do Agent

### Graph LangGraph

```
__start__ → classify → reason → [act | skip] → respond → __end__
```

| Node | Funcao | Modelo |
|------|--------|--------|
| classify | Classifica intencao do usuario (query, action, diagnostic) | gemini-2.0-flash |
| reason | Decide quais tools usar baseado na intencao | gemini-2.0-flash |
| act | Executa tools selecionadas | - |
| respond | Gera resposta final em linguagem natural | claude-3-haiku |

### State

```typescript
const KaiState = Annotation.Root({
  // Input
  message: Annotation<string>,
  conversationHistory: Annotation<Array<{ role: string; content: string }>>,

  // Classification
  intent: Annotation<"query" | "action" | "diagnostic" | "recommendation" | "greeting">,

  // Reasoning
  toolsToUse: Annotation<string[]>,

  // Results
  toolResults: Annotation<Array<{ tool: string; input: object; output: object; duration_ms: number }>>,

  // Output
  response: Annotation<string>,
  error: Annotation<string | null>,
});
```

### Tools da Kai

| Tool | Descricao | Endpoint Backend |
|------|-----------|-----------------|
| list_projects | Lista todos os projetos | GET /api/projects |
| get_status | Status detalhado de um projeto | GET /api/projects/:slug/status |
| create_project | Cria novo projeto | POST /api/projects |
| init_workspace | Inicializa workspace | POST /api/projects/:slug/init |
| start_loop | Inicia loop autonomo | POST /api/projects/:slug/loop/start |
| stop_loop | Para loop | POST /api/projects/:slug/loop/stop |
| read_features | Le features.json | interno (filesystem) |
| read_session | Le output.jsonl de sessao | interno (filesystem) |
| read_progress | Le agent-progress.txt | interno (filesystem) |
| read_logs | Le logs do loop | interno (filesystem) |
| adjust_params | Ajusta parametros do projeto | PATCH /api/projects/:slug |
| rotate_context | Rotaciona contexto de feature | POST /api/projects/:slug/features/:id/rotate |

---

## Real-Time (SSE)

### Endpoint

```
GET /api/events
```

### Eventos

| Evento | Data | Trigger |
|--------|------|---------|
| feature:status | { slug, featureId, oldStatus, newStatus } | FSWatcher em features.json |
| loop:start | { slug, pid } | Spawn de processo |
| loop:stop | { slug, reason } | Processo termina |
| loop:progress | { slug, iteration, feature } | Mudanca em state.json |
| project:created | { slug, name } | POST /api/projects |

### Implementacao

- FSWatcher (chokidar) monitora arquivos de artefatos
- Debounce de 500ms para evitar flooding
- Reconexao automatica no client com backoff exponencial
- EventSource API no browser (nativo)

---

## Bibliotecas Compartilhadas

| Funcao | Biblioteca | Versao |
|--------|------------|--------|
| UI Components | shadcn/ui | v4 |
| Forms | react-hook-form | ^7 |
| Validation | zod | ^3 |
| Routing (client) | react-router-dom | ^7 |
| Charts | recharts (via shadcn) | ^2 |
| Animations | framer-motion | ^11 |
| Virtual Lists | @tanstack/react-virtual | ^3 |
| Agent Framework | @langchain/langgraph | latest |
| LLM | @langchain/openai (OpenRouter) | latest |
| HTTP Server | hono | ^4 |
| File Watching | chokidar | ^4 |
| JWT | jose | ^5 |
| Password Hashing | bcryptjs | ^3 |
| PWA | workbox-webpack-plugin | ^7 |
| Icons | lucide-react | latest |

---

## Convencoes de Codigo

| Item | Convencao | Exemplo |
|------|-----------|---------|
| Arquivos | kebab-case | `project-service.ts` |
| Componentes | PascalCase | `FeatureTable.tsx` |
| Hooks | camelCase com prefix use | `useProjects.ts` |
| Rotas API | kebab-case | `/api/projects/:slug/loop/start` |
| Banco | snake_case | `refresh_tokens` |
| Enums DB | lowercase pt-BR | `'operador'`, `'admin'` |
| Variaveis | camelCase | `maxTurns` |
| Constantes | UPPER_SNAKE | `MAX_RETRIES` |
| Commits | Conventional Commits pt-BR | `feat(kai): adicionar tool de diagnostico` |

---

## Seguranca

- [x] Senhas com bcrypt (cost >= 12)
- [x] JWT access token de curta duracao (15min)
- [x] Refresh token em HTTP-only cookie
- [x] CORS restritivo com origin explicito
- [x] Rate limiting em rotas de autenticacao (5/min)
- [x] Validacao Zod em todo input
- [x] Sanitizacao de paths (prevenir path traversal no acesso a workspaces)
- [x] API keys (OpenRouter) armazenadas em .env, nunca no client

---

## Performance

| Metrica | Alvo | Medicao |
|---------|------|---------|
| LCP | < 2.0s | Lighthouse |
| INP | < 100ms | Lighthouse |
| CLS | < 0.1 | Lighthouse |
| PWA Score | >= 90 | Lighthouse |
| SSE Latency | < 1s | Monitoramento interno |
| Kai Response (first token) | < 2s | Logging |

---

## Decisoes Tecnicas Vinculantes

| Decisao | Justificativa |
|---------|---------------|
| SSE ao inves de WebSocket | Unidirecional e suficiente; HTTP/2 multiplexing; menos complexidade |
| OpenRouter ao inves de API direta | Multi-model, fallback, billing unificado |
| LangGraph ao inves de agent loop manual | Estado tipado, condicional edges, observabilidade nativa |
| Hono ao inves de Express | Web Standards, TypeScript nativo, middleware composavel |
| FSWatcher ao inves de polling | Notificacao instantanea, menor uso de CPU |
| JWT ao inves de session cookie | Stateless, escalavel, compativel com PWA |
| Workbox ao inves de SW manual | Cache strategies testadas, precaching automatico |
