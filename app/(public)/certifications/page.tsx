import Link from "next/link";
import type { Metadata } from "next";
import type { ProjectCategory } from "@prisma/client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CATEGORY_LABELS, PROJECT_CATEGORIES } from "@/config/project";
import { getPublishedCertifications } from "@/features/certifications/queries";
import { formatDate } from "@/lib/utils";

const description = "Professional certifications in cloud, DevOps, and software engineering.";

export const metadata: Metadata = {
  title: "Certifications",
  description,
  alternates: { canonical: "/certifications" },
  openGraph: { title: "Certifications", description, url: "/certifications" },
  twitter: { title: "Certifications", description },
};

function isProjectCategory(value: string | undefined): value is ProjectCategory {
  return PROJECT_CATEGORIES.includes(value as ProjectCategory);
}

export default async function CertificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category: categoryParam } = await searchParams;
  const category = isProjectCategory(categoryParam) ? categoryParam : undefined;
  const certifications = await getPublishedCertifications(category);

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight">Certifications</h1>

      <div className="flex flex-wrap gap-2">
        <Link href="/certifications">
          <Badge variant={category ? "outline" : "default"} className="cursor-pointer">
            All
          </Badge>
        </Link>
        {PROJECT_CATEGORIES.map((c) => (
          <Link key={c} href={`/certifications?category=${c}`}>
            <Badge variant={category === c ? "default" : "outline"} className="cursor-pointer">
              {CATEGORY_LABELS[c]}
            </Badge>
          </Link>
        ))}
      </div>

      {certifications.length === 0 ? (
        <p className="text-muted-foreground rounded-lg border border-dashed p-12 text-center text-sm">
          No certifications published yet.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {certifications.map((cert) => (
            <Card key={cert.id}>
              <CardHeader>
                <CardTitle className="text-base">{cert.name}</CardTitle>
                <p className="text-muted-foreground text-sm">{cert.issuer}</p>
              </CardHeader>
              <CardContent className="space-y-2">
                {cert.issueDate ? (
                  <p className="text-muted-foreground text-xs">
                    Issued {formatDate(cert.issueDate, { month: "short", year: "numeric" })}
                  </p>
                ) : null}
                {cert.credentialUrl ? (
                  <Link
                    href={cert.credentialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm underline underline-offset-4"
                  >
                    View credential
                  </Link>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
