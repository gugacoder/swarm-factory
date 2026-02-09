# MJS como padrão da stack

## Decisão

Toda a stack do Runs será `.mjs` — SDK, API, e o `agent-harness` gerado no workspace. Sem `.sh`.

## Justificativa

- JSON é a operação central do sistema (project.json, features.json). Em `.mjs` é cidadão de primeira classe; em `.sh` depende de `jq`.
- Node já é pré-requisito do projeto.
- Cross-platform — roda em Windows sem Git Bash/MSYS2.
- Error handling estruturado (try/catch vs `set -e`).
- O harness gerado no workspace pode importar ou embutir funções da SDK.
- Consistência: uma linguagem só em toda a stack.

## O que muda

- `agent-harness.sh` → `agent-harness.mjs`
- Scripts da API já são `.mjs`
- Invocação: `node agent-harness.mjs` em vez de `bash agent-harness.sh`
