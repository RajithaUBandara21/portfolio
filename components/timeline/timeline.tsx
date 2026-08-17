import type { ReactNode } from "react";

import { formatDate } from "@/lib/utils";

export interface TimelineItem {
  id: string;
  title: string;
  subtitle: string;
  dateRange: string;
  content?: ReactNode;
}

function formatDateRange(
  start: Date | string,
  end: Date | string | null,
  current: boolean,
): string {
  const fmt = (d: Date | string) => formatDate(d, { month: "short", year: "numeric" });
  return `${fmt(start)} — ${current ? "Present" : end ? fmt(end) : "Present"}`;
}

export { formatDateRange };

export function Timeline({ items }: { items: TimelineItem[] }) {
  if (items.length === 0) {
    return (
      <p className="text-muted-foreground rounded-lg border border-dashed p-12 text-center text-sm">
        Nothing to show yet.
      </p>
    );
  }

  return (
    <ol className="space-y-8 border-l pl-6">
      {items.map((item) => (
        <li key={item.id} className="relative">
          <span className="bg-foreground absolute top-1.5 -left-[29px] size-2.5 rounded-full" />
          <p className="text-muted-foreground text-sm">{item.dateRange}</p>
          <h3 className="text-lg font-semibold">{item.title}</h3>
          <p className="text-muted-foreground">{item.subtitle}</p>
          {item.content}
        </li>
      ))}
    </ol>
  );
}
