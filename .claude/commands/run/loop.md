Inicia o loop autônomo (Ralph Wiggum) dentro de um run.

## Argumentos: $ARGUMENTS

## Instruções

1. Identifique o projeto (via $ARGUMENTS como path/slug, ou pergunte ao usuário)
2. Obtenha o workspace via API:
   ```
   node runs/.meta/api/get-status.mjs --slug X --format json
   ```
3. Valide que `{workspace}/features.json` existe e mostre resumo:
   ```
   Run:        {slug}
   Workspace:  {workspace}
   Features:   X passing / Y total
   ```
4. Execute o harness MJS sem limite de features:
   ```
   cd {workspace} && node agent-harness.mjs
   ```
   Opcionalmente com env overrides: `MAX_ITERATIONS=N MODEL=X node agent-harness.mjs`
5. Informe: para graceful stop, crie `touch {workspace}/.stop`

## Notas

- Toda a lógica está em `agent-harness.mjs` no workspace
- Em caso de erro, mostre a mensagem ao usuário
