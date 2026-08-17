import { redirect } from "next/navigation";

import { getSession } from "@/features/auth/session";

export default async function AdminIndexPage() {
  const session = await getSession();
  redirect(session ? "/admin/dashboard" : "/admin/login");
}
