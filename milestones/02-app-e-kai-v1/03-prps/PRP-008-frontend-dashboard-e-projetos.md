# PRP-008 — Frontend Dashboard e Projetos

## Objetivo

Implementar as paginas de dashboard, lista de projetos, criacao, detalhe e edicao de projetos, incluindo real-time via SSE.

## Execution Mode

`implementar`

## Contexto

O PRP-007 criou o app shell com routing e placeholders. Os endpoints REST existem (PRP-004) e SSE (PRP-005). Os padroes de pagina estao em `ui-guide.md` secao Padroes de Pagina (Dashboard, Lista, Formulario, Detalhe). Componentes shadcn/ui ja instalados.

## Especificacao

### SSE Hook (apps/hub/src/hooks/use-sse.ts)

- `useSSE(url)` — conecta ao endpoint SSE, retorna eventos tipados
- Reconexao automatica com backoff exponencial (1s, 2s, 4s, max 30s) (RNF011)
- Cleanup na desmontagem do componente
- Estado: `connected`, `connecting`, `disconnected`
- Parsing de eventos: `event.type` + `JSON.parse(event.data)`

### Projects Hook (apps/hub/src/hooks/use-projects.ts)

- `useProjects()` — lista projetos, cache local, refetch via SSE
- `useProject(slug)` — detalhes de um projeto
- `useProjectStatus(slug)` — status com features, atualizado via SSE
- `useCreateProject()` — mutation para criar projeto
- `useUpdateProject(slug)` — mutation para atualizar parametros
- `useDeleteProject(slug)` — mutation para excluir

Usar padrao de state management com `useState` + fetch + SSE para atualizacao. Nao usar biblioteca de state management externa.

### Dashboard Page (apps/hub/src/pages/dashboard.tsx)

Conforme US001 e padrao Dashboard do ui-guide.md.

- KPI cards no topo: total projetos, total features, features passing, taxa de sucesso global (OSD108)
- Grid de project cards: cada card com nome, slug, harness, barra de progresso, badge de estado (running/idle/not_initialized) (OSD100, OSD102)
- Cards clicaveis — navegam para `/projects/:slug`
- Atualizacao real-time via SSE (OSD103)
- Empty state quando nao ha projetos: CTA "Criar Primeiro Projeto"

### Project List Page (apps/hub/src/pages/projects/list.tsx)

Conforme padrao Lista do ui-guide.md.

- Header com titulo "Projetos" e botao "Novo Projeto" (OSD020)
- Tabela com colunas: slug, nome, harness, workspace, estado, progresso
- Filtro por harness (select)
- Busca por nome/slug (input)
- Badge de estado por cor
- Click na linha navega para detalhe

### Project Create Page (apps/hub/src/pages/projects/create.tsx)

Conforme padrao Formulario do ui-guide.md e US002.

- Formulario com react-hook-form + Zod
- Campos: slug (Input, obrigatorio, kebab-case), nome (Input, obrigatorio), workspace (Input, path absoluto), specs (Input, path), harness (Select: claude-code, opencode, codex), scaffold (Select: postgres-n8n, null)
- Campos opcionais em secao colapsavel "Parametros Avancados": model, max_turns (default 50), max_iterations, max_features, max_retries (default 5)
- Botoes: Cancelar (volta para lista), Criar (submete)
- Feedback: toast de sucesso, redirect para detalhe

### Project Detail Page (apps/hub/src/pages/projects/[slug]/detail.tsx)

Conforme padrao Detalhe do ui-guide.md e US003-US006.

- Header: nome do projeto, badge de estado, botoes de acao
- Tabs: Visao Geral, Features, Sessoes, Logs

**Tab Visao Geral:**
- Card com info do projeto (slug, workspace, harness, model, parametros)
- Card com status do loop (PID, iteracao, horario inicio) (OSD073)
- Botoes condicionais:
  - "Inicializar" se not_initialized (OSD050)
  - "Iniciar Loop" se idle (com dialog para MAX_TURNS e MODEL) (OSD070, OSD074, OSD075)
  - "Parar" e "Forcar Parada" se running (OSD071, OSD072)
  - "Despachar Sessao" se idle e inicializado (OSD076)
- Card de progresso: barra + contagem por status (OSD101, OSD102)
- Botao "Editar Parametros" abre dialog/drawer com formulario pre-preenchido (OSD024)
- Botao "Excluir" com AlertDialog de confirmacao (slug digitado) (OSD026)

**Tab Features:**
- Tabela de features conforme US007: id, titulo, status (badge), prioridade, dependencias
- Filtro por status (multi-select)
- Grafico de evolucao de features passing (Area Chart do shadcn) (OSD104)
- Botao "Rotacionar Contexto" por feature em status failing (OSD079)
- Atualizacao real-time via SSE

**Tab Sessoes:**
- Conforme US009 — lista e replay (implementacao completa no PRP-009)
- Placeholder: lista simples de sessoes com link "Ver Detalhes"

**Tab Logs:**
- Exibicao do agent-progress.txt (US016)
- Texto monospacado com scroll automatico para o final
- Atualizacao em tempo real via polling a cada 5 segundos

### Mobile Adaptations

- Tabs como horizontal scroll em mobile
- Formularios em fullscreen (nao dialog) em mobile
- Drawer ao inves de Dialog para acoes em mobile (OSD215)
- Usar `useMediaQuery` para alternar

### Verificacao

Dashboard carrega com projetos existentes. Criar projeto funciona. Detail exibe info e controla loop. Features atualizam em real-time. Funciona em mobile e desktop.

## Limites

- Nao implementar a tab Sessoes completa (replay) — placeholder aqui, implementacao no PRP-009
- Nao implementar notificacoes/toasts de eventos SSE — sera feito no PRP-011
- Nao implementar virtualizacao de listas neste PRP (somente se necessario — RNF004)
- Seguir padroes do ui-guide.md para todos os componentes
- Nao criar componentes customizados quando shadcn/ui ja oferece equivalente
