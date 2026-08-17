import { cookies } from "next/headers";

import { env } from "@/lib/env";

// Callable only from Server Actions and Route Handlers (Next.js restriction on writing
// cookies outside a request/mutation context). `expiresAt` is passed in rather than computed
// here so the cookie's lifetime always matches the DB session row's `expiresAt` exactly.
export async function setSessionCookie(token: string, expiresAt: Date): Promise<void> {
  const store = await cookies();
  store.set(env.SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(env.SESSION_COOKIE_NAME);
}

// Safe to call anywhere a request context exists (Server Components, Actions, Route Handlers).
export async function getSessionTokenFromCookies(): Promise<string | null> {
  const store = await cookies();
  return store.get(env.SESSION_COOKIE_NAME)?.value ?? null;
}
