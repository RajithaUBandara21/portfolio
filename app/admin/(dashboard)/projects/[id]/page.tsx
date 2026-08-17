import { notFound } from "next/navigation";

import { ProjectForm } from "@/components/admin/project-form";
import {
  getProjectForAdmin,
  getSkillOptions,
  getTechnologyOptions,
} from "@/features/projects/queries";
import type { ProjectInput } from "@/schemas/project.schema";

function toDateInputValue(date: Date | null): string {
  return date ? date.toISOString().slice(0, 10) : "";
}

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [project, technologyOptions, skillOptions] = await Promise.all([
    getProjectForAdmin(id),
    getTechnologyOptions(),
    getSkillOptions(),
  ]);

  if (!project) notFound();

  const defaultValues: ProjectInput = {
    slug: project.slug,
    title: project.title,
    shortDescription: project.shortDescription,
    fullDescription: project.fullDescription,
    categories: project.categories,
    status: project.status,
    contentStatus: project.contentStatus,
    featured: project.featured,
    startDate: toDateInputValue(project.startDate),
    endDate: toDateInputValue(project.endDate),
    githubUrl: project.githubUrl ?? "",
    demoUrl: project.demoUrl ?? "",
    docsUrl: project.docsUrl ?? "",
    problem: project.problem ?? "",
    solution: project.solution ?? "",
    architectureNotes: project.architectureNotes ?? "",
    challenges: project.challenges ?? "",
    results: project.results ?? "",
    lessons: project.lessons ?? "",
    futureImprovements: project.futureImprovements ?? "",
    reliabilityNotes: project.reliabilityNotes ?? "",
    securityNotes: project.securityNotes ?? "",
    observabilityNotes: project.observabilityNotes ?? "",
    testingNotes: project.testingNotes ?? "",
    technologyNames: project.technologies.map((t) => t.technology.name),
    skillIds: project.skills.map((s) => s.skillId),
    screenshots: project.screenshots.map((s) => ({
      url: s.url,
      altText: s.altText,
      order: s.order,
    })),
    metrics: project.metrics.map((m) => ({
      label: m.label,
      value: m.value,
      context: m.context ?? "",
      order: m.order,
    })),
    decisions: project.decisions.map((d) => ({
      title: d.title,
      reason: d.reason,
      alternatives: d.alternatives,
      tradeoffs: d.tradeoffs,
      order: d.order,
    })),
    archNodes: project.archNodes.map((n) => ({
      key: n.key,
      label: n.label,
      kind: n.kind,
      technology: n.technology ?? "",
      responsibility: n.responsibility ?? "",
      interfaces: n.interfaces,
      dependencies: n.dependencies,
      positionX: n.positionX,
      positionY: n.positionY,
    })),
    archEdges: project.archEdges.map((e) => {
      const source = project.archNodes.find((n) => n.id === e.sourceId);
      const target = project.archNodes.find((n) => n.id === e.targetId);
      return {
        sourceKey: source?.key ?? "",
        targetKey: target?.key ?? "",
        label: e.label ?? "",
        dataFlow: e.dataFlow ?? "",
      };
    }),
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Edit project</h1>
      <ProjectForm
        defaultValues={defaultValues}
        projectId={project.id}
        technologyOptions={technologyOptions}
        skillOptions={skillOptions}
      />
    </div>
  );
}
