import type { Metadata } from "next";

import { getProfile } from "@/features/profile/queries";

const description = "Background, experience, and how I approach software engineering.";

export const metadata: Metadata = {
  title: "About",
  description,
  alternates: { canonical: "/about" },
  openGraph: { title: "About", description, url: "/about" },
  twitter: { title: "About", description },
};

export default async function AboutPage() {
  const profile = await getProfile();

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight">About</h1>
      <div className="text-muted-foreground space-y-4 leading-relaxed whitespace-pre-line">
        {profile?.bio ?? "TODO: Add a bio in the admin CMS."}
      </div>
      {profile?.location ? (
        <p className="text-muted-foreground text-sm">Based in {profile.location}</p>
      ) : null}
    </div>
  );
}
