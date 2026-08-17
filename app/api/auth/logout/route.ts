import { NextResponse } from "next/server";

import { clearSessionCookie } from "@/lib/auth/session-cookie";
import { logout } from "@/features/auth/actions";
import { getSession } from "@/features/auth/session";

export async function POST() {
  const session = await getSession();
  await logout(session?.tokenHash ?? null);
  await clearSessionCookie();
  return NextResponse.json({ success: true });
}
