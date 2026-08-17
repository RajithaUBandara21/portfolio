import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { env } from "@/lib/env";

// This is a cheap, cookie-presence-only gate — NOT the authoritative auth check. Proxy is
// documented as potentially running in an optimized, CDN-adjacent context outside normal
// render code ("you should not attempt relying on shared modules or globals"), so it
// deliberately never touches Postgres. The real check (hash lookup, expiry, revocation) runs
// in features/auth/session.ts's getSession(), called from the admin layout and from every
// admin server action / API route handler. This proxy only saves an unauthenticated visitor
// a full page render before bouncing them to /admin/login.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSessionCookie = Boolean(request.cookies.get(env.SESSION_COOKIE_NAME)?.value);

  if (pathname.startsWith("/api/admin")) {
    if (!hasSessionCookie) {
      return NextResponse.json({ success: false, error: "Unauthenticated" }, { status: 401 });
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!hasSessionCookie) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
