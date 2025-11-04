/**
 * Move Page Tool
 *
 * Moves a page to a new path in Wiki.js
 */

export const movePageTool = {
  name: 'move_page',
  description: 'Move a page to a new path in Wiki.js. Useful for reorganizing content structure.',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'number',
        description: 'Page ID to move',
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
    required: ['id', 'destinationPath'],
  },
};

export async function handleMovePage(client, args) {
  try {
    const result = await client.movePage(
      args.id,
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
