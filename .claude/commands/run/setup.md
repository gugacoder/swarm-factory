Prepara a workspace de um run e executa o Initializer Agent.

## Argumentos: $ARGUMENTS

## Instruções

1. Identifique o projeto (via $ARGUMENTS como path/slug, ou pergunte ao usuário)
2. Se o projeto tem session_name/milestone definido, passe como `--session-name`:
   ```
   node runs/.meta/api/init-workspace.mjs --slug X --session-name Y
   ```
   Sem session_name: `node runs/.meta/api/init-workspace.mjs --slug X`
   Ou com path direto: `node runs/.meta/api/init-workspace.mjs <path>`
3. Após sucesso, obtenha o workspace do projeto via:
   ```
   node runs/.meta/api/get-status.mjs --slug X --format json
   ```
4. Execute o initializer no workspace via exec-setup-harness (substitui `{session}` e injeta config):

   ```bash
   node runs/.meta/tools/exec-setup-harness.mjs --workspace {workspace} --session {session_name} [--force]
   ```

   O `session_name` vem do output do init-workspace (passo 2).

5. Reporte: quantas features criadas, primeira feature, próximos passos (`/run:loop` ou `/run:code`)

## Notas

- Toda a lógica de inicialização está em `runs/.meta/api/init-workspace.mjs`
- O initializer (passo 4) é o LLM que gera `features.json` a partir dos PRPs
- Cria estrutura `.harness/` com session isolada
- Em caso de erro, mostre a mensagem da API ao usuário
