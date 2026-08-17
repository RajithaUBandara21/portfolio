import { NextResponse } from "next/server";

import { db } from "@/services/db";
import { logger } from "@/lib/logger";

export async function GET() {
  try {
    await db.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ready" });
  } catch (error) {
    logger.error({ err: error }, "Readiness check failed: database unreachable");
    return NextResponse.json({ status: "not ready" }, { status: 503 });
  }
}
