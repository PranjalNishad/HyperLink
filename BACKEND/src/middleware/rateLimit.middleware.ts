import type { Context, Next } from "hono";

interface RateLimitOptions {
  /** Bucket name — separates limits per feature. */
  name: string;
  /** Window length in milliseconds. */
  windowMs: number;
  /** Maximum requests allowed per window per client. */
  max: number;
}

interface Bucket {
  count: number;
  resetAt: number;
}

// In-memory store. Sufficient for a single Bun instance; a multi-instance
// deployment would move this to Redis or similar.
const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 10_000;

const clientKey = (c: Context) => {
  const forwarded = c.req.header("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return c.req.header("x-real-ip") || "unknown";
};

const prune = (now: number) => {
  if (buckets.size < MAX_BUCKETS) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
};

/** Lightweight fixed-window rate limiter for abuse-prone endpoints. */
export const rateLimit =
  ({ name, windowMs, max }: RateLimitOptions) =>
  async (c: Context, next: Next) => {
    const now = Date.now();
    const key = `${name}:${clientKey(c)}`;

    let bucket = buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + windowMs };
      buckets.set(key, bucket);
      prune(now);
    }

    bucket.count += 1;

    if (bucket.count > max) {
      const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
      c.header("Retry-After", String(retryAfter));
      return c.json(
        {
          success: false,
          message: "Too many requests. Please slow down and try again shortly.",
        },
        429,
      );
    }

    await next();
  };
