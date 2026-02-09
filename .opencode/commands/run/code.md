---
description: Executa uma sessão do Coding Agent dentro de um run existente
---

Execute UMA sessão do Coding Agent dentro de um run.

## Argumentos: $ARGUMENTS

Se argumentos foram passados, use como `<run-name>`.

Se NÃO foram passados argumentos (vazio), use AskUserQuestion:

### Pergunta 1: Run
- Liste as pastas em `runs/` que tenham `features.json` (já inicializados)
- Para cada run, mostre na descrição o progresso: "X/Y features passing"
- Header: "Run"
- Question: "Qual run usar para coding?"

## Execução

1. Valide que `runs/{run-name}/features.json` existe
2. Mostre o status atual (passing/total)
3. Detecte a tool (existe `.claude/` → claude-code, existe `.opencode/` → opencode)
4. Execute uma sessão:
   - **Claude Code**: `cd runs/{run-name} && claude -p "$(cat .claude/commands/vibe/code.md)" --allowedTools "Edit,Write,Bash,Read,Glob,Grep" --max-turns 50`
   - **OpenCode**: `cd runs/{run-name} && opencode run --agent coder "Execute o protocolo de startup e implemente a próxima feature"`
5. Mostre o progresso atualizado
