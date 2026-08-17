import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { Timeline, formatDateRange, type TimelineItem } from "@/components/timeline/timeline";
import { getPublishedExperiences } from "@/features/experience/queries";

const description = "Professional work experience and career history.";

export const metadata: Metadata = {
  title: "Experience",
  description,
  alternates: { canonical: "/experience" },
  openGraph: { title: "Experience", description, url: "/experience" },
  twitter: { title: "Experience", description },
};

export default async function ExperiencePage() {
  const experiences = await getPublishedExperiences();

  const items: TimelineItem[] = experiences.map((exp) => ({
    id: exp.id,
    title: `${exp.role} · ${exp.company}`,
    subtitle: exp.location ?? "",
    dateRange: formatDateRange(exp.startDate, exp.endDate, exp.current),
    content: (
      <div className="mt-3 space-y-3">
        <p className="text-muted-foreground leading-relaxed">{exp.summary}</p>
        {exp.highlights.length > 0 ? (
          <ul className="text-muted-foreground list-disc space-y-1 pl-5 text-sm">
            {exp.highlights.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        ) : null}
        {exp.technologies.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {exp.technologies.map((t) => (
              <Badge key={t} variant="outline">
                {t}
              </Badge>
            ))}
          </div>
        ) : null}
      </div>
    ),
  }));

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight">Experience</h1>
      <Timeline items={items} />
    </div>
  );
}
