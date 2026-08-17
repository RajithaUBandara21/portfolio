import { unstable_cache } from "next/cache";

import {
  findSkillBySlug,
  listPublishedProjectsForSkill,
  listSkills,
  listSkillsWithPublishedProjects,
} from "@/services/skillService";

export const SKILLS_CACHE_TAG = "skills";

export const getSkills = unstable_cache(async () => listSkills(), ["skills-list"], {
  tags: [SKILLS_CACHE_TAG],
});

export const getSkillBySlug = unstable_cache(
  async (slug: string) => findSkillBySlug(slug),
  ["skill-by-slug"],
  { tags: [SKILLS_CACHE_TAG] },
);

export const getProjectsForSkill = unstable_cache(
  async (skillId: string) => listPublishedProjectsForSkill(skillId),
  ["projects-for-skill"],
  { tags: [SKILLS_CACHE_TAG, "projects"] },
);

export function getSkillsForAdmin() {
  return listSkills();
}

export const getSkillsWithProjects = unstable_cache(
  async () => listSkillsWithPublishedProjects(),
  ["skills-with-projects"],
  { tags: [SKILLS_CACHE_TAG, "projects"] },
);
