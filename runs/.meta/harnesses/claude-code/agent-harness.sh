#!/bin/bash
# =============================================================================
# Ralph Wiggum Loop — Claude Code (wrapper)
# =============================================================================

LOOP_NAME="Ralph Wiggum Loop — Claude Code"
MAX_AGENT_TURNS=${MAX_TURNS:-0}
MODEL=${MODEL:-""}

run_agent() {
  (echo $BASHPID > "$1/pid"; exec claude -p - \
    --verbose --output-format stream-json \
    --allowedTools "Edit,Write,Bash,Read,Glob,Grep" \
    ${MAX_AGENT_TURNS:+--max-turns "${MAX_AGENT_TURNS}"} \
    ${MODEL:+--model "$MODEL"}) \
    < .claude/commands/vibe/code.md
}

source ../../.meta/ralph-wiggum-loop.sh
