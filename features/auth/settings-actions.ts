"use server";

import { z } from "zod";

import { changePasswordForUser } from "@/features/auth/actions";
import { requireAdminSession } from "@/features/auth/session";
import { type ChangePasswordInput, changePasswordSchema } from "@/schemas/auth.schema";

export async function changePasswordAction(
  input: ChangePasswordInput,
): Promise<{ success: true } | { success: false; error: string }> {
  const parsed = changePasswordSchema.safeParse(input);
  if (!parsed.success) {
    const firstError = Object.values(z.flattenError(parsed.error).fieldErrors)[0]?.[0];
    return { success: false, error: firstError ?? "Invalid input" };
  }

  let session;
  try {
    session = await requireAdminSession();
  } catch {
    return { success: false, error: "Your session has expired. Please sign in again." };
  }

  return changePasswordForUser(session.user.email, session.tokenHash, parsed.data);
}
