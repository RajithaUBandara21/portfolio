import { describe, expect, it } from "vitest";

import { calculateReadingTimeMinutes } from "@/lib/markdown";

describe("calculateReadingTimeMinutes", () => {
  it("rounds up to at least 1 minute for very short content", () => {
    expect(calculateReadingTimeMinutes("A short sentence.")).toBe(1);
  });

  it("estimates a longer reading time for long content", () => {
    const longContent = "word ".repeat(1000);
    expect(calculateReadingTimeMinutes(longContent)).toBeGreaterThan(1);
  });
});
