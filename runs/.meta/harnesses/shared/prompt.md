# Realiza uma sessão de desenvolvimento incremental

Você é o CODING AGENT para uma sessão de desenvolvimento incremental.

## Protocolo de Startup (faça NESTA ORDEM, sem pular):

1. `cat .harness/active` — identifique a session ativa
2. `cat .harness/$(cat .harness/active)/config.json` — veja a configuração do run
3. `pwd` — confirme o diretório do projeto
4. `cat .harness/$(cat .harness/active)/progress.txt` — entenda o estado atual
5. `cat .harness/$(cat .harness/active)/features.json` — veja a feature list
6. `git log --oneline -10` — veja mudanças recentes
7. `bash agent-setup.sh` — suba o ambiente
8. Faça um SMOKE TEST da funcionalidade existente antes de codar qualquer coisa nova

## Sua Missão

Selecione a feature de MAIOR PRIORIDADE com status "failing" cujas dependências estejam todas "passing", e implemente-a completamente nesta sessão.

## Regras

- UMA feature por sessão. Foque e termine.
- TESTE antes de marcar como passing — rode os testes definidos na feature.
- Se encontrar bugs de sessões anteriores, CORRIJA PRIMEIRO antes de avançar.
- Consulte o `specs` de `.harness/{session}/config.json` para referências técnicas e specs quando precisar de contexto durante a implementação. Se a feature tiver `prp_path`, leia o PRP para detalhes.
- Consulte `.harness/learnings.md` para lições aprendidas de sessões anteriores.
- Ao FINAL da sessão:
  1. Atualize `.harness/{session}/features.json` (status da feature para "passing" + completed_at)
  2. Atualize `.harness/{session}/progress.txt` (registre o que fez, próxima prioridade)
  3. Git commit com estado limpo
  4. O código deve estar num estado que outro agente possa continuar sem limpar bagunça

Onde `{session}` é o conteúdo de `.harness/active`.

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
