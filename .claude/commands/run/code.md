Execute UMA sessão do Coding Agent dentro de um run.

## Argumentos: $ARGUMENTS

## Instruções

1. Identifique o projeto (via $ARGUMENTS como path/slug, ou pergunte ao usuário)
2. Obtenha o workspace via API:
   ```
   node runs/.meta/api/get-status.mjs --slug X --format json
   ```
3. Valide que `{workspace}/features.json` existe e mostre progresso atual
4. Execute o harness MJS com limite de 1 feature:
   ```
   cd {workspace} && MAX_FEATURES=1 node agent-harness.mjs
   ```
5. Mostre o progresso atualizado após conclusão

## Notas

- Equivale a rodar o loop uma única vez (1 feature)
- Toda a lógica está em `agent-harness.mjs` no workspace
- Em caso de erro, mostre a mensagem ao usuário
