"use server";

import { updateTag } from "next/cache";
import { Prisma } from "@prisma/client";

import { requireAdminSession } from "@/features/auth/session";
import { PROJECTS_CACHE_TAG } from "@/features/projects/queries";
import { type ProjectInput, projectSchema } from "@/schemas/project.schema";
import {
  createProject as createProjectRecord,
  deleteProject as deleteProjectRecord,
  setProjectFlags,
  updateProject as updateProjectRecord,
  type SaveProjectInput,
} from "@/services/projectService";

export type ActionResult<T = undefined> =
  { success: true; data: T } | { success: false; error: string };

function toSaveInput(input: ProjectInput): SaveProjectInput {
  const blankToNull = (v: string | undefined) => (v ? v : null);
  return {
    slug: input.slug,
    title: input.title,
    shortDescription: input.shortDescription,
    fullDescription: input.fullDescription,
    categories: input.categories,
    status: input.status,
    contentStatus: input.contentStatus,
    featured: input.featured,
    startDate: input.startDate ? new Date(input.startDate) : null,
    endDate: input.endDate ? new Date(input.endDate) : null,
    githubUrl: blankToNull(input.githubUrl),
    demoUrl: blankToNull(input.demoUrl),
    docsUrl: blankToNull(input.docsUrl),
    problem: blankToNull(input.problem),
    solution: blankToNull(input.solution),
    architectureNotes: blankToNull(input.architectureNotes),
    challenges: blankToNull(input.challenges),
    results: blankToNull(input.results),
    lessons: blankToNull(input.lessons),
    futureImprovements: blankToNull(input.futureImprovements),
    reliabilityNotes: blankToNull(input.reliabilityNotes),
    securityNotes: blankToNull(input.securityNotes),
    observabilityNotes: blankToNull(input.observabilityNotes),
    testingNotes: blankToNull(input.testingNotes),
    technologyNames: input.technologyNames,
    skillIds: input.skillIds,
    screenshots: input.screenshots,
    metrics: input.metrics.map((m) => ({ ...m, context: blankToNull(m.context ?? "") })),
    decisions: input.decisions,
    archNodes: input.archNodes.map((n) => ({
      ...n,
      technology: blankToNull(n.technology ?? ""),
      responsibility: blankToNull(n.responsibility ?? ""),
    })),
    archEdges: input.archEdges.map((e) => ({
      ...e,
      label: blankToNull(e.label ?? ""),
      dataFlow: blankToNull(e.dataFlow ?? ""),
    })),
  };
}

function isUniqueSlugViolation(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002" &&
    Array.isArray(error.meta?.target) &&
    (error.meta.target as string[]).includes("slug")
  );
}

export async function createProjectAction(
  input: ProjectInput,
): Promise<ActionResult<{ id: string }>> {
  const parsed = projectSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    await requireAdminSession();
  } catch {
    return { success: false, error: "Your session has expired. Please sign in again." };
  }

  try {
    const result = await createProjectRecord(toSaveInput(parsed.data));
    updateTag(PROJECTS_CACHE_TAG);
    return { success: true, data: result };
  } catch (error) {
    if (isUniqueSlugViolation(error)) {
      return { success: false, error: "That slug is already in use." };
    }
    throw error;
  }
}

export async function updateProjectAction(
  id: string,
  input: ProjectInput,
): Promise<ActionResult<{ id: string }>> {
  const parsed = projectSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    await requireAdminSession();
  } catch {
    return { success: false, error: "Your session has expired. Please sign in again." };
  }

  try {
    const result = await updateProjectRecord(id, toSaveInput(parsed.data));
    updateTag(PROJECTS_CACHE_TAG);
    return { success: true, data: result };
  } catch (error) {
    if (isUniqueSlugViolation(error)) {
      return { success: false, error: "That slug is already in use." };
    }
    throw error;
  }
}

export async function deleteProjectAction(id: string): Promise<ActionResult> {
  try {
    await requireAdminSession();
  } catch {
    return { success: false, error: "Your session has expired. Please sign in again." };
  }

  await deleteProjectRecord(id);
  updateTag(PROJECTS_CACHE_TAG);
  return { success: true, data: undefined };
}

export async function setProjectFlagsAction(
  id: string,
  flags: { contentStatus?: "DRAFT" | "PUBLISHED" | "ARCHIVED"; featured?: boolean },
): Promise<ActionResult> {
  try {
    await requireAdminSession();
  } catch {
    return { success: false, error: "Your session has expired. Please sign in again." };
  }

  await setProjectFlags(id, flags);
  updateTag(PROJECTS_CACHE_TAG);
  return { success: true, data: undefined };
}
