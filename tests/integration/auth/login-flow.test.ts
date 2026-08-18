import { randomUUID } from "node:crypto";

import { afterAll, describe, expect, it } from "vitest";

import { changePasswordForUser, login, logout } from "@/features/auth/actions";
import { hashPassword } from "@/lib/auth/password";
import { hashSessionToken } from "@/lib/auth/session-token";
import { db } from "@/services/db";
import { findActiveSessionByTokenHash } from "@/services/sessionService";

const PASSWORD = "correct horse battery staple";

async function createTestUser(emailPrefix: string) {
  const email = `${emailPrefix}-${randomUUID()}@example.com`;
  const passwordHash = await hashPassword(PASSWORD);
  const user = await db.user.create({ data: { email, passwordHash } });
  return { email, user };
}

describe("login flow (integration)", () => {
  const createdUserIds: string[] = [];

  afterAll(async () => {
    await db.session.deleteMany({ where: { userId: { in: createdUserIds } } });
    await db.user.deleteMany({ where: { id: { in: createdUserIds } } });
  });

  it("creates a real, active session row on successful login", async () => {
    const { email, user } = await createTestUser("login-success");
    createdUserIds.push(user.id);

    const result = await login(
      { email, password: PASSWORD },
      { ipHash: "test-ip-hash", userAgent: "vitest" },
    );

    expect(result.success).toBe(true);
    if (!result.success) return;

    const tokenHash = hashSessionToken(result.token);
    const session = await findActiveSessionByTokenHash(tokenHash);
    expect(session).not.toBeNull();
    expect(session?.userId).toBe(user.id);
    expect(session?.revokedAt).toBeNull();
    expect(session?.expiresAt.getTime()).toBeGreaterThan(Date.now());
  });

  it("rejects an incorrect password without creating a session", async () => {
    const { email, user } = await createTestUser("login-wrong-password");
    createdUserIds.push(user.id);

    const before = await db.session.count({ where: { userId: user.id } });
    const result = await login(
      { email, password: "not the password" },
      { ipHash: "test-ip-hash-2", userAgent: "vitest" },
    );
    const after = await db.session.count({ where: { userId: user.id } });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Invalid email or password");
    }
    expect(after).toBe(before);
  });

  it("rejects an unknown email with the same generic error (no user enumeration)", async () => {
    const result = await login(
      { email: `nobody-${randomUUID()}@example.com`, password: PASSWORD },
      { ipHash: "test-ip-hash-3", userAgent: "vitest" },
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Invalid email or password");
    }
  });

  it("rate-limits repeated failed attempts for the same ip+email", async () => {
    const { email, user } = await createTestUser("login-rate-limited");
    createdUserIds.push(user.id);
    const ipHash = `rate-limit-test-${randomUUID()}`;

    let lastResult;
    for (let i = 0; i < 11; i++) {
      lastResult = await login({ email, password: "wrong" }, { ipHash, userAgent: "vitest" });
    }

    expect(lastResult?.success).toBe(false);
    if (lastResult && !lastResult.success) {
      expect(lastResult.retryAfterMs).toBeGreaterThan(0);
    }
  });

  it("revokes the session on logout so it can no longer authenticate", async () => {
    const { email, user } = await createTestUser("logout");
    createdUserIds.push(user.id);

    const loginResult = await login(
      { email, password: PASSWORD },
      { ipHash: "test-ip-hash-4", userAgent: "vitest" },
    );
    expect(loginResult.success).toBe(true);
    if (!loginResult.success) return;

    const tokenHash = hashSessionToken(loginResult.token);
    await logout(tokenHash);

    const session = await findActiveSessionByTokenHash(tokenHash);
    expect(session).toBeNull();
  });

  it("changes the password and revokes other sessions, keeping the current one", async () => {
    const { email, user } = await createTestUser("change-password");
    createdUserIds.push(user.id);

    const sessionA = await login(
      { email, password: PASSWORD },
      { ipHash: "test-ip-hash-5a", userAgent: "vitest" },
    );
    const sessionB = await login(
      { email, password: PASSWORD },
      { ipHash: "test-ip-hash-5b", userAgent: "vitest" },
    );
    expect(sessionA.success).toBe(true);
    expect(sessionB.success).toBe(true);
    if (!sessionA.success || !sessionB.success) return;

    const tokenHashA = hashSessionToken(sessionA.token);
    const tokenHashB = hashSessionToken(sessionB.token);

    const changeResult = await changePasswordForUser(email, tokenHashA, {
      currentPassword: PASSWORD,
      newPassword: "a brand new stronger password",
    });
    expect(changeResult.success).toBe(true);

    expect(await findActiveSessionByTokenHash(tokenHashA)).not.toBeNull();
    expect(await findActiveSessionByTokenHash(tokenHashB)).toBeNull();

    const oldPasswordLogin = await login(
      { email, password: PASSWORD },
      { ipHash: "test-ip-hash-5c", userAgent: "vitest" },
    );
    expect(oldPasswordLogin.success).toBe(false);

    const newPasswordLogin = await login(
      { email, password: "a brand new stronger password" },
      { ipHash: "test-ip-hash-5d", userAgent: "vitest" },
    );
    expect(newPasswordLogin.success).toBe(true);
  });

  it("rejects a password change with an incorrect current password", async () => {
    const { email, user } = await createTestUser("change-password-wrong-current");
    createdUserIds.push(user.id);

    const result = await changePasswordForUser(email, "irrelevant-token-hash", {
      currentPassword: "totally wrong",
      newPassword: "a brand new stronger password",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Current password is incorrect");
    }
  });
});
