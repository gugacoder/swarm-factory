Crie um novo run a partir do catálogo.

## Argumentos: $ARGUMENTS

Se argumentos foram passados, parse como: `<project> <milestone> <harness> [run-name]`

Se NÃO foram passados argumentos (vazio), use AskUserQuestion para perguntar interativamente:

### Pergunta 1: Projeto
- Liste as pastas disponíveis em `projects/` (exceto `.meta`)
- Mostre cada pasta como opção selecionável
- Adicione opção "Externo" — descrição: "Projeto existente fora da fábrica"
- Header: "Projeto"
- Question: "Qual projeto usar?"

### Pergunta 2: Milestone
- Se projeto interno: liste as pastas dentro de `projects/{projeto}/` (exceto `project.json`)
- Se projeto externo: pergunte o nome do milestone (texto livre)
- Header: "Milestone"
- Question: "Qual milestone?"

### Pergunta 3: Milestone Path (apenas se projeto externo ou location Custom)
- Header: "Planning"
- Question: "Caminho dos docs do milestone (specs, PRPs, refs) relativo ao projeto?"
- Exemplo: `milestones/01-my-milestone`
- Este campo será salvo como `milestone_path` no run JSON

### Pergunta 4: Scaffold
- Liste as pastas disponíveis em `scaffolds/`
- Header: "Scaffold"
- Question: "Qual scaffold usar?"
- Opções dinâmicas + opção "Nenhum" (para projetos externos)

### Pergunta 5: Harness
- Header: "Harness"
- Question: "Qual agente de IA usar?"
- Opções:
  - "claude-code" — descrição: "Claude Code (Anthropic) — claude -p no loop"
  - "opencode" — descrição: "OpenCode (open-source) — opencode run no loop"

### Pergunta 6: Location
- Header: "Location"
- Question: "Onde criar a workspace?"
- Opções:
  - "./workspaces/{projeto}--{harness-abbrev}" — descrição: "Workspace local (prototipação) (Recomendado)"
  - "Custom" — descrição: "Caminho externo (projeto real existente)"

### Pergunta 7: Nome do run
- Header: "Run name"
- Question: "Nome do run?"
- Opções:
  - "{projeto}--{harness-abbrev}" — descrição: "Nome automático (Recomendado)"
  - "Custom" — descrição: "Digitar um nome personalizado"

## Execução

1. Com os valores definidos (via args ou perguntas), valide:
   - Se projeto interno: `projects/{projeto}/{milestone}` existe
   - Se projeto externo com `milestone_path`: valide que `{location}/{milestone_path}/03-prps/` existe
   - `scaffolds/{scaffold}` existe (se scaffold não for null)
   - `runs/.meta/harnesses/{harness}` existe
2. Crie o diretório do location se necessário (`mkdir -p`)
3. Se scaffold não for null, copie: `cp -r scaffolds/{scaffold}/* {location}/`
4. Copie o harness:
   - **claude-code**: copie `runs/.meta/harnesses/claude-code/agent-harness.sh` para `{location}/agent-harness.sh`
   - **opencode**: copie `runs/.meta/harnesses/opencode/*` para `{location}/` (incluindo `agent-harness.sh`)
5. Crie `{location}/.sessions/.current-milestone` com o nome do milestone
6. Crie o `runs/{run-name}.json` com todos os campos do run config:
   - Inclua `milestone_path` se foi definido (projetos externos)
   - Inclua `scaffold: null` se "Nenhum" foi selecionado
7. Mostre o resultado e próximos passos:
   ```
   Run criado: runs/{run-name}.json
   Location: {location}
   Próximo: /run:setup {run-name}
   ```

Abreviações do harness para nomes: `claude-code` → `cc`, `opencode` → `oc`
