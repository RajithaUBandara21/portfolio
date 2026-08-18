"use server";

import { revalidatePath } from "next/cache";
import type { ContactMessageStatus } from "@prisma/client";

import { requireAdminSession } from "@/features/auth/session";
import type { ActionResult } from "@/features/projects/actions";
import { updateContactMessageStatus } from "@/services/contactService";

export async function updateContactMessageStatusAction(
  id: string,
  status: ContactMessageStatus,
): Promise<ActionResult> {
  try {
    await requireAdminSession();
  } catch {
    return { success: false, error: "Your session has expired. Please sign in again." };
  }
  await updateContactMessageStatus(id, status);
  revalidatePath("/admin/messages");
  return { success: true, data: undefined };
}
