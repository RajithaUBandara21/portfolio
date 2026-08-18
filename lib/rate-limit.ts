import "server-only";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

import { env, hasUpstashRateLimit } from "@/lib/env";
import { db } from "@/services/db";

export interface RateLimitResult {
  allowed: boolean;
  retryAfterMs?: number;
}

const upstashLimiter = hasUpstashRateLimit
  ? new Ratelimit({
      redis: new Redis({
        url: env.UPSTASH_REDIS_REST_URL!,
        token: env.UPSTASH_REDIS_REST_TOKEN!,
      }),
      limiter: Ratelimit.slidingWindow(5, "10 m"),
      prefix: "contact-form",
    })
  : null;

const FALLBACK_WINDOW_MS = 10 * 60 * 1000;
const FALLBACK_MAX_REQUESTS = 5;

// Fallback used when Upstash isn't configured (e.g. local dev / self-host without cloud
// credentials): a fixed-window counter against ContactMessage rows, keyed by hashed IP. Less
// precise than a sliding window, but keeps `docker-compose up` self-contained with just
// app+Postgres rather than requiring a second infra dependency.
async function checkPostgresFallback(ipHash: string): Promise<RateLimitResult> {
  const windowStart = new Date(Date.now() - FALLBACK_WINDOW_MS);
  const count = await db.contactMessage.count({
    where: { ipHash, createdAt: { gt: windowStart } },
  });
  if (count >= FALLBACK_MAX_REQUESTS) {
    return { allowed: false, retryAfterMs: FALLBACK_WINDOW_MS };
  }
  return { allowed: true };
}

export async function checkContactRateLimit(ipHash: string): Promise<RateLimitResult> {
  if (upstashLimiter) {
    const result = await upstashLimiter.limit(ipHash);
    return {
      allowed: result.success,
      retryAfterMs: result.success ? undefined : Math.max(0, result.reset - Date.now()),
    };
  }
  return checkPostgresFallback(ipHash);
}
