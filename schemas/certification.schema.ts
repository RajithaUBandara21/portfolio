import { z } from "zod";

import { projectCategoryValues } from "@/schemas/project.schema";

export const certificationSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  issuer: z.string().min(1, "Issuer is required").max(160),
  category: z.enum(projectCategoryValues).optional(),
  issueDate: z.string().optional().or(z.literal("")),
  expiryDate: z.string().optional().or(z.literal("")),
  credentialUrl: z.string().url().optional().or(z.literal("")),
  fileUrl: z.string().optional().or(z.literal("")),
  order: z.number().int().min(0),
  contentStatus: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
});

export type CertificationInput = z.infer<typeof certificationSchema>;
