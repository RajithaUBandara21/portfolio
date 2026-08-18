import { z } from "zod";

export const activityTypeValues = [
  "talk",
  "open-source",
  "award",
  "publication",
  "volunteering",
  "leadership",
  "other",
] as const;

export const activitySchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  type: z.enum(activityTypeValues),
  description: z.string().max(4000).optional().or(z.literal("")),
  url: z.string().url().optional().or(z.literal("")),
  date: z.string().min(1, "Date is required"),
  order: z.number().int().min(0),
  contentStatus: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
});

export type ActivityInput = z.infer<typeof activitySchema>;
