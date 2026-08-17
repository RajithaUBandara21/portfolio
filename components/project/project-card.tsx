import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CATEGORY_LABELS } from "@/config/project";
import type { ProjectWithRelations } from "@/services/projectService";

export function ProjectCard({ project }: { project: ProjectWithRelations }) {
  const coverImage = project.screenshots[0];

  return (
    <Link href={`/projects/${project.slug}`} className="group block">
      <Card className="h-full overflow-hidden py-0 transition-all duration-200 group-hover:shadow-md motion-safe:group-hover:-translate-y-1">
        {coverImage ? (
          <div className="bg-muted relative aspect-video w-full overflow-hidden">
            <Image
              src={coverImage.url}
              alt={coverImage.altText}
              fill
              className="object-cover"
              sizes="(min-width: 768px) 33vw, 100vw"
            />
          </div>
        ) : (
          <div className="bg-muted aspect-video w-full" />
        )}
        <CardHeader className="pt-5">
          <div className="flex flex-wrap gap-1.5">
            {project.categories.slice(0, 2).map((category) => (
              <Badge key={category} variant="secondary" className="text-xs">
                {CATEGORY_LABELS[category]}
              </Badge>
            ))}
          </div>
          <h3 className="text-lg font-semibold">{project.title}</h3>
        </CardHeader>
        <CardContent className="pb-5">
          <p className="text-muted-foreground text-sm">{project.shortDescription}</p>
          {project.technologies.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {project.technologies.slice(0, 5).map(({ technology }) => (
                <Badge key={technology.id} variant="outline" className="text-xs">
                  {technology.name}
                </Badge>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </Link>
  );
}
