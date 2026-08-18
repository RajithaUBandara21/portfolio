import { randomUUID } from "node:crypto";

import { afterAll, describe, expect, it } from "vitest";

import { checkContactRateLimit } from "@/lib/rate-limit";
import { createContactMessage } from "@/services/contactService";
import { db } from "@/services/db";

describe("contact rate limiting (Postgres fallback — no Upstash configured in tests)", () => {
  const createdIpHashes: string[] = [];

  afterAll(async () => {
    await db.contactMessage.deleteMany({ where: { ipHash: { in: createdIpHashes } } });
  });

  it("allows the first 5 messages from an IP within the window, then blocks the 6th", async () => {
    const ipHash = `test-rl-${randomUUID()}`;
    createdIpHashes.push(ipHash);

    for (let i = 0; i < 5; i++) {
      const result = await checkContactRateLimit(ipHash);
      expect(result.allowed).toBe(true);
      await createContactMessage({
        name: "Test",
        email: "test@example.com",
        subject: null,
        message: `message ${i}`,
        ipHash,
        userAgent: "vitest",
      });
    }

    const sixth = await checkContactRateLimit(ipHash);
    expect(sixth.allowed).toBe(false);
    expect(sixth.retryAfterMs).toBeGreaterThan(0);
  });

  it("does not rate-limit a different IP", async () => {
    const ipHash = `test-rl-${randomUUID()}`;
    createdIpHashes.push(ipHash);

    const result = await checkContactRateLimit(ipHash);
    expect(result.allowed).toBe(true);
  });
});
