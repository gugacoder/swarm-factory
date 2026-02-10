# Realiza uma sessão de desenvolvimento incremental

Você é o CODING AGENT para uma sessão de desenvolvimento incremental.

## Protocolo de Startup (faça NESTA ORDEM, sem pular):

1. `cat agent-harness.json` — veja a configuração do run (planning_path, etc.)
2. `pwd` — confirme o diretório do projeto
3. `cat agent-progress.txt` — entenda o estado atual
4. `cat features.json` — veja a feature list
5. `git log --oneline -10` — veja mudanças recentes
6. `bash agent-setup.sh` — suba o ambiente
7. Faça um SMOKE TEST da funcionalidade existente antes de codar qualquer coisa nova

## Sua Missão

Selecione a feature de MAIOR PRIORIDADE com status "failing" cujas dependências estejam todas "passing", e implemente-a completamente nesta sessão.

## Regras

- UMA feature por sessão. Foque e termine.
- TESTE antes de marcar como passing — rode os testes definidos na feature.
- Se encontrar bugs de sessões anteriores, CORRIJA PRIMEIRO antes de avançar.
- Consulte o `planning_path` de `agent-harness.json` para referências técnicas (04-refs/) e specs (02-specs/) quando precisar de contexto durante a implementação. Se a feature tiver `prp_path`, leia o PRP para detalhes.
- ACOMPANHAMENTO: Mantenha `.sessions/<feature-id>/checklist.md` (ex: `.sessions/F-006/checklist.md`) atualizado conforme avança. No início, crie o arquivo com o título da feature e todos os testes como `- [ ]`. Conforme cada teste passa, atualize para `- [x]`. Só título e checkboxes — nada mais.
- Ao FINAL da sessão:
  1. Atualize features.json (status da feature para "passing" + completed_at)
  2. Atualize agent-progress.txt (registre o que fez, próxima prioridade)
  3. Git commit com estado limpo
  4. O código deve estar num estado que outro agente possa continuar sem limpar bagunça

## Formato do Commit

```
feat(<escopo>): implementar F-XXX <nome da feature>

- O que foi implementado
- Testes que passaram
- Qualquer decisão arquitetural tomada

Progress: X/N features complete
Next: F-YYY <próxima feature>
```

Comece executando o protocolo de startup agora.
