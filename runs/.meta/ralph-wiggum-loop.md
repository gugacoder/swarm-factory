# Ralph Wiggum Loop

Loop autonomo que executa agents de IA iterativamente ate implementar todas as features de um projeto.

**Inspiracao:** [11 Tips For AI Coding With Ralph Wiggum](https://www.aihero.dev/tips-for-ai-coding-with-ralph-wiggum)

---

## O que e

Um sistema que roda agents (Claude Code, OpenCode) em loop. Cada iteracao pega a proxima feature elegivel, executa o agent, e repete. O loop termina quando todas as features estao `"passing"` — ou quando o operador manda parar.

Por padrao, **sem limites**. Roda ate completar ou ate receber `.stop`. Limites de iteracoes e turns existem para contingencia de tokens.

---

## Arquitetura

Um run e composto por dois artefatos:

1. **Run config** (`runs/{nome}.json`) — metadata: projeto, milestone, scaffold, harness, location
2. **Workspace** (pasta de trabalho no `location`) — codigo, features.json, sessions, agent-harness.json

O loop roda **dentro do workspace**. O run config e lido pelos commands (`/vibe:*`) para resolver paths.

### Run Config

```json
{
  "name": "meu-projeto--cc",
  "project": "meu-projeto",
  "milestone": "01-mvp",
  "milestone_path": "milestones/01-mvp",
  "scaffold": null,
  "harness": "claude-code",
  "location": "D:\\sources\\meu-projeto",
  "params": { "max_iterations": null, "max_turns": 50, "model": null },
  "created_at": "2026-02-08T00:00:00Z"
}
```

- `location` relativo (`./workspaces/...`) = prototipacao local na fabrica
- `location` absoluto (`D:\sources\...`) = projeto real existente
- `milestone_path` relativo = relativo ao `location`; absoluto = direto; ausente = `projects/{project}/{milestone}/` na fabrica
- Chave candidata = `location` (nunca dois runs para a mesma pasta)

### Estrutura do Workspace

```
<location>/                             ← workspace (pode ser path externo)
├── ralph-wiggum-loop.sh        # Engine do loop (copiada da fabrica, sourced pelo wrapper)
├── ralph-wiggum-loop.md        # Documentacao do loop (copiada da fabrica)
├── agent-harness.json          # Config resolvida pelo initializer
├── agent-harness.sh            # Wrapper — source do ralph-wiggum-loop.sh local
├── agent-harness.pid           # PID do processo do loop (gravado no startup, gitignored)
├── agent-harness.state         # JSON — estado atual do loop (gitignored)
├── agent-setup.sh              # Bootstrap do ambiente
├── features.json               # Lista de features (fonte de verdade do progresso)
├── agent-progress.txt          # Log acumulado entre sessoes (contexto pro agent)
├── .env                        # Config de ambiente (se aplicavel)
├── .stop                       # Sinal de parada (criado sob demanda, consumido ao parar)
│
├── .claude/commands/vibe/
│   ├── initialize.md           # Prompt do initializer agent
│   └── code.md                 # Prompt do coding agent
│
└── .sessions/
    ├── .current-milestone      # Nome do milestone
    ├── .current-feature        # Feature ID da sessao ativa
    └── <feature-id>/           # Ex: F-006
        ├── output.jsonl        # Output do agent (JSON Lines)
        ├── pid                 # PID do agent
        ├── started_at          # Timestamp UTC de inicio
        ├── finished_at         # Timestamp UTC de fim
        └── checklist.md        # Progresso dos testes (mantido pelo agent)
```

### agent-harness.json

Criado pelo initializer, contem paths resolvidos para o coder agent nao precisar adivinhar:

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

O `planning_path` e sempre absoluto. O coder le `agent-harness.json` no startup e sabe exatamente onde estao specs, PRPs e refs.

### Infraestrutura na fabrica (source of truth)

```
runs/.meta/
├── ralph-wiggum-loop.sh        # Engine do loop (copiada para o workspace pelo setup)
├── ralph-wiggum-loop.md        # Este documento (copiado para o workspace pelo setup)
├── run.schema.json             # Schema de validacao do run.json
└── harnesses/                  # Templates por agente
    ├── claude-code/
    │   ├── agent-harness.sh    # Wrapper (define run_agent, faz source ./ralph-wiggum-loop.sh)
    │   └── templates/          # Prompts genericos do workspace
    │       ├── initialize.md   # Prompt do initializer (usa agent-harness.json)
    │       └── code.md         # Prompt do coder (usa agent-harness.json)
    └── opencode/
        ├── agent-harness.sh
        ├── opencode.json
        └── AGENTS.md
```

O `run:setup` copia `ralph-wiggum-loop.sh`, `ralph-wiggum-loop.md` e `agent-harness.sh` para o workspace, tornando-o autossuficiente. A fabrica e a source of truth — `run:setup` SEMPRE sobrescreve a engine e os templates.

---

## Como Operar

### Rodar

```bash
cd <location>
bash agent-harness.sh
```

**Deve ser executado diretamente no terminal** — nao via ferramentas com timeout.

### Parar

```bash
touch .stop
```

O loop detecta no proximo ponto de checagem (ate 1s de latencia). Se um agent estiver rodando, **aguarda o agent terminar naturalmente** — nunca mata o agent. O `.stop` e consumido (removido) ao parar.

### Resumir

```bash
bash agent-harness.sh
```

O estado persistente e o `features.json`, nao o processo. O loop le quais features ja estao `"passing"` e continua da proxima elegivel.

**PID muda entre execucoes.** Cada `bash agent-harness.sh` gera novos PIDs (loop e agent). O monitor precisa re-ler `agent-harness.pid` apos um resume.

### Via commands (recomendado)

```bash
/vibe:loop <run-name>           # Resolve location via run.json e executa
/vibe:status <run-name>         # Mostra progresso
/vibe:code <run-name>           # Uma sessao manual
```

### Limites (contingencia de tokens)

Por padrao tudo e ilimitado (`0`). Para sessoes controladas:

```bash
MAX_ITERATIONS=10 MAX_TURNS=30 bash agent-harness.sh
```

| Variavel | Default | O que limita |
|----------|---------|-------------|
| `MAX_ITERATIONS` | `0` (ilimitado) | Iteracoes do loop |
| `MAX_TURNS` / `MAX_STEPS` | `0` (ilimitado) | Turns do agent por sessao |
| `SLEEP_BETWEEN` | `5` | Segundos entre sessoes |
| `MODEL` | (default do CLI) | Modelo do agent |

---

## Features

### Formato

O sistema aceita dois formatos de `features.json`:

**Array direto:**
```json
[
  {
    "id": "F-001",
    "name": "Migrations: Estrutura Base",
    "status": "passing",
    "priority": 1,
    "dependencies": [],
    "prp_path": "D:\\sources\\meu-projeto\\milestones\\01-mvp\\03-prps\\PRP-001.md",
    "completed_at": "2026-02-07T14:00:00Z"
  }
]
```

**Objeto com `.features`:**
```json
{
  "features": [
    { "id": "PRP-001", "status": "passing", "..." : "..." }
  ]
}
```

### Campos que o sistema usa

| Campo | Uso |
|-------|-----|
| `id` | Identifica a feature, nomeia a pasta de sessao |
| `status` | `"passing"` = concluida, qualquer outro = pendente |
| `priority` | Menor numero = maior prioridade (default: 999) |
| `dependencies` | Array de IDs que devem estar `"passing"` antes |

Campos extras (`name`, `tests`, `files`, `prp_path`, etc.) sao consumidos pelo agent, nao pelo loop.

### Selecao

A cada iteracao, o loop escolhe a feature pendente de **maior prioridade** (menor numero) cujas **dependencias ja estejam passing**. Se nenhuma e elegivel (deadlock de deps), o loop aborta.

### Ciclo de vida

```
failing → (agent trabalha) → passing
                ↑
                └── se o agent falha, a feature continua failing
                    e o loop tenta de novo na proxima iteracao
```

---

## Monitoramento

### Estado do Loop — `agent-harness.state`

JSON atualizado a cada transicao de estado:

```json
{
  "status": "running",
  "iteration": 3,
  "max_iterations": 0,
  "total": 36,
  "done": 8,
  "remaining": 28,
  "feature_id": "F-009",
  "started_at": "2026-02-07T15:00:00Z",
  "updated_at": "2026-02-07T15:30:00Z",
  "exit_reason": ""
}
```

| Campo | Valores |
|-------|---------|
| `status` | `starting`, `running`, `between`, `exited` |
| `exit_reason` | `""`, `completed`, `stopped`, `iteration_limit`, `deps_impossible` |
| `max_iterations` | `0` = ilimitado |

### Estado da Sessao

| Arquivo | Conteudo |
|---------|----------|
| `.sessions/.current-feature` | Feature ID ativa (ex: `F-009`) |
| `.sessions/<id>/pid` | PID do agent (verificar com `kill -0`) |
| `.sessions/<id>/started_at` | Timestamp UTC |
| `.sessions/<id>/finished_at` | Timestamp UTC (so existe apos terminar) |
| `.sessions/<id>/checklist.md` | `- [ ]` / `- [x]` dos testes |

### Output do Agent — `output.jsonl`

Formato JSON Lines (`--verbose --output-format stream-json` do Claude Code). Cada linha e um evento JSON independente.

**Evento: mensagem do sistema (init)**
```json
{"type":"system","subtype":"init","session_id":"...","tools":[...],"model":"..."}
```

**Evento: mensagem do assistente (texto)**
```json
{"type":"assistant","message":{"id":"...","role":"assistant","content":[{"type":"text","text":"Vou implementar..."}]},"session_id":"..."}
```

**Evento: uso de ferramenta**
```json
{"type":"assistant","message":{"id":"...","role":"assistant","content":[{"type":"tool_use","id":"...","name":"Edit","input":{"file_path":"/path/to/file","old_string":"...","new_string":"..."}}]},"session_id":"..."}
```

**Evento: resultado de ferramenta**
```json
{"type":"tool_result","tool_use_id":"...","content":[{"type":"text","text":"File edited successfully"}],"session_id":"..."}
```

**Evento: resultado final**
```json
{"type":"result","result":"...","session_id":"...","cost_usd":0.42,"duration_ms":120000,"turns":15}
```

A ferramenta de monitoramento parseia linha a linha para exibir progresso em tempo real. Eventos relevantes:

| O que extrair | Onde encontrar |
|---------------|---------------|
| O que o agent esta fazendo | `type: "assistant"` → campo `content[].text` |
| Qual ferramenta esta usando | `type: "assistant"` → `content[].name` quando `type: "tool_use"` |
| Resultado da ferramenta | `type: "tool_result"` → `content[].text` |
| Custo da sessao | `type: "result"` → `cost_usd` |
| Duracao | `type: "result"` → `duration_ms` |
| Turns usados | `type: "result"` → `turns` |

### Estados Observaveis

```
IDLE        — loop nao esta rodando
RUNNING     — loop rodando, agent ativo
BETWEEN     — loop rodando, entre iteracoes
STOPPING    — .stop pedido, aguardando agent
STOPPED     — loop parou por .stop
COMPLETED   — todas features passing
ERROR       — loop parou por erro
```

### Deteccao de Estado

**Via `agent-harness.state` (recomendado):** ler o JSON e usar `status` + `exit_reason`.

**Via processos (fallback):**

```
Loop NAO rodando (agent-harness.pid invalido):
  ├── agent-harness.state "exited" + "completed"   → COMPLETED
  ├── agent-harness.state "exited" + "stopped"     → STOPPED
  ├── agent-harness.state "exited" + outro         → ERROR
  └── Sem agent-harness.state                      → IDLE

Loop RODANDO (agent-harness.pid valido):
  ├── .stop existe?
  │   └── Sim                             → STOPPING
  └── .stop nao existe?
      ├── Agent pid valido                → RUNNING
      └── Agent pid invalido              → BETWEEN
```

### Controle pela ferramenta

```
[PARAR]
  └── touch <workspace>/.stop
      └── Polling: agent-harness.state muda para "exited"?
          └── Sim → STOPPED

[RESUMIR]
  └── bash <workspace>/agent-harness.sh (background)
      └── Ler agent-harness.pid para novo PID
          └── Monitorar normalmente
```

### O que persiste entre execucoes

| Arquivo | Persiste? | Papel |
|---------|-----------|-------|
| `features.json` | Sim | **Fonte de verdade** do progresso |
| `agent-progress.txt` | Sim | Contexto acumulado pro agent |
| `agent-harness.json` | Sim | Config resolvida (planning_path, factory) |
| `ralph-wiggum-loop.sh` | Sobrescrito pelo setup | Engine do loop (copiada da fabrica) |
| `ralph-wiggum-loop.md` | Sobrescrito pelo setup | Documentacao do loop |
| `.sessions/` | Sim | Historico de todas as sessoes |
| `agent-harness.pid` | Sobrescrito | PID do loop atual |
| `agent-harness.state` | Sobrescrito | Estado do loop atual |
| `.stop` | Consumido | Removido ao parar |
