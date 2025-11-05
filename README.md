# Wiki.js MCP Server

**Model Context Protocol Server for Wiki.js integration in Claude Code** - Create and manage wiki pages directly from your AI assistant.

## 📖 Documentation

**📚 [Complete Documentation & FAQ](https://faq.markus-michalski.net/en/mcp/wikijs)**

The comprehensive guide includes:
- Installation instructions
- Configuration examples
- All 7 MCP tools with parameters
- GraphQL API integration details
- Troubleshooting guide

## ⚡ Quick Start

```bash
# 1. Clone repository
git clone https://github.com/markus-michalski/wikijs-mcp-server.git ~/.claude/mcp-servers/wikijs

# 2. Install dependencies
cd ~/.claude/mcp-servers/wikijs
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your Wiki.js API credentials

# 4. Restart Claude Code
```

## 🔑 Requirements

- **Node.js 18+**
- **Wiki.js instance** (v2.x or v3.x)
- **Wiki.js API Token** with page management permissions

## 🛠️ Available Tools

- `create_page` - Create new wiki pages with Markdown or HTML content
- `update_page` - Update existing pages (content, title, description, tags)
- `get_page` - Retrieve full page content and metadata
- `list_pages` - List all pages with optional filtering
- `search_pages` - Full-text search across wiki pages
- `delete_page` - Permanently delete pages
- `move_page` - Move pages to new paths

## 📄 License

MIT License - See [LICENSE](./LICENSE) for details

## 👤 Author

**Markus Michalski**
- Website: [markus-michalski.net](https://markus-michalski.net)
- GitHub: [@markus-michalski](https://github.com/markus-michalski)

## 🔗 Links

- **[📚 Full Documentation](https://faq.markus-michalski.net/en/mcp/wikijs)** (English)
- **[📚 Vollständige Dokumentation](https://faq.markus-michalski.net/de/mcp/wikijs)** (Deutsch)
- [Changelog](./CHANGELOG.md)
