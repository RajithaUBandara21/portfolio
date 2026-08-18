import { randomUUID } from "node:crypto";

import { afterAll, describe, expect, it } from "vitest";

import {
  createProject,
  findProjectByIdForAdmin,
  updateProject,
  type SaveProjectInput,
} from "@/services/projectService";
import { db } from "@/services/db";

function baseInput(overrides: Partial<SaveProjectInput> = {}): SaveProjectInput {
  return {
    slug: `test-project-${randomUUID()}`,
    title: "Test Project",
    shortDescription: "A test project",
    fullDescription: "A longer description of the test project",
    categories: ["BACKEND"],
    status: "IN_PROGRESS",
    contentStatus: "DRAFT",
    featured: false,
    startDate: null,
    endDate: null,
    githubUrl: null,
    demoUrl: null,
    docsUrl: null,
    problem: null,
    solution: null,
    architectureNotes: null,
    challenges: null,
    results: null,
    lessons: null,
    futureImprovements: null,
    reliabilityNotes: null,
    securityNotes: null,
    observabilityNotes: null,
    testingNotes: null,
    technologyNames: [],
    skillIds: [],
    screenshots: [],
    metrics: [],
    decisions: [],
    archNodes: [],
    archEdges: [],
    ...overrides,
  };
}

describe("projectService (integration)", () => {
  const createdProjectIds: string[] = [];
  const createdTechNames = [`tech-${randomUUID()}`, `tech-${randomUUID()}`];

  afterAll(async () => {
    await db.project.deleteMany({ where: { id: { in: createdProjectIds } } });
    await db.technology.deleteMany({ where: { name: { in: createdTechNames } } });
  });

  it("creates a project with technologies, decisions, and an architecture diagram", async () => {
    const { id } = await createProject(
      baseInput({
        technologyNames: [createdTechNames[0]],
        decisions: [
          {
            title: "Use Postgres",
            reason: "ACID",
            alternatives: "MongoDB",
            tradeoffs: "Less flexible schema",
            order: 0,
          },
        ],
        archNodes: [
          {
            key: "api",
            label: "API",
            kind: "SERVICE",
            technology: null,
            responsibility: null,
            interfaces: [],
            dependencies: [],
            positionX: 0,
            positionY: 0,
          },
          {
            key: "db",
            label: "DB",
            kind: "DATABASE",
            technology: null,
            responsibility: null,
            interfaces: [],
            dependencies: [],
            positionX: 200,
            positionY: 0,
          },
        ],
        archEdges: [{ sourceKey: "api", targetKey: "db", label: "reads/writes", dataFlow: null }],
      }),
    );
    createdProjectIds.push(id);

    const project = await findProjectByIdForAdmin(id);
    expect(project).not.toBeNull();
    expect(project?.technologies).toHaveLength(1);
    expect(project?.technologies[0].technology.name).toBe(createdTechNames[0]);
    expect(project?.decisions).toHaveLength(1);
    expect(project?.archNodes).toHaveLength(2);
    expect(project?.archEdges).toHaveLength(1);

    // The edge must resolve to the *database ids* of the nodes it references by key, not the keys themselves.
    const apiNode = project?.archNodes.find((n) => n.key === "api");
    const dbNode = project?.archNodes.find((n) => n.key === "db");
    expect(project?.archEdges[0].sourceId).toBe(apiNode?.id);
    expect(project?.archEdges[0].targetId).toBe(dbNode?.id);
  });

  it("drops an edge that references a node key not present in the same save", async () => {
    const { id } = await createProject(
      baseInput({
        archNodes: [
          {
            key: "only-node",
            label: "Only",
            kind: "SERVICE",
            technology: null,
            responsibility: null,
            interfaces: [],
            dependencies: [],
            positionX: 0,
            positionY: 0,
          },
        ],
        archEdges: [
          { sourceKey: "only-node", targetKey: "missing-node", label: null, dataFlow: null },
        ],
      }),
    );
    createdProjectIds.push(id);

    const project = await findProjectByIdForAdmin(id);
    expect(project?.archNodes).toHaveLength(1);
    expect(project?.archEdges).toHaveLength(0);
  });

  it("wholesale-replaces technologies on update, removing ones no longer selected", async () => {
    const { id } = await createProject(baseInput({ technologyNames: [createdTechNames[0]] }));
    createdProjectIds.push(id);

    let project = await findProjectByIdForAdmin(id);
    expect(project?.technologies.map((t) => t.technology.name)).toEqual([createdTechNames[0]]);

    await updateProject(
      id,
      baseInput({ slug: project!.slug, technologyNames: [createdTechNames[1]] }),
    );

    project = await findProjectByIdForAdmin(id);
    expect(project?.technologies).toHaveLength(1);
    expect(project?.technologies[0].technology.name).toBe(createdTechNames[1]);
  });

  it("sets publishedAt when transitioning to PUBLISHED, and keeps it stable on re-save", async () => {
    const { id } = await createProject(baseInput({ contentStatus: "DRAFT" }));
    createdProjectIds.push(id);

    let project = await findProjectByIdForAdmin(id);
    expect(project?.publishedAt).toBeNull();

    await updateProject(id, baseInput({ slug: project!.slug, contentStatus: "PUBLISHED" }));
    project = await findProjectByIdForAdmin(id);
    const firstPublishedAt = project?.publishedAt;
    expect(firstPublishedAt).not.toBeNull();

    // Re-saving while already PUBLISHED must not reset the original publish timestamp.
    await updateProject(
      id,
      baseInput({ slug: project!.slug, contentStatus: "PUBLISHED", title: "Updated title" }),
    );
    project = await findProjectByIdForAdmin(id);
    expect(project?.publishedAt?.getTime()).toBe(firstPublishedAt?.getTime());
    expect(project?.title).toBe("Updated title");
  });
});
