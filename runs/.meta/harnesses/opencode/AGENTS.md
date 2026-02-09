# AGENTS.md

Este arquivo será enriquecido pelo Initializer Agent com contexto específico do projeto.

## Agent Harness

Este projeto usa agent harness para desenvolvimento incremental com sessões curtas.

### Artefatos de Bridging
- `features.json` — tracking de features (status: failing → passing)
- `agent-progress.txt` — progresso acumulado entre sessões
- `agent-setup.sh` — bootstrap do ambiente
- `.sessions/.current-milestone` — nome da sessão de planning

### Fluxo de Sessão
1. Leia `agent-progress.txt` PRIMEIRO
2. Leia `features.json` para próxima feature
3. Execute `agent-setup.sh` para subir o ambiente
4. Implemente UMA feature
5. Teste, commite, atualize artefatos

### Planning
Os docs de planning estão em `../../../projects/{projeto}/{milestone}/`:
- `02-specs/` — especificações
- `03-prps/` — PRPs detalhados
- `04-refs/` — referências técnicas
