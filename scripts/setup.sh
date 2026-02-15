#!/bin/bash
# =============================================================================
# Wiki.js MCP Server — Initial Setup Script
# =============================================================================
# Run this after cloning the repository:
#   chmod +x scripts/setup.sh
#   ./scripts/setup.sh
# =============================================================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m'

# Resolve project root (one level up from scripts/)
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

echo -e "${GREEN}=== Wiki.js MCP Server — Setup ===${NC}\n"

# ---- Check Node.js ----
if ! command -v node &> /dev/null; then
    echo -e "${RED}[ERROR] Node.js is not installed. Please install Node.js 18+ first.${NC}"
    exit 1
fi

NODE_MAJOR=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_MAJOR" -lt 18 ]; then
    echo -e "${RED}[ERROR] Node.js 18+ is required. Current version: $(node -v)${NC}"
    exit 1
fi
echo -e "${GREEN}[OK] Node.js $(node -v) detected${NC}"

# ---- Install dependencies ----
echo -e "\n${GREEN}[STEP 1] Installing dependencies...${NC}"
npm install

# ---- Create .env from example ----
if [ ! -f .env ]; then
    echo -e "\n${GREEN}[STEP 2] Creating .env from .env.example...${NC}"
    cp .env.example .env
    echo -e "${YELLOW}[NOTE] Edit .env and set WIKIJS_API_URL and WIKIJS_API_TOKEN before starting.${NC}"
else
    echo -e "\n${GREEN}[STEP 2] .env already exists — skipping.${NC}"
fi

# ---- Build TypeScript ----
echo -e "\n${GREEN}[STEP 3] Building TypeScript...${NC}"
npm run build

echo -e "\n${GREEN}=== Setup complete! ===${NC}"
echo ""
echo -e "Next steps:"
echo -e "  1. Edit ${YELLOW}.env${NC} with your Wiki.js API credentials"
echo -e "  2. Choose how to run the server:"
echo ""
echo -e "     ${YELLOW}STDIO mode${NC} (local editor integration):"
echo -e "       npm start"
echo ""
echo -e "     ${YELLOW}HTTP mode${NC} (remote access from VS Code over network):"
echo -e "       npm run start:http"
echo ""
echo -e "     ${YELLOW}Install as systemd service${NC} (auto-start on boot):"
echo -e "       sudo ./scripts/install-service.sh"
echo ""
