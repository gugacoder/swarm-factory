# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## O que e o Swarm Factory

Fabrica de software autonoma — sistema que planeja, configura e constroi multiplos projetos usando agentes de IA em loops autonomos. Opera em tres eixos: **Projects** (catalogo com specs e PRPs), **Scaffolds** (templates de codigo), e **Runs** (configuracoes que conectam projeto + scaffold + agente via o Ralph Wiggum Loop).

## Comandos

### Tooling (dashboard)
```bash
npm run tooling          # Dev server do dashboard (brand-editor, run-monitor, session-live)
```

### Run Commands — fabrica (Claude Code slash commands)
```bash
/run:create              # Cria um novo run (interativo ou com args)
/run:setup <run>         # Prepara workspace + executa initializer (gera features.json)
/run:code <run>          # Despacha sessao manual (uma feature por vez)
/run:loop <run>          # Despacha loop autonomo (Ralph Wiggum)
/run:status [run]        # Status de um ou todos os runs
/run:create-worktree     # Cria worktree + run + .harness/ num passo
```

### Vibe Commands — projeto destino (copiados pelo run:setup)
```bash
/vibe:initialize         # Gera features.json a partir dos PRPs (standalone, sem fabrica)
/vibe:code               # Sessao de coding (usa features.json local)
/vibe:loop               # Loop autonomo (usa agent-harness.sh local)
```

### Derivacao de docs
```bash
/derive:specs <projeto>/<milestone>   # Brainstorming -> Specs
/derive:prps <projeto>/<milestone>    # Specs -> PRPs
```

### Commits
```bash
/git-commit              # Commits tematicos agrupados (conventional commits em pt-BR)
/git-commit --all        # Stage all + commits tematicos
/git-commit --one        # Commit unico com tudo
```

### Loop direto no terminal (V2 — .harness/)
```bash
cd <workspace>
node .harness/scripts/loop.mjs                  # Com defaults (session de .harness/active)
node .harness/scripts/loop.mjs 08-precificacao  # Session explicita
MAX_FEATURES=1 node .harness/scripts/loop.mjs   # Uma feature
MAX_TURNS=50 node .harness/scripts/loop.mjs     # Limitar turns
touch .stop                                     # Graceful stop (termina feature atual)
```

### Loop direto no terminal (V1 — legacy)
```bash
cd <workspace>
node agent-harness.mjs                          # Com defaults
MAX_TURNS=50 node agent-harness.mjs             # Limitar turns por sessao
touch .stop                                     # Graceful stop (termina feature atual)
```

## Arquitetura

```
swarm-factory/
├── projects/                    # CATALOGO DE PROJETOS
│   ├── .meta/                   # Metodologia (what-is/, template/, refs/)
│   └── <projeto>/               # Um projeto
│       └── <milestone>/         # 01-brainstorming/, 02-specs/, 03-prps/, 04-refs/
│
├── scaffolds/                   # TEMPLATES DE CODIGO
│   └── postgres-n8n/            # Monorepo React+Hono+PostgreSQL+Docker+n8n
│
├── runs/                        # CONFIGURACOES DE RUNS
│   ├── .meta/
│   │   ├── ralph-wiggum-loop.sh # Engine do loop autonomo V1 (legacy)
│   │   ├── run.schema.json      # Schema de validacao de run configs
│   │   └── harnesses/           # Configs por agente
│   │       ├── shared/          # loop.mjs (engine V2), prompt.md (coder prompt)
│   │       ├── claude-code/     # run.mjs, init.mjs, templates/
│   │       └── codex/           # run.mjs, init.mjs, templates/
│   ├── *.json                   # Run configs
│   └── workspaces/              # Workspaces de prototipacao
│
├── tooling/                     # DASHBOARD (React 18 + Vite + Tailwind)
│   └── src/tools/               # brand-editor, run-monitor, session-live
│
└── .claude/commands/            # Slash commands
    ├── run/                     # create, setup, code, loop, status, create-worktree (fabrica)
    ├── derive/                  # specs, prps
    └── git-commit.md
```

## Conceitos-chave

### Run Config (`runs/<nome>.json`)
Conecta projeto + scaffold + harness. Dois modos:
- **Prototipacao**: `location` relativo (`./workspaces/...`), `scaffold` definido — gera codigo do zero
- **Incremento**: `location` absoluto, `scaffold: null` — adiciona features a codebase existente

### Workspace (gerado pelo run:setup + initializer)

**V2 (multi-milestone, .harness/):**
```
workspace/
├── .harness/                    # gitignored
│   ├── scripts/                 # loop.mjs, run.mjs, init.mjs
│   ├── prompt.md                # prompt do coder agent
│   ├── learnings.md             # licoes cross-milestone
│   ├── active                   # string → "08-precificacao"
│   └── {session}/               # session = milestone
│       ├── config.json          # {slug, project, session_name, specs, agent}
│       ├── features.json
│       ├── progress.txt
│       ├── loop.json            # {status, pid, iteration, ...}
│       └── runs/                # F-001.jsonl, F-001.json, ...
├── .claude/commands/vibe/       # slash commands standalone
├── agent-setup.sh               # bootstrap do projeto
└── .stop                        # graceful stop (verificado pelo loop)
```

**V1 (legacy, flat):**
Contem `agent-harness.json`, `features.json`, `agent-progress.txt`, `agent-harness.mjs`, `.sessions/` por feature, e `.claude/commands/vibe/`.

### Features Pipeline
`features.json` e um array de features com `id`, `status` (failing/passing), `priority`, `dependencies`. O loop seleciona a proxima feature elegivel (maior prioridade, deps satisfeitas), spawna o agent, que implementa + testa e marca como `passing`.

### Planning Pipeline
Brainstorming -> `/derive:specs` -> Specs (requirements, user-stories, design, er, ui-guide, onboarding) -> `/derive:prps` -> PRPs (Product Requirements Prompts). IDs sao referenciados cruzadamente (OSD, US, RNF, PRP).

## Convencoes

- Idioma: pt-BR (commits, docs, comentarios, mensagens)
- Commits: Conventional Commits — `<tipo>(<escopo>): <resumo>`
- Tipos: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`
- Escopos: `system`, `commands`, `blueprint`, `template`, `domain`, `feature`, `task`, `deps`
- Arquivos: `kebab-case`
- Database: `snake_case` (tabelas plural, UUIDs como PK, TIMESTAMPTZ, triggers de `updated_at`)
- ES Modules (`.mjs` para scripts Node.js)
- Node built-ins com `node:` prefix

## Usuarios de teste

| Email | Senha | Role |
|---|---|---|
| admin@ekai.local | admin123 | admin |

Seed: `database/seeds/001_admin_user.sql`. Login: `POST /api/auth/login`.

## Stack do Scaffold (`postgres-n8n`)

Quando um workspace e criado a partir deste scaffold, ele contem:
- **hub**: React 19 + Vite + Tailwind 4 + shadcn/ui (porta 9000)
- **backbone**: Hono + Node.js (porta 9090)
- **landing**: Next.js 15 (porta 3000)
- **database**: PostgreSQL 16 + migrations SQL idempotentes
- **infra**: Docker Compose (PostgreSQL, Redis, n8n, Caddy, Evolution, Whisper)

Scripts do scaffold: `dev:all`, `dev:hub`, `dev:backbone`, `build:all`, `migrate`, `platform:up/down`.

## Tooling Stack

React 18, Vite 5, Tailwind 3, react-router-dom 7, Playwright (e2e). Vite plugins customizados: `brandApiPlugin` (serve brand data), `runMonitorPlugin` (observa runs/), `spaFallbackPlugin`.
