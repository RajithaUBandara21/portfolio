import { describe, expect, it, vi } from "vitest";

const queryRaw = vi.fn();
vi.mock("@/services/db", () => ({ db: { $queryRaw: (...args: unknown[]) => queryRaw(...args) } }));
vi.mock("@/lib/logger", () => ({ logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() } }));

describe("/api/ready", () => {
  it("returns 200 when the database is reachable", async () => {
    queryRaw.mockResolvedValueOnce([{ "?column?": 1 }]);
    const { GET } = await import("@/app/api/ready/route");

    const response = await GET();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "ready" });
  });

  it("returns 503 when the database is unreachable", async () => {
    queryRaw.mockRejectedValueOnce(new Error("connection refused"));
    const { GET } = await import("@/app/api/ready/route");

    const response = await GET();
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ status: "not ready" });
  });
});
