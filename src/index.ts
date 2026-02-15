#!/usr/bin/env node

/**
 * Wiki.js MCP Server — STDIO Entry Point
 *
 * Provides Model Context Protocol (MCP) tools for interacting with Wiki.js GraphQL API
 * using the standard stdio transport (for local spawning by editors).
 *
 * For HTTP transport (remote access), see http-server.ts
 *
 * @author Markus Michalski
 * @license MIT
 */

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { loadEnv, createConfiguredServer } from './server-setup.js';

// Load environment
loadEnv();

// Create configured server with all tools
const { server, apiUrl } = createConfiguredServer();

// Graceful shutdown handling
let isShuttingDown = false;

async function shutdown(signal: string): Promise<void> {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.error(`Received ${signal}, shutting down gracefully...`);
  try {
    await server.close();
    console.error('Wiki.js MCP Server shutdown complete');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
}

// Setup signal handlers
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('uncaughtException', (error: Error & { code?: string }) => {
  // Don't log EPIPE errors (broken pipe when client disconnects)
  if (error.code !== 'EPIPE') {
    console.error('Uncaught exception:', error);
  }
  shutdown('uncaughtException');
});
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
  shutdown('unhandledRejection');
});

// Start server
async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Wiki.js MCP Server v2.0.0 running on stdio');
  console.error(`Connected to: ${apiUrl}`);
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
