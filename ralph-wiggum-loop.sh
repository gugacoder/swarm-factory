#!/bin/bash
# =============================================================================
# Ralph Wiggum Loop — Engine compartilhada
# Sourced pelos wrappers (não executar diretamente)
#
# Requer do wrapper:
#   LOOP_NAME        — nome para o banner (ex: "Ralph Wiggum Loop — Claude Code")
#   MAX_AGENT_TURNS  — limite de turns/steps do agent (0 = ilimitado)
#   MODEL            — modelo a usar (vazio = default do agent)
#   run_agent()      — função que executa o agent; recebe SESSION_DIR como $1
#
# Limites (0 = ilimitado):
#   MAX_ITERATIONS   — máximo de iterações do loop (default: 0)
#   MAX_AGENT_TURNS  — máximo de turns por sessão do agent (default: 0)
#
# Graceful stop:
#   touch .stop      — loop para após o agent atual terminar
# =============================================================================

set -uo pipefail

MAX_ITERATIONS=${MAX_ITERATIONS:-0}
SLEEP_BETWEEN=${SLEEP_BETWEEN:-5}
STOP_FILE=".stop"

# --- Cores ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# --- Loop state (observabilidade) ---
write_loop_state() {
  local status="$1"
  local exit_reason="${2:-}"
  cat > agent-harness.state <<STEOF
{"status":"${status}","iteration":${i:-0},"max_iterations":${MAX_ITERATIONS},"total":${TOTAL:-0},"done":${DONE:-0},"remaining":${REMAINING:-0},"feature_id":"${NEXT_FEATURE:-}","started_at":"${LOOP_STARTED_AT:-}","updated_at":"$(date -u +%Y-%m-%dT%H:%M:%SZ)","exit_reason":"${exit_reason}"}
STEOF
}

# --- Graceful stop ---
check_stop() {
  [ -f "$STOP_FILE" ] || return 0
  # Agent ainda rodando? Aguarda terminar
  if [ -n "${AGENT_PID:-}" ] && kill -0 "$AGENT_PID" 2>/dev/null; then
    echo -e "${YELLOW}Stop solicitado. Aguardando agent (PID $AGENT_PID) finalizar...${NC}"
    wait "$AGENT_PID" 2>/dev/null
  fi
  echo -e "${YELLOW}Loop encerrado por .stop após iteração ${i:-0}.${NC}"
  write_loop_state "exited" "stopped"
  rm -f "$STOP_FILE"
  exit 0
}

# --- Verificações ---
if [ ! -f "features.json" ]; then
  echo -e "${RED}features.json não encontrado.${NC}"
  exit 1
fi

if [ ! -f ".sessions/.current-milestone" ]; then
  echo -e "${RED}.sessions/.current-milestone não encontrado. Este diretório é um run válido?${NC}"
  exit 1
fi

# .stop residual de sessão anterior? Remove com aviso
if [ -f "$STOP_FILE" ]; then
  echo -e "${YELLOW}AVISO: .stop residual encontrado. Removendo para iniciar.${NC}"
  rm -f "$STOP_FILE"
fi

SESSION=$(cat .sessions/.current-milestone)
LIMIT_LABEL=$( [ "$MAX_ITERATIONS" = "0" ] && echo "∞" || echo "$MAX_ITERATIONS" )
echo -e "${CYAN}=======================================${NC}"
echo -e "${CYAN}  ${LOOP_NAME}${NC}"
echo -e "${CYAN}  Sessão: ${SESSION}${NC}"
echo -e "${CYAN}  Iterações: ${LIMIT_LABEL}${NC}"
echo -e "${CYAN}  Para parar: touch .stop${NC}"
echo -e "${CYAN}=======================================${NC}"
echo ""

LOOP_STARTED_AT=$(date -u +%Y-%m-%dT%H:%M:%SZ)
echo $BASHPID > agent-harness.pid
write_loop_state "starting"

# --- Loop Principal ---
i=0
while true; do
  i=$((i + 1))

  # Limite de iterações (0 = ilimitado)
  if [ "$MAX_ITERATIONS" -gt 0 ] && [ "$i" -gt "$MAX_ITERATIONS" ]; then
    echo -e "${RED}Limite de ${MAX_ITERATIONS} iterações atingido.${NC}"
    echo -e "${RED}Features restantes: ${REMAINING:-?}${NC}"
    write_loop_state "exited" "iteration_limit"
    exit 1
  fi

  check_stop

  # Conta features restantes
  REMAINING=$(node -e "
    const f = JSON.parse(require('fs').readFileSync('features.json','utf8'));
    const r = Array.isArray(f) ? f.filter(x => x.status !== 'passing') : f.features.filter(x => x.status !== 'passing');
    console.log(r.length);
  " 2>/dev/null || echo "?")

  TOTAL=$(node -e "
    const f = JSON.parse(require('fs').readFileSync('features.json','utf8'));
    const t = Array.isArray(f) ? f.length : f.features.length;
    console.log(t);
  " 2>/dev/null || echo "?")

  DONE=$((TOTAL - REMAINING))

  if [ "$REMAINING" = "0" ]; then
    echo ""
    echo -e "${GREEN}=======================================${NC}"
    echo -e "${GREEN}  TODAS AS FEATURES IMPLEMENTADAS!${NC}"
    echo -e "${GREEN}  Total: ${TOTAL} features${NC}"
    echo -e "${GREEN}  Iterações: $((i - 1))${NC}"
    echo -e "${GREEN}=======================================${NC}"
    write_loop_state "exited" "completed"
    exit 0
  fi

  # Descobre o ID da próxima feature failing (maior prioridade com deps passing)
  NEXT_FEATURE=$(node -e "
    const f = JSON.parse(require('fs').readFileSync('features.json','utf8'));
    const arr = Array.isArray(f) ? f : f.features;
    const passingIds = new Set(arr.filter(x => x.status === 'passing').map(x => x.id));
    const next = arr
      .filter(x => x.status !== 'passing')
      .sort((a, b) => (a.priority || 999) - (b.priority || 999))
      .find(x => !x.dependencies || x.dependencies.every(d => passingIds.has(d)));
    console.log(next ? next.id : '');
  " 2>/dev/null || echo "")

  if [ -z "$NEXT_FEATURE" ]; then
    echo -e "${RED}Nenhuma feature elegível (deps não satisfeitas). Abortando.${NC}"
    write_loop_state "exited" "deps_impossible"
    exit 1
  fi

  echo -e "${YELLOW}--- Iteração ${i}/${LIMIT_LABEL} | ${NEXT_FEATURE} | Features: ${DONE}/${TOTAL} (faltam ${REMAINING}) ---${NC}"

  # Session tracking — pasta nomeada pelo ID da feature
  SESSION_DIR=".sessions/${NEXT_FEATURE}"
  mkdir -p "$SESSION_DIR"
  date -u +%Y-%m-%dT%H:%M:%SZ > "$SESSION_DIR/started_at"
  echo "$NEXT_FEATURE" > .sessions/.current-feature
  write_loop_state "running"

  # Executa agent (função definida pelo wrapper)
  # Output em stream-json (JSON Lines) — consumido pela ferramenta de monitoramento
  run_agent "$SESSION_DIR" > "$SESSION_DIR/output.jsonl" 2>&1 &
  AGENT_PID=$!
  wait $AGENT_PID || {
    echo -e "${RED}Sessão ${i} (${NEXT_FEATURE}) falhou. Continuando em ${SLEEP_BETWEEN}s...${NC}"
  }
  date -u +%Y-%m-%dT%H:%M:%SZ > "$SESSION_DIR/finished_at"
  write_loop_state "between"

  check_stop

  echo -e "${CYAN}Sessão ${i} concluída. Aguardando ${SLEEP_BETWEEN}s...${NC}"
  for s in $(seq 1 $SLEEP_BETWEEN); do
    check_stop
    sleep 1
  done
done
