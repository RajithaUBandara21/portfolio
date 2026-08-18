"use server";

import { updateTag } from "next/cache";

import { ACTIVITIES_CACHE_TAG } from "@/features/activities/queries";
import { requireAdminSession } from "@/features/auth/session";
import type { ActionResult } from "@/features/projects/actions";
import { type ActivityInput, activitySchema } from "@/schemas/activity.schema";
import { createActivity, deleteActivity, updateActivity } from "@/services/activityService";

function toSaveInput(input: ActivityInput) {
  return {
    title: input.title,
    type: input.type,
    description: input.description ? input.description : null,
    url: input.url ? input.url : null,
    date: new Date(input.date),
    order: input.order,
    contentStatus: input.contentStatus,
  };
}

export async function createActivityAction(
  input: ActivityInput,
): Promise<ActionResult<{ id: string }>> {
  const parsed = activitySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  try {
    await requireAdminSession();
  } catch {
    return { success: false, error: "Your session has expired. Please sign in again." };
  }
  const activity = await createActivity(toSaveInput(parsed.data));
  updateTag(ACTIVITIES_CACHE_TAG);
  return { success: true, data: { id: activity.id } };
}

export async function updateActivityAction(
  id: string,
  input: ActivityInput,
): Promise<ActionResult<{ id: string }>> {
  const parsed = activitySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  try {
    await requireAdminSession();
  } catch {
    return { success: false, error: "Your session has expired. Please sign in again." };
  }
  const activity = await updateActivity(id, toSaveInput(parsed.data));
  updateTag(ACTIVITIES_CACHE_TAG);
  return { success: true, data: { id: activity.id } };
}

export async function deleteActivityAction(id: string): Promise<ActionResult> {
  try {
    await requireAdminSession();
  } catch {
    return { success: false, error: "Your session has expired. Please sign in again." };
  }
  await deleteActivity(id);
  updateTag(ACTIVITIES_CACHE_TAG);
  return { success: true, data: undefined };
}
