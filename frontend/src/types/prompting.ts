import { z } from 'zod';

export const CursorPromptRequestSchema = z
  .object({
    input: z.string().min(1, 'input is required').max(4000, 'input too long'),
    context: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

export type CursorPromptRequest = z.infer<typeof CursorPromptRequestSchema>;

export const CursorPromptResponseSchema = z
  .object({
    responseText: z.string(),
    model: z.string(),
    meta: z
      .object({
        usage: z
          .object({
            promptTokens: z.number().optional(),
            completionTokens: z.number().optional(),
            totalTokens: z.number().optional(),
          })
          .partial()
          .optional(),
      })
      .partial()
      .optional(),
    error: z.string().optional(),
  })
  .strict();

export type CursorPromptResponse = z.infer<typeof CursorPromptResponseSchema>;
