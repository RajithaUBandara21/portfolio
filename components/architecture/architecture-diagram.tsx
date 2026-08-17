"use client";

import "@xyflow/react/dist/style.css";

import { Background, Controls, MiniMap, ReactFlow, type NodeTypes } from "@xyflow/react";
import { useMemo, useState } from "react";

import { ArchNode } from "@/components/architecture/arch-node";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { ArchFlowEdge, ArchFlowNode } from "@/features/architecture-diagram/toReactFlowGraph";
import { useMediaQuery } from "@/hooks/use-media-query";

const nodeTypes: NodeTypes = { archNode: ArchNode };

export function ArchitectureDiagram({
  nodes,
  edges,
}: {
  nodes: ArchFlowNode[];
  edges: ArchFlowEdge[];
}) {
  const [selected, setSelected] = useState<ArchFlowNode | null>(null);
  const isDesktop = useMediaQuery("(min-width: 640px)");

  const proOptions = useMemo(() => ({ hideAttribution: true }), []);

  if (nodes.length === 0) {
    return (
      <p className="text-muted-foreground rounded-lg border border-dashed p-8 text-center text-sm">
        No architecture diagram has been added for this project yet.
      </p>
    );
  }

  return (
    <>
      <div className="bg-muted/20 h-[420px] w-full rounded-lg border sm:h-[520px]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          proOptions={proOptions}
          fitView
          minZoom={0.3}
          onNodeClick={(_, node) => setSelected(node as ArchFlowNode)}
          onPaneClick={() => setSelected(null)}
        >
          <Background />
          <Controls showInteractive={false} />
          <MiniMap pannable zoomable className="!bg-background" />
        </ReactFlow>
      </div>

      <Sheet open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent side={isDesktop ? "right" : "bottom"} className="overflow-y-auto">
          {selected ? (
            <>
              <SheetHeader>
                <SheetTitle>{selected.data.label}</SheetTitle>
                <SheetDescription>
                  {selected.data.technology ?? "Technology not specified"}
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-4 px-4 pb-6">
                {selected.data.responsibility ? (
                  <div>
                    <h4 className="mb-1 text-sm font-medium">Responsibility</h4>
                    <p className="text-muted-foreground text-sm">{selected.data.responsibility}</p>
                  </div>
                ) : null}
                {selected.data.interfaces.length > 0 ? (
                  <div>
                    <h4 className="mb-2 text-sm font-medium">Interfaces</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selected.data.interfaces.map((iface) => (
                        <Badge key={iface} variant="secondary">
                          {iface}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : null}
                {selected.data.dependencies.length > 0 ? (
                  <div>
                    <h4 className="mb-2 text-sm font-medium">Dependencies</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selected.data.dependencies.map((dep) => (
                        <Badge key={dep} variant="outline">
                          {dep}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </>
  );
}
