"use server";

import { updateTag } from "next/cache";
import { Prisma } from "@prisma/client";

import { requireAdminSession } from "@/features/auth/session";
import { BLOG_CACHE_TAG } from "@/features/blog/queries";
import type { ActionResult } from "@/features/projects/actions";
import { calculateReadingTimeMinutes } from "@/lib/markdown";
import { type BlogPostInput, blogPostSchema } from "@/schemas/blog.schema";
import { createPost, deletePost, setPostFlags, updatePost } from "@/services/blogService";

function toSaveInput(input: BlogPostInput) {
  return {
    slug: input.slug,
    title: input.title,
    excerpt: input.excerpt,
    contentMdx: input.contentMdx,
    coverImageUrl: input.coverImageUrl ? input.coverImageUrl : null,
    readingTimeMin: calculateReadingTimeMinutes(input.contentMdx),
    contentStatus: input.contentStatus,
    tagNames: input.tagNames,
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

export async function createPostAction(
  input: BlogPostInput,
): Promise<ActionResult<{ id: string }>> {
  const parsed = blogPostSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  try {
    await requireAdminSession();
  } catch {
    return { success: false, error: "Your session has expired. Please sign in again." };
  }
  try {
    const result = await createPost(toSaveInput(parsed.data));
    updateTag(BLOG_CACHE_TAG);
    return { success: true, data: result };
  } catch (error) {
    if (isUniqueSlugViolation(error)) {
      return { success: false, error: "That slug is already in use." };
    }
    throw error;
  }
}

export async function updatePostAction(
  id: string,
  input: BlogPostInput,
): Promise<ActionResult<{ id: string }>> {
  const parsed = blogPostSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  try {
    await requireAdminSession();
  } catch {
    return { success: false, error: "Your session has expired. Please sign in again." };
  }
  try {
    const result = await updatePost(id, toSaveInput(parsed.data));
    updateTag(BLOG_CACHE_TAG);
    return { success: true, data: result };
  } catch (error) {
    if (isUniqueSlugViolation(error)) {
      return { success: false, error: "That slug is already in use." };
    }
    throw error;
  }
}

export async function deletePostAction(id: string): Promise<ActionResult> {
  try {
    await requireAdminSession();
  } catch {
    return { success: false, error: "Your session has expired. Please sign in again." };
  }
  await deletePost(id);
  updateTag(BLOG_CACHE_TAG);
  return { success: true, data: undefined };
}

export async function setPostStatusAction(
  id: string,
  contentStatus: "DRAFT" | "PUBLISHED" | "ARCHIVED",
): Promise<ActionResult> {
  try {
    await requireAdminSession();
  } catch {
    return { success: false, error: "Your session has expired. Please sign in again." };
  }
  await setPostFlags(id, { contentStatus });
  updateTag(BLOG_CACHE_TAG);
  return { success: true, data: undefined };
}
