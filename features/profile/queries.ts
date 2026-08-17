import { unstable_cache } from "next/cache";

import { findProfile, type ProfileWithLinks } from "@/services/profileService";

export const PROFILE_CACHE_TAG = "profile";

export const getProfile = unstable_cache(
  async (): Promise<ProfileWithLinks | null> => findProfile(),
  ["profile"],
  { tags: [PROFILE_CACHE_TAG] },
);

// Uncached: the admin editor must always see the latest saved values, not a stale cache entry.
export function getProfileForAdmin(): Promise<ProfileWithLinks | null> {
  return findProfile();
}
