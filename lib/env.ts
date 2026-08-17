import { z } from "zod";

// Optional env vars are frequently present but empty in .env files (e.g. `GITHUB_TOKEN=`).
// Treat an empty string the same as "unset" so `.optional()` behaves as expected.
function optionalString(minLength = 1) {
  return z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().min(minLength).optional(),
  );
}

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  DIRECT_URL: z.string().min(1, "DIRECT_URL is required"),

  SESSION_COOKIE_NAME: z.string().default("session"),
  SESSION_TTL_DAYS: z.coerce.number().int().positive().default(7),

  SEED_ADMIN_EMAIL: optionalString(),
  SEED_ADMIN_PASSWORD: optionalString(8),

  GITHUB_TOKEN: optionalString(),
  GITHUB_USERNAME: optionalString(),

  BLOB_READ_WRITE_TOKEN: optionalString(),

  UPSTASH_REDIS_REST_URL: optionalString(),
  UPSTASH_REDIS_REST_TOKEN: optionalString(),

  NEXT_PUBLIC_SITE_URL: z.string().min(1).default("http://localhost:3000"),
});

type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const flat = z.flattenError(parsed.error);
    const message = Object.entries(flat.fieldErrors)
      .map(([key, errors]) => `  ${key}: ${(errors ?? []).join(", ")}`)
      .join("\n");
    throw new Error(`Invalid environment configuration:\n${message}`);
  }

  return parsed.data;
}

export const env = loadEnv();

export const hasGithubIntegration = Boolean(env.GITHUB_TOKEN && env.GITHUB_USERNAME);
export const hasBlobStorage = Boolean(env.BLOB_READ_WRITE_TOKEN);
export const hasUpstashRateLimit = Boolean(
  env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN,
);
