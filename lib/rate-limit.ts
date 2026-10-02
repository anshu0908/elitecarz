// Fixed-window in-memory rate limiter. Good enough for a single instance / demo;
// swap for Upstash/Redis when deployed to multiple instances.
const buckets = new Map<string, { count: number; resetAt: number }>();

// Looser limits in local dev/test so e2e runs from one IP don't trip them. Production limits are as written.
const SCALE = process.env.NODE_ENV === "production" ? 1 : 10;

export function rateLimit(key: string, max: number, windowMs: number): { ok: boolean; retryAfterS: number } {
  const limit = max * SCALE;
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterS: 0 };
  }
  b.count++;
  if (b.count > limit) return { ok: false, retryAfterS: Math.ceil((b.resetAt - now) / 1000) };
  return { ok: true, retryAfterS: 0 };
}

export function resetRateLimit(key: string) {
  buckets.delete(key);
}

/** Read a bucket without counting this request (e.g. "are we locked out?"). */
export function peekRateLimit(key: string, max: number): { ok: boolean; retryAfterS: number } {
  const limit = max * SCALE;
  const b = buckets.get(key);
  const now = Date.now();
  if (!b || b.resetAt <= now || b.count < limit) return { ok: true, retryAfterS: 0 };
  return { ok: false, retryAfterS: Math.ceil((b.resetAt - now) / 1000) };
}
