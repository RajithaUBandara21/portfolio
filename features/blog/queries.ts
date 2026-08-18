import { unstable_cache } from "next/cache";

import {
  findPostByIdForAdmin,
  findPublishedPostBySlug,
  findRelatedPosts,
  listAllTags,
  listPostsForAdmin,
  listPublishedPosts,
  type BlogListFilters,
} from "@/services/blogService";

export const BLOG_CACHE_TAG = "blog";

export const getPublishedPosts = unstable_cache(
  async (filters: BlogListFilters = {}) => listPublishedPosts(filters),
  ["blog-list"],
  { tags: [BLOG_CACHE_TAG] },
);

export const getPublishedPostBySlug = unstable_cache(
  async (slug: string) => findPublishedPostBySlug(slug),
  ["blog-by-slug"],
  { tags: [BLOG_CACHE_TAG] },
);

export const getRelatedPosts = unstable_cache(
  async (postId: string, tagIds: string[]) => findRelatedPosts(postId, tagIds),
  ["blog-related"],
  { tags: [BLOG_CACHE_TAG] },
);

export const getAllTags = unstable_cache(async () => listAllTags(), ["blog-tags"], {
  tags: [BLOG_CACHE_TAG],
});

export function getPostsForAdmin() {
  return listPostsForAdmin();
}

export function getPostForAdmin(id: string) {
  return findPostByIdForAdmin(id);
}
