import { MapPin, FileText } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BlogCard } from "@/components/blog/blog-card";
import { GithubIcon, LinkedinIcon } from "@/components/icons/social-icons";
import { JsonLd } from "@/components/json-ld";
import { ProjectCard } from "@/components/project/project-card";
import { siteConfig } from "@/config/site";
import { getPublishedPosts } from "@/features/blog/queries";
import { getProfile } from "@/features/profile/queries";
import { getFeaturedProjects } from "@/features/projects/queries";

const RECENT_POSTS_LIMIT = 3;

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

const SOCIAL_ICONS: Record<string, typeof GithubIcon> = {
  github: GithubIcon,
  linkedin: LinkedinIcon,
};

export default async function HomePage() {
  const [profile, featuredProjects, recentPosts] = await Promise.all([
    getProfile(),
    getFeaturedProjects(),
    getPublishedPosts(),
  ]);
  const featuredPosts = recentPosts.slice(0, RECENT_POSTS_LIMIT);

  const fullName = profile?.fullName ?? "[Your Name]";
  const headline = profile?.headline ?? "[Your Professional Headline]";
  const bio = profile?.bio ?? "TODO: Add a bio in the admin CMS.";
  const resumeUrl = profile?.resumeUrl;
  const iconSocialLinks = (profile?.socialLinks ?? []).filter(
    (l) => SOCIAL_ICONS[l.platform.toLowerCase()],
  );

  return (
    <div className="mx-auto max-w-5xl space-y-20 px-4 py-20">
      {profile ? (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Person",
            name: profile.fullName,
            jobTitle: profile.headline,
            url: siteConfig.url,
            ...(profile.avatarUrl ? { image: profile.avatarUrl } : {}),
            ...(profile.location ? { address: profile.location } : {}),
            ...(profile.email ? { email: profile.email } : {}),
            sameAs: profile.socialLinks.map((l) => l.url),
          }}
        />
      ) : null}

      <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 flex flex-col-reverse gap-8 motion-safe:duration-700 sm:flex-row sm:items-center">
        <div className="flex-1 space-y-6">
          {profile?.availability ? (
            <Badge variant="secondary" className="gap-1.5">
              <span className="relative flex size-2">
                <span className="bg-primary absolute inline-flex h-full w-full rounded-full opacity-75 motion-safe:animate-ping" />
                <span className="bg-primary relative inline-flex size-2 rounded-full" />
              </span>
              {profile.availability}
            </Badge>
          ) : null}

          <div className="space-y-3">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{fullName}</h1>
            <p className="text-muted-foreground text-xl">{headline}</p>
            {profile?.location ? (
              <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
                <MapPin className="size-4" />
                {profile.location}
              </p>
            ) : null}
          </div>

          <p className="text-muted-foreground max-w-xl leading-relaxed">{bio}</p>

          <div className="flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link href="/projects">View projects</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/contact">Contact me</Link>
            </Button>

            {iconSocialLinks.length > 0 || resumeUrl ? (
              <div className="flex items-center gap-1 pl-1">
                {iconSocialLinks.map((link) => {
                  const Icon = SOCIAL_ICONS[link.platform.toLowerCase()];
                  return (
                    <Button key={link.id} asChild size="icon" variant="ghost">
                      <Link
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={link.platform}
                      >
                        <Icon className="size-5" />
                      </Link>
                    </Button>
                  );
                })}
                {resumeUrl ? (
                  <Button asChild size="icon" variant="ghost">
                    <Link href="/resume" aria-label="Résumé">
                      <FileText className="size-5" />
                    </Link>
                  </Button>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        <div className="relative shrink-0 self-center sm:self-auto">
          <div
            aria-hidden
            className="bg-primary/25 absolute inset-0 -z-10 scale-90 rounded-full blur-2xl"
          />
          <div className="from-primary/70 via-primary/20 to-primary/70 rounded-full bg-linear-to-br p-0.75 shadow-2xl">
            {profile?.avatarUrl ? (
              <Image
                src={profile.avatarUrl}
                alt={fullName}
                width={256}
                height={256}
                className="ring-background size-48 rounded-full object-cover ring-4 sm:size-56 lg:size-64"
                priority
              />
            ) : (
              <div className="bg-muted ring-background flex size-48 items-center justify-center rounded-full text-5xl font-semibold ring-4 sm:size-56 lg:size-64">
                {initials(fullName)}
              </div>
            )}
          </div>
        </div>
      </div>

      {featuredProjects.length > 0 ? (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold tracking-tight">Featured projects</h2>
            <Link href="/projects" className="text-muted-foreground hover:text-foreground text-sm">
              View all →
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </section>
      ) : null}

      {featuredPosts.length > 0 ? (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold tracking-tight">Recent writing</h2>
            <Link href="/blog" className="text-muted-foreground hover:text-foreground text-sm">
              View all →
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredPosts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
