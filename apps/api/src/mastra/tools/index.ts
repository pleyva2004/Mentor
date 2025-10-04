import { createTool } from '@mastra/core';
import { z } from 'zod';

// Example Database Tool
export const databaseQueryTool = createTool({
  id: 'database-query',
  description: 'Query the database',
  inputSchema: z.object({
    query: z.string().describe('SQL query to execute'),
  }),
  execute: async ({ context }) => {
    // Execute database query
    console.log(`Executing query: ${context.query}`);
    return { results: [] };
  },
});

// Example API Tool
export const apiCallTool = createTool({
  id: 'api-call',
  description: 'Make an API call',
  inputSchema: z.object({
    url: z.string().url(),
    method: z.enum(['GET', 'POST', 'PUT', 'DELETE']),
  }),
  execute: async ({ context }) => {
    // Make API call
    console.log(`Calling ${context.method} ${context.url}`);
    return { data: {} };
  },
});

// Export all tools
export const tools = {
  databaseQueryTool,
  apiCallTool,
};
