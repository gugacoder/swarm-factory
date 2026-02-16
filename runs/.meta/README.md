# Runs — Módulo de Execução Autônoma

## Visão Geral

O módulo Runs orquestra a execução autônoma de projetos de software usando agentes de IA. Conecta um projeto (specs + PRPs) a um workspace de código via configuração declarativa (`project.json`), e executa features automaticamente usando o Ralph Wiggum Loop — um loop que seleciona, implementa e testa features uma a uma até completar o projeto.

Toda a API é acessível como CLI (scripts Node.js) e como SDK (imports ES Modules).

## Conceitos

| Conceito | Descrição |
|----------|-----------|
| **project.json** | Manifesto do projeto — declara slug, workspace, specs, agente e artefatos. Fonte da verdade. |
| **Workspace** | Diretório de desenvolvimento onde o código vive. Artefatos em `.harness/`. |
| **Features** | Unidades de trabalho rastreadas em `features.json`. Cada feature tem status, prioridade e dependências. |
| **Session** | Uma session = milestone dentro de `.harness/{session}/`. Permite múltiplos milestones no mesmo workspace. |
| **Sessão de Feature** | Uma execução do agente para implementar uma feature. Registrada em `.harness/{session}/runs/`. |
| **Harness** | Agente executor (`claude-code`, `opencode`, `codex`). Cada harness tem seu template de scripts e commands. |
| **Loop** | O Ralph Wiggum Loop — seleciona a próxima feature elegível, spawna o agente, verifica resultado, repete. |

## Guia Rápido

### Criar projeto

```bash
node runs/.meta/api/create-project.mjs \
  --slug meu-app \
  --name "Meu App" \
  --workspace "/home/user/meu-app" \
  --specs "./docs/specs" \
  --harness claude-code

# Saída:
# ✔ Projeto criado: runs/meu-app/project.json
# {
#   "slug": "meu-app",
#   "name": "Meu App",
#   "specs": "./docs/specs",
#   "workspace": "/home/user/meu-app",
#   "agent": {
#     "harness": "claude-code",
#     "model": null,
#     "max_turns": 50,
#     "max_iterations": null,
#     "max_features": null,
#     "max_retries": 5
#   },
#   "artifacts": { ... }
# }
```

Flags opcionais: `--model`, `--max-turns`, `--max-iterations`, `--max-features`, `--max-retries`, `--format` (`flat` ou `structured`, default: `structured`), `--description`.

### Inicializar workspace

```bash
node runs/.meta/api/init-workspace.mjs --slug meu-app

# Saída:
# ✔ Workspace inicializado: /home/user/meu-app
# {
#   "workspace": "/home/user/meu-app",
#   "slug": "meu-app",
#   "name": "Meu App",
#   "harness": "claude-code",
#   "artifacts_created": ["harness_dir", "scripts_dir", "prompt", ...]
# }
```

Após inicializar, execute o Initializer Agent para gerar `features.json` a partir dos PRPs.

### Criar worktree isolado

```bash
node runs/.meta/api/create-worktree.mjs \
  --target /home/user/meu-app \
  --milestone 08-precificacao \
  --harness claude-code

# Cria:
# 1. Git worktree em /home/user/meu-app-08-precificacao (branch milestone/08-precificacao)
# 2. Run config em runs/meu-app-08-precificacao-cc.json
# 3. Estrutura .harness/ no worktree
```

### Executar uma feature

```bash
cd /home/user/meu-app
MAX_FEATURES=1 node .harness/scripts/loop.mjs

# Saída (.harness/{session}/loop.json):
# {
#   "status": "exited",
#   "pid": 12345,
#   "iteration": 1,
#   "feature_id": "F-001",
#   "features_done": 1,
#   "exit_reason": "feature_limit"
# }
```

### Executar loop contínuo

```bash
cd /home/user/meu-app
node .harness/scripts/loop.mjs                  # Session de .harness/active
node .harness/scripts/loop.mjs 09-checklist     # Session explícita
```

Loop executa até:
- Todas as features serem passing (`exit_reason: "completed"`)
- Atingir MAX_ITERATIONS (`exit_reason: "iteration_limit"`)
- Receber .stop (`exit_reason: "stopped"`)
- Nenhuma feature elegível restante (`exit_reason: "deps_impossible"`)

Para parar graciosamente (o loop termina a feature atual):

```bash
touch .stop
```

Variáveis de ambiente:

| Variável | Default | Descrição |
|----------|---------|-----------|
| `MAX_TURNS` | `agent.max_turns` | Turns por sessão do agente |
| `MAX_ITERATIONS` | `agent.max_iterations` | Iterações totais do loop (0 = ilimitado) |
| `MAX_FEATURES` | `agent.max_features` | Features a completar (0 = ilimitado) |
| `MODEL` | `agent.model` | Modelo do agente |
| `SLEEP_BETWEEN` | `5` | Segundos entre iterações |

### Consultar status

```bash
node runs/.meta/api/get-status.mjs --slug meu-app

# Saída (--format table, default):
# meu-app — Meu App
# Estado: idle
# Progresso: [████████████████░░░░] 80% (12/15)
#
#   passing:     12
#   failing:      2
#   pending:      1
#   in_progress:  0
#   blocked:      0
#   skipped:      0

node runs/.meta/api/get-status.mjs --slug meu-app --format json

# Saída:
# {
#   "slug": "meu-app",
#   "name": "Meu App",
#   "workspace": "/home/user/meu-app",
#   "state": "idle",
#   "loop": {
#     "active": false,
#     "pid": null,
#     "iteration": null,
#     "started_at": null
#   },
#   "features": {
#     "total": 15,
#     "pending": 1,
#     "in_progress": 0,
#     "failing": 2,
#     "blocked": 0,
#     "skipped": 0,
#     "passing": 12
#   },
#   "progress": 80
# }
```

### Listar projetos

```bash
node runs/.meta/api/list-projects.mjs

# Saída (--format table, default):
# slug          name            workspace               harness       format
# ─────────────────────────────────────────────────────────────────────────────
# meu-app       Meu App         /home/user/meu-app      claude-code   structured
# outro-proj    Outro Projeto   /home/user/outro         opencode      flat

node runs/.meta/api/list-projects.mjs --format json

# Saída:
# [
#   {
#     "slug": "meu-app",
#     "name": "Meu App",
#     "workspace": "/home/user/meu-app",
#     "harness": "claude-code",
#     "format": "structured",
#     "_source": "runs/meu-app/project.json"
#   }
# ]
```

## Uso como SDK

### Importar módulos

```javascript
import { createProject } from './runs/.meta/api/create-project.mjs'
import { loadProject } from './runs/.meta/api/load-project.mjs'
import { initWorkspace } from './runs/.meta/api/init-workspace.mjs'
import { listProjects } from './runs/.meta/api/list-projects.mjs'
import { getStatus } from './runs/.meta/api/get-status.mjs'
```

### createProject(params)

Cria um novo `project.json` validado e o escreve no filesystem.

**Parâmetros:**

| Param | Tipo | Default | Obrigatório |
|-------|------|---------|-------------|
| `slug` | string | — | sim |
| `name` | string | — | sim |
| `workspace` | string | — | sim |
| `specs` | string | — | sim |
| `harness` | string | — | sim |
| `description` | string | `null` | não |
| `model` | string | `null` | não |
| `max_turns` | number | `50` | não |
| `max_iterations` | number | `null` | não |
| `max_features` | number | `null` | não |
| `max_retries` | number | `5` | não |
| `format` | string | `'structured'` | não |
| `runsDir` | string | auto-detectado | não |

**Retorno:** `Promise<object>` — o `project.json` gerado.

**Erros:**
- Validação falhou contra o schema
- Projeto já existe no destino

```javascript
const project = await createProject({
  slug: 'meu-app',
  name: 'Meu App',
  workspace: '/home/user/meu-app',
  specs: './docs/specs',
  harness: 'claude-code',
  max_turns: 100
})
// project.agent.max_turns === 100
```

### loadProject(pathOrOptions)

Carrega, valida e enriquece um `project.json` com paths resolvidos.

**Parâmetros:**
- `string` — caminho direto para `project.json`
- `{ slug: string, runsDir?: string }` — busca por slug via discovery

**Retorno:** `Promise<object>` — project.json + campos `_source` (path do arquivo) e `_resolved` (specs e artifacts com paths absolutos).

**Erros:**
- Slug não encontrado
- JSON inválido ou não passa no schema

```javascript
// Por path
const p = await loadProject('runs/meu-app/project.json')

// Por slug
const p = await loadProject({ slug: 'meu-app', runsDir: 'runs/' })

// p._source → 'runs/meu-app/project.json'
// p._resolved.specs → '/absolute/path/to/specs'
// p._resolved.artifacts.features → '/absolute/path/to/features.json'
```

### initWorkspace(pathOrOptions)

Inicializa o workspace de um projeto: cria `.harness/`, copia scripts e commands.

**Parâmetros:**
- `string` — caminho direto para `project.json`
- `{ slug: string, runsDir?: string }` — busca por slug via discovery

**Retorno:** `Promise<object>`

```javascript
{
  workspace: string,            // path absoluto
  slug: string,
  name: string,
  harness: string,
  artifacts_created: string[]   // chaves dos artefatos criados
}
```

**Comportamento na reinicialização:** sobrescreve scripts do harness, mas preserva `features.json` e `progress.txt`.

**Erros:**
- Projeto não encontrado ou inválido

```javascript
const result = await initWorkspace({ slug: 'meu-app' })
// result.workspace → '/home/user/meu-app'
// result.artifacts_created → ['harness_dir', 'scripts_dir', 'prompt', ...]
```

### listProjects(options)

Lista todos os projetos descobertos no diretório de runs.

**Parâmetros:**

| Param | Tipo | Default |
|-------|------|---------|
| `runsDir` | string | auto-detectado |

**Retorno:** `Promise<Array>` — array de `ProjectSummary`:

```javascript
{
  slug: string,
  name: string | null,
  workspace: string | null,
  harness: string | null,
  format: string,       // 'flat' | 'structured'
  _source: string,      // path do arquivo
  _error?: string       // presente se projeto inválido
}
```

Projetos com JSON inválido aparecem com `_error` — não são ignorados silenciosamente.

```javascript
const projects = await listProjects({ runsDir: 'runs/' })
// projects[0].slug → 'meu-app'
// projects[0]._error → undefined (projeto válido)
```

### getStatus(pathOrOptions)

Consulta o status completo de um projeto: estado do workspace, loop e features.

**Parâmetros:**
- `string` — caminho direto para `project.json`
- `{ slug: string, runsDir?: string }` — busca por slug via discovery

**Retorno:** `Promise<object>`

```javascript
{
  slug: string,
  name: string,
  workspace: string,
  state: string,          // 'not_initialized' | 'initialized' | 'idle' | 'running'
  loop: {
    active: boolean,
    pid: number | null,
    iteration: number | null,
    started_at: string | null
  },
  features: {
    total: number,
    pending: number,
    in_progress: number,
    failing: number,
    blocked: number,
    skipped: number,
    passing: number
  },
  progress: number        // 0–100
}
```

```javascript
const status = await getStatus({ slug: 'meu-app' })
// status.state → 'idle'
// status.progress → 80
// status.features.passing → 12
```

## Formatos de Arquivo

### project.json

Manifesto do projeto. Vive no diretório de runs.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `slug` | string | Identificador machine-friendly |
| `name` | string | Nome humano do projeto |
| `description` | string \| null | Contexto sobre o projeto |
| `specs` | string | Caminho para specs/PRPs (relativo ao workspace ou absoluto) |
| `workspace` | string | Caminho absoluto para o diretório de desenvolvimento |
| `agent` | AgentConfig | Configuração do agente (ver abaixo) |
| `artifacts` | Record\<string, Artifact\> | Artefatos declarados com `type` (`file`/`dir`) e `path` |

Dois formatos no filesystem:

| Formato | Path | Uso |
|---------|------|-----|
| **Flat** | `runs/{slug}.json` | Projetos avulsos, criação manual |
| **Structured** | `runs/{slug}/project.json` | Padrão, via `create-project.mjs` |

Ambos produzem o mesmo objeto em memória após `loadProject()`.

### features.json

Tracking de features. Array JSON. Gerado pelo Initializer Agent. Gerenciado pelo loop.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | string | Identificador (ex: `F-001`) |
| `title` | string | Título descritivo |
| `description` | string | Descrição detalhada / critérios de aceitação |
| `status` | FeatureStatus | Estado atual |
| `priority` | integer | Prioridade (menor valor = maior prioridade) |
| `dependencies` | string[] | IDs de features que devem estar `passing` antes |
| `retries` | integer | Contagem de tentativas (incrementada pelo loop) |
| `prp_ids` | string[] | IDs dos PRPs de origem |
| `completed_at` | string \| undefined | Timestamp ISO8601 quando marcada como `passing` |

Status possíveis:

| Status | Descrição |
|--------|-----------|
| `pending` | Aguardando — ainda não foi selecionada |
| `in_progress` | Em execução — agente trabalhando |
| `failing` | Falhando — testes não passaram na última tentativa |
| `blocked` | Bloqueada — dependências não satisfeitas (computado) |
| `skipped` | Pulada — gutter detection após falhas consecutivas |
| `passing` | Passando — testes OK, feature completa |

## Artefatos do Workspace

### Estrutura `.harness/` (multi-milestone)

```
workspace/
├── .harness/                              # gitignored
│   ├── scripts/
│   │   ├── loop.mjs                       # ralph wiggum loop (shared)
│   │   ├── run.mjs                        # spawna coder agent (per-harness)
│   │   └── init.mjs                       # spawna initializer agent (per-harness)
│   ├── prompt.md                          # prompt do coder agent
│   ├── learnings.md                       # lições cross-milestone
│   ├── active                             # string → "08-precificacao"
│   └── {session}/                         # session = milestone
│       ├── config.json                    # {slug, project, session_name, specs, agent}
│       ├── features.json
│       ├── progress.txt
│       ├── loop.json                      # {status, pid, iteration, ...}
│       └── runs/
│           ├── F-001.jsonl                # output stream do agent
│           ├── F-001.json                 # metadata da feature run
│           └── ...
├── agent-setup.sh                         # bootstrap do projeto (no root)
├── .claude/commands/vibe/                 # slash commands standalone
└── .stop                                  # graceful stop
```

#### config.json (per-session)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `slug` | string | Slug do run |
| `project` | string | Nome do projeto |
| `session_name` | string | Nome da session/milestone |
| `specs` | string | Caminho para specs |
| `agent` | object | Config do agente (harness, model, max_turns, etc.) |
| `notifications` | array | Webhooks |

#### loop.json (per-session)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `status` | string | `starting`, `running`, `between`, `exited` |
| `pid` | number | PID do processo do loop |
| `iteration` | number | Iteração atual |
| `feature_id` | string | Feature em execução |
| `features_done` | number | Features completadas |
| `started_at` | string | Timestamp de início |
| `exit_reason` | string | Motivo de saída |

#### runs/F-xxx.json (metadata da feature run)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `feature_id` | string | ID da feature |
| `started_at` | string | Timestamp de início |
| `finished_at` | string | Timestamp de conclusão |
| `agent_pid` | number | PID do processo do agente |
| `exit_code` | number | Código de saída |
| `retries` | number | Tentativas acumuladas |

## Configuração do Agente

Campos do objeto `agent` em `project.json`:

| Campo | Tipo | Default | Comportamento |
|-------|------|---------|---------------|
| `harness` | string | — | Agente executor: `claude-code`, `opencode`, `codex` |
| `model` | string \| null | `null` | Modelo do agente (`null` = default do harness) |
| `max_turns` | integer \| null | `50` | Turns por sessão. `null` = sem limite |
| `max_iterations` | integer \| null | `null` | Iterações totais do loop. `null` = sem limite |
| `max_features` | integer \| null | `null` | Features a completar. `1` = sessão manual. `null` = todas |
| `max_retries` | integer | `5` | Tentativas por feature antes de rotação de contexto |

Todos os campos (exceto `harness`) podem ser sobrescritos via variáveis de ambiente no momento da execução.

## Webhooks

Configurados no array `notifications` do `config.json`:

```json
{
  "notifications": [
    {
      "url": "https://example.com/webhook",
      "events": ["completed", "stopped"]
    },
    {
      "url": "https://monitor.local/all",
      "events": ["*"]
    }
  ]
}
```

### Eventos disponíveis

| Evento | Quando disparado |
|--------|-----------------|
| `feature_done` | Feature completada com sucesso (`passing`) |
| `feature_skip` | Feature pulada pelo gutter detection (`skipped`) |
| `completed` | Loop finalizou — todas as features processadas |
| `stopped` | Graceful stop via `.stop` |
| `error` | Erro fatal no loop |
| `*` | Wildcard — recebe todos os eventos |

### Payload

```json
{
  "event": "feature_done",
  "timestamp": "2026-02-09T15:30:00.000Z",
  "project": {
    "slug": "meu-app",
    "name": "Meu App"
  },
  "data": {
    "featureId": "F-003",
    "featureTitle": "Título da feature",
    "iteration": 3,
    "featuresDone": 3,
    "featuresTotal": 15
  }
}
```

Envio: HTTP POST com `Content-Type: application/json`. Timeout de 10 segundos. Fire-and-forget — erro em um webhook não impede os demais. Resultados registrados em `progress.txt`.

## Graceful Stop

Para parar o loop sem interromper a feature em execução:

```bash
touch .stop
```

Comportamento:
1. O loop verifica a existência de `.stop` antes de selecionar a próxima feature, após a feature atual finalizar, e durante o intervalo entre iterações.
2. Se `.stop` existir, o loop finaliza graciosamente com `exit_reason: "stopped"`.
3. A feature em execução **não é interrompida** — completa normalmente.
4. O arquivo `.stop` é removido automaticamente ao sair.
5. Se `.stop` existir ao iniciar o loop, é removido com aviso no log.

## Gutter Detection

Mecanismo de resiliência para features que falham repetidamente.

### Fluxo

```
Tentativas 1 a max_retries-1:
  → Falha normal, retries incrementado, feature volta para 'failing'

Tentativa max_retries (default: 5):
  → ROTAÇÃO DE CONTEXTO
  → Rollback executado (stash/reset/none)
  → Feature permanece 'failing', contexto limpo para nova tentativa

Tentativas max_retries+1 a max_retries*2-1:
  → Retries normais após rotação

Tentativa max_retries*2 (default: 10):
  → SKIP — feature marcada como 'skipped' permanentemente
  → Feature skipped NÃO satisfaz dependências de outras features
```

### Rollback

Configurado em `agent.rollback` (default: `stash`):

| Modo | Ação |
|------|------|
| `stash` | `git stash push -m "gutter-{featureId}-{timestamp}"` — preserva mudanças |
| `reset` | `git reset --hard HEAD` — descarta mudanças |
| `none` | Sem ação — prossegue com código modificado |

### Guardrails

O arquivo `agent-guardrails.md` é criado/atualizado com lições aprendidas quando ocorre rotação ou skip. Contém fatos (timestamp, problema, ação, resultado) — não interpretações.

Registros no `progress.txt`:
- `[FALHA]` — falha de feature
- `[ROTAÇÃO]` — rotação de contexto executada
- `[ROLLBACK]` — rollback executado
- `[SKIP]` — feature pulada permanentemente

## Troubleshooting

### Loop não inicia

Verifique se `.harness/` existe no workspace com `active` apontando para uma session válida. Execute `initWorkspace()` antes de rodar o loop.

### Feature bloqueada permanentemente

Quando uma feature depende de outra que foi marcada como `skipped`, ela nunca será elegível. O loop detecta isso e sai com `exit_reason: "deps_impossible"`.

### PID stale

Se o loop foi interrompido abruptamente, `loop.json` pode conter um PID inválido. O `getStatus()` verifica se o processo está ativo (cross-platform).

### Reinicializar workspace sem perder features

Execute `initWorkspace()` novamente — sobrescreve scripts do harness, mas preserva `features.json` e `progress.txt`.

### Webhook não dispara

Verifique o array `notifications` em `.harness/{session}/config.json`. Webhooks são fire-and-forget — erros são registrados em `progress.txt` como `[WEBHOOK] POST {url} → ERRO`.

### Features em `in_progress` após crash

Se o loop foi interrompido durante a execução de uma feature, ela pode ficar com status `in_progress`. O loop trata `in_progress` como elegível na próxima execução — a feature será reselecionada automaticamente.

### Worktrees / Multi-milestone

Múltiplos milestones podem coexistir no mesmo workspace (via `.harness/{session}/`). Para isolamento completo via git worktree:

```bash
node runs/.meta/api/create-worktree.mjs \
  --target /path/to/repo \
  --milestone 08-precificacao
```

Isso cria um worktree separado com branch `milestone/{milestone}` e estrutura `.harness/` independente.

---

*Documentação do módulo Runs — estrutura `.harness/` com sessions multi-milestone.*
