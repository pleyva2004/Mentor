import OpenAI from 'openai';

export interface LlmResponse {
  text: string;
  model: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

function buildUserMessage(input: string, context?: Record<string, unknown>): string {
  const contextPart = context && Object.keys(context).length > 0
    ? `\n\nContext (JSON):\n${JSON.stringify(context, null, 2)}`
    : '';
  return `User input:\n${input}${contextPart}`;
}

export async function generateWithLlm(
  input: string,
  context?: Record<string, unknown>
): Promise<LlmResponse> {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_API_MODEL || 'gpt-4o-mini';

  if (!apiKey) {
    // Mock fallback for local/dev without credentials
    return {
      text: `Mock response: ${input.slice(0, 200)}`,
      model: 'mock',
    };
  }

  const client = new OpenAI({ apiKey });

  const messages = [
    {
      role: 'system' as const,
      content:
        'You are the Mentor MVP cursor assistant. Be concise, helpful, and safe. Respond in Markdown when appropriate.',
    },
    { role: 'user' as const, content: buildUserMessage(input, context) },
  ];

  const completion = await client.chat.completions.create({
    model,
    messages,
    temperature: 0.3,
  });

  const content = completion.choices[0]?.message?.content ?? '';
  const usage = completion.usage
    ? {
        promptTokens: completion.usage.prompt_tokens,
        completionTokens: completion.usage.completion_tokens,
        totalTokens: completion.usage.total_tokens,
      }
    : undefined;

  return {
    text: content,
    model: `openai:${model}`,
    usage,
  };
}
