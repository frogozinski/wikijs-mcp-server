/**
 * Delete Page Tool
 *
 * Deletes a page from Wiki.js
 */

export const deletePageTool = {
  name: 'delete_page',
  description: 'Delete a page from Wiki.js. WARNING: This action is irreversible! Provide either id OR path+locale to identify the page.',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'number',
        description: 'Page ID to delete (optional if path is provided)',
      },
      path: {
        type: 'string',
        description: 'Page path (optional if id is provided, e.g., "osticket/api-key-wildcard")',
      },
      locale: {
        type: 'string',
        description: 'Page locale (required if using path, e.g., "en", "de")',
        default: 'en',
      },
    },
  },
};

export async function handleDeletePage(client, args) {
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

    const result = await client.deletePage(pageId);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            message: `Page ${pageId} deleted successfully`,
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
