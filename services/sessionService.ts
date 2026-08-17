import type { Session, User } from "@prisma/client";

import { db } from "@/services/db";

export interface CreateSessionInput {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  userAgent?: string | null;
  ipHash?: string | null;
}

export function createSession(input: CreateSessionInput): Promise<Session> {
  return db.session.create({ data: input });
}

export function findActiveSessionByTokenHash(
  tokenHash: string,
): Promise<(Session & { user: User }) | null> {
  return db.session.findFirst({
    where: { tokenHash, revokedAt: null, expiresAt: { gt: new Date() } },
    include: { user: true },
  });
}

export function revokeSessionByTokenHash(tokenHash: string): Promise<{ count: number }> {
  return db.session.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export function revokeAllSessionsForUser(
  userId: string,
  exceptTokenHash?: string,
): Promise<{ count: number }> {
  return db.session.updateMany({
    where: {
      userId,
      revokedAt: null,
      ...(exceptTokenHash ? { tokenHash: { not: exceptTokenHash } } : {}),
    },
    data: { revokedAt: new Date() },
  });
}

export function deleteExpiredSessions(): Promise<{ count: number }> {
  return db.session.deleteMany({ where: { expiresAt: { lt: new Date() } } });
}
