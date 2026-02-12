# PRP-004 — Backend API de Projetos

## Objetivo

Implementar as rotas REST de CRUD de projetos, workspaces, loops e sessoes no backbone, fazendo bridge com a SDK .mjs existente.

## Execution Mode

`implementar`

## Contexto

A SDK de gestao de projetos existe em `runs/.meta/api/` com funcoes: `createProject`, `loadProject`, `listProjects`, `getStatus`, `initWorkspace`. O backbone (PRP-001/003) ja tem Hono rodando com auth middleware. Os endpoints estao definidos em `requirements.md` (OSD230-OSD243) e `design.md` secao API. O path `RUNS_DIR` vem do `.env`.

O loop autonomo (Ralph Wiggum) e um script bash (`runs/.meta/ralph-wiggum-loop.sh`) que e executado como processo filho. Parada graceful e feita criando arquivo `.stop` no workspace. Parada forcada mata o PID.

## Especificacao

### Project Service (apps/backbone/src/services/project-service.ts)

Bridge entre as rotas Hono e a SDK .mjs. Importa as funcoes via dynamic import (ES Modules .mjs).

- `list()` — chama `listProjects({ runsDir })`, retorna array de projetos
- `get(slug)` — chama `loadProject({ slug, runsDir })`, retorna projeto enriquecido
- `create(params)` — chama `createProject(params)`, retorna projeto criado
- `getStatus(slug)` — chama `getStatus({ slug, runsDir })`, retorna status com features
- `update(slug, params)` — le project.json, aplica patch nos parametros de agent (max_turns, max_iterations, max_features, max_retries, model), revalida e salva
- `delete(slug)` — remove o arquivo project.json (nao remove workspace)
- `initWorkspace(slug)` — chama `initWorkspace({ slug, runsDir })`, retorna resultado
- Todas as funcoes recebem `runsDir` do env

### Loop Service (apps/backbone/src/services/loop-service.ts)

- `start(slug, options)` — resolve path do workspace via project, spawna `bash agent-harness.sh` como child process com env vars (MAX_TURNS, MODEL), salva PID em state, retorna `{ pid }`
- `stop(slug, force)` — se `force=false`, cria arquivo `.stop` no workspace; se `force=true`, mata PID via `process.kill(pid, 'SIGTERM')`
- `getLogs(slug, tail)` — le ultimas N linhas do agent-progress.txt

### Session Service (apps/backbone/src/services/session-service.ts)

- `list(slug)` — le diretorio `.sessions/` do workspace, retorna lista de sessoes com metadata (feature, data, duracao)
- `get(slug, sessionId)` — le output.jsonl da sessao, parseia cada linha como JSON, retorna array de eventos
- `getProgress(slug)` — le agent-progress.txt inteiro

### Routes

**projects.ts** (apps/backbone/src/routes/projects.ts)
- `GET /api/projects` — lista projetos (OSD232)
- `POST /api/projects` — cria projeto, body validado com Zod (OSD231)
- `GET /api/projects/:slug` — detalhes do projeto (OSD233)
- `PATCH /api/projects/:slug` — atualiza parametros (OSD024)
- `DELETE /api/projects/:slug` — exclui projeto (OSD026)
- `GET /api/projects/:slug/status` — status com contagem de features (OSD234)
- `GET /api/projects/:slug/progress` — conteudo do agent-progress.txt (OSD107)

**workspaces.ts** (apps/backbone/src/routes/workspaces.ts)
- `POST /api/projects/:slug/init` — inicializa workspace (OSD235)

**loops.ts** (apps/backbone/src/routes/loops.ts)
- `POST /api/projects/:slug/loop/start` — body `{ maxTurns?, model? }` (OSD236)
- `POST /api/projects/:slug/loop/stop` — body `{ force?: boolean }` (OSD237)
- `GET /api/projects/:slug/loop/logs` — query `?tail=100` (OSD077)

**sessions.ts** (apps/backbone/src/routes/sessions.ts)
- `GET /api/projects/:slug/sessions` — lista sessoes (OSD238)
- `GET /api/projects/:slug/sessions/:id` — replay de sessao (OSD239)

### Features

- `GET /api/projects/:slug/features` — le features.json do workspace, retorna array
- `POST /api/projects/:slug/features/:id/rotate` — rotacao de contexto: limpa sessao da feature, reseta status para "failing", zera retries (OSD079)

### Validacao

Schemas Zod para todos os bodies de request. Path traversal prevention: validar que slug contem apenas `[a-z0-9-]`.

### Verificacao

Todas as rotas retornam dados corretos quando testadas com curl. CRUD de projetos funciona end-to-end. Loop start/stop controlam o processo filho.

## Limites

- Nao reimplementar logica que ja existe na SDK .mjs — fazer bridge/wrapper
- Nao criar endpoints que nao estejam listados em requirements.md
- Nao implementar SSE neste PRP (sera feito no PRP-005)
- Nao implementar rotas da Kai (sera feito no PRP-006)
- Nao acessar paths fora de RUNS_DIR e dos workspaces dos projetos
