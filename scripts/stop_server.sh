#!/bin/bash
# =============================================================================
# Wiki.js MCP Server — Stop Server
# =============================================================================
# Usage:  npm run stop   OR   ./scripts/stop_server.sh
# =============================================================================

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

echo "=== Stopping Wiki.js MCP Server ==="

STOPPED=0

# ---- Stop by PID file ----
if [ -f server.pid ]; then
    PID=$(cat server.pid)
    if kill -0 "$PID" 2>/dev/null; then
        echo "Stopping process (PID: $PID)..."
        kill "$PID"
        sleep 2
        if kill -0 "$PID" 2>/dev/null; then
            echo "Force killing PID: $PID"
            kill -9 "$PID" 2>/dev/null || true
        fi
        STOPPED=1
    else
        echo "Process $PID already stopped"
    fi
    rm -f server.pid
fi

# ---- Kill any remaining MCP server processes ----
if pgrep -f "dist/http-server.js" > /dev/null 2>&1; then
    echo "Stopping remaining http-server processes..."
    pkill -f "dist/http-server.js" 2>/dev/null || true
    STOPPED=1
fi

# ---- Clean up ----
if [ -f server.log ]; then
    echo "Log file preserved: server.log"
fi

if [ "$STOPPED" -eq 1 ]; then
    echo "Server stopped."
else
    echo "No running server found."
fi
