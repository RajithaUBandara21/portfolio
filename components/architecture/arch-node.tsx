import { Handle, Position, type NodeProps } from "@xyflow/react";

import type { ArchFlowNode } from "@/features/architecture-diagram/toReactFlowGraph";

const KIND_LABELS: Record<string, string> = {
  SERVICE: "Service",
  DATABASE: "Database",
  QUEUE: "Queue",
  CACHE: "Cache",
  CLIENT: "Client",
  EXTERNAL_API: "External API",
  GATEWAY: "Gateway",
  STORAGE: "Storage",
  OTHER: "Other",
};

const KIND_COLORS: Record<string, string> = {
  SERVICE: "border-blue-500/50 bg-blue-500/10",
  DATABASE: "border-emerald-500/50 bg-emerald-500/10",
  QUEUE: "border-amber-500/50 bg-amber-500/10",
  CACHE: "border-orange-500/50 bg-orange-500/10",
  CLIENT: "border-violet-500/50 bg-violet-500/10",
  EXTERNAL_API: "border-rose-500/50 bg-rose-500/10",
  GATEWAY: "border-cyan-500/50 bg-cyan-500/10",
  STORAGE: "border-teal-500/50 bg-teal-500/10",
  OTHER: "border-muted-foreground/40 bg-muted",
};

export function ArchNode({ data, selected }: NodeProps<ArchFlowNode>) {
  return (
    <div
      className={`min-w-40 rounded-lg border-2 px-4 py-2.5 shadow-sm ${KIND_COLORS[data.kind] ?? KIND_COLORS.OTHER} ${
        selected ? "ring-2 ring-offset-2" : ""
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-foreground/40" />
      <p className="text-foreground text-sm font-semibold">{data.label}</p>
      <p className="text-muted-foreground text-xs">{KIND_LABELS[data.kind] ?? data.kind}</p>
      {data.technology ? (
        <p className="text-muted-foreground mt-1 text-xs italic">{data.technology}</p>
      ) : null}
      <Handle type="source" position={Position.Bottom} className="!bg-foreground/40" />
    </div>
  );
}
