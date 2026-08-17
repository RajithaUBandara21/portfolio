import type { User } from "@prisma/client";

import { db } from "@/services/db";

export function findUserByEmail(email: string): Promise<User | null> {
  return db.user.findUnique({ where: { email } });
}

export function findUserById(id: string): Promise<User | null> {
  return db.user.findUnique({ where: { id } });
}

export function touchLastLogin(userId: string): Promise<User> {
  return db.user.update({ where: { id: userId }, data: { lastLoginAt: new Date() } });
}

export function updateUserPassword(userId: string, passwordHash: string): Promise<User> {
  return db.user.update({ where: { id: userId }, data: { passwordHash } });
}
