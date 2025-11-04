# Wiki.js MCP Server

Model Context Protocol (MCP) server for interacting with Wiki.js GraphQL API.

This server enables Claude Code and other MCP clients to create, read, update, and delete pages in Wiki.js via a simple tool-based interface.

## Features

- ✅ **Create Pages** - Create new wiki pages with markdown or HTML content
- ✅ **Update Pages** - Modify existing pages (content, title, description, tags)
- ✅ **Get Pages** - Retrieve pages by ID or path
- ✅ **List Pages** - List all pages with optional locale filtering
- ✅ **Search Pages** - Full-text search across all wiki content
- ✅ **Delete Pages** - Remove pages from the wiki
- ✅ **Move Pages** - Reorganize content by moving pages to new paths

## Requirements

- Node.js 18+
- Wiki.js instance with GraphQL API enabled
- Wiki.js API token with appropriate permissions

## Installation

### 1. Clone or Download

```bash
cd /home/markus/projekte/claude
# Repository already exists at wikijs-mcp-server/
cd wikijs-mcp-server
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Edit `.env`:

```env
WIKIJS_API_URL=https://faq.markus-michalski.net/graphql
WIKIJS_API_TOKEN=your-api-token-here
```

### 4. Create Wiki.js API Token

1. Login to Wiki.js Admin Panel
2. Navigate to **Administration → API Access**
3. Click **Generate New Key**
4. Name: `Claude Code MCP Server`
5. Select permissions:
   - `read:pages` - Read page content
   - `write:pages` - Create and update pages
   - `manage:pages` - Delete and move pages
6. Click **Generate**
7. Copy the token and paste it into `.env`

### 5. Add to Claude Code MCP Settings

Edit your Claude Code MCP settings file:

**macOS/Linux:**
```bash
~/.claude/mcp_settings.json
```

**Windows:**
```
%APPDATA%\Claude\mcp_settings.json
```

Add the server configuration:

```json
{
  "mcpServers": {
    "wikijs": {
      "command": "node",
      "args": ["/home/markus/projekte/claude/wikijs-mcp-server/index.js"],
      "disabled": false
    }
  }
}
```

### 6. Restart Claude Code

Restart Claude Code to load the new MCP server.

## Available Tools

### `create_page`

Create a new page in Wiki.js.

**Parameters:**
- `path` (required) - Page path (e.g., "osticket/plugin-name")
- `title` (required) - Page title
- `content` (required) - Page content (Markdown or HTML)
- `description` (required) - Short page description
- `locale` (optional) - Page locale (default: "en")
- `editor` (optional) - Editor type: "markdown", "code", "ckeditor" (default: "markdown")
- `isPublished` (optional) - Publish immediately (default: true)
- `tags` (optional) - Array of tags (default: [])

**Example:**
```javascript
{
  "path": "osticket/ticket-merge-plugin",
  "title": "Ticket Merge Plugin - Technical Documentation",
  "content": "# Technical Documentation\n\n...",
  "description": "Detailed technical documentation for the Ticket Merge Plugin",
  "locale": "en",
  "editor": "markdown",
  "tags": ["osticket", "plugin", "development"]
}
```

### `update_page`

Update an existing page.

**Parameters:**
- `id` (required) - Page ID
- `content` (optional) - New content
- `title` (optional) - New title
- `description` (optional) - New description
- `isPublished` (optional) - Publication status
- `tags` (optional) - New tags array

**Example:**
```javascript
{
  "id": 5,
  "content": "# Updated Content\n\nNew information...",
  "tags": ["updated", "osticket"]
}
```

### `get_page`

Retrieve a page by ID or path.

**Parameters:**
- `id` (optional) - Page ID
- `path` (optional) - Page path (required if no ID)
- `locale` (optional) - Page locale (required if using path)

**Example:**
```javascript
// By ID
{ "id": 5 }

// By path
{ "path": "osticket/plugin-name", "locale": "en" }
```

### `list_pages`

List all pages with optional filtering.

**Parameters:**
- `locale` (optional) - Filter by locale
- `limit` (optional) - Maximum results (default: 100)

**Example:**
```javascript
{
  "locale": "en",
  "limit": 50
}
```

### `search_pages`

Search pages by query string.

**Parameters:**
- `query` (required) - Search query
- `locale` (optional) - Filter by locale

**Example:**
```javascript
{
  "query": "osTicket plugin",
  "locale": "en"
}
```

### `delete_page`

Delete a page (irreversible!).

**Parameters:**
- `id` (required) - Page ID to delete

**Example:**
```javascript
{ "id": 123 }
```

### `move_page`

Move a page to a new path.

**Parameters:**
- `id` (required) - Page ID
- `destinationPath` (required) - New path
- `destinationLocale` (optional) - Target locale (default: "en")

**Example:**
```javascript
{
  "id": 5,
  "destinationPath": "new-category/page-name",
  "destinationLocale": "en"
}
```

## Usage Examples

### Example 1: Create Plugin Documentation After Development

After finishing a plugin, create comprehensive Wiki.js documentation:

```javascript
// Claude Code will call this automatically
await mcp.wikijs.create_page({
  path: "osticket/ticket-merge-plugin",
  title: "Ticket Merge Plugin - Technical Documentation",
  content: `
# Ticket Merge Plugin - Technical Documentation

## Architecture

### Component Structure
\`\`\`
TicketMergePlugin/
├── plugin.php
├── class.TicketMerger.php
└── api/MergeController.php
\`\`\`

## Implementation Details
...

## API Endpoints
- POST /api/tickets/merge
- GET /api/tickets/mergeable

## Troubleshooting
...
  `,
  description: "Technical documentation for osTicket Ticket Merge Plugin",
  locale: "en",
  tags: ["osticket", "plugin", "technical", "development"]
});
```

### Example 2: Update Page with New Information

```javascript
// Get the page first to see current content
const page = await mcp.wikijs.get_page({
  path: "osticket/ticket-merge-plugin",
  locale: "en"
});

// Update with new troubleshooting section
await mcp.wikijs.update_page({
  id: page.id,
  content: page.content + "\n\n## New Troubleshooting Section\n..."
});
```

### Example 3: Search and Reorganize

```javascript
// Find all osTicket pages
const results = await mcp.wikijs.search_pages({
  query: "osTicket",
  locale: "en"
});

// Move a page to better category
await mcp.wikijs.move_page({
  id: results.results[0].id,
  destinationPath: "osticket/troubleshooting/common-issues"
});
```

## Workflow: Plugin Development → Wiki Documentation

**Typical workflow:**

1. **Develop Plugin** - Write code, create README.md (short, user-focused)
2. **Claude Code creates detailed Wiki page** - Automatically via MCP
3. **Wiki page contains:**
   - Technical architecture details
   - Code flow diagrams
   - API documentation
   - Advanced troubleshooting
   - Developer notes
4. **README.md stays concise** - 100-200 lines, user-first
5. **Wiki.js has deep technical docs** - 500+ lines, developer-first

**Benefits:**
- No duplicate work
- Separation of concerns (user docs vs. technical docs)
- Automated documentation generation
- Consistent structure

## Troubleshooting

### "Missing required environment variables"

**Problem:** `.env` file not found or incomplete

**Solution:**
1. Ensure `.env` exists in project root
2. Verify `WIKIJS_API_URL` and `WIKIJS_API_TOKEN` are set
3. Check `.env.example` for correct format

### "GraphQL Error: Forbidden"

**Problem:** API token lacks required permissions

**Solution:**
1. Go to Wiki.js Admin Panel → API Access
2. Edit your API key
3. Ensure these permissions are enabled:
   - `read:pages`
   - `write:pages`
   - `manage:pages`
4. Regenerate token if needed

### "HTTP error! status: 404"

**Problem:** Wrong API URL

**Solution:**
1. Verify `WIKIJS_API_URL` in `.env`
2. Should end with `/graphql`
3. Example: `https://faq.markus-michalski.net/graphql`

### Server not appearing in Claude Code

**Problem:** MCP configuration not loaded

**Solution:**
1. Check `mcp_settings.json` syntax
2. Verify file path to `index.js` is correct
3. Restart Claude Code completely
4. Check Claude Code logs for errors

## Development

### Project Structure

```
wikijs-mcp-server/
├── index.js              # MCP server entry point
├── package.json          # Dependencies
├── .env                  # Configuration (not in git)
├── .env.example          # Configuration template
├── src/
│   ├── client.js         # Wiki.js GraphQL client
│   └── tools/
│       ├── create-page.js
│       ├── update-page.js
│       ├── get-page.js
│       ├── list-pages.js
│       ├── search-pages.js
│       ├── delete-page.js
│       └── move-page.js
└── README.md
```

### Adding New Tools

1. Create new tool file in `src/tools/`
2. Export tool definition and handler
3. Import in `index.js`
4. Add to `tools` array
5. Add case to switch statement

## License

MIT License - See LICENSE file for details

## Author

**Markus Michalski**
- Website: https://markus-michalski.net
- Wiki: https://faq.markus-michalski.net

## Contributing

Contributions welcome! Please open an issue or pull request.

## Related

- [Wiki.js Documentation](https://docs.requarks.io)
- [Model Context Protocol](https://modelcontextprotocol.io)
- [Claude Code](https://claude.com/claude-code)
