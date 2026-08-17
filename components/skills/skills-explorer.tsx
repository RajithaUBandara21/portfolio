"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useMediaQuery } from "@/hooks/use-media-query";

export interface SkillWithProjects {
  id: string;
  name: string;
  slug: string;
  category: string;
  level: string;
  description: string | null;
  projects: Array<{ id: string; slug: string; title: string; shortDescription: string }>;
}

const CATEGORY_LABELS: Record<string, string> = {
  LANGUAGE: "Languages",
  FRAMEWORK: "Frameworks",
  DATABASE: "Databases",
  CLOUD_DEVOPS: "Cloud & DevOps",
  TOOLING: "Tooling",
  SOFT_SKILL: "Soft skills",
  OTHER: "Other",
};

export function SkillsExplorer({ skills }: { skills: SkillWithProjects[] }) {
  const [selected, setSelected] = useState<SkillWithProjects | null>(null);
  const isDesktop = useMediaQuery("(min-width: 640px)");
  const searchParams = useSearchParams();

  useEffect(() => {
    // Syncing local state to an external source (the URL) on navigation is exactly the
    // "subscribe to updates from an external system" case the lint rule allows for.
    const targetSlug = searchParams.get("skill");
    if (!targetSlug) return;
    const match = skills.find((s) => s.slug === targetSlug);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (match) setSelected(match);
    // Only react to the URL param on first render / navigation, not on every skills re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const grouped: Record<string, SkillWithProjects[]> = {};
  for (const skill of skills) {
    const bucket = grouped[skill.category] ?? [];
    bucket.push(skill);
    grouped[skill.category] = bucket;
  }

  return (
    <div className="space-y-8">
      {Object.entries(grouped).map(([category, categorySkills]) => (
        <div key={category} className="space-y-3">
          <h2 className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
            {CATEGORY_LABELS[category] ?? category}
          </h2>
          <div className="flex flex-wrap gap-2">
            {categorySkills.map((skill) => (
              <Badge
                key={skill.id}
                variant="outline"
                className="cursor-pointer px-3 py-1.5 text-sm"
                onClick={() => setSelected(skill)}
              >
                {skill.name}
                {skill.projects.length > 0 ? (
                  <span className="text-muted-foreground ml-1.5">({skill.projects.length})</span>
                ) : null}
              </Badge>
            ))}
          </div>
        </div>
      ))}

      <Sheet open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent side={isDesktop ? "right" : "bottom"} className="overflow-y-auto">
          {selected ? (
            <>
              <SheetHeader>
                <SheetTitle>{selected.name}</SheetTitle>
                <SheetDescription>
                  {selected.description || "Projects using this skill"}
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-3 px-4 pb-6">
                {selected.projects.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    No published projects use this skill yet.
                  </p>
                ) : (
                  selected.projects.map((project) => (
                    <Link
                      key={project.id}
                      href={`/projects/${project.slug}`}
                      className="hover:bg-accent block rounded-lg border p-3 transition-colors"
                    >
                      <p className="font-medium">{project.title}</p>
                      <p className="text-muted-foreground text-sm">{project.shortDescription}</p>
                    </Link>
                  ))
                )}
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}
