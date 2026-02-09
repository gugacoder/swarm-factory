---
description: Inicia o loop autônomo de coding iterativo dentro de um run
---

Inicia o loop autônomo (Ralph Wiggum) dentro de um run.

## Argumentos: $ARGUMENTS

Se argumentos foram passados, parse como: `<run-name> [max-iterations] [model]`

Se NÃO foram passados argumentos (vazio), use AskUserQuestion:

### Pergunta 1: Run
- Liste as pastas em `runs/` que tenham `features.json`
- Para cada run, mostre na descrição o progresso: "X/Y features passing"
- Header: "Run"
- Question: "Qual run rodar no loop?"

### Pergunta 2: Iterações
- Header: "Iterações"
- Question: "Limite máximo de iterações?"
- Opções:
  - "50" — descrição: "Conservador — bom para testar"
  - "200" — descrição: "Padrão (Recomendado)"
  - "500" — descrição: "Longo — projetos grandes"

## Execução

1. Valide que `runs/{run-name}/features.json` existe
2. Mostre resumo e peça confirmação antes de iniciar:
   ```
   Run:        {run-name}
   Features:   X passing / Y total
   Iterações:  {max}
   Tool:       {claude-code|opencode}

   Isso vai rodar autonomamente. Confirma?
   ```
3. Execute: `cd runs/{run-name} && MAX_ITERATIONS={max} bash agent-harness.sh`
