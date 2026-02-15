# Scripts

Management scripts for the Wiki.js MCP Server. All scripts can be run via `npm` or directly.

## Scripts

### setup.sh

First-time project setup. Installs dependencies, creates `.env` from template, builds TypeScript.

```bash
npm run setup
```

### start_http.sh

Starts the HTTP MCP server in the background. Saves PID to `server.pid`, logs to `server.log`. Automatically stops any previously running instance before starting.

```bash
npm run start:http
```

Default port: `3200` (configurable via `MCP_HTTP_PORT` in `.env`).

### stop_server.sh

Stops the running HTTP server. Uses PID file, falls back to `pkill` if needed.

```bash
npm run stop
```

### update.sh

Pulls latest changes from git, reinstalls dependencies, rebuilds TypeScript and restarts the HTTP server.

```bash
npm run update
```

### cleanup.sh

Full teardown — stops all running MCP processes (PID file + pkill fallback), removes runtime files (`.env`, `server.pid`, `server.log`) and deletes the entire project directory.

```bash
npm run cleanup
```

> **Warning:** This permanently removes the repo from disk.

## Files created at runtime

| File | Description |
|------|-------------|
| `server.pid` | PID of the running HTTP server process |
| `server.log` | Server output and error log |

## Typical workflow

```bash
npm run setup              # 1. install & build
nano .env                  # 2. configure credentials
npm run start:http         # 3. start server
curl localhost:3200/health # 4. verify
npm run stop               # 5. stop when done
npm run update             # 6. pull & rebuild & restart
npm run cleanup            # 7. full uninstall (removes repo!)
```
