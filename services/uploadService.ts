import "server-only";

import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { put } from "@vercel/blob";

import { env, hasBlobStorage } from "@/lib/env";

export interface UploadedFile {
  url: string;
}

export interface UploadInput {
  buffer: Buffer;
  filename: string;
  contentType: string;
}

const ALLOWED_CONTENT_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "application/pdf"]);

const MAX_BYTES = {
  image: 5 * 1024 * 1024,
  "application/pdf": 10 * 1024 * 1024,
} as const;

export class UploadValidationError extends Error {}

function assertValid(input: UploadInput): void {
  if (!ALLOWED_CONTENT_TYPES.has(input.contentType)) {
    throw new UploadValidationError(`Unsupported file type: ${input.contentType}`);
  }
  const limit =
    input.contentType === "application/pdf" ? MAX_BYTES["application/pdf"] : MAX_BYTES.image;
  if (input.buffer.byteLength > limit) {
    throw new UploadValidationError(`File exceeds the ${Math.round(limit / 1024 / 1024)}MB limit`);
  }
}

function extensionFor(contentType: string): string {
  switch (contentType) {
    case "image/png":
      return "png";
    case "image/jpeg":
      return "jpg";
    case "image/webp":
      return "webp";
    case "application/pdf":
      return "pdf";
    default:
      return "bin";
  }
}

// Storage key is always generated (cuid + extension), never derived from the original
// filename — avoids path traversal and collisions without needing to sanitize user input.
export async function uploadFile(input: UploadInput): Promise<UploadedFile> {
  assertValid(input);
  const key = `${randomUUID()}.${extensionFor(input.contentType)}`;

  if (hasBlobStorage) {
    const blob = await put(key, input.buffer, {
      access: "public",
      contentType: input.contentType,
      token: env.BLOB_READ_WRITE_TOKEN,
    });
    return { url: blob.url };
  }

  // Local-dev / self-host fallback: write into public/uploads, served as a static asset.
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });
  await writeFile(path.join(uploadsDir, key), input.buffer);
  return { url: `/uploads/${key}` };
}
