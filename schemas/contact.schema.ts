import { z } from "zod";

export const contactFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  email: z.email("Enter a valid email address").min(1, "Email is required"),
  subject: z.string().max(300).optional().or(z.literal("")),
  message: z.string().min(1, "Message is required").max(5000),
  // Honeypot: real users never see or fill this field (hidden via CSS). Bots that fill every
  // field in a scraped form will populate it. Deliberately unconstrained (any string is valid
  // input here) so a filled honeypot doesn't fail schema validation and return an error that
  // would tip a bot off — the route handler checks this value and returns a fake success instead.
  website: z.string().optional().or(z.literal("")),
  // Client-supplied render timestamp, used only as a cheap, non-cryptographic signal to reject
  // submissions faster than a human could plausibly fill the form. Defense in depth alongside
  // the honeypot and rate limiter, not a security boundary on its own.
  renderedAt: z.coerce.number(),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;
