import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";
import { getPublishedPosts } from "@/features/blog/queries";
import { getPublishedProjects } from "@/features/projects/queries";

const STATIC_ROUTES: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "", changeFrequency: "monthly", priority: 1 },
  { path: "/about", changeFrequency: "monthly", priority: 0.7 },
  { path: "/projects", changeFrequency: "weekly", priority: 0.9 },
  { path: "/skills", changeFrequency: "monthly", priority: 0.6 },
  { path: "/experience", changeFrequency: "monthly", priority: 0.6 },
  { path: "/education", changeFrequency: "yearly", priority: 0.5 },
  { path: "/certifications", changeFrequency: "monthly", priority: 0.5 },
  { path: "/resume", changeFrequency: "monthly", priority: 0.6 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.8 },
  { path: "/activities", changeFrequency: "monthly", priority: 0.4 },
  { path: "/contact", changeFrequency: "yearly", priority: 0.5 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, posts] = await Promise.all([getPublishedProjects(), getPublishedPosts()]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${siteConfig.url}${route.path}`,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const projectEntries: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${siteConfig.url}/projects/${project.slug}`,
    lastModified: project.updatedAt,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${siteConfig.url}/blog/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticEntries, ...projectEntries, ...postEntries];
}
