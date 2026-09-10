/**
 * Rate limiter abstraction. Swap `store` for a Redis/Upstash-backed implementation in
 * production by replacing `memoryStore` below — nothing else in the app needs to change.
 */
export interface RateLimitStore {
  /** Returns the request count for `key` within the current window, incrementing it. */
  hit(key: string, windowMs: number): Promise<number>;
}

// ponytail: single-process Map, resets on redeploy/restart. Swap for Upstash/Redis
// when running more than one instance or when limits must survive a restart.
class MemoryStore implements RateLimitStore {
  private buckets = new Map<string, { count: number; resetAt: number }>();

  async hit(key: string, windowMs: number): Promise<number> {
    const now = Date.now();
    const bucket = this.buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      this.buckets.set(key, { count: 1, resetAt: now + windowMs });
      return 1;
    }
    bucket.count += 1;
    return bucket.count;
  }
}

const store: RateLimitStore = new MemoryStore();

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  limit: number;
}

const LIMIT = 12;
const WINDOW_MS = 60_000;

export async function checkRateLimit(identifier: string): Promise<RateLimitResult> {
  const count = await store.hit(identifier, WINDOW_MS);
  return { ok: count <= LIMIT, remaining: Math.max(0, LIMIT - count), limit: LIMIT };
}
