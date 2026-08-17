import { unstable_cache } from "next/cache";

import { listEducationForAdmin, listPublishedEducation } from "@/services/educationService";

export const EDUCATION_CACHE_TAG = "education";

export const getPublishedEducation = unstable_cache(
  async () => listPublishedEducation(),
  ["education-list"],
  { tags: [EDUCATION_CACHE_TAG] },
);

export function getEducationForAdmin() {
  return listEducationForAdmin();
}
