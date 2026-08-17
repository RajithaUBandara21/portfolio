export interface AdminNavItem {
  label: string;
  href: string;
}

// Grows as each entity's admin CRUD lands (profile in Phase 2, projects in Phase 3, ...).
export const adminNavItems: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "Profile", href: "/admin/profile" },
  { label: "Projects", href: "/admin/projects" },
  { label: "Skills", href: "/admin/skills" },
  { label: "Experience", href: "/admin/experience" },
  { label: "Education", href: "/admin/education" },
  { label: "Certifications", href: "/admin/certifications" },
  { label: "Blog", href: "/admin/blog" },
  { label: "Activities", href: "/admin/activities" },
  { label: "Messages", href: "/admin/messages" },
  { label: "Settings", href: "/admin/settings" },
];
