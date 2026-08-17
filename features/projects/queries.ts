import { unstable_cache } from "next/cache";
import type { ProjectCategory } from "@prisma/client";

import {
  findProjectByIdForAdmin,
  findPublishedProjectBySlug,
  listProjectsForAdmin,
  listPublishedProjects,
  type ProjectListFilters,
} from "@/services/projectService";
import { listSkills } from "@/services/skillService";
import { listTechnologies } from "@/services/technologyService";

export const PROJECTS_CACHE_TAG = "projects";

export const getPublishedProjects = unstable_cache(
  async (filters: ProjectListFilters = {}) => listPublishedProjects(filters),
  ["projects-list"],
  { tags: [PROJECTS_CACHE_TAG] },
);

export const getPublishedProjectBySlug = unstable_cache(
  async (slug: string) => findPublishedProjectBySlug(slug),
  ["project-by-slug"],
  { tags: [PROJECTS_CACHE_TAG] },
);

export const getFeaturedProjects = unstable_cache(
  async () => listPublishedProjects({ featuredOnly: true }),
  ["projects-featured"],
  { tags: [PROJECTS_CACHE_TAG] },
);

export function getProjectsForAdmin() {
  return listProjectsForAdmin();
}

export function getProjectForAdmin(id: string) {
  return findProjectByIdForAdmin(id);
}

export function getTechnologyOptions() {
  return listTechnologies();
}

export function getSkillOptions() {
  return listSkills();
}

export type { ProjectCategory };
