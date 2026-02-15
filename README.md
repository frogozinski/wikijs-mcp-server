# Wiki.js MCP Server

MCP server for Wiki.js — manage wiki pages from VS Code, Cursor or Claude Code via GraphQL API. Supports **stdio** (local) and **HTTP** (remote/network) transport.

## Requirements

- Node.js 18+
- Wiki.js 2.x/3.x with API token (Admin → API Access)

## Installation

```bash
git clone https://github.com/markus-michalski/wikijs-mcp-server.git
cd wikijs-mcp-server
npm run setup
```

Edit `.env` — set your Wiki.js URL and API token:

```env
WIKIJS_API_URL=http://localhost:3000/graphql
WIKIJS_API_TOKEN=your-token-here
MCP_HTTP_PORT=3200
```

## Running

### HTTP mode (remote access over network)

```bash
npm run start:http        # start in background (PID saved to server.pid)
npm run stop              # stop server
curl http://localhost:3200/health   # check status
tail -f server.log        # view logs
```

### STDIO mode (local editor)

```bash
npm start
```

## Editor Configuration

### VS Code — HTTP (remote server)

Add to `settings.json`:

```json
{
  "mcp": {
    "servers": {
      "wikijs": {
        "type": "http",
        "url": "http://<SERVER_IP>:3200/mcp"
      }
    }
  }
}
```

### VS Code — STDIO (local)

```json
{
  "mcp": {
    "servers": {
      "wikijs": {
        "type": "stdio",
        "command": "node",
        "args": ["dist/index.js"],
        "cwd": "/path/to/wikijs-mcp-server",
        "env": {
          "WIKIJS_API_URL": "http://localhost:3000/graphql",
          "WIKIJS_API_TOKEN": "your-token"
        }
      }
    }
  }
}
```

### Cursor — HTTP

Add to `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "wikijs": {
      "url": "http://<SERVER_IP>:3200/mcp"
    }
  }
}
```

## Available Tools

| Tool | Description |
|------|-------------|
| `wikijs_create_page` | Create new page (Markdown/HTML) |
| `wikijs_update_page` | Update page content, title, tags |
| `wikijs_get_page` | Get page content and metadata |
| `wikijs_list_pages` | List pages with pagination |
| `wikijs_search_pages` | Full-text search |
| `wikijs_delete_page` | Delete a page |
| `wikijs_move_page` | Move page to new path |

## Development

```bash
npm run dev          # STDIO with hot-reload
npm run dev:http     # HTTP with hot-reload
npm run build        # Build for production
npm run typecheck    # Type check only
npm test             # Run tests
```

## Scripts Reference

| Command | Description |
|---------|-------------|
| `npm run setup` | First-time setup (install, .env, build) |
| `npm start` | Run STDIO server (foreground) |
| `npm run start:http` | Start HTTP server (background, port 3200) |
| `npm run stop` | Stop HTTP server |
| `npm run build` | Build TypeScript |
| `npm test` | Run tests |

## License

MIT — see [LICENSE](./LICENSE)
