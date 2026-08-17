import { EducationManager } from "@/components/admin/education-manager";
import { getEducationForAdmin } from "@/features/education/queries";

export default async function AdminEducationPage() {
  const educationEntries = await getEducationForAdmin();
  return <EducationManager educationEntries={educationEntries} />;
}
