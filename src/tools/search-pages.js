/**
 * Search Pages Tool
 *
 * Searches pages in Wiki.js
 */

export const searchPagesTool = {
  name: 'search_pages',
  description: 'Search for pages in Wiki.js by query string. Returns matching pages with relevance scoring.',
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Search query string',
      },
      locale: {
        type: 'string',
        description: 'Filter results by locale (optional, e.g., "en", "de")',
      },
    },
    required: ['query'],
  },
};

export async function handleSearchPages(client, args) {
  try {
    const results = await client.searchPages(args.query, args.locale);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            totalHits: results.totalHits,
            suggestions: results.suggestions,
            results: results.results.map(r => ({
              id: r.id,
              title: r.title,
              path: r.path,
              description: r.description,
              locale: r.locale,
            })),
          }, null, 2),
        },
      ],
    };
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
}
