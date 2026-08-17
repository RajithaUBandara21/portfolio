import { createHash } from "node:crypto";

// IP addresses are only ever stored/used as a hash (rate-limit keys, audit fields) — never
// persisted or logged raw, to avoid retaining personal data unnecessarily.
export function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex");
}

export function getClientIp(request: Request): string | null {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? null;
  }
  return request.headers.get("x-real-ip");
}
