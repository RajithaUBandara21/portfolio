// Simple in-memory fixed-window limiter for the login endpoint. Per-instance only (resets on
// restart/cold start) — acceptable for a single-admin site where the threat model is external
// brute-forcing, not sophisticated distributed attacks. The contact form gets a proper
// pluggable Upstash/Postgres-backed limiter (see lib/rate-limit.ts) because it's public,
// higher-volume, and the natural place for that infrastructure to earn its cost.

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;

const attempts = new Map<string, { count: number; windowStart: number }>();

export function checkLoginRateLimit(key: string): { allowed: boolean; retryAfterMs?: number } {
  const now = Date.now();
  const entry = attempts.get(key);

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    attempts.set(key, { count: 1, windowStart: now });
    return { allowed: true };
  }

  if (entry.count >= MAX_ATTEMPTS) {
    return { allowed: false, retryAfterMs: WINDOW_MS - (now - entry.windowStart) };
  }

  entry.count += 1;
  return { allowed: true };
}

export function resetLoginRateLimit(key: string): void {
  attempts.delete(key);
}
