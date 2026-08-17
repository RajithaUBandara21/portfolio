import type {
  Prisma,
  ProjectCategory,
  ProjectStatus,
  ContentStatus,
  ArchNodeKind,
} from "@prisma/client";

import { db } from "@/services/db";
import { findOrCreateTechnologiesByNames } from "@/services/technologyService";

const publicProjectInclude = {
  technologies: { include: { technology: true } },
  skills: { include: { skill: true } },
  screenshots: { orderBy: { order: "asc" as const } },
  metrics: { orderBy: { order: "asc" as const } },
  decisions: { orderBy: { order: "asc" as const } },
  archNodes: true,
  archEdges: true,
} satisfies Prisma.ProjectInclude;

export type ProjectWithRelations = Prisma.ProjectGetPayload<{
  include: typeof publicProjectInclude;
}>;

export interface ProjectListFilters {
  category?: ProjectCategory;
  featuredOnly?: boolean;
}

export function listPublishedProjects(filters: ProjectListFilters = {}) {
  return db.project.findMany({
    where: {
      contentStatus: "PUBLISHED",
      ...(filters.category ? { categories: { has: filters.category } } : {}),
      ...(filters.featuredOnly ? { featured: true } : {}),
    },
    include: publicProjectInclude,
    orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
  });
}

export function findPublishedProjectBySlug(slug: string): Promise<ProjectWithRelations | null> {
  return db.project.findFirst({
    where: { slug, contentStatus: "PUBLISHED" },
    include: publicProjectInclude,
  });
}

export function listProjectsForAdmin() {
  return db.project.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      status: true,
      contentStatus: true,
      featured: true,
      updatedAt: true,
    },
  });
}

export function findProjectByIdForAdmin(id: string): Promise<ProjectWithRelations | null> {
  return db.project.findUnique({ where: { id }, include: publicProjectInclude });
}

export function findProjectBySlugForAdmin(slug: string) {
  return db.project.findUnique({ where: { slug }, select: { id: true } });
}

export interface SaveProjectInput {
  slug: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  categories: ProjectCategory[];
  status: ProjectStatus;
  contentStatus: ContentStatus;
  featured: boolean;
  startDate: Date | null;
  endDate: Date | null;
  githubUrl: string | null;
  demoUrl: string | null;
  docsUrl: string | null;
  problem: string | null;
  solution: string | null;
  architectureNotes: string | null;
  challenges: string | null;
  results: string | null;
  lessons: string | null;
  futureImprovements: string | null;
  reliabilityNotes: string | null;
  securityNotes: string | null;
  observabilityNotes: string | null;
  testingNotes: string | null;
  technologyNames: string[];
  skillIds: string[];
  screenshots: Array<{ url: string; altText: string; order: number }>;
  metrics: Array<{ label: string; value: string; context: string | null; order: number }>;
  decisions: Array<{
    title: string;
    reason: string;
    alternatives: string;
    tradeoffs: string;
    order: number;
  }>;
  archNodes: Array<{
    key: string;
    label: string;
    kind: ArchNodeKind;
    technology: string | null;
    responsibility: string | null;
    interfaces: string[];
    dependencies: string[];
    positionX: number;
    positionY: number;
  }>;
  archEdges: Array<{
    sourceKey: string;
    targetKey: string;
    label: string | null;
    dataFlow: string | null;
  }>;
}

const projectScalarFields = [
  "slug",
  "title",
  "shortDescription",
  "fullDescription",
  "categories",
  "status",
  "contentStatus",
  "featured",
  "startDate",
  "endDate",
  "githubUrl",
  "demoUrl",
  "docsUrl",
  "problem",
  "solution",
  "architectureNotes",
  "challenges",
  "results",
  "lessons",
  "futureImprovements",
  "reliabilityNotes",
  "securityNotes",
  "observabilityNotes",
  "testingNotes",
] as const;

function scalarData(input: SaveProjectInput) {
  return Object.fromEntries(projectScalarFields.map((field) => [field, input[field]])) as Pick<
    SaveProjectInput,
    (typeof projectScalarFields)[number]
  >;
}

// All nested relations (technologies, skills, screenshots, metrics, decisions, architecture
// nodes/edges) are replaced wholesale on every save rather than diffed. These lists are always
// small (a handful of rows each) for a personal portfolio project, so delete+recreate inside one
// transaction is simpler and just as correct as tracking per-row identity across edits.
async function replaceProjectRelations(
  tx: Prisma.TransactionClient,
  projectId: string,
  input: SaveProjectInput,
) {
  const technologies = await findOrCreateTechnologiesByNames(tx, input.technologyNames);

  await tx.projectTechnology.deleteMany({ where: { projectId } });
  if (technologies.length > 0) {
    await tx.projectTechnology.createMany({
      data: technologies.map((t) => ({ projectId, technologyId: t.id })),
    });
  }

  await tx.projectSkill.deleteMany({ where: { projectId } });
  if (input.skillIds.length > 0) {
    await tx.projectSkill.createMany({
      data: input.skillIds.map((skillId) => ({ projectId, skillId })),
    });
  }

  await tx.projectScreenshot.deleteMany({ where: { projectId } });
  if (input.screenshots.length > 0) {
    await tx.projectScreenshot.createMany({
      data: input.screenshots.map((s) => ({ ...s, projectId })),
    });
  }

  await tx.projectMetric.deleteMany({ where: { projectId } });
  if (input.metrics.length > 0) {
    await tx.projectMetric.createMany({
      data: input.metrics.map((m) => ({ ...m, projectId })),
    });
  }

  await tx.projectDecision.deleteMany({ where: { projectId } });
  if (input.decisions.length > 0) {
    await tx.projectDecision.createMany({
      data: input.decisions.map((d) => ({ ...d, projectId })),
    });
  }

  // Edges reference nodes by client-stable `key`, so nodes must be (re)created first and their
  // new database ids resolved before edges can be written.
  await tx.architectureEdge.deleteMany({ where: { projectId } });
  await tx.architectureNode.deleteMany({ where: { projectId } });
  if (input.archNodes.length > 0) {
    await tx.architectureNode.createMany({
      data: input.archNodes.map((n) => ({ ...n, projectId })),
    });
    const createdNodes = await tx.architectureNode.findMany({
      where: { projectId },
      select: { id: true, key: true },
    });
    const idByKey = new Map(createdNodes.map((n) => [n.key, n.id]));

    const edgesToCreate = input.archEdges
      .map((edge) => {
        const sourceId = idByKey.get(edge.sourceKey);
        const targetId = idByKey.get(edge.targetKey);
        if (!sourceId || !targetId) return null;
        return {
          projectId,
          sourceId,
          targetId,
          label: edge.label,
          dataFlow: edge.dataFlow,
        };
      })
      .filter((e) => e !== null);

    if (edgesToCreate.length > 0) {
      await tx.architectureEdge.createMany({ data: edgesToCreate });
    }
  }
}

export async function createProject(input: SaveProjectInput): Promise<{ id: string }> {
  return db.$transaction(async (tx) => {
    const project = await tx.project.create({
      data: {
        ...scalarData(input),
        publishedAt: input.contentStatus === "PUBLISHED" ? new Date() : null,
      },
    });
    await replaceProjectRelations(tx, project.id, input);
    return { id: project.id };
  });
}

export async function updateProject(id: string, input: SaveProjectInput): Promise<{ id: string }> {
  return db.$transaction(async (tx) => {
    const existing = await tx.project.findUniqueOrThrow({
      where: { id },
      select: { contentStatus: true, publishedAt: true },
    });

    const nowPublishing =
      input.contentStatus === "PUBLISHED" && existing.contentStatus !== "PUBLISHED";

    const project = await tx.project.update({
      where: { id },
      data: {
        ...scalarData(input),
        publishedAt: nowPublishing ? new Date() : existing.publishedAt,
      },
    });
    await replaceProjectRelations(tx, project.id, input);
    return { id: project.id };
  });
}

export function deleteProject(id: string): Promise<void> {
  return db.project.delete({ where: { id } }).then(() => undefined);
}

export async function setProjectFlags(
  id: string,
  flags: { contentStatus?: ContentStatus; featured?: boolean },
) {
  const existing = await db.project.findUniqueOrThrow({
    where: { id },
    select: { contentStatus: true, publishedAt: true },
  });
  const nowPublishing =
    flags.contentStatus === "PUBLISHED" && existing.contentStatus !== "PUBLISHED";

  return db.project.update({
    where: { id },
    data: {
      ...flags,
      publishedAt: nowPublishing ? new Date() : existing.publishedAt,
    },
  });
}
