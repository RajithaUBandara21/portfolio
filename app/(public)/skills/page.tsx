import { Suspense } from "react";
import type { Metadata } from "next";

import { SkillsExplorer } from "@/components/skills/skills-explorer";
import { getSkillsWithProjects } from "@/features/skills/queries";

const description =
  "Technical skills across languages, frameworks, cloud/DevOps, and databases — linked to the projects that use them.";

export const metadata: Metadata = {
  title: "Skills",
  description,
  alternates: { canonical: "/skills" },
  openGraph: { title: "Skills", description, url: "/skills" },
  twitter: { title: "Skills", description },
};

export default async function SkillsPage() {
  const skills = await getSkillsWithProjects();

  const mapped = skills.map((skill) => ({
    id: skill.id,
    name: skill.name,
    slug: skill.slug,
    category: skill.category,
    level: skill.level,
    description: skill.description,
    projects: skill.projects.map((p) => p.project),
  }));

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-16">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Skills</h1>
        <p className="text-muted-foreground">Click a skill to see the projects that use it.</p>
      </div>
      {mapped.length === 0 ? (
        <p className="text-muted-foreground rounded-lg border border-dashed p-12 text-center text-sm">
          No skills added yet.
        </p>
      ) : (
        <Suspense>
          <SkillsExplorer skills={mapped} />
        </Suspense>
      )}
    </div>
  );
}
