import { MastraClient } from '@mastra/client-js';

export const mastraClient = new MastraClient({
  // In production, point to your deployed API
  baseUrl: process.env.NEXT_PUBLIC_MASTRA_API_URL || 'http://localhost:3000',
});

// Type-safe agent interaction
export async function chatWithAgent(
  agentId: string,
  messages: Array<{ role: string; content: string }>
) {
  return mastraClient.agents.generate({
    agentId,
    messages,
  });
}

// Workflow execution
export async function executeWorkflow(
  workflowId: string,
  input: Record<string, unknown>
) {
  const run = await mastraClient.workflows.createRun({
    workflowId,
    input,
  });

  return mastraClient.workflows.start({ runId: run.id });
}
