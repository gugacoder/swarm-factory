Inicia o loop autônomo (Ralph Wiggum) dentro de um run.

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

4. Mostre resumo:
   ```
   Run:        {slug}
   Workspace:  {workspace}
   Session:    {session}
   Features:   X passing / Y total
   ```

5. Execute o loop:

   `cd {workspace} && node .harness/scripts/loop.mjs`

   Opcionalmente com env overrides: `MAX_ITERATIONS=N MODEL=X ...`

6. Informe: para graceful stop, crie `touch {workspace}/.stop`

## Notas

- Usa `.harness/scripts/loop.mjs` com session isolada
- Em caso de erro, mostre a mensagem ao usuário
