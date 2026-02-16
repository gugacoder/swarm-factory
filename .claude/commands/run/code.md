Execute UMA sessão do Coding Agent dentro de um run.

## Argumentos: $ARGUMENTS

## Instruções

1. Identifique o projeto (via $ARGUMENTS como path/slug, ou pergunte ao usuário)
2. Obtenha o workspace via API:
   ```
   node runs/.meta/api/get-status.mjs --slug X --format json
   ```
3. Valide que o workspace tem `.harness/` e features:
   ```bash
   cat {workspace}/.harness/active
   cat {workspace}/.harness/{session}/features.json | head -5
   ```

4. Mostre o progresso atual

5. Execute o loop com limite de 1 feature:

   `cd {workspace} && MAX_FEATURES=1 node .harness/scripts/loop.mjs`

6. Mostre o progresso atualizado após conclusão

## Notas

- Equivale a rodar o loop uma única vez (1 feature)
- Usa `.harness/scripts/loop.mjs`
- Em caso de erro, mostre a mensagem ao usuário
