#!/bin/bash
# =============================================================================
# Wiki.js MCP Server — Full Cleanup & Uninstall
# =============================================================================
# Stops all running processes, removes runtime files and the entire repo.
# Usage:  ./scripts/cleanup.sh
# =============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m'

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

echo -e "${RED}=== Wiki.js MCP Server — Full Cleanup ===${NC}\n"

# ---- Stop by PID file ----
if [ -f server.pid ]; then
    PID=$(cat server.pid)
    if kill -0 "$PID" 2>/dev/null; then
        echo -e "${YELLOW}Stopping server (PID: $PID)...${NC}"
        kill "$PID" 2>/dev/null || true
        sleep 2
        kill -0 "$PID" 2>/dev/null && kill -9 "$PID" 2>/dev/null || true
    fi
    rm -f server.pid
    echo "PID file removed"
fi

# ---- Kill any remaining MCP processes ----
if pgrep -f "dist/http-server.js" > /dev/null 2>&1; then
    echo -e "${YELLOW}Killing remaining http-server processes...${NC}"
    pkill -9 -f "dist/http-server.js" 2>/dev/null || true
fi

if pgrep -f "dist/index.js" > /dev/null 2>&1; then
    echo -e "${YELLOW}Killing remaining stdio server processes...${NC}"
    pkill -9 -f "dist/index.js" 2>/dev/null || true
fi

echo -e "${GREEN}All MCP processes stopped${NC}"

# ---- Remove runtime files ----
echo "Removing runtime files..."
rm -f "$PROJECT_DIR/server.pid"
rm -f "$PROJECT_DIR/server.log"
rm -f "$PROJECT_DIR/.env"

# ---- Remove repo ----
echo ""
echo -e "${RED}Removing project directory: $PROJECT_DIR${NC}"
cd /
rm -rf "$PROJECT_DIR"

echo -e "\n${GREEN}=== Cleanup complete. Project removed. ===${NC}"
