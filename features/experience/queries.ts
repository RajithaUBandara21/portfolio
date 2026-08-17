import { unstable_cache } from "next/cache";

import { listExperiencesForAdmin, listPublishedExperiences } from "@/services/experienceService";

export const EXPERIENCE_CACHE_TAG = "experience";

export const getPublishedExperiences = unstable_cache(
  async () => listPublishedExperiences(),
  ["experience-list"],
  { tags: [EXPERIENCE_CACHE_TAG] },
);

export function getExperiencesForAdmin() {
  return listExperiencesForAdmin();
}
