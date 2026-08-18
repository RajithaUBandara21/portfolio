import { describe, expect, it } from "vitest";

import { formatDate } from "@/lib/utils";

describe("formatDate", () => {
  it("formats a real Date instance", () => {
    expect(formatDate(new Date("2026-08-18T00:00:00Z"))).toBe("August 18, 2026");
  });

  it(
    "formats an ISO date string the same way — this is the case that breaks a bare " +
      "`.toLocaleDateString()` call on data that came back from unstable_cache after a cache hit",
    () => {
      expect(formatDate("2026-08-18T00:00:00.000Z")).toBe("August 18, 2026");
    },
  );

  it("returns an empty string for null/undefined instead of throwing", () => {
    expect(formatDate(null)).toBe("");
    expect(formatDate(undefined)).toBe("");
  });

  it("accepts custom Intl.DateTimeFormat options", () => {
    expect(formatDate(new Date("2026-08-18T00:00:00Z"), { month: "short", year: "numeric" })).toBe(
      "Aug 2026",
    );
  });
});
