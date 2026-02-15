/**
 * Wiki.js MCP Server Setup
 *
 * Shared server configuration — registers all tools on a McpServer instance.
 * Used by both the stdio and HTTP entry points.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import dotenv from 'dotenv';
import { homedir } from 'os';
import { join } from 'path';
import { existsSync } from 'fs';

import { WikiJsClient } from './services/client.js';
import {
  createPageToolDefinition,
  handleCreatePage,
  getPageToolDefinition,
  handleGetPage,
  listPagesToolDefinition,
  handleListPages,
  searchPagesToolDefinition,
  handleSearchPages,
  updatePageToolDefinition,
  handleUpdatePage,
  deletePageToolDefinition,
  handleDeletePage,
  movePageToolDefinition,
  handleMovePage,
} from './tools/index.js';

/**
 * Load environment variables from the standard locations.
 */
export function loadEnv(): void {
  const envPath = join(homedir(), '.claude', 'mcp-servers', 'wikijs', '.env');
  if (existsSync(envPath)) {
    dotenv.config({ path: envPath });
  } else {
    dotenv.config();
  }
}

/**
 * Validate required environment variables and return the Wiki.js client settings.
 */
export function getWikiConfig(): { apiUrl: string; apiToken: string } {
  const apiUrl = process.env.WIKIJS_API_URL;
  const apiToken = process.env.WIKIJS_API_TOKEN;

  if (!apiUrl || !apiToken) {
    console.error('Error: Missing required environment variables');
    console.error('Please ensure WIKIJS_API_URL and WIKIJS_API_TOKEN are set in .env file');
    process.exit(1);
  }

  return { apiUrl, apiToken };
}

/**
 * Create and configure a McpServer with all Wiki.js tools registered.
 */
export function createConfiguredServer(): { server: McpServer; wikiClient: WikiJsClient; apiUrl: string } {
  const { apiUrl, apiToken } = getWikiConfig();
  const wikiClient = new WikiJsClient(apiUrl, apiToken);

  const server = new McpServer({
    name: 'wikijs-mcp-server',
    version: '2.0.0',
  });

  // Register tools
  server.tool(
    createPageToolDefinition.name,
    createPageToolDefinition.description,
    createPageToolDefinition.inputSchema.shape,
    async (args) => handleCreatePage(wikiClient, args)
  );

  server.tool(
    getPageToolDefinition.name,
    getPageToolDefinition.description,
    getPageToolDefinition.inputSchema.shape,
    async (args) => handleGetPage(wikiClient, args)
  );

  server.tool(
    listPagesToolDefinition.name,
    listPagesToolDefinition.description,
    listPagesToolDefinition.inputSchema.shape,
    async (args) => handleListPages(wikiClient, args)
  );

  server.tool(
    searchPagesToolDefinition.name,
    searchPagesToolDefinition.description,
    searchPagesToolDefinition.inputSchema.shape,
    async (args) => handleSearchPages(wikiClient, args)
  );

  server.tool(
    updatePageToolDefinition.name,
    updatePageToolDefinition.description,
    updatePageToolDefinition.inputSchema.shape,
    async (args) => handleUpdatePage(wikiClient, args)
  );

  server.tool(
    deletePageToolDefinition.name,
    deletePageToolDefinition.description,
    deletePageToolDefinition.inputSchema.shape,
    async (args) => handleDeletePage(wikiClient, args)
  );

  server.tool(
    movePageToolDefinition.name,
    movePageToolDefinition.description,
    movePageToolDefinition.inputSchema.shape,
    async (args) => handleMovePage(wikiClient, args)
  );

  return { server, wikiClient, apiUrl };
}
