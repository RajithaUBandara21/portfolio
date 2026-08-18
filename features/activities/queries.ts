import { unstable_cache } from "next/cache";

import { listActivitiesForAdmin, listPublishedActivities } from "@/services/activityService";

export const ACTIVITIES_CACHE_TAG = "activities";

export const getPublishedActivities = unstable_cache(
  async () => listPublishedActivities(),
  ["activities-list"],
  { tags: [ACTIVITIES_CACHE_TAG] },
);

export function getActivitiesForAdmin() {
  return listActivitiesForAdmin();
}
