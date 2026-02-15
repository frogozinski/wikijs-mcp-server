#!/bin/bash
# =============================================================================
# Wiki.js MCP Server — Initial Setup
# =============================================================================
# Usage:  npm run setup   OR   ./scripts/setup.sh
# =============================================================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m'

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

echo -e "${GREEN}=== Wiki.js MCP Server — Setup ===${NC}\n"

# ---- Node.js check ----
if ! command -v node &> /dev/null; then
    echo -e "${RED}[ERROR] Node.js not found. Install Node.js 18+ first.${NC}"
    exit 1
fi

NODE_MAJOR=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_MAJOR" -lt 18 ]; then
    echo -e "${RED}[ERROR] Node.js 18+ required. Current: $(node -v)${NC}"
    exit 1
fi
echo -e "${GREEN}[OK] Node.js $(node -v)${NC}"

# ---- Install dependencies ----
echo -e "\n${GREEN}[1/3] Installing dependencies...${NC}"
npm install

# ---- Create .env ----
if [ ! -f .env ]; then
    echo -e "\n${GREEN}[2/3] Creating .env from .env.example...${NC}"
    cp .env.example .env
    echo -e "${YELLOW}  -> Edit .env and set WIKIJS_API_URL and WIKIJS_API_TOKEN${NC}"
else
    echo -e "\n${GREEN}[2/3] .env already exists — skipping${NC}"
fi

# ---- Build ----
echo -e "\n${GREEN}[3/3] Building TypeScript...${NC}"
npm run build

echo -e "\n${GREEN}=== Setup complete ===${NC}\n"
echo -e "Next steps:"
echo -e "  1. Edit ${YELLOW}.env${NC} with your Wiki.js credentials"
echo -e "  2. Start HTTP server:  ${YELLOW}npm run start:http${NC}"
echo -e "  3. Stop HTTP server:   ${YELLOW}npm run stop${NC}"
echo -e "  4. Check health:       ${YELLOW}curl http://localhost:3200/health${NC}"
echo ""
