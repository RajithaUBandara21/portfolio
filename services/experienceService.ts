import type { Experience } from "@prisma/client";

import { db } from "@/services/db";

export function listPublishedExperiences(): Promise<Experience[]> {
  return db.experience.findMany({
    where: { contentStatus: "PUBLISHED" },
    orderBy: [{ startDate: "desc" }],
  });
}

export function listExperiencesForAdmin(): Promise<Experience[]> {
  return db.experience.findMany({ orderBy: [{ startDate: "desc" }] });
}

export function findExperienceById(id: string): Promise<Experience | null> {
  return db.experience.findUnique({ where: { id } });
}

export interface SaveExperienceInput {
  company: string;
  role: string;
  location: string | null;
  startDate: Date;
  endDate: Date | null;
  current: boolean;
  summary: string;
  highlights: string[];
  technologies: string[];
  order: number;
  contentStatus: Experience["contentStatus"];
}

export function createExperience(input: SaveExperienceInput): Promise<Experience> {
  return db.experience.create({ data: input });
}

export function updateExperience(id: string, input: SaveExperienceInput): Promise<Experience> {
  return db.experience.update({ where: { id }, data: input });
}

export function deleteExperience(id: string): Promise<void> {
  return db.experience.delete({ where: { id } }).then(() => undefined);
}
