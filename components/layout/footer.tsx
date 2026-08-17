import Link from "next/link";

import { getProfile } from "@/features/profile/queries";

export async function Footer() {
  const profile = await getProfile();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t">
      <div className="text-muted-foreground mx-auto flex max-w-5xl flex-col gap-4 px-4 py-8 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {year} {profile?.fullName ?? "Portfolio"}
        </p>
        {profile && profile.socialLinks.length > 0 ? (
          <ul className="flex items-center gap-4">
            {profile.socialLinks.map((link) => (
              <li key={link.id}>
                <Link
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  {link.platform}
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </footer>
  );
}
