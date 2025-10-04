import { z } from 'zod';

// Agent Message Types
export const MessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
  timestamp: z.date().optional(),
});

export type Message = z.infer<typeof MessageSchema>;

// Agent Request/Response Types
export const AgentRequestSchema = z.object({
  agentId: z.string(),
  messages: z.array(MessageSchema),
  stream: z.boolean().optional(),
});

export type AgentRequest = z.infer<typeof AgentRequestSchema>;

export const AgentResponseSchema = z.object({
  response: z.string(),
  agentId: z.string(),
  timestamp: z.date(),
});

export type AgentResponse = z.infer<typeof AgentResponseSchema>;
