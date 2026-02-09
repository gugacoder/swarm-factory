---
description: Mostra o status e progresso de um ou todos os runs
---

Mostra o status de um ou todos os runs.

## Argumentos: $ARGUMENTS

Se argumentos foram passados, use como `<run-name>` para ver detalhes de um run específico.

Se NÃO foram passados argumentos (vazio):

1. Liste todas as pastas em `runs/` (exceto .gitkeep)
2. Para cada run, colete:
   - Tool: existe `.claude/` → claude-code, existe `.opencode/` → opencode
   - Session: conteúdo de `.sessions/.current-milestone`
   - Progress: leia `features.json` e conte passing/total (ou "não inicializado" se não existir)
3. Mostre como tabela:
   ```
   Run                                  | Tool        | Planning                    | Progresso
   01-mvp-cartao-de-ponto-claude-code   | claude-code | 01-mvp-cartao-de-ponto      | 12/45 passing
   01-mvp-cartao-de-ponto-opencode      | opencode    | 01-mvp-cartao-de-ponto      | não inicializado
   ```

## Detalhes de um run específico

Quando `run-name` é fornecido:

1. Leia `.sessions/.current-milestone` e mostre a sessão de planning
2. Detecte a tool
3. Se `features.json` existe:
   - Total de features, passing, failing
   - Lista das últimas 5 features passing (com data se tiver completed_at)
   - Próxima feature a implementar (primeira failing sem deps blocking)
4. Se `agent-progress.txt` existe, mostre as últimas 10 linhas
5. Mostre o git log das últimas 5 sessões: `cd runs/{run-name} && git log --oneline -5`
