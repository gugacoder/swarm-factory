# PRP-007 — Frontend Shell e Autenticacao

## Objetivo

Implementar o app shell mobile-first (sidebar, bottom nav, breadcrumb), sistema de rotas, pagina de login e fluxo de autenticacao JWT no hub.

## Execution Mode

`implementar`

## Contexto

O PRP-001 criou o hub React com Vite, Tailwind 4, shadcn/ui e react-router-dom. O PRP-003 criou os endpoints de auth no backbone. O layout esta definido em `design.md` secao Estrutura do Monorepo (paginas) e em `requirements.md` secao PWA e Mobile (OSD212-OSD214). O `ui-guide.md` define tokens, componentes e padroes de pagina. A ref `mobile-patterns.md` define padroes de bottom navigation, breakpoints e gestos.

O app nao tem topbar — apenas breadcrumb bar. A navegacao e bottom navigation em mobile e sidebar colapsavel em desktop.

## Especificacao

### Auth (apps/hub/src/lib/auth.ts)

- Armazenar access token em memoria (variavel de modulo, nao localStorage)
- `login(email, password)` — POST /api/auth/login, armazena access token, retorna user
- `refresh()` — POST /api/auth/refresh (cookie automatico), atualiza access token
- `logout()` — POST /api/auth/logout, limpa access token
- `getUser()` — GET /api/auth/me
- `getAccessToken()` — retorna token atual (para o fetch wrapper)
- Interceptor de refresh automatico: quando qualquer request retorna 401, tenta refresh uma vez antes de redirecionar para login

### API Client (apps/hub/src/lib/api.ts)

- Fetch wrapper que injeta `Authorization: Bearer` header
- Intercepta 401 → tenta refresh → se falha, redireciona para /login
- Metodos: `get(url)`, `post(url, body)`, `patch(url, body)`, `del(url)`
- Retorna JSON parseado ou erro tipado

### Login Page (apps/hub/src/pages/login.tsx)

- Formulario centralizado com email e senha (OSD001)
- Componentes: Card, Input, Label, Button do shadcn/ui
- Validacao Zod (email valido, senha nao vazia)
- Feedback de erro inline (credenciais invalidas)
- Redirect para dashboard apos sucesso
- Layout fullscreen sem shell (sem sidebar/bottom nav)

### App Shell (apps/hub/src/components/layout/)

**app-shell.tsx**
- Container principal que renderiza sidebar (desktop) ou bottom nav (mobile)
- Usa `useMediaQuery("(min-width: 768px)")` para detectar breakpoint
- Maximiza area util: sem header fixo alem do breadcrumb (OSD214)

**sidebar.tsx** (desktop: md+)
- Colapsavel (toggle com icone Menu)
- Itens: Dashboard (LayoutDashboard), Projetos (FolderKanban), Kai (Bot), Configuracoes (Settings)
- Footer: avatar + nome do usuario + dropdown com Perfil/Logout
- Largura: 240px expandida, 64px colapsada
- Persistir estado colapsado em localStorage

**bottom-nav.tsx** (mobile: < md)
- Fixed bottom, 4 itens com icones: Dashboard, Projetos, Kai, Perfil
- Touch targets 44x44px (OSD218)
- Indicador visual do item ativo
- Sem labels quando espaco e limitado (apenas icones)

**breadcrumb-bar.tsx**
- Breadcrumb do shadcn/ui no topo do conteudo
- Gerado automaticamente a partir da rota atual
- Mapeamento: `/` → Dashboard, `/projects` → Projetos, `/projects/:slug` → nome do projeto, `/kai` → Kai, `/settings` → Configuracoes

### Routing (apps/hub/src/app.tsx)

- `BrowserRouter` com rotas:
  - `/login` — LoginPage (sem shell)
  - `/` — redirect para /dashboard
  - `/dashboard` — DashboardPage (placeholder)
  - `/projects` — ProjectListPage (placeholder)
  - `/projects/create` — ProjectCreatePage (placeholder)
  - `/projects/:slug` — ProjectDetailPage (placeholder)
  - `/projects/:slug/features` — FeaturesPage (placeholder)
  - `/projects/:slug/sessions` — SessionsPage (placeholder)
  - `/projects/:slug/logs` — LogsPage (placeholder)
  - `/kai` — KaiPage (placeholder)
  - `/settings` — SettingsPage (placeholder)
- Rotas protegidas: redirecionar para /login se nao autenticado
- ProtectedRoute wrapper que checa token e faz refresh se necessario

### Dark Mode (RNF018)

- Usar `class` strategy do Tailwind
- Toggle no sidebar/settings
- Persistir preferencia em localStorage
- Respeitar preferencia do sistema como default

### Verificacao

Login funciona e redireciona para dashboard. Sidebar aparece em desktop, bottom nav em mobile. Breadcrumb reflete a rota atual. Logout redireciona para login. Refresh automatico funciona quando token expira. Dark mode toggle funciona.

## Limites

- Nao implementar conteudo das paginas (apenas placeholders com titulo) — sera feito nos PRPs seguintes
- Nao implementar SSE/real-time no frontend (sera feito no PRP-008)
- Nao implementar o chat da Kai (sera feito no PRP-010)
- Nao adicionar animacoes de transicao de pagina neste PRP
- Seguir tokens semanticos do ui-guide.md — nunca classes de cor Tailwind diretas
