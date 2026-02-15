#!/bin/bash
# =============================================================================
# Wiki.js MCP Server — Update from Git
# =============================================================================
# Pulls latest changes, reinstalls dependencies, rebuilds and restarts.
# Usage:  npm run update   OR   ./scripts/update.sh
# =============================================================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m'

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

echo -e "${GREEN}=== Wiki.js MCP Server — Update ===${NC}\n"

# ---- Check git ----
if [ ! -d .git ]; then
    echo -e "${RED}[ERROR] Not a git repository. Cannot update.${NC}"
    exit 1
fi

# ---- Stop running server ----
if [ -f server.pid ]; then
    PID=$(cat server.pid)
    if kill -0 "$PID" 2>/dev/null; then
        echo -e "${YELLOW}Stopping running server (PID: $PID)...${NC}"
        kill "$PID" 2>/dev/null || true
        sleep 2
        kill -0 "$PID" 2>/dev/null && kill -9 "$PID" 2>/dev/null || true
    fi
    rm -f server.pid
fi

# ---- Pull latest ----
echo -e "\n${GREEN}[1/4] Pulling latest changes...${NC}"
git pull --ff-only || {
    echo -e "${RED}[ERROR] git pull failed. Resolve conflicts manually.${NC}"
    exit 1
}

# ---- Install deps ----
echo -e "\n${GREEN}[2/4] Installing dependencies...${NC}"
npm install

# ---- Build ----
echo -e "\n${GREEN}[3/4] Building TypeScript...${NC}"
npm run build

# ---- Restart if was running ----
echo -e "\n${GREEN}[4/4] Restarting HTTP server...${NC}"
bash scripts/start_http.sh

echo -e "\n${GREEN}=== Update complete ===${NC}"
