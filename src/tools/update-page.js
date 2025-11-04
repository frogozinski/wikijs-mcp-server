/**
 * Update Page Tool
 *
 * Updates an existing page in Wiki.js
 */

export const updatePageTool = {
  name: 'update_page',
  description: 'Update an existing page in Wiki.js (content, title, description, tags, or publish status)',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'number',
        description: 'Page ID to update',
      },
      content: {
        type: 'string',
        description: 'New page content (optional)',
      },
      title: {
        type: 'string',
        description: 'New page title (optional)',
      },
      description: {
        type: 'string',
        description: 'New page description (optional)',
      },
      isPublished: {
        type: 'boolean',
        description: 'Whether the page should be published (optional)',
      },
      tags: {
        type: 'array',
        items: { type: 'string' },
        description: 'Array of tags for the page (optional)',
      },
    },
    required: ['id'],
  },
};

export async function handleUpdatePage(client, args) {
  try {
    const result = await client.updatePage({
      id: args.id,
      content: args.content,
      title: args.title,
      description: args.description,
      isPublished: args.isPublished,
      tags: args.tags,
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            message: `Page ${args.id} updated successfully`,
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
