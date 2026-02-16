# AGENTS.md

Este arquivo será enriquecido pelo Initializer Agent com contexto específico do projeto.

## Agent Harness

Este projeto usa agent harness para desenvolvimento incremental com sessões curtas.

### Artefatos de Bridging
- `.harness/{session}/features.json` — tracking de features (status: failing → passing)
- `.harness/{session}/progress.txt` — progresso acumulado entre sessões
- `agent-setup.sh` — bootstrap do ambiente

### Fluxo de Sessão
1. Leia `.harness/{session}/progress.txt` PRIMEIRO
2. Leia `.harness/{session}/features.json` para próxima feature
3. Execute `agent-setup.sh` para subir o ambiente
4. Implemente UMA feature
5. Teste, commite, atualize artefatos

### Planning
Os specs estão no caminho indicado em `.harness/{session}/config.json` → `specs`.
