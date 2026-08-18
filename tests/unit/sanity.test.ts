import { describe, expect, it } from "vitest";

describe("test runner sanity check", () => {
  it("runs unit tests", () => {
    expect(1 + 1).toBe(2);
  });
});
