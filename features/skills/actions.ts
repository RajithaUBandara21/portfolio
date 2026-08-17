"use server";

import { updateTag } from "next/cache";
import { Prisma } from "@prisma/client";

import { requireAdminSession } from "@/features/auth/session";
import { SKILLS_CACHE_TAG } from "@/features/skills/queries";
import { type SkillInput, skillSchema } from "@/schemas/skill.schema";
import { createSkill, deleteSkill, updateSkill } from "@/services/skillService";
import type { ActionResult } from "@/features/projects/actions";

function toSaveInput(input: SkillInput) {
  return { ...input, description: input.description ? input.description : null };
}

function isUniqueSlugViolation(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002" &&
    Array.isArray(error.meta?.target) &&
    (error.meta.target as string[]).some((t) => t === "slug" || t === "name")
  );
}

export async function createSkillAction(input: SkillInput): Promise<ActionResult<{ id: string }>> {
  const parsed = skillSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  try {
    await requireAdminSession();
  } catch {
    return { success: false, error: "Your session has expired. Please sign in again." };
  }

  try {
    const skill = await createSkill(toSaveInput(parsed.data));
    updateTag(SKILLS_CACHE_TAG);
    return { success: true, data: { id: skill.id } };
  } catch (error) {
    if (isUniqueSlugViolation(error)) {
      return { success: false, error: "A skill with that name or slug already exists." };
    }
    throw error;
  }
}

export async function updateSkillAction(
  id: string,
  input: SkillInput,
): Promise<ActionResult<{ id: string }>> {
  const parsed = skillSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  try {
    await requireAdminSession();
  } catch {
    return { success: false, error: "Your session has expired. Please sign in again." };
  }

  try {
    const skill = await updateSkill(id, toSaveInput(parsed.data));
    updateTag(SKILLS_CACHE_TAG);
    return { success: true, data: { id: skill.id } };
  } catch (error) {
    if (isUniqueSlugViolation(error)) {
      return { success: false, error: "A skill with that name or slug already exists." };
    }
    throw error;
  }
}

export async function deleteSkillAction(id: string): Promise<ActionResult> {
  try {
    await requireAdminSession();
  } catch {
    return { success: false, error: "Your session has expired. Please sign in again." };
  }
  await deleteSkill(id);
  updateTag(SKILLS_CACHE_TAG);
  return { success: true, data: undefined };
}
