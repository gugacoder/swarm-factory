Prepara a workspace de um run e executa o Initializer Agent.

## Argumentos: $ARGUMENTS

Se argumentos foram passados, use como `<run-name>`.

Se NÃO foram passados argumentos (vazio), use AskUserQuestion:

### Pergunta 1: Run
- Liste os arquivos `*.json` em `runs/` (exceto os de `.meta/`)
- Para cada run, leia o JSON e mostre: projeto, milestone, harness
- Inclua na descrição se o location já tem features.json ("já inicializado") ou não ("pendente")
- Header: "Run"
- Question: "Qual run preparar?"

## Execução

### Passo 1 — Ler configuração do run

1. Leia `runs/{run-name}.json` para obter a configuração do run
2. Resolva o `location`:
   - Se começa com `./` → relativo a `runs/`
   - Se absoluto → usar diretamente
3. Valide que o location existe (crie se necessário com `mkdir -p`)

### Passo 2 — Resolver planning path

Resolva o caminho dos docs de planning (specs, PRPs, refs):

- Se `milestone_path` existe no run JSON:
  - Se é caminho relativo → resolver relativo ao `location` (ex: `milestones/01-xxx` → `{location}/milestones/01-xxx`)
  - Se é caminho absoluto → usar diretamente
- Se `milestone_path` NÃO existe → usar `projects/{project}/{milestone}/` (relativo à raiz do repo da fábrica)

Valide que o path resolvido existe e contém pelo menos `03-prps/`.

### Passo 3 — Preparar workspace no location

Crie/atualize os seguintes arquivos no `{location}`:

#### 3.1 `.sessions/.current-milestone`
Conteúdo: nome do milestone (ex: `01-very-first-agentic-worker`). Crie `.sessions/` se não existir (`mkdir -p`).

#### 3.2 `agent-harness.json`
```json
{
  "run": "{run-name}",
  "project": "{project}",
  "milestone": "{milestone}",
  "planning_path": "{planning_path_resolvido_absoluto}",
  "harness": "{harness}",
  "factory": "{caminho_absoluto_da_fabrica}"
}
```
Use caminhos absolutos para `planning_path` e `factory` — o coder roda no `location` e precisa de referências absolutas para docs que podem estar fora.

**Nota:** O arquivo anteriormente se chamava `.harness.json`. Agora é `agent-harness.json` na raiz do workspace.

#### 3.3 Vibe commands para o destino (SEMPRE sobrescrever)

Copie os templates de vibe commands para o destino — estes são os comandos standalone que o dev usa NO projeto.
**SEMPRE sobrescreva** os arquivos existentes — a fábrica é a source of truth e versões antigas no destino causam bugs:

- **claude-code**:
  - Copie `runs/.meta/harnesses/claude-code/templates/initialize.md` → `{location}/.claude/commands/vibe/initialize.md`
  - Copie `runs/.meta/harnesses/claude-code/templates/code.md` → `{location}/.claude/commands/vibe/code.md`

#### 3.4 `agent-harness.sh` (se NÃO existir)
- Se location é relativo (começa com `./`): copie de `runs/.meta/harnesses/{harness}/agent-harness.sh` para `{location}/agent-harness.sh` sem alterações
- Se location é absoluto (projeto externo): gere `{location}/agent-harness.sh` baseado no template de `runs/.meta/harnesses/{harness}/agent-harness.sh`, mas substituindo a linha `source ../../.meta/ralph-wiggum-loop.sh` pelo caminho absoluto: `source "{factory_root}/runs/.meta/ralph-wiggum-loop.sh"` (onde `factory_root` é a raiz da fábrica)

### Passo 4 — Executar initializer agent

Execute o initializer conforme o harness:
- **claude-code**: `cd {location} && claude -p "$(cat .claude/commands/vibe/initialize.md)" --allowedTools "Edit,Write,Bash,Read,Glob,Grep"`
- **opencode**: `cd {location} && opencode run --agent initializer "Inicialize o harness"`

### Passo 5 — Relatório

Após concluir, mostre:
- Quantas features foram criadas
- Primeira feature a implementar
- Próximos passos:
  - `/run:loop {run-name}` (da fábrica)
  - Ou `cd {location}` e usar `/vibe:loop` direto no destino
