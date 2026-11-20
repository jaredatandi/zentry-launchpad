interface Bucket {
  count: number;
  resetAt: number;
}

/** Small in-memory fixed-window limiter; sufficient for a single-owner v1. */
export class RateLimiter {
  private buckets = new Map<string, Bucket>();

  constructor(
    private readonly max: number,
    private readonly windowMs: number,
  ) {}

  check(key: string): { allowed: boolean; retryAfter: number } {
    const now = Date.now();
    const bucket = this.buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      this.buckets.set(key, { count: 1, resetAt: now + this.windowMs });
      return { allowed: true, retryAfter: 0 };
    }
    if (bucket.count >= this.max) {
      return { allowed: false, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) };
    }
    bucket.count += 1;
    return { allowed: true, retryAfter: 0 };
  }

  clear(): void {
    this.buckets.clear();
  }
}
