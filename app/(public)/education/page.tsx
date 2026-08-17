import type { Metadata } from "next";

import { Timeline, formatDateRange, type TimelineItem } from "@/components/timeline/timeline";
import { getPublishedEducation } from "@/features/education/queries";

const description = "Academic background and education history.";

export const metadata: Metadata = {
  title: "Education",
  description,
  alternates: { canonical: "/education" },
  openGraph: { title: "Education", description, url: "/education" },
  twitter: { title: "Education", description },
};

export default async function EducationPage() {
  const educationEntries = await getPublishedEducation();

  const items: TimelineItem[] = educationEntries.map((edu) => ({
    id: edu.id,
    title: edu.degree,
    subtitle: [edu.institution, edu.fieldOfStudy].filter(Boolean).join(" · "),
    dateRange: formatDateRange(edu.startDate, edu.endDate, edu.current),
    content: edu.description ? (
      <p className="text-muted-foreground mt-3 leading-relaxed">{edu.description}</p>
    ) : undefined,
  }));

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight">Education</h1>
      <Timeline items={items} />
    </div>
  );
}
