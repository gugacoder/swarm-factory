Crie um novo run a partir do catálogo.

## Argumentos: $ARGUMENTS

## Instruções

1. Colete os parâmetros (via $ARGUMENTS ou pergunte ao usuário):
   - **slug** (obrigatório): identificador do projeto (ex: `meu-app--cc`)
   - **name** (obrigatório): nome descritivo
   - **workspace** (obrigatório): caminho do workspace (ex: `./workspaces/meu-app--cc`)
   - **specs** (obrigatório): caminho das specs relativo ao workspace
   - **harness** (obrigatório): `claude-code` ou `opencode`
   - **format** (opcional, default `flat`): `flat` ou `structured`
   - **model**, **max-turns**, **max-iterations**, **max-features**, **max-retries** (opcionais)
2. Construa e execute:
   ```
   node runs/.meta/api/create-project.mjs --slug X --name Y --workspace W --specs S --harness H [--format F] [--max-turns N] ...
   ```
3. Mostre o JSON criado e sugira: `Próximo: /run:setup {slug}`

## Notas

- Toda a lógica está em `runs/.meta/api/create-project.mjs` — apenas colete e invoque
- Em caso de erro, mostre a mensagem da API ao usuário
