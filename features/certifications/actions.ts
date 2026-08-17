"use server";

import { updateTag } from "next/cache";

import { CERTIFICATIONS_CACHE_TAG } from "@/features/certifications/queries";
import { requireAdminSession } from "@/features/auth/session";
import type { ActionResult } from "@/features/projects/actions";
import { type CertificationInput, certificationSchema } from "@/schemas/certification.schema";
import {
  createCertification,
  deleteCertification,
  updateCertification,
} from "@/services/certificationService";

function toSaveInput(input: CertificationInput) {
  return {
    name: input.name,
    issuer: input.issuer,
    category: input.category ?? null,
    issueDate: input.issueDate ? new Date(input.issueDate) : null,
    expiryDate: input.expiryDate ? new Date(input.expiryDate) : null,
    credentialUrl: input.credentialUrl ? input.credentialUrl : null,
    fileUrl: input.fileUrl ? input.fileUrl : null,
    order: input.order,
    contentStatus: input.contentStatus,
  };
}

export async function createCertificationAction(
  input: CertificationInput,
): Promise<ActionResult<{ id: string }>> {
  const parsed = certificationSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  try {
    await requireAdminSession();
  } catch {
    return { success: false, error: "Your session has expired. Please sign in again." };
  }
  const certification = await createCertification(toSaveInput(parsed.data));
  updateTag(CERTIFICATIONS_CACHE_TAG);
  return { success: true, data: { id: certification.id } };
}

export async function updateCertificationAction(
  id: string,
  input: CertificationInput,
): Promise<ActionResult<{ id: string }>> {
  const parsed = certificationSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  try {
    await requireAdminSession();
  } catch {
    return { success: false, error: "Your session has expired. Please sign in again." };
  }
  const certification = await updateCertification(id, toSaveInput(parsed.data));
  updateTag(CERTIFICATIONS_CACHE_TAG);
  return { success: true, data: { id: certification.id } };
}

export async function deleteCertificationAction(id: string): Promise<ActionResult> {
  try {
    await requireAdminSession();
  } catch {
    return { success: false, error: "Your session has expired. Please sign in again." };
  }
  await deleteCertification(id);
  updateTag(CERTIFICATIONS_CACHE_TAG);
  return { success: true, data: undefined };
}
