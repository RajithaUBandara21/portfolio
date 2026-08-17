import "server-only";

import type { User } from "@prisma/client";

import { getSessionTokenFromCookies } from "@/lib/auth/session-cookie";
import { hashSessionToken } from "@/lib/auth/session-token";
import { findActiveSessionByTokenHash } from "@/services/sessionService";

export interface AuthenticatedSession {
  user: Omit<User, "passwordHash">;
  tokenHash: string;
}

// The single authoritative session check. Every admin server action, admin page/layout, and
// /api/admin/* route handler calls this — proxy.ts only does a cheap cookie-presence redirect
// (see proxy.ts for why it can't safely do this DB-backed check itself).
export async function getSession(): Promise<AuthenticatedSession | null> {
  const token = await getSessionTokenFromCookies();
  if (!token) return null;

  const tokenHash = hashSessionToken(token);
  const session = await findActiveSessionByTokenHash(tokenHash);
  if (!session) return null;

  const { passwordHash: _passwordHash, ...user } = session.user;
  return { user, tokenHash };
}

export async function requireAdminSession(): Promise<AuthenticatedSession> {
  const session = await getSession();
  if (!session) {
    throw new Error("UNAUTHENTICATED");
  }
  return session;
}
