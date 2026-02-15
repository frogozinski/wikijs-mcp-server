#!/bin/bash
# =============================================================================
# Wiki.js MCP Server — Start HTTP Server
# =============================================================================
# Usage:  npm run start:http   OR   ./scripts/start_http.sh
# =============================================================================

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

echo "=== Wiki.js MCP HTTP Server ==="

# ---- Stop existing processes ----
if [ -f server.pid ]; then
    OLD_PID=$(cat server.pid)
    if kill -0 "$OLD_PID" 2>/dev/null; then
        echo "Stopping existing server (PID: $OLD_PID)..."
        kill "$OLD_PID" 2>/dev/null || true
        sleep 1
        # Force kill if still running
        kill -0 "$OLD_PID" 2>/dev/null && kill -9 "$OLD_PID" 2>/dev/null || true
    fi
    rm -f server.pid
fi

# ---- Load .env ----
if [ -f .env ]; then
    export $(grep -v '^#' .env | grep -v '^\s*$' | xargs)
    echo "Loaded .env"
else
    echo "ERROR: .env not found. Run 'npm run setup' first."
    exit 1
fi

# ---- Validate required vars ----
if [ -z "$WIKIJS_API_TOKEN" ] && [ -z "$WIKIJS_API_URL" ]; then
    echo "ERROR: WIKIJS_API_URL and WIKIJS_API_TOKEN not set in .env"
    exit 1
fi

# ---- Check build ----
if [ ! -f dist/http-server.js ]; then
    echo "Building TypeScript..."
    npm run build
fi

# ---- Set defaults ----
export MCP_HTTP_PORT=${MCP_HTTP_PORT:-3200}
export MCP_HTTP_HOST=${MCP_HTTP_HOST:-0.0.0.0}

# ---- Start server in background ----
echo "Starting on ${MCP_HTTP_HOST}:${MCP_HTTP_PORT}..."
nohup node dist/http-server.js > server.log 2>&1 &

# ---- Save PID ----
echo $! > server.pid
echo "Server started (PID: $(cat server.pid))"

# ---- Health check ----
sleep 2
if curl -s "http://localhost:${MCP_HTTP_PORT}/health" > /dev/null 2>&1; then
    echo ""
    curl -s "http://localhost:${MCP_HTTP_PORT}/health" | python3 -m json.tool 2>/dev/null || curl -s "http://localhost:${MCP_HTTP_PORT}/health"
    echo ""
    echo "Server is running. Logs: tail -f server.log"
else
    echo "WARNING: Health check failed. Check server.log for errors."
    tail -5 server.log 2>/dev/null
fi
