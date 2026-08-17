import { z } from "zod";

export const educationSchema = z.object({
  institution: z.string().min(1, "Institution is required").max(200),
  degree: z.string().min(1, "Degree is required").max(160),
  fieldOfStudy: z.string().max(160).optional().or(z.literal("")),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional().or(z.literal("")),
  current: z.boolean(),
  description: z.string().max(4000).optional().or(z.literal("")),
  order: z.number().int().min(0),
  contentStatus: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
});

export type EducationInput = z.infer<typeof educationSchema>;
