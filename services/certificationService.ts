import type { Certification, ProjectCategory } from "@prisma/client";

import { db } from "@/services/db";

export function listPublishedCertifications(category?: ProjectCategory): Promise<Certification[]> {
  return db.certification.findMany({
    where: { contentStatus: "PUBLISHED", ...(category ? { category } : {}) },
    orderBy: [{ issueDate: "desc" }],
  });
}

export function listCertificationsForAdmin(): Promise<Certification[]> {
  return db.certification.findMany({ orderBy: [{ issueDate: "desc" }] });
}

export function findCertificationById(id: string): Promise<Certification | null> {
  return db.certification.findUnique({ where: { id } });
}

export interface SaveCertificationInput {
  name: string;
  issuer: string;
  category: ProjectCategory | null;
  issueDate: Date | null;
  expiryDate: Date | null;
  credentialUrl: string | null;
  fileUrl: string | null;
  order: number;
  contentStatus: Certification["contentStatus"];
}

export function createCertification(input: SaveCertificationInput): Promise<Certification> {
  return db.certification.create({ data: input });
}

export function updateCertification(
  id: string,
  input: SaveCertificationInput,
): Promise<Certification> {
  return db.certification.update({ where: { id }, data: input });
}

export function deleteCertification(id: string): Promise<void> {
  return db.certification.delete({ where: { id } }).then(() => undefined);
}
