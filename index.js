#!/usr/bin/env node

/**
 * Wiki.js MCP Server
 *
 * Provides Model Context Protocol (MCP) tools for interacting with Wiki.js GraphQL API
 *
 * @author Markus Michalski
 * @license MIT
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';
import { WikiJsClient } from './src/client.js';

// Import tools
import { createPageTool, handleCreatePage } from './src/tools/create-page.js';
import { updatePageTool, handleUpdatePage } from './src/tools/update-page.js';
import { getPageTool, handleGetPage } from './src/tools/get-page.js';
import { listPagesTool, handleListPages } from './src/tools/list-pages.js';
import { searchPagesTool, handleSearchPages } from './src/tools/search-pages.js';
import { deletePageTool, handleDeletePage } from './src/tools/delete-page.js';
import { movePageTool, handleMovePage } from './src/tools/move-page.js';

// Load environment variables
dotenv.config();

// Validate required environment variables
const WIKIJS_API_URL = process.env.WIKIJS_API_URL;
const WIKIJS_API_TOKEN = process.env.WIKIJS_API_TOKEN;

if (!WIKIJS_API_URL || !WIKIJS_API_TOKEN) {
  console.error('Error: Missing required environment variables');
  console.error('Please ensure WIKIJS_API_URL and WIKIJS_API_TOKEN are set in .env file');
  process.exit(1);
}

// Initialize Wiki.js client
const wikiClient = new WikiJsClient(WIKIJS_API_URL, WIKIJS_API_TOKEN);

// Create MCP server
const server = new Server(
  {
    name: 'wikijs-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define available tools
const tools = [
  createPageTool,
  updatePageTool,
  getPageTool,
  listPagesTool,
  searchPagesTool,
  deletePageTool,
  movePageTool,
];

// List tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools,
  };
});

// Call tool handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'create_page':
        return await handleCreatePage(wikiClient, args);

      case 'update_page':
        return await handleUpdatePage(wikiClient, args);

      case 'get_page':
        return await handleGetPage(wikiClient, args);

      case 'list_pages':
        return await handleListPages(wikiClient, args);

      case 'search_pages':
        return await handleSearchPages(wikiClient, args);

      case 'delete_page':
        return await handleDeletePage(wikiClient, args);

      case 'move_page':
        return await handleMovePage(wikiClient, args);

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: error.message,
          }, null, 2),
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Wiki.js MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
