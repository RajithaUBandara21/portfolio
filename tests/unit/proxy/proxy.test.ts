import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { proxy } from "@/proxy";

function makeRequest(path: string, cookie?: string): NextRequest {
  const headers = new Headers();
  if (cookie) headers.set("cookie", `session=${cookie}`);
  return new NextRequest(new URL(path, "http://localhost:3000"), { headers });
}

describe("proxy (admin route protection)", () => {
  it("redirects an unauthenticated request to /admin/dashboard to /admin/login", () => {
    const response = proxy(makeRequest("/admin/dashboard"));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/admin/login");
    expect(response.headers.get("location")).toContain("next=%2Fadmin%2Fdashboard");
  });

  it("lets an unauthenticated request through to /admin/login itself", () => {
    const response = proxy(makeRequest("/admin/login"));
    expect(response.status).toBe(200);
  });

  it("lets a request with a session cookie through to /admin/dashboard", () => {
    const response = proxy(makeRequest("/admin/dashboard", "some-token"));
    expect(response.status).toBe(200);
  });

  it("returns 401 JSON for an unauthenticated /api/admin/* request rather than redirecting", async () => {
    const response = proxy(makeRequest("/api/admin/projects"));
    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body).toEqual({ success: false, error: "Unauthenticated" });
  });

  it("lets an authenticated /api/admin/* request through", () => {
    const response = proxy(makeRequest("/api/admin/projects", "some-token"));
    expect(response.status).toBe(200);
  });

  it("does not gate public routes at all", () => {
    const response = proxy(makeRequest("/projects"));
    expect(response.status).toBe(200);
  });
});
