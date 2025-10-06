import { NextRequest, NextResponse } from 'next/server';
import { CursorPromptRequestSchema } from '@/types/prompting';
import { generateWithLlm } from '@/lib/llm';
import { rateLimitByKey } from '@/lib/rateLimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getClientKey(req: NextRequest): string {
  const xfwd = req.headers.get('x-forwarded-for') || '';
  const ip = xfwd.split(',')[0]?.trim();
  const realIp = req.headers.get('x-real-ip');
  return (realIp || ip || 'anonymous').slice(0, 100);
}

export async function POST(req: NextRequest) {
  const key = getClientKey(req);
  const limit = Number(process.env.PROMPT_RATE_LIMIT ?? 10);
  const intervalMs = Number(process.env.PROMPT_RATE_INTERVAL_MS ?? 60_000);
  const rate = rateLimitByKey(key, limit, intervalMs);

  const rateHeaders = new Headers();
  rateHeaders.set('X-RateLimit-Limit', String(limit));
  rateHeaders.set('X-RateLimit-Remaining', String(rate.remaining));
  rateHeaders.set('X-RateLimit-Reset', String(rate.resetMs));

  if (!rate.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please try again later.' },
      { status: 429, headers: rateHeaders }
    );
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400, headers: rateHeaders }
    );
  }

  const parsed = CursorPromptRequestSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400, headers: rateHeaders }
    );
  }

  const { input, context } = parsed.data;

  try {
    const result = await generateWithLlm(input, context);
    return NextResponse.json(
      {
        responseText: result.text,
        model: result.model,
        meta: { usage: result.usage },
      },
      { status: 200, headers: rateHeaders }
    );
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : 'Failed to generate response',
      },
      { status: 500, headers: rateHeaders }
    );
  }
}
