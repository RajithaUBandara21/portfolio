import "server-only";

import { checkLoginRateLimit } from "@/lib/auth/login-rate-limit";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import {
  generateSessionToken,
  hashSessionToken,
  sessionExpiryDate,
} from "@/lib/auth/session-token";
import { logger } from "@/lib/logger";
import type { LoginInput } from "@/schemas/auth.schema";
import {
  createSession,
  revokeAllSessionsForUser,
  revokeSessionByTokenHash,
} from "@/services/sessionService";
import { findUserByEmail, touchLastLogin, updateUserPassword } from "@/services/userService";

export interface LoginMeta {
  ipHash: string | null;
  userAgent: string | null;
}

export type LoginResult =
  | { success: true; token: string; expiresAt: Date }
  | { success: false; error: string; retryAfterMs?: number };

// Pure business logic: no next/headers dependency, so it's directly unit/integration testable.
// Callers (route handlers, server actions) own reading/writing the session cookie.
export async function login(input: LoginInput, meta: LoginMeta): Promise<LoginResult> {
  const rateLimitKey = `${meta.ipHash ?? "unknown"}:${input.email.toLowerCase()}`;
  const rateLimit = checkLoginRateLimit(rateLimitKey);
  if (!rateLimit.allowed) {
    return {
      success: false,
      error: "Too many login attempts. Try again later.",
      retryAfterMs: rateLimit.retryAfterMs,
    };
  }

  const user = await findUserByEmail(input.email);
  const passwordValid = user ? await verifyPassword(user.passwordHash, input.password) : false;

  if (!user || !passwordValid) {
    return { success: false, error: "Invalid email or password" };
  }

  const token = generateSessionToken();
  const expiresAt = sessionExpiryDate();
  await createSession({
    userId: user.id,
    tokenHash: hashSessionToken(token),
    expiresAt,
    userAgent: meta.userAgent,
    ipHash: meta.ipHash,
  });
  await touchLastLogin(user.id);

  logger.info({ userId: user.id }, "Admin login succeeded");
  return { success: true, token, expiresAt };
}

export async function logout(tokenHash: string | null): Promise<void> {
  if (tokenHash) {
    await revokeSessionByTokenHash(tokenHash);
  }
}

export async function changePasswordForUser(
  userEmail: string,
  currentSessionTokenHash: string,
  input: { currentPassword: string; newPassword: string },
): Promise<{ success: true } | { success: false; error: string }> {
  const user = await findUserByEmail(userEmail);
  const currentValid = user
    ? await verifyPassword(user.passwordHash, input.currentPassword)
    : false;
  if (!user || !currentValid) {
    return { success: false, error: "Current password is incorrect" };
  }

  const newHash = await hashPassword(input.newPassword);
  await updateUserPassword(user.id, newHash);
  // Revoke every other session so a leaked-but-now-outdated credential can't keep a session alive.
  await revokeAllSessionsForUser(user.id, currentSessionTokenHash);

  logger.info({ userId: user.id }, "Admin password changed; other sessions revoked");
  return { success: true };
}
