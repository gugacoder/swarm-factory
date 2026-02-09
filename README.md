# Swarm Factory

Fabrique de software autonoma — sistema que planeja, configura e constroi multiplos projetos usando agentes de IA em loops autonomos.

## Como funciona

A fabrica opera em tres eixos independentes:

```
                    ┌─────────────────┐
                    │    PROJECTS     │  Catalogo de projetos com planejamento
                    │                 │  (brainstorming, specs, PRPs, refs)
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │      RUNS       │  Configuracoes que conectam
                    │                 │  projeto + scaffold + agente
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
     ┌────────▼────────┐     │     ┌────────▼────────┐
     │   SCAFFOLDS     │     │     │    EXTERNAL     │
     │  Templates de   │     │     │   Projetos ja   │
     │  codigo         │     │     │   existentes    │
     └─────────────────┘     │     └─────────────────┘
                             │
                    ┌────────▼────────┐
                    │  AGENT HARNESS  │  Ralph Wiggum Loop
                    │  (loop autonomo)│  features.json → passing
                    └─────────────────┘
```

## Arquitetura

```
swarm-factory/
│
├── projects/                          ← CATALOGO DE PROJETOS
│   ├── .meta/                         ← metodologia compartilhada
│   │   ├── what-is/                   ← PRP.md, SPECS.md, agent-harness guides
│   │   ├── template/                  ← template de milestone
│   │   └── refs/                      ← biblioteca de referencias (ux, modules, patterns)
│   │
│   └── <projeto>/                     ← um projeto
│       ├── project.json               ← { name, description, milestones[] }
│       └── <milestone>/               ← milestone
│           ├── 01-brainstorming/
│           ├── 02-specs/
│           ├── 03-prps/
│           └── 04-refs/
│
├── scaffolds/                         ← TEMPLATES DE CODIGO
│   └── postgres-n8n/                  ← monorepo Next.js + LangGraph + PostgreSQL + n8n
│       ├── scaffold.json
│       ├── apps/
│       ├── database/
│       └── docker/
│
├── runs/                              ← CONFIGURACOES DE RUNS
│   ├── .meta/                         ← infraestrutura do loop
│   │   ├── ralph-wiggum-loop.sh       ← engine do loop autonomo
│   │   ├── ralph-wiggum-loop.md       ← documentacao completa do loop
│   │   ├── run.schema.json            ← schema de validacao
│   │   └── harnesses/                 ← configs por agente de IA
│   │       ├── claude-code/
│   │       │   ├── agent-harness.sh   ← wrapper do loop
│   │       │   └── templates/         ← prompts do workspace (initialize.md, code.md)
│   │       └── opencode/
│   │           ├── agent-harness.sh
│   │           ├── opencode.json
│   │           └── AGENTS.md
│   │
│   ├── <run-name>.json                ← run configs
│   │
│   └── workspaces/                    ← pastas de trabalho (prototipacao)
│       └── <run-name>/
│
├── tooling/                           ← DASHBOARD (brand-editor, run-monitor, session-live)
│
└── .claude/                           ← SKILLS E COMMANDS
    ├── commands/
    │   ├── vibe/                      ← create, initialize, code, loop, status
    │   └── derive/                    ← specs, prps
    └── skills/
        └── git-commit/
```

## Fluxo de trabalho

### 1. Criar um run

```bash
/vibe:create
```

Interativo — seleciona projeto, milestone, scaffold, harness e location.

### 2. Inicializar o harness

```bash
/vibe:initialize <run-name>
```

Le os specs e PRPs do milestone, gera `features.json` com todas as features decompostas, cria `agent-progress.txt` e `agent-setup.sh`.

### 3. Executar

```bash
# Loop autonomo (recomendado)
/vibe:loop <run-name>

# Sessao manual (uma feature por vez)
/vibe:code <run-name>

# Status
/vibe:status
/vibe:status <run-name>
```

#### Executar o loop direto no terminal

Apos a inicializacao, o `agent-harness.sh` fica na raiz do workspace do projeto. Para rodar fora do Claude Code:

```bash
cd <location>          # ex: cd D:/sources/codr.studio/agiliza

# Rodar com defaults
bash agent-harness.sh

# Ou com parametros opcionais
MAX_TURNS=50 bash agent-harness.sh                          # limitar turns por sessao
MODEL=claude-sonnet-4-5-20250929 bash agent-harness.sh      # forcar modelo
MAX_TURNS=50 MODEL=opus bash agent-harness.sh               # combinar parametros
```

Para parar o loop graciosamente (termina a feature atual antes de parar):

```bash
touch .stop            # dentro do workspace
```

### Derivacao de docs

```bash
/derive:specs <projeto>/<milestone>    # Brainstorming → Specs
/derive:prps <projeto>/<milestone>     # Specs → PRPs
```

## Run Config

Cada run e um JSON em `runs/<nome>.json`:

```json
{
  "name": "meu-projeto--cc",
  "project": "meu-projeto",
  "milestone": "01-mvp",
  "milestone_path": "milestones/01-mvp",
  "scaffold": "postgres-n8n",
  "harness": "claude-code",
  "location": "D:\\sources\\meu-projeto",
  "params": {
    "max_iterations": null,
    "max_turns": 50,
    "model": null
  },
  "created_at": "2026-02-08T00:00:00Z"
}
```

### Campos

| Campo | Descricao |
|-------|-----------|
| `name` | Identificador unico do run |
| `project` | Nome do projeto |
| `milestone` | Nome do milestone |
| `milestone_path` | Caminho para docs (specs, PRPs, refs). Relativo ao `location` ou absoluto. Se ausente, usa `projects/{project}/{milestone}/` na fabrica |
| `scaffold` | Template de codigo (`null` para projetos existentes) |
| `harness` | Agente de IA: `claude-code` ou `opencode` |
| `location` | Pasta de trabalho. Relativo (`./workspaces/...`) = prototipacao. Absoluto = projeto existente |
| `params` | Limites: `max_iterations`, `max_turns`, `model` |

### Dois modos de operacao

**Prototipacao (interno):**
- `location`: `./workspaces/meu-projeto--cc`
- `scaffold`: `postgres-n8n`
- `milestone_path`: ausente (usa `projects/` da fabrica)
- Caso: projeto novo, codigo gerado do zero a partir de um scaffold

**Incremento (externo):**
- `location`: `D:\sources\meu-projeto` (absoluto)
- `scaffold`: `null`
- `milestone_path`: `milestones/01-mvp` (relativo ao projeto)
- Caso: projeto existente, adicionar features a um codebase real

## Workspace

O initializer prepara o workspace no `location` com:

```
<location>/
├── agent-harness.json          # Config resolvida (planning_path absoluto, factory path)
├── agent-harness.sh            # Wrapper do loop autonomo
├── agent-harness.pid           # PID do loop (runtime, gitignored)
├── agent-harness.state         # Estado do loop (runtime, gitignored)
├── agent-setup.sh              # Bootstrap do ambiente
├── features.json               # Features decompostas (failing → passing)
├── agent-progress.txt          # Progresso acumulado entre sessoes
│
├── .claude/commands/vibe/
│   ├── initialize.md           # Prompt do initializer agent
│   └── code.md                 # Prompt do coding agent
│
└── .sessions/
    ├── .current-milestone      # Nome do milestone
    ├── .current-feature        # Feature ID ativa
    └── <feature-id>/           # Ex: F-006
        ├── output.jsonl        # Output do agent
        ├── checklist.md        # Progresso dos testes
        ├── started_at
        └── finished_at
```

O `agent-harness.json` e o elo entre a fabrica e o workspace:

```json
{
  "run": "meu-projeto--cc",
  "project": "meu-projeto",
  "milestone": "01-mvp",
  "planning_path": "D:\\sources\\meu-projeto\\milestones\\01-mvp",
  "harness": "claude-code",
  "factory": "D:\\sources\\swarm-factory"
}
```

O coder agent le `agent-harness.json` para saber onde estao os docs. Nunca precisa adivinhar paths.

## Agent Harness (Ralph Wiggum Loop)

Loop autonomo que executa agentes iterativamente ate implementar todas as features.

```
features.json
  │
  ├── F-001: passing ✓
  ├── F-002: passing ✓
  ├── F-003: failing ← agent trabalhando
  ├── F-004: failing (deps: F-003)
  └── F-005: failing (deps: F-003, F-004)
```

Cada iteracao:
1. Le `features.json`, encontra a proxima feature elegivel (maior prioridade, deps satisfeitas)
2. Spawna o agent, que implementa e testa a feature
3. Agent marca como `passing`, commita, atualiza progresso
4. Loop repete ate todas serem `passing`

Graceful stop: `touch .stop` no workspace.

Documentacao completa: [`runs/.meta/ralph-wiggum-loop.md`](runs/.meta/ralph-wiggum-loop.md)

## Convencoes

### Commits (Conventional Commits em pt-BR)

```
<tipo>(<escopo>): <resumo direto da mudanca>
```

Tipos: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

### Idioma

Projeto em pt-BR (commits, docs, mensagens).

### Codigo

- ES Modules (`.mjs` para scripts Node.js)
- Async/await
- Variaveis de ambiente via `dotenv-cli`
