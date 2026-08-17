"use server";

import { updateTag } from "next/cache";

import { requireAdminSession } from "@/features/auth/session";
import { EXPERIENCE_CACHE_TAG } from "@/features/experience/queries";
import type { ActionResult } from "@/features/projects/actions";
import { type ExperienceInput, experienceSchema } from "@/schemas/experience.schema";
import { createExperience, deleteExperience, updateExperience } from "@/services/experienceService";

function toSaveInput(input: ExperienceInput) {
  return {
    company: input.company,
    role: input.role,
    location: input.location ? input.location : null,
    startDate: new Date(input.startDate),
    endDate: input.endDate ? new Date(input.endDate) : null,
    current: input.current,
    summary: input.summary,
    highlights: input.highlights,
    technologies: input.technologies,
    order: input.order,
    contentStatus: input.contentStatus,
  };
}

export async function createExperienceAction(
  input: ExperienceInput,
): Promise<ActionResult<{ id: string }>> {
  const parsed = experienceSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  try {
    await requireAdminSession();
  } catch {
    return { success: false, error: "Your session has expired. Please sign in again." };
  }
  const experience = await createExperience(toSaveInput(parsed.data));
  updateTag(EXPERIENCE_CACHE_TAG);
  return { success: true, data: { id: experience.id } };
}

export async function updateExperienceAction(
  id: string,
  input: ExperienceInput,
): Promise<ActionResult<{ id: string }>> {
  const parsed = experienceSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  try {
    await requireAdminSession();
  } catch {
    return { success: false, error: "Your session has expired. Please sign in again." };
  }
  const experience = await updateExperience(id, toSaveInput(parsed.data));
  updateTag(EXPERIENCE_CACHE_TAG);
  return { success: true, data: { id: experience.id } };
}

export async function deleteExperienceAction(id: string): Promise<ActionResult> {
  try {
    await requireAdminSession();
  } catch {
    return { success: false, error: "Your session has expired. Please sign in again." };
  }
  await deleteExperience(id);
  updateTag(EXPERIENCE_CACHE_TAG);
  return { success: true, data: undefined };
}
