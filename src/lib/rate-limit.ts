/**
 * Simple in-memory rate limiter.
 * For cost effectiveness, no Redis needed at 5-client scale.
 * In production with many instances, upgrade to Upstash Redis.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

export function rateLimit(
  identifier: string,
  options: { maxRequests?: number; windowMs?: number } = {}
): { success: boolean; remaining: number; resetAt: number } {
  const { maxRequests = 10, windowMs = 60000 } = options;
  const now = Date.now();
  const entry = store.get(identifier);

  if (!entry || now > entry.resetAt) {
    store.set(identifier, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: maxRequests - 1, resetAt: now + windowMs };
  }

  if (entry.count >= maxRequests) {
    return { success: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { success: true, remaining: maxRequests - entry.count, resetAt: entry.resetAt };
}

// Cleanup expired entries periodically to prevent memory leak
setInterval(() => {
  const now = Date.now();
  store.forEach((entry, key) => {
    if (now > entry.resetAt) {
      store.delete(key);
    }
  });
}, 60000);
