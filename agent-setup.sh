#!/usr/bin/env bash
# agent-setup.sh — Bootstrap do ambiente para Swarm Factory / 01-new-concepts
# Executa deteccao de pacotes, instala deps, e faz smoke test.

set -euo pipefail

echo "=== Agent Setup — Swarm Factory / 01-new-concepts ==="
echo ""

# --- Detectar gerenciador de pacotes ---
if command -v pnpm &>/dev/null && [ -f "pnpm-lock.yaml" ]; then
  PKG_MANAGER="pnpm"
elif command -v yarn &>/dev/null && [ -f "yarn.lock" ]; then
  PKG_MANAGER="yarn"
elif command -v bun &>/dev/null && [ -f "bun.lockb" ]; then
  PKG_MANAGER="bun"
elif command -v npm &>/dev/null; then
  PKG_MANAGER="npm"
else
  echo "[ERRO] Nenhum gerenciador de pacotes encontrado (npm, pnpm, yarn, bun)"
  exit 1
fi

echo "[INFO] Gerenciador de pacotes: $PKG_MANAGER"

# --- Instalar dependencias ---
echo ""
echo "=== Instalando dependencias ==="
$PKG_MANAGER install

# --- Docker (se docker-compose existir) ---
if [ -f "docker-compose.yml" ] || [ -f "docker-compose.yaml" ]; then
  echo ""
  echo "=== Subindo ambiente Docker ==="
  if command -v docker &>/dev/null; then
    docker compose up -d 2>/dev/null || docker-compose up -d 2>/dev/null || echo "[WARN] Falha ao subir Docker — verifique se o Docker esta rodando"
  else
    echo "[WARN] Docker nao encontrado — pulando"
  fi
fi

# --- Verificar Node.js ---
echo ""
echo "=== Verificando ambiente ==="
echo "[INFO] Node.js: $(node --version 2>/dev/null || echo 'NAO ENCONTRADO')"
echo "[INFO] npm: $(npm --version 2>/dev/null || echo 'NAO ENCONTRADO')"

# --- Verificar ajv (dependencia principal) ---
if node -e "require('ajv')" 2>/dev/null; then
  echo "[OK] ajv disponivel"
else
  echo "[WARN] ajv nao encontrado — sera instalado na feature F-001"
fi

# --- Smoke test: verificar que o workspace esta funcional ---
echo ""
echo "=== Smoke Test ==="

if [ -f "features.json" ]; then
  TOTAL=$(node -e "const f=JSON.parse(require('fs').readFileSync('features.json','utf8')); console.log(f.length)")
  PASSING=$(node -e "const f=JSON.parse(require('fs').readFileSync('features.json','utf8')); console.log(f.filter(x=>x.status==='passing').length)")
  echo "[OK] features.json: $PASSING/$TOTAL passing"
else
  echo "[WARN] features.json nao encontrado"
fi

if [ -f "agent-harness.json" ]; then
  echo "[OK] agent-harness.json presente"
else
  echo "[WARN] agent-harness.json nao encontrado"
fi

if [ -f "agent-progress.txt" ]; then
  echo "[OK] agent-progress.txt presente"
else
  echo "[WARN] agent-progress.txt nao encontrado"
fi

if [ -d ".sessions" ]; then
  echo "[OK] .sessions/ presente"
else
  echo "[WARN] .sessions/ nao encontrado"
fi

# --- Resumo ---
echo ""
echo "=== Resumo ==="
echo "Workspace: $(pwd)"
echo "Package manager: $PKG_MANAGER"
echo "Node.js: $(node --version 2>/dev/null || echo 'N/A')"
echo "Features: ${TOTAL:-0} total, ${PASSING:-0} passing"
echo ""
echo "Setup completo. Pronto para /vibe:code ou node agent-harness.mjs"
