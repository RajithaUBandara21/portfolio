import Link from "next/link";
import type { Metadata } from "next";
import type { ProjectCategory } from "@prisma/client";

import { Badge } from "@/components/ui/badge";
import { ProjectCard } from "@/components/project/project-card";
import { CATEGORY_LABELS, PROJECT_CATEGORIES } from "@/config/project";
import { getPublishedProjects } from "@/features/projects/queries";

const description =
  "Technical case studies of software engineering projects — architecture, technical decisions, and engineering challenges.";

export const metadata: Metadata = {
  title: "Projects",
  description,
  alternates: { canonical: "/projects" },
  openGraph: { title: "Projects", description, url: "/projects" },
  twitter: { title: "Projects", description },
};

function isProjectCategory(value: string | undefined): value is ProjectCategory {
  return PROJECT_CATEGORIES.includes(value as ProjectCategory);
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category: categoryParam } = await searchParams;
  const category = isProjectCategory(categoryParam) ? categoryParam : undefined;
  const projects = await getPublishedProjects(category ? { category } : {});

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-16">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
        <p className="text-muted-foreground">Technical case studies of things I&apos;ve built.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link href="/projects">
          <Badge variant={category ? "outline" : "default"} className="cursor-pointer">
            All
          </Badge>
        </Link>
        {PROJECT_CATEGORIES.map((c) => (
          <Link key={c} href={`/projects?category=${c}`}>
            <Badge variant={category === c ? "default" : "outline"} className="cursor-pointer">
              {CATEGORY_LABELS[c]}
            </Badge>
          </Link>
        ))}
      </div>

      {projects.length === 0 ? (
        <p className="text-muted-foreground rounded-lg border border-dashed p-12 text-center text-sm">
          No projects published yet — check back soon.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
