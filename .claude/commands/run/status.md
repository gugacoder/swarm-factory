Mostra o status de um ou todos os runs.

## Argumentos: $ARGUMENTS

## Instruções

1. Se $ARGUMENTS contém um slug/path, mostre status detalhado:
   ```
   node runs/.meta/api/get-status.mjs --slug X --format table
   ```
2. Se $ARGUMENTS está vazio, liste todos os projetos:
   ```
   node runs/.meta/api/list-projects.mjs --format table
   ```
   E para cada projeto listado, opcionalmente execute `get-status.mjs` para detalhes
3. Mostre o resultado formatado ao usuário

## Notas

- Toda a lógica está em `get-status.mjs` e `list-projects.mjs`
- Use `--format json` se precisar processar os dados programaticamente
- Em caso de erro, mostre a mensagem da API ao usuário
