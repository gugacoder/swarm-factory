---
description: Cria um novo run a partir do template de uma sessão de planning
---

Crie um novo run a partir do template.

## Argumentos: $ARGUMENTS

Se argumentos foram passados, parse como: `<planning-session> <tool> [run-name]`

Se NÃO foram passados argumentos (vazio), use AskUserQuestion para perguntar interativamente:

### Pergunta 1: Sessão de planning
- Liste as pastas disponíveis em `planning/` (execute `ls planning/`)
- Mostre cada pasta como opção selecionável
- Header: "Planning"
- Question: "Qual sessão de planning usar?"

### Pergunta 2: Ferramenta
- Header: "Tool"
- Question: "Qual ferramenta usar para o harness?"
- Opções:
  - "claude-code" — descrição: "Claude Code (Anthropic) — claude -p no loop"
  - "opencode" — descrição: "OpenCode (open-source) — opencode run no loop"

### Pergunta 3: Nome do run
- Header: "Run name"
- Question: "Nome do run? (deixe vazio para usar o default)"
- Opções:
  - "{session}-{tool}" — descrição: "Nome automático (Recomendado)"
  - "Custom" — descrição: "Digitar um nome personalizado"

## Execução

1. Com os valores definidos (via args ou perguntas), valide:
   - `planning/{session}` existe
   - `template/{tool}` existe
2. Execute: `bash create-run.sh {session} {tool} {run-name}`
3. Mostre o resultado e próximos passos:
   ```
   Run criado: runs/{run-name}/
   Próximo: /run:setup {run-name}
   ```
