import { createHash } from "node:crypto";

import { describe, expect, it } from "vitest";

import {
  generateSessionToken,
  hashSessionToken,
  sessionExpiryDate,
} from "@/lib/auth/session-token";

describe("session tokens", () => {
  it("generates unique, sufficiently long tokens", () => {
    const a = generateSessionToken();
    const b = generateSessionToken();
    expect(a).not.toBe(b);
    expect(a.length).toBeGreaterThanOrEqual(32);
  });

  it("hashes deterministically and matches a plain sha256 of the token", () => {
    const token = generateSessionToken();
    const expected = createHash("sha256").update(token).digest("hex");
    expect(hashSessionToken(token)).toBe(expected);
    expect(hashSessionToken(token)).toBe(hashSessionToken(token));
  });

  it("produces a session expiry date in the future", () => {
    const expiry = sessionExpiryDate();
    expect(expiry.getTime()).toBeGreaterThan(Date.now());
  });
});
