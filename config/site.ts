export const siteConfig = {
  name: "Rajitha Bandara",
  description:
    "Software engineer building scalable backend, cloud, and distributed systems — projects, technical case studies, and engineering writing.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  // Used by JSON-LD structured data and Open Graph tags — update alongside any handle changes.
  twitterHandle: undefined as string | undefined,
};

export interface PublicNavItem {
  label: string;
  href: string;
}

// Grows as each public route lands (About in Phase 2, Projects in Phase 3, ...) so we never
// link to a route that doesn't exist yet.
export const publicNavItems: PublicNavItem[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Projects", href: "/projects" },
  { label: "Skills", href: "/skills" },
  { label: "Experience", href: "/experience" },
  { label: "Education", href: "/education" },
  { label: "Certifications", href: "/certifications" },
  { label: "Resume", href: "/resume" },
  { label: "Blog", href: "/blog" },
  //{ label: "Activities", href: "/activities" },
  { label: "Contact", href: "/contact" },
];
