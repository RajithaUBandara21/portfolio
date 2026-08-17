import { redirect } from "next/navigation";

import { LoginForm } from "@/components/admin/login-form";
import { getSession } from "@/features/auth/session";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const session = await getSession();
  if (session) {
    redirect("/admin/dashboard");
  }

  const { next } = await searchParams;
  const target = next && next.startsWith("/admin") ? next : "/admin/dashboard";

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-xl font-semibold">Admin sign in</h1>
          <p className="text-muted-foreground text-sm">Manage portfolio content</p>
        </div>
        <LoginForm next={target} />
      </div>
    </div>
  );
}
