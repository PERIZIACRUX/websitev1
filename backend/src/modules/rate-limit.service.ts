

/**
 * Basic in-memory rate limiter foundation.
 * This should be replaced with Redis (e.g. Upstash) or Cloudflare Rate Limiting
 * before production to work across serverless edge functions.
 */

// Simple in-memory store: { ip: { count, resetTime } }
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export interface RateLimitOptions {
  limit: number;
  windowMs: number; // Time window in milliseconds
}

export const defaultRateLimitOptions: RateLimitOptions = {
  limit: 60, // 60 requests
  windowMs: 60 * 1000, // per 1 minute
};

export async function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = defaultRateLimitOptions
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  // If no record or window expired, create/reset
  if (!record || now > record.resetAt) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetAt: now + options.windowMs,
    });
    return {
      success: true,
      limit: options.limit,
      remaining: options.limit - 1,
      reset: now + options.windowMs,
    };
  }

  // Increment count
  record.count += 1;
  const remaining = Math.max(0, options.limit - record.count);
  const success = record.count <= options.limit;

  return {
    success,
    limit: options.limit,
    remaining,
    reset: record.resetAt,
  };
}
