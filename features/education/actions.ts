"use server";

import { updateTag } from "next/cache";

import { requireAdminSession } from "@/features/auth/session";
import { EDUCATION_CACHE_TAG } from "@/features/education/queries";
import type { ActionResult } from "@/features/projects/actions";
import { type EducationInput, educationSchema } from "@/schemas/education.schema";
import { createEducation, deleteEducation, updateEducation } from "@/services/educationService";

function toSaveInput(input: EducationInput) {
  return {
    institution: input.institution,
    degree: input.degree,
    fieldOfStudy: input.fieldOfStudy ? input.fieldOfStudy : null,
    startDate: new Date(input.startDate),
    endDate: input.endDate ? new Date(input.endDate) : null,
    current: input.current,
    description: input.description ? input.description : null,
    order: input.order,
    contentStatus: input.contentStatus,
  };
}

export async function createEducationAction(
  input: EducationInput,
): Promise<ActionResult<{ id: string }>> {
  const parsed = educationSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  try {
    await requireAdminSession();
  } catch {
    return { success: false, error: "Your session has expired. Please sign in again." };
  }
  const education = await createEducation(toSaveInput(parsed.data));
  updateTag(EDUCATION_CACHE_TAG);
  return { success: true, data: { id: education.id } };
}

export async function updateEducationAction(
  id: string,
  input: EducationInput,
): Promise<ActionResult<{ id: string }>> {
  const parsed = educationSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  try {
    await requireAdminSession();
  } catch {
    return { success: false, error: "Your session has expired. Please sign in again." };
  }
  const education = await updateEducation(id, toSaveInput(parsed.data));
  updateTag(EDUCATION_CACHE_TAG);
  return { success: true, data: { id: education.id } };
}

export async function deleteEducationAction(id: string): Promise<ActionResult> {
  try {
    await requireAdminSession();
  } catch {
    return { success: false, error: "Your session has expired. Please sign in again." };
  }
  await deleteEducation(id);
  updateTag(EDUCATION_CACHE_TAG);
  return { success: true, data: undefined };
}
