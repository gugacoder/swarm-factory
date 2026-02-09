#!/bin/bash
# =============================================================================
# Cria um novo run a partir do template
#
# Uso:
#   ./create-run.sh <planning-session> <tool> [run-name]
#
# Exemplos:
#   ./create-run.sh 01-mvp-cartao-de-ponto claude-code
#   ./create-run.sh 01-mvp-cartao-de-ponto opencode
#   ./create-run.sh 01-mvp-cartao-de-ponto claude-code sonnet-test
#   MODEL=claude-3-5-sonnet ./create-run.sh 01-mvp cartao-de-ponto opencode meu-teste
# =============================================================================

set -euo pipefail

# --- Cores ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# --- Validação de args ---
if [ $# -lt 2 ]; then
  echo -e "${CYAN}Uso: ./create-run.sh <planning-session> <tool> [run-name]${NC}"
  echo ""
  echo "  planning-session  Nome da pasta em planning/ (ex: 01-mvp-cartao-de-ponto)"
  echo "  tool              claude-code | opencode"
  echo "  run-name          Nome do run (opcional, default: {session}-{tool})"
  echo ""
  echo "Exemplos:"
  echo "  ./create-run.sh 01-mvp-cartao-de-ponto claude-code"
  echo "  ./create-run.sh 01-mvp-cartao-de-ponto opencode meu-teste"
  exit 1
fi

PLANNING_SESSION="$1"
TOOL="$2"
RUN_NAME="${3:-${PLANNING_SESSION}-${TOOL}}"

# --- Diretório base (onde este script está) ---
BASE_DIR="$(cd "$(dirname "$0")" && pwd)"

# --- Validações ---
if [ ! -d "${BASE_DIR}/planning/${PLANNING_SESSION}" ]; then
  echo -e "${RED}Sessão de planning não encontrada: planning/${PLANNING_SESSION}${NC}"
  echo "Sessões disponíveis:"
  ls "${BASE_DIR}/planning/"
  exit 1
fi

if [ ! -d "${BASE_DIR}/template/${TOOL}" ]; then
  echo -e "${RED}Tool não encontrada: template/${TOOL}${NC}"
  echo "Tools disponíveis:"
  ls "${BASE_DIR}/template/" | grep -v scaffold
  exit 1
fi

if [ ! -d "${BASE_DIR}/template/scaffold" ]; then
  echo -e "${RED}Scaffold não encontrado: template/scaffold/${NC}"
  exit 1
fi

RUN_DIR="${BASE_DIR}/runs/${RUN_NAME}"

if [ -d "$RUN_DIR" ]; then
  echo -e "${RED}Run já existe: runs/${RUN_NAME}${NC}"
  echo "Escolha outro nome ou remova o existente."
  exit 1
fi

# --- Criação ---
echo -e "${CYAN}Criando run: ${RUN_NAME}${NC}"
echo -e "  Planning: ${PLANNING_SESSION}"
echo -e "  Tool:     ${TOOL}"
echo ""

# 1. Copia scaffold
echo -e "${YELLOW}[1/4] Copiando scaffold...${NC}"
cp -r "${BASE_DIR}/template/scaffold" "$RUN_DIR"

# 2. Copia harness por cima (merge)
echo -e "${YELLOW}[2/4] Aplicando harness ${TOOL}...${NC}"
cp -r "${BASE_DIR}/template/${TOOL}/." "$RUN_DIR/"

# 3. Cria .sessions/.current-milestone com o nome do milestone
echo -e "${YELLOW}[3/4] Configurando sessão...${NC}"
mkdir -p "${RUN_DIR}/.sessions"
echo -n "$PLANNING_SESSION" > "${RUN_DIR}/.sessions/.current-milestone"

# 4. Inicializa git
echo -e "${YELLOW}[4/4] Inicializando git...${NC}"
cd "$RUN_DIR"
git init -q
git add -A
git commit -q -m "chore: scaffold inicial + harness ${TOOL}

- Scaffold copiado de template/scaffold/
- Harness ${TOOL} aplicado
- Planning session: ${PLANNING_SESSION}"

# --- Resumo ---
echo ""
echo -e "${GREEN}=======================================${NC}"
echo -e "${GREEN}  Run criado com sucesso!${NC}"
echo -e "${GREEN}=======================================${NC}"
echo ""
echo -e "  Diretório: ${CYAN}runs/${RUN_NAME}/${NC}"
echo -e "  Planning:  ${CYAN}planning/${PLANNING_SESSION}/${NC}"
echo -e "  Tool:      ${CYAN}${TOOL}${NC}"
echo ""
echo -e "${YELLOW}Próximos passos:${NC}"
echo ""

if [ "$TOOL" = "claude-code" ]; then
  echo "  cd runs/${RUN_NAME}"
  echo "  claude -p \"\$(cat .claude/commands/vibe/initialize.md)\"   # Initializer"
  echo "  bash agent-harness.sh                              # Loop autônomo"
elif [ "$TOOL" = "opencode" ]; then
  echo "  cd runs/${RUN_NAME}"
  echo "  opencode run --agent initializer \"Inicialize o harness\"   # Initializer"
  echo "  bash agent-harness.sh                              # Loop autônomo"
fi

echo ""
