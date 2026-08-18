import Link from "next/link";
import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPublishedActivities } from "@/features/activities/queries";
import { formatDate } from "@/lib/utils";

const description = "Talks, open-source contributions, awards, and other engineering activities.";

export const metadata: Metadata = {
  title: "Activities",
  description,
  alternates: { canonical: "/activities" },
  openGraph: { title: "Activities", description, url: "/activities" },
  twitter: { title: "Activities", description },
};

export default async function ActivitiesPage() {
  const activities = await getPublishedActivities();

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight">Activities</h1>

      {activities.length === 0 ? (
        <p className="text-muted-foreground rounded-lg border border-dashed p-12 text-center text-sm">
          Nothing to show yet.
        </p>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <Card key={activity.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{activity.title}</CardTitle>
                  <Badge variant="outline">{activity.type}</Badge>
                </div>
                <p className="text-muted-foreground text-sm">{formatDate(activity.date)}</p>
              </CardHeader>
              {activity.description || activity.url ? (
                <CardContent className="space-y-2">
                  {activity.description ? (
                    <p className="text-muted-foreground">{activity.description}</p>
                  ) : null}
                  {activity.url ? (
                    <Link
                      href={activity.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm underline underline-offset-4"
                    >
                      Learn more
                    </Link>
                  ) : null}
                </CardContent>
              ) : null}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
