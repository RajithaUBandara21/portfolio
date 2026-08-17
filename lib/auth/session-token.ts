import { createHash, randomBytes } from "node:crypto";

import { env } from "@/lib/env";

// The raw token is what goes in the cookie and is shown to the browser exactly once, at
// login. Only its hash is ever persisted, so a database read (or backup leak) can't be used
// to forge a session the way a stored plaintext or reversibly-encrypted token could.
export function generateSessionToken(): string {
  return randomBytes(32).toString("hex");
}

export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function sessionExpiryDate(): Date {
  return new Date(Date.now() + env.SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);
}
