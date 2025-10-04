import { z } from 'zod';

// API Response wrapper
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.unknown().optional(),
  error: z.string().optional(),
  timestamp: z.date(),
});

export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
};

// Health Check
export const HealthCheckSchema = z.object({
  status: z.enum(['ok', 'degraded', 'down']),
  timestamp: z.date(),
  services: z.record(z.boolean()).optional(),
});

export type HealthCheck = z.infer<typeof HealthCheckSchema>;
