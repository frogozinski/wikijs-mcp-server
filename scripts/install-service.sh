#!/bin/bash
# =============================================================================
# Wiki.js MCP Server — systemd Service Installer
# =============================================================================
# Installs the MCP HTTP server as a systemd service on Ubuntu/Debian.
# Must be run as root (sudo).
#
# Usage:
#   sudo ./scripts/install-service.sh
#
# After installation:
#   sudo systemctl status wikijs-mcp
#   sudo systemctl restart wikijs-mcp
#   sudo journalctl -u wikijs-mcp -f
# =============================================================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m'

# ---- Check root ----
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}[ERROR] This script must be run as root (use sudo).${NC}"
    exit 1
fi

# ---- Resolve project directory ----
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# ---- Check that the project is built ----
if [ ! -f "$PROJECT_DIR/dist/http-server.js" ]; then
    echo -e "${RED}[ERROR] dist/http-server.js not found. Run 'npm run build' first.${NC}"
    exit 1
fi

# ---- Check that .env exists ----
if [ ! -f "$PROJECT_DIR/.env" ]; then
    echo -e "${RED}[ERROR] .env file not found. Run './scripts/setup.sh' first.${NC}"
    exit 1
fi

# ---- Detect Node.js path ----
NODE_PATH=$(which node)
if [ -z "$NODE_PATH" ]; then
    echo -e "${RED}[ERROR] Node.js not found in PATH.${NC}"
    exit 1
fi
echo -e "${GREEN}[OK] Using Node.js: $NODE_PATH${NC}"

# ---- Determine run user ----
# Use the owner of the project directory (not root)
RUN_USER=$(stat -c '%U' "$PROJECT_DIR")
RUN_GROUP=$(stat -c '%G' "$PROJECT_DIR")
echo -e "${GREEN}[OK] Service will run as: $RUN_USER:$RUN_GROUP${NC}"

# ---- Read port from .env ----
MCP_PORT=$(grep -E '^MCP_HTTP_PORT=' "$PROJECT_DIR/.env" 2>/dev/null | cut -d '=' -f 2 | tr -d '[:space:]')
MCP_PORT=${MCP_PORT:-3200}

# ---- Create systemd unit file ----
SERVICE_FILE="/etc/systemd/system/wikijs-mcp.service"

cat > "$SERVICE_FILE" << EOF
[Unit]
Description=Wiki.js MCP Server (HTTP)
Documentation=https://github.com/markus-michalski/wikijs-mcp-server
After=network.target
Wants=network-online.target

[Service]
Type=simple
User=$RUN_USER
Group=$RUN_GROUP
WorkingDirectory=$PROJECT_DIR
ExecStart=$NODE_PATH $PROJECT_DIR/dist/http-server.js
Restart=on-failure
RestartSec=5
StartLimitIntervalSec=60
StartLimitBurst=5

# Environment
EnvironmentFile=$PROJECT_DIR/.env

# Security hardening
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=read-only
ReadWritePaths=$PROJECT_DIR
PrivateTmp=true

# Logging (stdout/stderr → journald)
StandardOutput=journal
StandardError=journal
SyslogIdentifier=wikijs-mcp

[Install]
WantedBy=multi-user.target
EOF

echo -e "${GREEN}[OK] Created systemd unit: $SERVICE_FILE${NC}"

# ---- Reload systemd ----
systemctl daemon-reload

# ---- Enable and start ----
systemctl enable wikijs-mcp
systemctl restart wikijs-mcp

echo ""
echo -e "${GREEN}=== Wiki.js MCP Server installed as systemd service ===${NC}"
echo ""
echo -e "Service status:"
systemctl status wikijs-mcp --no-pager || true
echo ""
echo -e "Useful commands:"
echo -e "  ${YELLOW}sudo systemctl status wikijs-mcp${NC}      — check status"
echo -e "  ${YELLOW}sudo systemctl restart wikijs-mcp${NC}     — restart"
echo -e "  ${YELLOW}sudo systemctl stop wikijs-mcp${NC}        — stop"
echo -e "  ${YELLOW}sudo journalctl -u wikijs-mcp -f${NC}      — view logs"
echo ""
echo -e "MCP HTTP endpoint: ${YELLOW}http://$(hostname -I | awk '{print $1}'):${MCP_PORT}/mcp${NC}"
echo ""
echo -e "VS Code config (add to settings.json on your Windows machine):"
echo -e "${YELLOW}"
cat << VSCODE
{
  "mcp": {
    "servers": {
      "wikijs": {
        "type": "http",
        "url": "http://$(hostname -I | awk '{print $1}'):${MCP_PORT}/mcp"
      }
    }
  }
}
VSCODE
echo -e "${NC}"
