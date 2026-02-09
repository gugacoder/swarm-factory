Inicia o loop autônomo (Ralph Wiggum) dentro de um run.

## Argumentos: $ARGUMENTS

Se argumentos foram passados, parse como: `<run-name> [max-iterations] [model]`

Se NÃO foram passados argumentos (vazio), use AskUserQuestion:

### Pergunta 1: Run
- Liste os arquivos `*.json` em `runs/` (exceto os de `.meta/`)
- Para cada run, leia o JSON e verifique se o location tem `features.json`
- Mostre na descrição o progresso: "X/Y features passing"
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

1. Leia `runs/{run-name}.json` para obter a configuração do run
2. Resolva o `location` (relativo a `runs/` se começa com `./`)
3. Valide que `{location}/features.json` existe
4. Mostre resumo e peça confirmação antes de iniciar:
   ```
   Run:        {run-name}
   Location:   {location}
   Features:   X passing / Y total
   Iterações:  {max}
   Harness:    {harness}

   Isso vai rodar autonomamente. Confirma?
   ```
5. Execute: `cd {location} && MAX_ITERATIONS={max} bash agent-harness.sh`
