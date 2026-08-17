import { z } from "zod";

export const experienceSchema = z.object({
  company: z.string().min(1, "Company is required").max(160),
  role: z.string().min(1, "Role is required").max(160),
  location: z.string().max(160).optional().or(z.literal("")),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional().or(z.literal("")),
  current: z.boolean(),
  summary: z.string().min(1, "Summary is required").max(4000),
  highlights: z.array(z.string().min(1).max(500)),
  technologies: z.array(z.string().min(1).max(60)),
  order: z.number().int().min(0),
  contentStatus: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
});

export type ExperienceInput = z.infer<typeof experienceSchema>;
