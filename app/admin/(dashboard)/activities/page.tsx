import { ActivityManager } from "@/components/admin/activity-manager";
import { getActivitiesForAdmin } from "@/features/activities/queries";

export default async function AdminActivitiesPage() {
  const activities = await getActivitiesForAdmin();
  return <ActivityManager activities={activities} />;
}
