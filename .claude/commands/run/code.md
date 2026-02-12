Execute UMA sessão do Coding Agent dentro de um run.

## Argumentos: $ARGUMENTS

## Instruções

1. Identifique o projeto (via $ARGUMENTS como path/slug, ou pergunte ao usuário)
2. Obtenha o workspace via API:
   ```
   node runs/.meta/api/get-status.mjs --slug X --format json
   ```
3. Detecte a versão e valide features:

   **V2 (tem .harness/):**
   ```bash
   cat {workspace}/.harness/active
   cat {workspace}/.harness/{session}/features.json | head -5
   ```

   **V1 (legacy):**
   ```bash
   cat {workspace}/features.json | head -5
   ```

4. Mostre o progresso atual

5. Execute o loop com limite de 1 feature:

   **V2**: `cd {workspace} && MAX_FEATURES=1 node .harness/scripts/loop.mjs`
   **V1**: `cd {workspace} && MAX_FEATURES=1 node agent-harness.mjs`

6. Mostre o progresso atualizado após conclusão

## Notas

- Equivale a rodar o loop uma única vez (1 feature)
- V2 usa `.harness/scripts/loop.mjs`; V1 usa `agent-harness.mjs`
- Em caso de erro, mostre a mensagem ao usuário
