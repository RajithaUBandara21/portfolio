import { z } from "zod";

export const projectCategoryValues = [
  "AI_ML",
  "SOFTWARE_ENGINEERING",
  "DISTRIBUTED_SYSTEMS",
  "CLOUD",
  "DEVOPS",
  "RESEARCH",
  "BACKEND",
  "FRONTEND",
  "MOBILE",
  "DATA_ENGINEERING",
] as const;

export const projectStatusValues = [
  "PLANNED",
  "IN_PROGRESS",
  "COMPLETED",
  "MAINTAINED",
  "ARCHIVED",
] as const;

export const contentStatusValues = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;

export const archNodeKindValues = [
  "SERVICE",
  "DATABASE",
  "QUEUE",
  "CACHE",
  "CLIENT",
  "EXTERNAL_API",
  "GATEWAY",
  "STORAGE",
  "OTHER",
] as const;

const optionalUrl = z.string().url().optional().or(z.literal(""));
const optionalText = z.string().max(20_000).optional().or(z.literal(""));

export const architectureNodeSchema = z.object({
  key: z.string().min(1).max(60),
  label: z.string().min(1).max(120),
  kind: z.enum(archNodeKindValues),
  technology: z.string().max(120).optional().or(z.literal("")),
  responsibility: z.string().max(2000).optional().or(z.literal("")),
  interfaces: z.array(z.string().min(1).max(200)),
  dependencies: z.array(z.string().min(1).max(200)),
  positionX: z.number(),
  positionY: z.number(),
});

// Edges reference nodes by their stable client-side `key`, not a database id — node rows are
// replaced wholesale on every save (new ids each time), so keys are the only stable join point
// available at request time. The service resolves key -> freshly-created-node-id server-side.
export const architectureEdgeSchema = z.object({
  sourceKey: z.string().min(1).max(60),
  targetKey: z.string().min(1).max(60),
  label: z.string().max(120).optional().or(z.literal("")),
  dataFlow: z.string().max(1000).optional().or(z.literal("")),
});

export const projectDecisionSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  reason: z.string().min(1, "Reason is required").max(4000),
  alternatives: z.string().min(1, "Alternatives are required").max(4000),
  tradeoffs: z.string().min(1, "Tradeoffs are required").max(4000),
  order: z.number().int().min(0),
});

export const projectMetricSchema = z.object({
  label: z.string().min(1, "Label is required").max(120),
  value: z.string().min(1, "Value is required").max(120),
  context: z.string().max(1000).optional().or(z.literal("")),
  order: z.number().int().min(0),
});

export const projectScreenshotSchema = z.object({
  url: z.string().min(1, "URL is required"),
  altText: z.string().min(1, "Alt text is required for accessibility").max(300),
  order: z.number().int().min(0),
});

export const projectSchema = z.object({
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only"),
  title: z.string().min(1, "Title is required").max(200),
  shortDescription: z.string().min(1, "Short description is required").max(300),
  fullDescription: z.string().min(1, "Full description is required").max(20_000),

  categories: z.array(z.enum(projectCategoryValues)).min(1, "Pick at least one category"),
  status: z.enum(projectStatusValues),
  contentStatus: z.enum(contentStatusValues),
  featured: z.boolean(),

  startDate: z.string().optional().or(z.literal("")),
  endDate: z.string().optional().or(z.literal("")),

  githubUrl: optionalUrl,
  demoUrl: optionalUrl,
  docsUrl: optionalUrl,

  problem: optionalText,
  solution: optionalText,
  architectureNotes: optionalText,
  challenges: optionalText,
  results: optionalText,
  lessons: optionalText,
  futureImprovements: optionalText,
  reliabilityNotes: optionalText,
  securityNotes: optionalText,
  observabilityNotes: optionalText,
  testingNotes: optionalText,

  technologyNames: z.array(z.string().min(1).max(60)),
  skillIds: z.array(z.string()),

  screenshots: z.array(projectScreenshotSchema),
  metrics: z.array(projectMetricSchema),
  decisions: z.array(projectDecisionSchema),
  archNodes: z.array(architectureNodeSchema),
  archEdges: z.array(architectureEdgeSchema),
});

export type ProjectInput = z.infer<typeof projectSchema>;
