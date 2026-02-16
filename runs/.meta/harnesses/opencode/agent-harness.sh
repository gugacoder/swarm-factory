#!/bin/bash
# =============================================================================
# Ralph Wiggum Loop — OpenCode (wrapper)
# =============================================================================

LOOP_NAME="Ralph Wiggum Loop — OpenCode"
MAX_AGENT_TURNS=${MAX_STEPS:-0}
MODEL=${MODEL:-"opencode/big-pickle"}

OC_FLAGS="--agent coder --format json"
CODER_PROMPT="Execute o protocolo de startup: leia .harness/active, depois .harness/{session}/config.json e progress.txt, features.json, git log. Rode agent-setup.sh. Implemente a próxima feature failing de maior prioridade cujas dependências estejam passing. Teste, commite, atualize os artefatos."

run_agent() {
  (echo $BASHPID > "$1/pid"; exec opencode run ${OC_FLAGS} \
    ${MODEL:+--model "$MODEL"} "${CODER_PROMPT}")
}

source .harness/scripts/loop.mjs
