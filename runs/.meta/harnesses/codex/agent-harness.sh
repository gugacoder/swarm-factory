#!/bin/bash
# =============================================================================
# Ralph Wiggum Loop — Codex (wrapper)
# =============================================================================

LOOP_NAME="Ralph Wiggum Loop — Codex"
MAX_AGENT_TURNS=${MAX_TURNS:-0}
MODEL=${MODEL:-""}

run_agent() {
  (echo $BASHPID > "$1/pid"; exec codex exec --full-auto \
    --skip-git-repo-check \
    --json \
    ${MODEL:+--model "$MODEL"} \
    -) \
    < .claude/commands/vibe/code.md
}

source ./ralph-wiggum-loop.sh
