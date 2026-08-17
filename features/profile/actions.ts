"use server";

import { updateTag } from "next/cache";

import { requireAdminSession } from "@/features/auth/session";
import { PROFILE_CACHE_TAG } from "@/features/profile/queries";
import { type ProfileInput, profileSchema } from "@/schemas/profile.schema";
import { upsertProfile } from "@/services/profileService";

export async function updateProfileAction(
  input: ProfileInput,
): Promise<{ success: true } | { success: false; error: string }> {
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    await requireAdminSession();
  } catch {
    return { success: false, error: "Your session has expired. Please sign in again." };
  }

  await upsertProfile({
    ...parsed.data,
    socialLinks: parsed.data.socialLinks.map((link, index) => ({
      platform: link.platform,
      url: link.url,
      order: link.order ?? index,
    })),
  });

  updateTag(PROFILE_CACHE_TAG);
  return { success: true };
}
