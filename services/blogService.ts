import type { BlogPost, Prisma } from "@prisma/client";

import { db } from "@/services/db";

const publicPostInclude = {
  tags: { include: { tag: true } },
} satisfies Prisma.BlogPostInclude;

export type BlogPostWithTags = Prisma.BlogPostGetPayload<{ include: typeof publicPostInclude }>;

export interface BlogListFilters {
  tagSlug?: string;
  search?: string;
}

export function listPublishedPosts(filters: BlogListFilters = {}): Promise<BlogPostWithTags[]> {
  return db.blogPost.findMany({
    where: {
      contentStatus: "PUBLISHED",
      ...(filters.tagSlug ? { tags: { some: { tag: { slug: filters.tagSlug } } } } : {}),
      ...(filters.search
        ? {
            OR: [
              { title: { contains: filters.search, mode: "insensitive" } },
              { excerpt: { contains: filters.search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: publicPostInclude,
    orderBy: { publishedAt: "desc" },
  });
}

export function findPublishedPostBySlug(slug: string): Promise<BlogPostWithTags | null> {
  return db.blogPost.findFirst({
    where: { slug, contentStatus: "PUBLISHED" },
    include: publicPostInclude,
  });
}

// Related posts: other published posts sharing at least one tag, most-shared-tags first.
export async function findRelatedPosts(
  postId: string,
  tagIds: string[],
  limit = 3,
): Promise<BlogPostWithTags[]> {
  if (tagIds.length === 0) return [];
  return db.blogPost.findMany({
    where: {
      id: { not: postId },
      contentStatus: "PUBLISHED",
      tags: { some: { tagId: { in: tagIds } } },
    },
    include: publicPostInclude,
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
}

export function listAllTags() {
  return db.blogTag.findMany({ orderBy: { name: "asc" } });
}

export function listPostsForAdmin() {
  return db.blogPost.findMany({
    orderBy: { updatedAt: "desc" },
    select: { id: true, slug: true, title: true, contentStatus: true, updatedAt: true },
  });
}

export function findPostByIdForAdmin(id: string): Promise<BlogPostWithTags | null> {
  return db.blogPost.findUnique({ where: { id }, include: publicPostInclude });
}

export interface SavePostInput {
  slug: string;
  title: string;
  excerpt: string;
  contentMdx: string;
  coverImageUrl: string | null;
  readingTimeMin: number;
  contentStatus: BlogPost["contentStatus"];
  tagNames: string[];
}

function slugifyTag(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function findOrCreateTags(tx: Prisma.TransactionClient, names: string[]) {
  const unique = Array.from(new Set(names.map((n) => n.trim()).filter(Boolean)));
  const tags = [];
  for (const name of unique) {
    const tag = await tx.blogTag.upsert({
      where: { name },
      update: {},
      create: { name, slug: slugifyTag(name) },
    });
    tags.push(tag);
  }
  return tags;
}

export async function createPost(input: SavePostInput): Promise<{ id: string }> {
  return db.$transaction(async (tx) => {
    const post = await tx.blogPost.create({
      data: {
        slug: input.slug,
        title: input.title,
        excerpt: input.excerpt,
        contentMdx: input.contentMdx,
        coverImageUrl: input.coverImageUrl,
        readingTimeMin: input.readingTimeMin,
        contentStatus: input.contentStatus,
        publishedAt: input.contentStatus === "PUBLISHED" ? new Date() : null,
      },
    });
    const tags = await findOrCreateTags(tx, input.tagNames);
    if (tags.length > 0) {
      await tx.blogPostTag.createMany({
        data: tags.map((tag) => ({ postId: post.id, tagId: tag.id })),
      });
    }
    return { id: post.id };
  });
}

export async function updatePost(id: string, input: SavePostInput): Promise<{ id: string }> {
  return db.$transaction(async (tx) => {
    const existing = await tx.blogPost.findUniqueOrThrow({
      where: { id },
      select: { contentStatus: true, publishedAt: true },
    });
    const nowPublishing =
      input.contentStatus === "PUBLISHED" && existing.contentStatus !== "PUBLISHED";

    const post = await tx.blogPost.update({
      where: { id },
      data: {
        slug: input.slug,
        title: input.title,
        excerpt: input.excerpt,
        contentMdx: input.contentMdx,
        coverImageUrl: input.coverImageUrl,
        readingTimeMin: input.readingTimeMin,
        contentStatus: input.contentStatus,
        publishedAt: nowPublishing ? new Date() : existing.publishedAt,
      },
    });

    await tx.blogPostTag.deleteMany({ where: { postId: id } });
    const tags = await findOrCreateTags(tx, input.tagNames);
    if (tags.length > 0) {
      await tx.blogPostTag.createMany({
        data: tags.map((tag) => ({ postId: post.id, tagId: tag.id })),
      });
    }
    return { id: post.id };
  });
}

export function deletePost(id: string): Promise<void> {
  return db.blogPost.delete({ where: { id } }).then(() => undefined);
}

export async function setPostFlags(
  id: string,
  flags: { contentStatus: BlogPost["contentStatus"] },
) {
  const existing = await db.blogPost.findUniqueOrThrow({
    where: { id },
    select: { contentStatus: true, publishedAt: true },
  });
  const nowPublishing =
    flags.contentStatus === "PUBLISHED" && existing.contentStatus !== "PUBLISHED";
  return db.blogPost.update({
    where: { id },
    data: { ...flags, publishedAt: nowPublishing ? new Date() : existing.publishedAt },
  });
}
