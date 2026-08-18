import { z } from "zod";

export const skillCategoryValues = [
  "LANGUAGE",
  "AI_ML",
  "FRAMEWORK",
  "LIBRARY",
  "RUNTIME_ENVIRONMENT",
  "DATABASE",
  "CLOUD_DEVOPS",
  "TOOLING",
  "SOFT_SKILL",
  "OTHER",
] as const;

// Single source of truth for human-readable category labels — used by both the admin
// category picker and the public skills page grouping headers.
export const skillCategoryLabels: Record<(typeof skillCategoryValues)[number], string> = {
  LANGUAGE: "Languages",
  AI_ML: "AI & ML",
  FRAMEWORK: "Frameworks",
  LIBRARY: "Libraries",
  RUNTIME_ENVIRONMENT: "Runtime Environments",
  DATABASE: "Databases",
  CLOUD_DEVOPS: "Cloud & DevOps",
  TOOLING: "Tooling",
  SOFT_SKILL: "Soft Skills",
  OTHER: "Other",
};

export const skillLevelValues = ["FAMILIAR", "PROFICIENT", "ADVANCED", "EXPERT"] as const;

export const skillSchema = z.object({
  name: z.string().min(1, "Name is required").max(80),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only"),
  category: z.enum(skillCategoryValues),
  level: z.enum(skillLevelValues),
  description: z.string().max(2000).optional().or(z.literal("")),
  order: z.number().int().min(0),
});

export type SkillInput = z.infer<typeof skillSchema>;
