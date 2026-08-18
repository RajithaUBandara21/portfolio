import Link from "next/link";
import type { Metadata } from "next";

import { Button } from "@/components/ui/button";
import { getProfile } from "@/features/profile/queries";

const description = "View or download my résumé.";

export const metadata: Metadata = {
  title: "Résumé",
  description,
  alternates: { canonical: "/resume" },
  openGraph: { title: "Résumé", description, url: "/resume" },
  twitter: { title: "Résumé", description },
};

export default async function ResumePage() {
  const profile = await getProfile();
  const resumeUrl = profile?.resumeUrl;

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-16">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Résumé</h1>
        {resumeUrl ? (
          <Button asChild variant="outline">
            <Link href={resumeUrl} target="_blank" rel="noopener noreferrer">
              Download PDF
            </Link>
          </Button>
        ) : null}
      </div>

      {resumeUrl ? (
        <div className="bg-muted overflow-hidden rounded-lg border" style={{ height: "85vh" }}>
          <iframe src={resumeUrl} title="Résumé" className="h-full w-full" />
        </div>
      ) : (
        <p className="text-muted-foreground rounded-lg border border-dashed p-12 text-center text-sm">
          No résumé has been uploaded yet.
        </p>
      )}
    </div>
  );
}
