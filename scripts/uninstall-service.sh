#!/bin/bash
# =============================================================================
# Wiki.js MCP Server — Uninstall systemd service
# =============================================================================
# Usage:  sudo ./scripts/uninstall-service.sh
# =============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}[ERROR] This script must be run as root (use sudo).${NC}"
    exit 1
fi

SERVICE_NAME="wikijs-mcp"

if systemctl is-active --quiet "$SERVICE_NAME" 2>/dev/null; then
    echo "Stopping $SERVICE_NAME..."
    systemctl stop "$SERVICE_NAME"
fi

if systemctl is-enabled --quiet "$SERVICE_NAME" 2>/dev/null; then
    echo "Disabling $SERVICE_NAME..."
    systemctl disable "$SERVICE_NAME"
fi

SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}.service"
if [ -f "$SERVICE_FILE" ]; then
    echo "Removing $SERVICE_FILE..."
    rm -f "$SERVICE_FILE"
    systemctl daemon-reload
fi

echo -e "${GREEN}[OK] Service $SERVICE_NAME uninstalled.${NC}"
