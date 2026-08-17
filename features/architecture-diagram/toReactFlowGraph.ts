import type { Edge, Node } from "@xyflow/react";
import type { ArchitectureNode, ArchitectureEdge, ArchNodeKind } from "@prisma/client";

export interface ArchNodeData {
  label: string;
  kind: ArchNodeKind;
  technology: string | null;
  responsibility: string | null;
  interfaces: string[];
  dependencies: string[];
  [key: string]: unknown;
}

export interface ArchEdgeData {
  dataFlow: string | null;
  [key: string]: unknown;
}

export type ArchFlowNode = Node<ArchNodeData>;
export type ArchFlowEdge = Edge<ArchEdgeData>;

// Pure data transform: Prisma rows -> React Flow's {nodes, edges} shape. Kept free of any
// React Flow instance/DOM concerns so it's independently unit-testable.
export function toReactFlowGraph(
  nodes: ArchitectureNode[],
  edges: ArchitectureEdge[],
): { nodes: ArchFlowNode[]; edges: ArchFlowEdge[] } {
  const idByDbId = new Map(nodes.map((n) => [n.id, n.id]));

  return {
    nodes: nodes.map((n) => ({
      id: n.id,
      type: "archNode",
      position: { x: n.positionX, y: n.positionY },
      data: {
        label: n.label,
        kind: n.kind,
        technology: n.technology,
        responsibility: n.responsibility,
        interfaces: n.interfaces,
        dependencies: n.dependencies,
      },
    })),
    edges: edges
      .filter((e) => idByDbId.has(e.sourceId) && idByDbId.has(e.targetId))
      .map((e) => ({
        id: e.id,
        source: e.sourceId,
        target: e.targetId,
        label: e.label ?? undefined,
        data: { dataFlow: e.dataFlow },
        animated: false,
      })),
  };
}
