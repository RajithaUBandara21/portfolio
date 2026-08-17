import type { Skill } from "@prisma/client";

import { db } from "@/services/db";

export function listSkills(): Promise<Skill[]> {
  return db.skill.findMany({ orderBy: [{ category: "asc" }, { order: "asc" }, { name: "asc" }] });
}

export function findSkillById(id: string): Promise<Skill | null> {
  return db.skill.findUnique({ where: { id } });
}

export function findSkillBySlug(slug: string) {
  return db.skill.findUnique({
    where: { slug },
    include: {
      projects: {
        include: {
          project: {
            select: {
              id: true,
              slug: true,
              title: true,
              shortDescription: true,
              contentStatus: true,
            },
          },
        },
      },
    },
  });
}

// Skill -> published projects using it, for the interactive "projects using this technology"
// feature. Draft projects are excluded even for the admin-facing skill editor's preview, since
// this mirrors what a public visitor would actually see.
export async function listPublishedProjectsForSkill(skillId: string) {
  const links = await db.projectSkill.findMany({
    where: { skillId, project: { contentStatus: "PUBLISHED" } },
    include: {
      project: { select: { id: true, slug: true, title: true, shortDescription: true } },
    },
  });
  return links.map((l) => l.project);
}

// All skills with their published projects, in one query — used by the public /skills page so
// the interactive skill -> projects UI can be fully client-side with no per-click round-trip.
export function listSkillsWithPublishedProjects() {
  return db.skill.findMany({
    orderBy: [{ category: "asc" }, { order: "asc" }, { name: "asc" }],
    include: {
      projects: {
        where: { project: { contentStatus: "PUBLISHED" } },
        include: {
          project: { select: { id: true, slug: true, title: true, shortDescription: true } },
        },
      },
    },
  });
}

export interface SaveSkillInput {
  name: string;
  slug: string;
  category: Skill["category"];
  level: Skill["level"];
  description: string | null;
  order: number;
}

export function createSkill(input: SaveSkillInput): Promise<Skill> {
  return db.skill.create({ data: input });
}

export function updateSkill(id: string, input: SaveSkillInput): Promise<Skill> {
  return db.skill.update({ where: { id }, data: input });
}

export function deleteSkill(id: string): Promise<void> {
  return db.skill.delete({ where: { id } }).then(() => undefined);
}
