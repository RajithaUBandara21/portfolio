import Link from "next/link";
import { redirect } from "next/navigation";

import { LogoutButton } from "@/components/admin/logout-button";
import { adminNavItems } from "@/config/admin-nav";
import { getSession } from "@/features/auth/session";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen flex-col sm:flex-row">
      {/* Below `sm`, the fixed sidebar would either overlap content or eat most of a small
          viewport — instead nav collapses into a horizontally scrollable strip up top. */}
      <aside className="hidden w-56 shrink-0 flex-col border-r px-4 py-6 sm:flex">
        <span className="mb-6 text-sm font-semibold">Admin</span>
        <nav className="flex flex-col gap-1">
          {adminNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hover:bg-accent rounded-md px-3 py-2 text-sm"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <nav className="flex gap-1 overflow-x-auto border-b px-4 py-3 sm:hidden">
        {adminNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="hover:bg-accent shrink-0 rounded-md px-3 py-2 text-sm"
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="min-w-0 flex-1">
        <header className="flex items-center justify-between border-b px-6 py-4">
          <span className="text-muted-foreground text-sm">{session.user.email}</span>
          <LogoutButton />
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
