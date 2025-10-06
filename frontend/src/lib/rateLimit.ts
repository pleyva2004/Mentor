type RateResult = {
  allowed: boolean;
  remaining: number;
  resetMs: number;
};

const windowMap: Map<string, number[]> = new Map();

export function rateLimitByKey(
  key: string,
  limit: number,
  intervalMs: number
): RateResult {
  const now = Date.now();
  const windowStart = now - intervalMs;

  const arr = windowMap.get(key) ?? [];
  const recent = arr.filter((ts) => ts > windowStart);

  if (recent.length >= limit) {
    const resetIn = Math.max(0, intervalMs - (now - recent[0]!));
    windowMap.set(key, recent); // prune
    return { allowed: false, remaining: 0, resetMs: resetIn };
  }

  recent.push(now);
  windowMap.set(key, recent);
  return { allowed: true, remaining: Math.max(0, limit - recent.length), resetMs: intervalMs };
}
