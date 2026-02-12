Inicia o loop autônomo (Ralph Wiggum) dentro de um run.

## Argumentos: $ARGUMENTS

## Instruções

1. Identifique o projeto (via $ARGUMENTS como path/slug, ou pergunte ao usuário)
2. Obtenha o workspace via API:
   ```
   node runs/.meta/api/get-status.mjs --slug X --format json
   ```
3. Detecte a versão do workspace e valide features:

   **V2 (tem .harness/):**
   ```bash
   cat {workspace}/.harness/active
   cat {workspace}/.harness/{session}/features.json | head -5
   ```

   **V1 (legacy):**
   ```bash
   cat {workspace}/features.json | head -5
   ```

4. Mostre resumo:
   ```
   Run:        {slug}
   Workspace:  {workspace}
   Session:    {session}  (V2 only)
   Features:   X passing / Y total
   ```

5. Execute o loop conforme a versão:

   **V2**: `cd {workspace} && node .harness/scripts/loop.mjs`
   **V1**: `cd {workspace} && node agent-harness.mjs`

   Opcionalmente com env overrides: `MAX_ITERATIONS=N MODEL=X ...`

6. Informe: para graceful stop, crie `touch {workspace}/.stop`

## Notas

- V2 usa `.harness/scripts/loop.mjs` com session isolada
- V1 usa `agent-harness.mjs` no root do workspace
- Em caso de erro, mostre a mensagem ao usuário
