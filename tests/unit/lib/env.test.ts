import { describe, expect, it } from "vitest";

import { envSchema } from "@/lib/env";

const baseEnv = {
  DATABASE_URL: "postgresql://user:pass@localhost:5432/db",
  DIRECT_URL: "postgresql://user:pass@localhost:5432/db",
};

describe("envSchema", () => {
  it("accepts the minimal required configuration", () => {
    const result = envSchema.safeParse(baseEnv);
    expect(result.success).toBe(true);
  });

  it("treats empty-string optional vars the same as unset, not invalid", () => {
    // .env files commonly declare optional keys with no value, e.g. `GITHUB_TOKEN=`.
    const result = envSchema.safeParse({
      ...baseEnv,
      GITHUB_TOKEN: "",
      GITHUB_USERNAME: "",
      BLOB_READ_WRITE_TOKEN: "",
      UPSTASH_REDIS_REST_URL: "",
      UPSTASH_REDIS_REST_TOKEN: "",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.GITHUB_TOKEN).toBeUndefined();
      expect(result.data.BLOB_READ_WRITE_TOKEN).toBeUndefined();
    }
  });

  it("rejects a missing DATABASE_URL", () => {
    const { DATABASE_URL: _omit, ...rest } = baseEnv;
    const result = envSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects a too-short seed admin password when it is actually set", () => {
    const result = envSchema.safeParse({ ...baseEnv, SEED_ADMIN_PASSWORD: "short" });
    expect(result.success).toBe(false);
  });
});
