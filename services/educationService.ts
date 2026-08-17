import type { Education } from "@prisma/client";

import { db } from "@/services/db";

export function listPublishedEducation(): Promise<Education[]> {
  return db.education.findMany({
    where: { contentStatus: "PUBLISHED" },
    orderBy: [{ startDate: "desc" }],
  });
}

export function listEducationForAdmin(): Promise<Education[]> {
  return db.education.findMany({ orderBy: [{ startDate: "desc" }] });
}

export function findEducationById(id: string): Promise<Education | null> {
  return db.education.findUnique({ where: { id } });
}

export interface SaveEducationInput {
  institution: string;
  degree: string;
  fieldOfStudy: string | null;
  startDate: Date;
  endDate: Date | null;
  current: boolean;
  description: string | null;
  order: number;
  contentStatus: Education["contentStatus"];
}

export function createEducation(input: SaveEducationInput): Promise<Education> {
  return db.education.create({ data: input });
}

export function updateEducation(id: string, input: SaveEducationInput): Promise<Education> {
  return db.education.update({ where: { id }, data: input });
}

export function deleteEducation(id: string): Promise<void> {
  return db.education.delete({ where: { id } }).then(() => undefined);
}
