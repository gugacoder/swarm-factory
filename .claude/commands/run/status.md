Mostra o status de um ou todos os runs.

## Argumentos: $ARGUMENTS

Se argumentos foram passados, use como `<run-name>` para ver detalhes de um run específico.

Se NÃO foram passados argumentos (vazio):

1. Liste todos os arquivos `*.json` em `runs/` (exceto os de `.meta/`)
2. Para cada run config, leia o JSON e colete:
   - Name: campo `name`
   - Project: campo `project`
   - Milestone: campo `milestone`
   - Harness: campo `harness`
   - Location: campo `location`
   - Progress: leia `{location}/features.json` e conte passing/total (ou "não inicializado" se não existir)
3. Mostre como tabela:
   ```
   Run              | Harness     | Project/Milestone               | Location                          | Progresso
   pontofacil--cc   | claude-code | pontofacil/01-mvp-cartao-de-ponto | ./workspaces/pontofacil--cc     | 12/45 passing
   pontofacil--oc   | opencode    | pontofacil/01-mvp-cartao-de-ponto | ./workspaces/pontofacil--oc     | não inicializado
   ```

## Detalhes de um run específico

Quando `run-name` é fornecido:

1. Leia `runs/{run-name}.json` para a configuração completa
2. Resolva o `location` (relativo a `runs/` se começa com `./`)
3. Mostre todos os campos do run config
4. Se `{location}/features.json` existe:
   - Total de features, passing, failing
   - Lista das últimas 5 features passing (com data se tiver completed_at)
   - Próxima feature a implementar (primeira failing sem deps blocking)
5. Se `{location}/agent-progress.txt` existe, mostre as últimas 10 linhas
6. Se `{location}/agent-harness.state` existe, mostre o estado do loop
7. Mostre o git log das últimas 5 sessões: `cd {location} && git log --oneline -5`
