import { z } from "zod";

export const socialLinkSchema = z.object({
  id: z.string().optional(),
  platform: z.string().min(1, "Platform is required").max(40),
  url: z.string().min(1, "URL is required").url("Enter a valid URL"),
  order: z.number().int().min(0),
});

export type SocialLinkInput = z.infer<typeof socialLinkSchema>;

// NaN (an empty <input type="number"> parsed via `valueAsNumber`) is treated as "not provided"
// rather than a validation error, since the field is optional.
const optionalYearsExperience = z.preprocess(
  (value) => (typeof value === "number" && Number.isNaN(value) ? undefined : value),
  z.number().int().min(0).max(80).optional().nullable(),
);

export const profileSchema = z.object({
  fullName: z.string().min(1, "Full name is required").max(120),
  headline: z.string().min(1, "Headline is required").max(160),
  bio: z.string().min(1, "Bio is required").max(5000),
  // Not `.url()`: these are populated by file upload, which returns a relative `/uploads/...`
  // path in local dev (no cloud blob storage configured) or an absolute URL in production.
  avatarUrl: z.string().optional().or(z.literal("")),
  resumeUrl: z.string().optional().or(z.literal("")),
  location: z.string().max(120).optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().max(40).optional().or(z.literal("")),
  availability: z.string().max(160).optional().or(z.literal("")),
  yearsExperience: optionalYearsExperience,
  socialLinks: z.array(socialLinkSchema),
});

export type ProfileInput = z.infer<typeof profileSchema>;
