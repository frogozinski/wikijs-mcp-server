/**
 * Delete Page Tool
 *
 * Deletes a page from Wiki.js
 */

export const deletePageTool = {
  name: 'delete_page',
  description: 'Delete a page from Wiki.js by ID. WARNING: This action is irreversible!',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'number',
        description: 'Page ID to delete',
      },
    },
    required: ['id'],
  },
};

export async function handleDeletePage(client, args) {
  try {
    const result = await client.deletePage(args.id);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            message: `Page ${args.id} deleted successfully`,
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
