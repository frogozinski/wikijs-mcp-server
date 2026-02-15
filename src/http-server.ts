#!/usr/bin/env node

/**
 * Wiki.js MCP Server — HTTP Entry Point (Streamable HTTP + SSE)
 *
 * Exposes the MCP server over HTTP so remote editors (VS Code, Cursor)
 * can connect across the network.
 *
 * Endpoints:
 *   POST /mcp   — JSON-RPC requests (Streamable HTTP transport)
 *   GET  /mcp   — SSE stream for server-initiated messages
 *   DELETE /mcp — Session cleanup
 *   GET  /health — Health check
 *
 * Environment variables:
 *   MCP_HTTP_PORT  — Port to listen on (default: 3200)
 *   MCP_HTTP_HOST  — Host to bind to (default: 0.0.0.0 — all interfaces)
 *   WIKIJS_API_URL — Wiki.js GraphQL API URL
 *   WIKIJS_API_TOKEN — Wiki.js API token
 *
 * @author Markus Michalski
 * @license MIT
 */

import { createServer, IncomingMessage, ServerResponse } from 'node:http';
import { randomUUID } from 'node:crypto';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { loadEnv, createConfiguredServer } from './server-setup.js';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

loadEnv();

const PORT = parseInt(process.env.MCP_HTTP_PORT || '3200', 10);
const HOST = process.env.MCP_HTTP_HOST || '0.0.0.0';

// ---------------------------------------------------------------------------
// Create MCP server (shared tool registration)
// ---------------------------------------------------------------------------

const { server, apiUrl } = createConfiguredServer();

// ---------------------------------------------------------------------------
// Session management — one transport per session
// ---------------------------------------------------------------------------

const sessions = new Map<string, StreamableHTTPServerTransport>();

function createTransport(): StreamableHTTPServerTransport {
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => randomUUID(),
    onsessioninitialized: (sessionId: string) => {
      sessions.set(sessionId, transport);
      console.error(`[session] New session: ${sessionId}  (active: ${sessions.size})`);
    },
    enableJsonResponse: false, // prefer SSE streaming
  });

  transport.onclose = () => {
    if (transport.sessionId) {
      sessions.delete(transport.sessionId);
      console.error(`[session] Closed: ${transport.sessionId}  (active: ${sessions.size})`);
    }
  };

  return transport;
}

// ---------------------------------------------------------------------------
// HTTP request handler
// ---------------------------------------------------------------------------

async function handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
  // CORS — allow cross-origin requests from editors
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, mcp-session-id');
  res.setHeader('Access-Control-Expose-Headers', 'mcp-session-id');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

  // ------ Health check ------
  if (url.pathname === '/health') {
    const body = JSON.stringify({
      status: 'ok',
      server: 'wikijs-mcp-server',
      version: '2.0.0',
      activeSessions: sessions.size,
      wikijsApi: apiUrl,
    });
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(body);
    return;
  }

  // ------ MCP transport endpoint ------
  if (url.pathname === '/mcp') {
    // Determine session from header
    const sessionId = req.headers['mcp-session-id'] as string | undefined;

    if (req.method === 'POST') {
      // Read the request body
      const body = await readBody(req);

      if (sessionId && sessions.has(sessionId)) {
        // Existing session — reuse transport
        const transport = sessions.get(sessionId)!;
        await transport.handleRequest(req, res, body);
      } else if (!sessionId) {
        // New session — create transport + connect to MCP server
        const transport = createTransport();
        await server.connect(transport);
        await transport.handleRequest(req, res, body);
      } else {
        // Invalid session ID
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Session not found' }));
      }
      return;
    }

    if (req.method === 'GET') {
      // SSE stream — requires an existing session
      if (sessionId && sessions.has(sessionId)) {
        const transport = sessions.get(sessionId)!;
        await transport.handleRequest(req, res);
      } else {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Missing or invalid mcp-session-id header for SSE stream' }));
      }
      return;
    }

    if (req.method === 'DELETE') {
      if (sessionId && sessions.has(sessionId)) {
        const transport = sessions.get(sessionId)!;
        await transport.handleRequest(req, res);
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Session not found' }));
      }
      return;
    }
  }

  // ------ Fallback ------
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    error: 'Not found',
    endpoints: {
      'POST /mcp': 'MCP JSON-RPC endpoint',
      'GET  /mcp': 'SSE stream (requires mcp-session-id header)',
      'DELETE /mcp': 'Close session',
      'GET /health': 'Health check',
    },
  }));
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function readBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf-8');
      try {
        resolve(raw ? JSON.parse(raw) : undefined);
      } catch {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

// ---------------------------------------------------------------------------
// Graceful shutdown
// ---------------------------------------------------------------------------

let isShuttingDown = false;

async function shutdown(signal: string): Promise<void> {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.error(`Received ${signal}, shutting down gracefully...`);
  try {
    // Close all active sessions
    for (const [id, transport] of sessions) {
      console.error(`  closing session ${id}`);
      await transport.close();
    }
    sessions.clear();
    await server.close();
    httpServer.close();
    console.error('Wiki.js MCP HTTP Server shutdown complete');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('uncaughtException', (error: Error & { code?: string }) => {
  if (error.code !== 'EPIPE') {
    console.error('Uncaught exception:', error);
  }
  shutdown('uncaughtException');
});
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
  shutdown('unhandledRejection');
});

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------

const httpServer = createServer(handleRequest);

httpServer.listen(PORT, HOST, () => {
  console.error(`Wiki.js MCP HTTP Server v2.0.0`);
  console.error(`  Listening on http://${HOST}:${PORT}`);
  console.error(`  MCP endpoint:  http://${HOST}:${PORT}/mcp`);
  console.error(`  Health check:  http://${HOST}:${PORT}/health`);
  console.error(`  Wiki.js API:   ${apiUrl}`);
  console.error('');
  console.error('VS Code config (settings.json):');
  console.error(JSON.stringify({
    "mcp": {
      "servers": {
        "wikijs": {
          "type": "http",
          "url": `http://<SERVER_IP>:${PORT}/mcp`
        }
      }
    }
  }, null, 2));
});
