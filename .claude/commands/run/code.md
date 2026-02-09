Execute UMA sessão do Coding Agent dentro de um run.

## Argumentos: $ARGUMENTS

Se argumentos foram passados, use como `<run-name>`.

Se NÃO foram passados argumentos (vazio), use AskUserQuestion:

### Pergunta 1: Run
- Liste os arquivos `*.json` em `runs/` (exceto os de `.meta/`)
- Para cada run, leia o JSON e verifique se o location tem `features.json` (já inicializado)
- Mostre na descrição o progresso: "X/Y features passing"
- Header: "Run"
- Question: "Qual run usar para coding?"

## Execução

1. Leia `runs/{run-name}.json` para obter a configuração do run
2. Resolva o `location` (relativo a `runs/` se começa com `./`)
3. Valide que `{location}/features.json` existe
4. Mostre o status atual (passing/total)
5. Execute uma sessão conforme o harness:
   - **claude-code**: `cd {location} && claude -p "$(cat .claude/commands/vibe/code.md)" --allowedTools "Edit,Write,Bash,Read,Glob,Grep" --max-turns 50`
   - **opencode**: `cd {location} && opencode run --agent coder "Execute o protocolo de startup e implemente a próxima feature"`
6. Mostre o progresso atualizado
