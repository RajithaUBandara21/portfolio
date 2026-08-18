import { beforeEach, describe, expect, it } from "vitest";

import { checkLoginRateLimit, resetLoginRateLimit } from "@/lib/auth/login-rate-limit";

describe("login rate limiting", () => {
  const key = "test-key";

  beforeEach(() => {
    resetLoginRateLimit(key);
  });

  it("allows requests under the limit", () => {
    for (let i = 0; i < 10; i++) {
      expect(checkLoginRateLimit(key).allowed).toBe(true);
    }
  });

  it("blocks once the limit is exceeded within the window", () => {
    for (let i = 0; i < 10; i++) {
      checkLoginRateLimit(key);
    }
    const result = checkLoginRateLimit(key);
    expect(result.allowed).toBe(false);
    expect(result.retryAfterMs).toBeGreaterThan(0);
  });

  it("tracks independent keys separately", () => {
    for (let i = 0; i < 10; i++) {
      checkLoginRateLimit("key-a");
    }
    expect(checkLoginRateLimit("key-a").allowed).toBe(false);
    expect(checkLoginRateLimit("key-b").allowed).toBe(true);
  });
});
