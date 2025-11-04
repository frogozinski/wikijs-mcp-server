/**
 * Move Page Tool
 *
 * Moves a page to a new path in Wiki.js
 */

export const movePageTool = {
  name: 'move_page',
  description: 'Move a page to a new path in Wiki.js. Useful for reorganizing content structure. Provide either id OR path+locale to identify the source page.',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'number',
        description: 'Page ID to move (optional if path is provided)',
      },
      path: {
        type: 'string',
        description: 'Current page path (optional if id is provided, e.g., "osticket/api-key-wildcard")',
      },
      locale: {
        type: 'string',
        description: 'Current page locale (required if using path, e.g., "en", "de")',
        default: 'en',
      },
      destinationPath: {
        type: 'string',
        description: 'New path for the page (e.g., "new-category/page-name")',
      },
      destinationLocale: {
        type: 'string',
        description: 'Target locale (e.g., "en", "de")',
        default: 'en',
      },
    },
    required: ['destinationPath'],
  },
};

export async function handleMovePage(client, args) {
  try {
    // Resolve page ID from path if needed
    let pageId = args.id;

    if (!pageId && args.path) {
      const page = await client.getPageByPath(args.path, args.locale || 'en');
      if (!page) {
        throw new Error(`Page not found at path: ${args.path}`);
      }
      pageId = page.id;
    }

    if (!pageId) {
      throw new Error('Either "id" or "path" must be provided');
    }

    const result = await client.movePage(
      pageId,
      args.destinationPath,
      args.destinationLocale || 'en'
    );

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            message: `Page ${args.id} moved to ${args.destinationPath}`,
            result,
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
