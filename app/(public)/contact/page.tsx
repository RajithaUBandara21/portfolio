import { Mail, MapPin, Phone } from "lucide-react";
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
        <div className="space-y-4 text-sm">
          <h2 className="font-medium">Other ways to reach me</h2>
          <div className="space-y-3">
            {profile?.email ? (
              <div className="flex items-center gap-3">
                <Mail className="text-muted-foreground size-4 shrink-0" aria-hidden />
                <Link
                  href={`mailto:${profile.email}`}
                  className="hover:text-foreground underline-offset-4 hover:underline"
                >
                  {profile.email}
                </Link>
              </div>
            ) : null}
            {profile?.phone ? (
              <div className="flex items-center gap-3">
                <Phone className="text-muted-foreground size-4 shrink-0" aria-hidden />
                <Link
                  href={`tel:${profile.phone}`}
                  className="hover:text-foreground underline-offset-4 hover:underline"
                >
                  {profile.phone}
                </Link>
              </div>
            ) : null}
            {profile?.location ? (
              <div className="flex items-center gap-3">
                <MapPin className="text-muted-foreground size-4 shrink-0" aria-hidden />
                <span>{profile.location}</span>
              </div>
            ) : null}
            {profile?.socialLinks.map((link) => (
              <div key={link.id} className="flex items-center gap-3">
                <span className="text-muted-foreground w-4 shrink-0 text-center text-xs capitalize">
                  {link.platform.slice(0, 1)}
                </span>
                <Link
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground truncate underline-offset-4 hover:underline"
                >
                  {link.url}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
