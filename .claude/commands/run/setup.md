Prepara a workspace de um run e executa o Initializer Agent.

## Argumentos: $ARGUMENTS

## Instruções

1. Identifique o projeto (via $ARGUMENTS como path/slug, ou pergunte ao usuário)
2. Execute a API determinística:
   ```
   node runs/.meta/api/init-workspace.mjs --slug X
   ```
   Ou com path direto: `node runs/.meta/api/init-workspace.mjs <path>`
3. Após sucesso, obtenha o workspace do projeto via:
   ```
   node runs/.meta/api/get-status.mjs --slug X --format json
   ```
4. Execute o initializer no workspace conforme o harness:
   - **claude-code**: `cd {workspace} && claude -p "$(cat .claude/commands/vibe/initialize.md)" --allowedTools "Edit,Write,Bash,Read,Glob,Grep"`
   - **codex**: `cd {workspace} && codex exec --full-auto --skip-git-repo-check - < .claude/commands/vibe/initialize.md`
5. Reporte: quantas features criadas, primeira feature, próximos passos (`/run:loop` ou `/run:code`)

## Notas

- Toda a lógica de inicialização está em `runs/.meta/api/init-workspace.mjs`
- O initializer (passo 4) é o LLM que gera `features.json` a partir dos PRPs
- Em caso de erro, mostre a mensagem da API ao usuário
