import { ProfileForm } from "@/components/admin/profile-form";
import { getProfileForAdmin } from "@/features/profile/queries";
import type { ProfileInput } from "@/schemas/profile.schema";

export default async function AdminProfilePage() {
  const profile = await getProfileForAdmin();

  const defaultValues: ProfileInput = {
    fullName: profile?.fullName ?? "",
    headline: profile?.headline ?? "",
    bio: profile?.bio ?? "",
    aboutContent: profile?.aboutContent ?? "",
    avatarUrl: profile?.avatarUrl ?? "",
    resumeUrl: profile?.resumeUrl ?? "",
    location: profile?.location ?? "",
    email: profile?.email ?? "",
    phone: profile?.phone ?? "",
    availability: profile?.availability ?? "",
    yearsExperience: profile?.yearsExperience ?? undefined,
    socialLinks:
      profile?.socialLinks.map((link) => ({
        id: link.id,
        platform: link.platform,
        url: link.url,
        order: link.order,
      })) ?? [],
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Profile</h1>
      <ProfileForm defaultValues={defaultValues} />
    </div>
  );
}
