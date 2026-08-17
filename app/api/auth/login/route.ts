import { NextResponse } from "next/server";

import { setSessionCookie } from "@/lib/auth/session-cookie";
import { login } from "@/features/auth/actions";
import { getClientIp, hashIp } from "@/lib/request-ip";
import { loginSchema } from "@/schemas/auth.schema";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
  }

  const ip = getClientIp(request);
  const result = await login(parsed.data, {
    ipHash: ip ? hashIp(ip) : null,
    userAgent: request.headers.get("user-agent"),
  });

  if (!result.success) {
    const status = result.retryAfterMs ? 429 : 401;
    return NextResponse.json(result, { status });
  }

  await setSessionCookie(result.token, result.expiresAt);
  return NextResponse.json({ success: true });
}
