import { SkillManager } from "@/components/admin/skill-manager";
import { getSkillsForAdmin } from "@/features/skills/queries";

export default async function AdminSkillsPage() {
  const skills = await getSkillsForAdmin();
  return <SkillManager skills={skills} />;
}
