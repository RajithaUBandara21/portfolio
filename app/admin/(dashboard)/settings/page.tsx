import { ChangePasswordForm } from "@/components/admin/change-password-form";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <div>
        <h2 className="mb-4 text-lg font-medium">Change password</h2>
        <ChangePasswordForm />
      </div>
    </div>
  );
}
