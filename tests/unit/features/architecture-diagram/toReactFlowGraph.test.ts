import { describe, expect, it } from "vitest";
import type { ArchitectureEdge, ArchitectureNode } from "@prisma/client";

import { toReactFlowGraph } from "@/features/architecture-diagram/toReactFlowGraph";

function makeNode(overrides: Partial<ArchitectureNode> = {}): ArchitectureNode {
  return {
    id: "node-1",
    projectId: "project-1",
    key: "api",
    label: "API Service",
    kind: "SERVICE",
    technology: "Node.js",
    responsibility: "Handles requests",
    interfaces: ["REST /api/x"],
    dependencies: ["database"],
    positionX: 10,
    positionY: 20,
    ...overrides,
  };
}

function makeEdge(overrides: Partial<ArchitectureEdge> = {}): ArchitectureEdge {
  return {
    id: "edge-1",
    projectId: "project-1",
    sourceId: "node-1",
    targetId: "node-2",
    label: "reads/writes",
    dataFlow: "user records",
    ...overrides,
  };
}

describe("toReactFlowGraph", () => {
  it("maps node fields into React Flow's node shape", () => {
    const node = makeNode();
    const { nodes } = toReactFlowGraph([node], []);

    expect(nodes).toHaveLength(1);
    expect(nodes[0]).toMatchObject({
      id: "node-1",
      type: "archNode",
      position: { x: 10, y: 20 },
      data: {
        label: "API Service",
        kind: "SERVICE",
        technology: "Node.js",
        responsibility: "Handles requests",
        interfaces: ["REST /api/x"],
        dependencies: ["database"],
      },
    });
  });

  it("maps edge source/target to node database ids and carries dataFlow in edge data", () => {
    const nodeA = makeNode({ id: "node-1", key: "api" });
    const nodeB = makeNode({ id: "node-2", key: "database", label: "PostgreSQL" });
    const edge = makeEdge({ sourceId: "node-1", targetId: "node-2" });

    const { edges } = toReactFlowGraph([nodeA, nodeB], [edge]);

    expect(edges).toHaveLength(1);
    expect(edges[0]).toMatchObject({
      id: "edge-1",
      source: "node-1",
      target: "node-2",
      label: "reads/writes",
      data: { dataFlow: "user records" },
    });
  });

  it("drops edges that reference a node not present in the node list", () => {
    const nodeA = makeNode({ id: "node-1" });
    const danglingEdge = makeEdge({ sourceId: "node-1", targetId: "node-does-not-exist" });

    const { edges } = toReactFlowGraph([nodeA], [danglingEdge]);

    expect(edges).toHaveLength(0);
  });

  it("returns empty arrays for a project with no architecture diagram yet", () => {
    expect(toReactFlowGraph([], [])).toEqual({ nodes: [], edges: [] });
  });
});
