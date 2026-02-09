---
description: Prepara a workspace de um run e executa o Initializer Agent
---

Prepara a workspace de um run e executa o Initializer Agent.

## Argumentos: $ARGUMENTS

Se argumentos foram passados, use como `<run-name>`.

Se NÃO foram passados argumentos (vazio), use AskUserQuestion:

### Pergunta 1: Run
- Liste as pastas disponíveis em `runs/` (execute `ls runs/`)
- Exclua `.gitkeep` da lista
- Mostre cada pasta como opção selecionável
- Header: "Run"
- Question: "Qual run preparar?"
- Para cada opção, inclua na descrição se já tem features.json ("já inicializado") ou não ("pendente")

## Execução

1. Valide que `runs/{run-name}` existe
2. Valide que `runs/{run-name}/.sessions/.current-milestone` existe
3. Leia a sessão: `cat runs/{run-name}/.sessions/.current-milestone`
4. Detecte a tool (existe `.claude/` → claude-code, existe `.opencode/` → opencode)
5. Execute o initializer:
   - **Claude Code**: `cd runs/{run-name} && claude -p "$(cat .claude/commands/vibe/initialize.md)" --allowedTools "Edit,Write,Bash,Read,Glob,Grep"`
   - **OpenCode**: `cd runs/{run-name} && opencode run --agent initializer "Inicialize o harness"`
6. Após concluir, mostre:
   - Quantas features foram criadas
   - Primeira feature a implementar
   - Próximos passos:
     - `/run:loop {run-name}` (da fábrica)
     - Ou `cd runs/{run-name}` e usar `/vibe:loop` direto no destino
