import { NextResponse } from "next/server";

import { getClientIp, hashIp } from "@/lib/request-ip";
import { checkContactRateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";
import { contactFormSchema } from "@/schemas/contact.schema";
import { createContactMessage } from "@/services/contactService";

const MIN_FILL_TIME_MS = 1500;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = contactFormSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
  }

  const { name, email, subject, message, website, renderedAt } = parsed.data;

  // Honeypot filled, or submitted faster than a human plausibly could: silently report success
  // so a bot gets no signal that it was caught, without persisting anything.
  const submittedTooFast = Date.now() - renderedAt < MIN_FILL_TIME_MS;
  if (website || submittedTooFast) {
    return NextResponse.json({ success: true });
  }

  const ip = getClientIp(request);
  const ipHash = ip ? hashIp(ip) : null;

  if (ipHash) {
    const rateLimit = await checkContactRateLimit(ipHash);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many messages sent. Please try again later." },
        { status: 429 },
      );
    }
  }

  await createContactMessage({
    name,
    email,
    subject: subject ? subject : null,
    message,
    ipHash,
    userAgent: request.headers.get("user-agent"),
  });

  logger.info({ ipHash }, "Contact message received");
  return NextResponse.json({ success: true });
}
