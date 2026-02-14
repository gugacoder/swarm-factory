#!/usr/bin/env bash
# agent-setup.sh — Bootstrap do ambiente para Swarm Factory / 02-app-e-kai-v1 (E-Kai)
# Executa deteccao de pacotes, instala deps, sobe Docker, inicia dev servers e faz smoke test.

set -euo pipefail

echo "=== Agent Setup — E-Kai / 02-app-e-kai-v1 ==="
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

# --- Instalar dependencias (raiz + workspaces) ---
echo ""
echo "=== Instalando dependencias ==="
$PKG_MANAGER install

# --- Docker (PostgreSQL via docker-compose.dev.yml) ---
COMPOSE_FILE=""
if [ -f "docker-compose.dev.yml" ]; then
  COMPOSE_FILE="docker-compose.dev.yml"
elif [ -f "docker/docker-compose.dev.yml" ]; then
  COMPOSE_FILE="docker/docker-compose.dev.yml"
elif [ -f "docker-compose.yml" ]; then
  COMPOSE_FILE="docker-compose.yml"
fi

if [ -n "$COMPOSE_FILE" ]; then
  echo ""
  echo "=== Subindo ambiente Docker ($COMPOSE_FILE) ==="
  if command -v docker &>/dev/null; then
    docker compose -f "$COMPOSE_FILE" up -d 2>/dev/null || docker-compose -f "$COMPOSE_FILE" up -d 2>/dev/null || echo "[WARN] Falha ao subir Docker — verifique se o Docker esta rodando"
    echo "[INFO] Aguardando PostgreSQL ficar pronto..."
    sleep 3
    # Verificar se PostgreSQL esta acessivel
    if command -v pg_isready &>/dev/null; then
      pg_isready -h localhost -p 8102 -t 10 2>/dev/null && echo "[OK] PostgreSQL acessivel na porta 8102" || echo "[WARN] PostgreSQL nao respondeu na porta 8102"
    else
      echo "[INFO] pg_isready nao disponivel — assumindo PostgreSQL pronto"
    fi
  else
    echo "[WARN] Docker nao encontrado — pulando. PostgreSQL precisa estar rodando manualmente."
  fi
else
  echo "[INFO] Nenhum docker-compose encontrado — pulando Docker"
fi

# --- Executar migrations (se existir script) ---
if [ -f "database/migrate.sh" ]; then
  echo ""
  echo "=== Executando migrations ==="
  bash database/migrate.sh 2>/dev/null || echo "[WARN] Falha nas migrations — verifique PostgreSQL"
elif npm run migrate --if-present 2>/dev/null; then
  echo "[OK] Migrations executadas"
fi

# --- Verificar Node.js ---
echo ""
echo "=== Verificando ambiente ==="
echo "[INFO] Node.js: $(node --version 2>/dev/null || echo 'NAO ENCONTRADO')"
echo "[INFO] npm: $(npm --version 2>/dev/null || echo 'NAO ENCONTRADO')"

# --- Verificar dependencias-chave ---
if [ -d "apps/hub" ]; then
  echo "[OK] apps/hub/ (frontend React) presente"
else
  echo "[INFO] apps/hub/ nao existe ainda (sera criado na F-016)"
fi

if [ -d "apps/backbone" ]; then
  echo "[OK] apps/backbone/ (backend Hono) presente"
else
  echo "[INFO] apps/backbone/ nao existe ainda (sera criado na F-016)"
fi

if [ -d "database" ]; then
  echo "[OK] database/ presente"
else
  echo "[INFO] database/ nao existe ainda (sera criado na F-016)"
fi

# --- Iniciar dev servers (em background se existirem) ---
# NOTA: O coding agent deve iniciar manualmente quando precisar.
# Este script apenas verifica se os comandos estao disponiveis.
if [ -f "apps/hub/package.json" ]; then
  echo "[INFO] Frontend disponivel: npm run dev:hub (porta 8100)"
fi
if [ -f "apps/backbone/package.json" ]; then
  echo "[INFO] Backend disponivel: npm run dev:backbone (porta 8101)"
fi

# --- Smoke test: verificar que o workspace esta funcional ---
echo ""
echo "=== Smoke Test ==="

if [ -f "features.json" ]; then
  TOTAL=$(node -e "const f=JSON.parse(require('fs').readFileSync('features.json','utf8')); console.log(f.length)")
  PASSING=$(node -e "const f=JSON.parse(require('fs').readFileSync('features.json','utf8')); console.log(f.filter(x=>x.status==='passing').length)")
  FAILING=$(node -e "const f=JSON.parse(require('fs').readFileSync('features.json','utf8')); console.log(f.filter(x=>x.status==='failing').length)")
  echo "[OK] features.json: $PASSING/$TOTAL passing, $FAILING failing"
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

# Health check do backend (se estiver rodando)
if curl -s http://localhost:8101/api/health >/dev/null 2>&1; then
  echo "[OK] Backend health check: $(curl -s http://localhost:8101/api/health)"
else
  echo "[INFO] Backend nao esta rodando (inicie com npm run dev:backbone)"
fi

# --- Resumo ---
echo ""
echo "=== Resumo ==="
echo "Workspace: $(pwd)"
echo "Milestone: 02-app-e-kai-v1 (E-Kai)"
echo "Package manager: $PKG_MANAGER"
echo "Node.js: $(node --version 2>/dev/null || echo 'N/A')"
echo "Features: ${TOTAL:-0} total, ${PASSING:-0} passing, ${FAILING:-0} failing"
echo ""
echo "Setup completo. Pronto para /vibe:code ou node agent-harness.mjs"
