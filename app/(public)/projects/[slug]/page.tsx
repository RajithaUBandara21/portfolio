import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { ArchitectureDiagram } from "@/components/architecture/architecture-diagram";
import { GithubStats } from "@/components/project/github-stats";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CATEGORY_LABELS, STATUS_LABELS } from "@/config/project";
import { toReactFlowGraph } from "@/features/architecture-diagram/toReactFlowGraph";
import { getPublishedProjectBySlug } from "@/features/projects/queries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getPublishedProjectBySlug(slug);
  if (!project) return {};

  const coverImage = project.screenshots[0]?.url;
  return {
    title: project.title,
    description: project.shortDescription,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: {
      type: "article",
      title: project.title,
      description: project.shortDescription,
      url: `/projects/${project.slug}`,
      ...(coverImage ? { images: [{ url: coverImage }] } : {}),
    },
    twitter: {
      title: project.title,
      description: project.shortDescription,
      ...(coverImage ? { images: [coverImage] } : {}),
    },
  };
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <div className="text-muted-foreground space-y-2 leading-relaxed whitespace-pre-line">
        {children}
      </div>
    </section>
  );
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getPublishedProjectBySlug(slug);
  if (!project) notFound();

  const { nodes, edges } = toReactFlowGraph(project.archNodes, project.archEdges);

  return (
    <div className="mx-auto max-w-3xl space-y-12 px-4 py-16">
      <header className="space-y-4">
        <div className="flex flex-wrap gap-1.5">
          {project.categories.map((category) => (
            <Badge key={category} variant="secondary">
              {CATEGORY_LABELS[category]}
            </Badge>
          ))}
          <Badge variant="outline">{STATUS_LABELS[project.status]}</Badge>
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{project.title}</h1>
        <p className="text-muted-foreground text-lg">{project.shortDescription}</p>
        <div className="flex flex-wrap gap-3 pt-1">
          {project.githubUrl ? (
            <Button asChild variant="outline" size="sm">
              <Link href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                GitHub
              </Link>
            </Button>
          ) : null}
          {project.demoUrl ? (
            <Button asChild variant="outline" size="sm">
              <Link href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                Live demo
              </Link>
            </Button>
          ) : null}
          {project.docsUrl ? (
            <Button asChild variant="outline" size="sm">
              <Link href={project.docsUrl} target="_blank" rel="noopener noreferrer">
                Documentation
              </Link>
            </Button>
          ) : null}
        </div>
        {project.githubUrl ? <GithubStats repoUrl={project.githubUrl} /> : null}
      </header>

      {project.technologies.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {project.technologies.map(({ technology }) => (
            <Badge key={technology.id} variant="outline">
              {technology.name}
            </Badge>
          ))}
        </div>
      ) : null}

      {project.screenshots.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {project.screenshots.map((shot) => (
            <div
              key={shot.id}
              className="bg-muted relative aspect-video overflow-hidden rounded-lg"
            >
              <Image src={shot.url} alt={shot.altText} fill className="object-cover" />
            </div>
          ))}
        </div>
      ) : null}

      <div className="space-y-1 whitespace-pre-line">
        <p className="text-muted-foreground leading-relaxed">{project.fullDescription}</p>
      </div>

      {project.problem ? <Section title="Problem">{project.problem}</Section> : null}
      {project.solution ? <Section title="Solution">{project.solution}</Section> : null}

      {(nodes.length > 0 || project.architectureNotes) && (
        <section className="space-y-3">
          <h2 className="text-xl font-semibold tracking-tight">Architecture</h2>
          {project.architectureNotes ? (
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
              {project.architectureNotes}
            </p>
          ) : null}
          <ArchitectureDiagram nodes={nodes} edges={edges} />
        </section>
      )}

      {project.decisions.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">Technical decisions</h2>
          <div className="space-y-4">
            {project.decisions.map((decision) => (
              <div key={decision.id} className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium">{decision.title}</h3>
                <dl className="space-y-2 text-sm">
                  <div>
                    <dt className="text-foreground font-medium">Reason</dt>
                    <dd className="text-muted-foreground">{decision.reason}</dd>
                  </div>
                  <div>
                    <dt className="text-foreground font-medium">Alternatives considered</dt>
                    <dd className="text-muted-foreground">{decision.alternatives}</dd>
                  </div>
                  <div>
                    <dt className="text-foreground font-medium">Trade-offs</dt>
                    <dd className="text-muted-foreground">{decision.tradeoffs}</dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {project.challenges ? (
        <Section title="Engineering challenges">{project.challenges}</Section>
      ) : null}

      {project.metrics.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-xl font-semibold tracking-tight">Performance</h2>
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {project.metrics.map((metric) => (
              <div key={metric.id} className="rounded-lg border p-4">
                <dt className="text-muted-foreground text-xs">{metric.label}</dt>
                <dd className="text-lg font-semibold">{metric.value}</dd>
                {metric.context ? (
                  <p className="text-muted-foreground mt-1 text-xs">{metric.context}</p>
                ) : null}
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      {project.reliabilityNotes ? (
        <Section title="Reliability">{project.reliabilityNotes}</Section>
      ) : null}
      {project.securityNotes ? <Section title="Security">{project.securityNotes}</Section> : null}
      {project.observabilityNotes ? (
        <Section title="Observability">{project.observabilityNotes}</Section>
      ) : null}
      {project.testingNotes ? <Section title="Testing">{project.testingNotes}</Section> : null}
      {project.results ? <Section title="Results">{project.results}</Section> : null}
      {project.lessons ? <Section title="Lessons learned">{project.lessons}</Section> : null}
      {project.futureImprovements ? (
        <Section title="Future improvements">{project.futureImprovements}</Section>
      ) : null}

      {project.skills.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-xl font-semibold tracking-tight">Skills applied</h2>
          <div className="flex flex-wrap gap-2">
            {project.skills.map(({ skill }) => (
              <Link key={skill.id} href={`/skills?skill=${skill.slug}`}>
                <Badge variant="secondary" className="cursor-pointer">
                  {skill.name}
                </Badge>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
