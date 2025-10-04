import { z } from 'zod';

// Workflow Run Types
export const WorkflowRunSchema = z.object({
  id: z.string(),
  workflowId: z.string(),
  status: z.enum(['pending', 'running', 'completed', 'failed']),
  input: z.record(z.unknown()),
  output: z.record(z.unknown()).optional(),
  error: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type WorkflowRun = z.infer<typeof WorkflowRunSchema>;

// Workflow Execution Request
export const ExecuteWorkflowSchema = z.object({
  workflowId: z.string(),
  input: z.record(z.unknown()),
});

export type ExecuteWorkflow = z.infer<typeof ExecuteWorkflowSchema>;
