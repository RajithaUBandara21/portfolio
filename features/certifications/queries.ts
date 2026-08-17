import { unstable_cache } from "next/cache";
import type { ProjectCategory } from "@prisma/client";

import {
  listCertificationsForAdmin,
  listPublishedCertifications,
} from "@/services/certificationService";

export const CERTIFICATIONS_CACHE_TAG = "certifications";

export const getPublishedCertifications = unstable_cache(
  async (category?: ProjectCategory) => listPublishedCertifications(category),
  ["certifications-list"],
  { tags: [CERTIFICATIONS_CACHE_TAG] },
);

export function getCertificationsForAdmin() {
  return listCertificationsForAdmin();
}
