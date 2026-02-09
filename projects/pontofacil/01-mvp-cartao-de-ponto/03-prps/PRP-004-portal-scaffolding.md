# PRP-004 — App Scaffolding: Vite+React+shadcn PWA + Backbone Hono + Autenticação

## Objetivo

Criar os projetos `app/` (Vite + React + shadcn/ui, PWA mobile-first) e `backbone/` (Hono REST/SSE), com estrutura de diretórios, dependências, layout base com sidebar, sistema de autenticação e roteamento do módulo Cartão de Ponto.

## Execution Mode

`implementar`

## Contexto

Os diretórios `app/` e `backbone/` **não existem ainda**. O `package.json` raiz configura workspaces. O docker-compose.yml espera o app com porta 9000 e backbone com porta 9090. O `.env` já contém DATABASE_URL e configurações de porta.

A spec de design (DES001, DES002, DES010) define:
- App: Vite + React, PWA state-of-the-art, mobile-first, com web enhancements
- Backbone: Hono REST/SSE como core do sistema
- shadcn/ui + Tailwind CSS (tema Mira, Gray, Fuchsia, Inter, radius Medium)
- Ícones Lucide
- React Hook Form + Zod para formulários

O ui-guide.md define os tokens semânticos, breakpoints, componentes e padrões de página.

DES016 define mapeamento de telas do legado para sidebar com agrupamento por módulo.

DES020 define API REST via Hono agrupadas por domínio: `/api/ponto/...`

## Especificação

### 1. App — Inicialização do projeto

Criar `app/` como projeto Vite + React com:
- TypeScript strict
- Tailwind CSS 4
- Tema shadcn/ui configurado (Mira style, Gray base, Fuchsia accent, Inter font, Medium radius)
- ESLint + Prettier configurados
- React Router para roteamento client-side
- PWA manifest + service worker básico (vite-plugin-pwa)
- Porta 9000

### 2. App — Dependências

Instalar e configurar:
- vite, react, react-dom, react-router-dom
- tailwindcss, @tailwindcss/postcss
- shadcn/ui (componentes base: Button, Input, Select, Combobox, Form, Table, DataTable, Card, Dialog, Sheet, Tabs, Sidebar, Breadcrumb, Alert, Toast/Sonner, Skeleton, Badge, Pagination, Calendar, DatePicker, Switch, Checkbox, RadioGroup, Textarea, Progress, Separator, Accordion, DropdownMenu, Popover, Tooltip, Avatar, Toggle)
- lucide-react
- react-hook-form + @hookform/resolvers + zod
- @tanstack/react-table
- @tanstack/react-query (para data fetching e cache)
- vite-plugin-pwa

### 3. App — Estrutura de diretórios

```
app/
├── src/
│   ├── main.tsx                # Entry point com providers
│   ├── App.tsx                 # Router setup
│   ├── routes/
│   │   ├── login.tsx           # Tela de login
│   │   └── ponto/
│   │       ├── layout.tsx      # Layout com sidebar do módulo
│   │       ├── index.tsx       # Dashboard/home do módulo
│   │       ├── funcionarios.tsx    # (placeholder)
│   │       ├── horarios.tsx        # (placeholder)
│   │       ├── escalas.tsx         # (placeholder)
│   │       ├── movimentacoes.tsx   # (placeholder)
│   │       ├── parametros.tsx      # (placeholder)
│   │       ├── eventos.tsx         # (placeholder)
│   │       ├── rep.tsx             # (placeholder)
│   │       ├── cartao.tsx          # (placeholder)
│   │       ├── apuracao.tsx        # (placeholder)
│   │       ├── importacao.tsx      # (placeholder)
│   │       ├── exportacao.tsx      # (placeholder)
│   │       ├── relatorios.tsx      # (placeholder)
│   │       └── auditoria.tsx       # (placeholder)
│   ├── components/
│   │   ├── ui/                     # shadcn/ui components (gerados)
│   │   ├── layout/
│   │   │   ├── app-sidebar.tsx     # Sidebar do módulo de ponto
│   │   │   └── breadcrumb-nav.tsx
│   │   └── shared/
│   │       └── hierarchical-filter.tsx  # Placeholder do DES013
│   ├── lib/
│   │   ├── api.ts              # Cliente HTTP para backbone (fetch wrapper)
│   │   ├── auth.ts             # Contexto de autenticação + guard de rotas
│   │   ├── sse.ts              # Cliente SSE para real-time events
│   │   ├── utils.ts            # Utilitários (cn, etc.)
│   │   └── validators/         # Schemas Zod compartilhados
│   └── styles/
│       └── globals.css         # Tailwind + tokens do tema
├── public/
│   ├── manifest.json           # PWA manifest
│   └── favicon.ico
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── postcss.config.mjs
└── .env.local → ../.env
```

### 4. Backbone — Inicialização do projeto

Criar `backbone/` como projeto Hono com:
- TypeScript strict
- Node.js runtime (não Bun/Deno)
- Zod para validação
- pg (node-postgres) para PostgreSQL
- Porta 9090

### 5. Backbone — Dependências

Instalar e configurar:
- hono, @hono/node-server
- pg (node-postgres)
- zod
- bcrypt (ou argon2) para hash de senhas
- jsonwebtoken (JWT para autenticação)
- dotenv

### 6. Backbone — Estrutura de diretórios

```
backbone/
├── src/
│   ├── index.ts                # Entry point, Hono app setup
│   ├── routes/
│   │   ├── auth.ts             # Login, logout, refresh token
│   │   └── ponto/
│   │       ├── funcionarios.ts     # (placeholder)
│   │       ├── horarios.ts         # (placeholder)
│   │       ├── escalas.ts          # (placeholder)
│   │       ├── movimentacoes.ts    # (placeholder)
│   │       ├── parametros.ts       # (placeholder)
│   │       ├── eventos.ts          # (placeholder)
│   │       ├── rep.ts              # (placeholder)
│   │       ├── cartao.ts           # (placeholder)
│   │       ├── apuracao.ts         # (placeholder)
│   │       ├── importacao.ts       # (placeholder)
│   │       ├── exportacao.ts       # (placeholder)
│   │       ├── relatorios.ts       # (placeholder)
│   │       └── auditoria.ts        # (placeholder)
│   ├── middleware/
│   │   ├── auth.ts             # JWT verification middleware
│   │   └── error.ts            # Error handler global
│   ├── db/
│   │   ├── index.ts            # Pool de conexão PostgreSQL
│   │   └── queries/            # Query helpers por domínio
│   ├── services/               # Lógica de negócio
│   ├── sse/
│   │   └── events.ts           # SSE endpoint e event emitter
│   └── types/
│       └── index.ts            # Types compartilhados
├── package.json
├── tsconfig.json
└── .env.local → ../.env
```

### 7. Layout com Sidebar (App)

O layout `routes/ponto/layout.tsx` deve implementar sidebar com seções agrupadas (DES016):

- **Cadastros**: Funcionários, Horários, Escalas, Tipos de Movimentação, Modelos REP
- **Configuração**: Parâmetros do Cartão, Eventos por Empresa, Saldo Inicial BH
- **Operação**: Digitação do Cartão, Importação de Batidas
- **Processamento**: Apuração / Fechamento
- **Exportação**: Horas, AEJ, Madis
- **Relatórios**: (submenu com todos os relatórios)
- **Sistema**: Auditoria, Logs de Operação

Usar componente Sidebar do shadcn/ui. Ícones Lucide conforme ui-guide.md.

### 8. Autenticação

- **Backbone**: endpoint POST `/api/auth/login` valida credenciais contra tabela `users`, retorna JWT. Middleware Hono verifica JWT em rotas protegidas `/api/ponto/**`.
- **App**: armazena JWT em memória (não localStorage). Auth context com React Context. Route guard redireciona para `/login` se não autenticado. Refresh token via endpoint dedicado.

### 9. Conexão com banco (Backbone)

Pool de conexão PostgreSQL usando `pg` com variáveis do `.env` (DATABASE_URL). Padrão de query helper reutilizável.

### 10. Páginas placeholder (App)

Cada rota dentro de `/ponto/*` deve ter um componente mínimo com título da seção e breadcrumb, sem implementação funcional. Isso permite navegação pela sidebar imediatamente.

### 11. API placeholder (Backbone)

Cada rota dentro de `/api/ponto/*` deve retornar `{ data: [], pagination: { page: 1, total: 0 } }` como placeholder. Isso permite o App conectar imediatamente.

## Limites

- Não implementar lógica de negócio em nenhuma tela ou rota — apenas scaffolding e placeholders
- Não criar o agent-core/ ou landing/ — fora do escopo deste PRP
- Não alterar o docker-compose.yml ou scripts existentes
- Não alterar o package.json raiz (exceto se necessário para dependências do workspace)
- Não instalar ORM (Prisma, Drizzle) — usar `pg` direto conforme padrão existente
- Não criar componentes de formulário ou tabela específicos do domínio — apenas instalar shadcn/ui components
- Não implementar PWA completo (offline, sync) — apenas manifest + service worker básico com vite-plugin-pwa
- Usar porta 9000 para app e 9090 para backbone conforme `.env` existente — **nunca alterar as portas**
