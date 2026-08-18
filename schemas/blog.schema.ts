import { z } from "zod";

export const blogPostSchema = z.object({
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(160)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only"),
  title: z.string().min(1, "Title is required").max(200),
  excerpt: z.string().min(1, "Excerpt is required").max(500),
  contentMdx: z.string().min(1, "Content is required"),
  coverImageUrl: z.string().optional().or(z.literal("")),
  contentStatus: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  tagNames: z.array(z.string().min(1).max(40)),
});

export type BlogPostInput = z.infer<typeof blogPostSchema>;
