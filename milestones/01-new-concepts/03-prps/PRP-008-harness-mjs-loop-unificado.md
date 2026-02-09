# PRP-008 — Harness MJS e Loop Unificado

## Objetivo

Reescrever o Ralph Wiggum Loop em MJS (`agent-harness.mjs`), substituindo o bash atual, unificando os modos Code e Loop em um único fluxo controlado por `max_features`.

## Execution Mode

`implementar`

## Contexto

O sistema atual usa dois arquivos bash:
- `runs/.meta/ralph-wiggum-loop.sh` — engine compartilhada (173 linhas)
- `runs/.meta/harnesses/claude-code/agent-harness.sh` — wrapper que define `run_agent()` e faz source do engine

O loop bash:
- Conta features restantes com `node -e` inline
- Seleciona próxima feature com `node -e` inline
- Gerencia PID, graceful stop, session dirs
- Escreve `agent-harness.state` para observabilidade
- Não implementa gutter detection nem rotação de contexto
- Não distingue `max_features` — roda até acabar ou atingir `MAX_ITERATIONS`

O novo sistema deve:
- Ser um único arquivo MJS por harness (`agent-harness.mjs`)
- Viver em `runs/.meta/harnesses/{harness}/agent-harness.mjs` como template
- Ser copiado para o workspace pelo `init-workspace.mjs`
- Funcionar de forma autônoma no workspace (sem source externo)
- Ler configuração de `agent-harness.json` local
- Suportar `max_features` para unificar Code (1) e Loop (null)

## Especificação

### Invocação

```bash
node agent-harness.mjs
```

Sem argumentos — toda configuração vem de `agent-harness.json` no mesmo diretório.

Variáveis de ambiente opcionais para override:
- `MAX_TURNS` — sobrescreve `agent.max_turns`
- `MAX_ITERATIONS` — sobrescreve `agent.max_iterations`
- `MAX_FEATURES` — sobrescreve `agent.max_features`
- `MODEL` — sobrescreve `agent.model`

### Fluxo principal

1. Ler `agent-harness.json` do diretório corrente
2. Ler `features.json` do path declarado nos artefatos
3. Verificar `.stop` residual — remover com aviso
4. Escrever PID em `agent-harness.pid`
5. Escrever estado inicial em `agent-harness.state`
6. **Loop:**
   a. Incrementar iteração
   b. Verificar `max_iterations` — se atingido, sair
   c. Verificar `max_features` — se features completadas >= limite, sair
   d. Verificar `.stop` — se existir, aguardar agente atual e sair
   e. Recarregar `features.json` (pode ter mudado entre iterações)
   f. Computar blocked: features cujas deps não estão `passing` → marcar como `blocked`
   g. Selecionar próxima feature elegível:
      - Status: `pending` ou `failing` (não `in_progress`, `passing`, `skipped`, `blocked`)
      - Dependencies: todas `passing`
      - Ordenar por `priority` (menor número = maior prioridade)
   h. Se nenhuma elegível → sair (completed ou deps_impossible)
   i. Marcar feature como `in_progress` e salvar `features.json`
   j. Criar session dir (`.sessions/{feature-id}/`)
   k. Registrar `started_at`
   l. Atualizar `agent-harness.state` → running
   m. Spawnar agente conforme harness:
      - Claude Code: `claude -p - --verbose --output-format stream-json --allowedTools "..." --max-turns N < {command_path}`
      - OpenCode: equivalente
   n. Capturar output em `output.jsonl`
   o. Registrar `finished_at`
   p. Reler `features.json` — verificar status da feature:
      - Se `passing` → incrementar `features_done`, registrar sucesso
      - Se não → incrementar `retries` (gutter detection — PRP-009)
   q. Atualizar `agent-harness.state` → between
   r. Aguardar `SLEEP_BETWEEN` (5s) com verificação de `.stop` a cada segundo

### Spawn do agente

A função de spawn deve ser configurável por harness. No template de `claude-code`:

```javascript
async function spawnAgent(config, featureId, sessionDir) {
  const args = [
    '-p', '-',
    '--verbose',
    '--output-format', 'stream-json',
    '--allowedTools', 'Edit,Write,Bash,Read,Glob,Grep',
  ]
  if (config.agent.max_turns) {
    args.push('--max-turns', String(config.agent.max_turns))
  }
  if (config.agent.model) {
    args.push('--model', config.agent.model)
  }
  // Spawn com stdin do command file, stdout/stderr para output.jsonl
}
```

### Observabilidade (agent-harness.state)

Mesmo formato JSON do bash atual, mas gerado por MJS:

```json
{
  "status": "running",
  "iteration": 5,
  "max_iterations": null,
  "total": 15,
  "done": 8,
  "remaining": 7,
  "feature_id": "F-005",
  "features_done": 3,
  "max_features": null,
  "started_at": "2026-02-09T10:30:00Z",
  "updated_at": "2026-02-09T11:15:00Z",
  "exit_reason": ""
}
```

Status possíveis: `starting`, `running`, `between`, `exited`
Exit reasons: `completed`, `stopped`, `iteration_limit`, `feature_limit`, `deps_impossible`, `error`

### Graceful stop

- Detectar arquivo `.stop` no diretório corrente
- Se agente está rodando, aguardar conclusão (não matar processo)
- Remover `.stop` após parar
- Registrar `exit_reason: "stopped"`

**Requisitos:** OSD070–OSD073, OSD090–OSD096, OSD126, OSD127, RNF001–RNF004

## Limites

- Não implementar gutter detection nem rotação de contexto — isso é PRP-009
- Não implementar webhooks — isso é PRP-010
- Não implementar worktrees — isso é PRP-012
- Não alterar o `ralph-wiggum-loop.sh` existente — manter como está para backward compatibility
- Não alterar o `agent-harness.sh` existente — manter como está
- O script MJS deve ser **autocontido** — todo código necessário dentro do arquivo (ou importando apenas de `node:` built-ins)
- Não instalar dependências no workspace — usar apenas `node:` built-ins

## Exemplos

### Execução com max_features=1 (substitui sessão manual)

```bash
MAX_FEATURES=1 node agent-harness.mjs
```

Seleciona uma feature, executa o agente, para. Equivalente ao antigo `/run:code`.

### Execução contínua

```bash
node agent-harness.mjs
```

Com `agent.max_features: null` e `agent.max_iterations: null` — roda até acabar ou `.stop`.

### Graceful stop

```bash
touch .stop
# Loop termina após feature atual
```
