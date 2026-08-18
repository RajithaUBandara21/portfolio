import Link from "next/link";
import type { Metadata } from "next";

import { ContactForm } from "@/components/contact/contact-form";
import { getProfile } from "@/features/profile/queries";

const description = "Get in touch to discuss opportunities or collaboration.";

export const metadata: Metadata = {
  title: "Contact",
  description,
  alternates: { canonical: "/contact" },
  openGraph: { title: "Contact", description, url: "/contact" },
  twitter: { title: "Contact", description },
};

export default async function ContactPage() {
  const profile = await getProfile();

  return (
    <div className="mx-auto max-w-3xl space-y-10 px-4 py-16">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Contact</h1>
        <p className="text-muted-foreground">
          Have a question or want to work together? Send a message below.
        </p>
      </div>

      <div className="grid gap-10 sm:grid-cols-2">
        <ContactForm />
        <div className="space-y-3 text-sm">
          {profile?.email ? (
            <p>
              <span className="text-muted-foreground">Email: </span>
              <Link href={`mailto:${profile.email}`} className="underline underline-offset-4">
                {profile.email}
              </Link>
            </p>
          ) : null}
          {profile?.location ? (
            <p>
              <span className="text-muted-foreground">Location: </span>
              {profile.location}
            </p>
          ) : null}
          {profile?.socialLinks.map((link) => (
            <p key={link.id}>
              <span className="text-muted-foreground capitalize">{link.platform}: </span>
              <Link
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4"
              >
                {link.url}
              </Link>
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
