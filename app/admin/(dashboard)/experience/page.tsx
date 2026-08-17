import { ExperienceManager } from "@/components/admin/experience-manager";
import { getExperiencesForAdmin } from "@/features/experience/queries";

export default async function AdminExperiencePage() {
  const experiences = await getExperiencesForAdmin();
  return <ExperienceManager experiences={experiences} />;
}
