import type { Profile, SocialLink } from "@prisma/client";

import { db } from "@/services/db";

export type ProfileWithLinks = Profile & { socialLinks: SocialLink[] };

export function findProfile(): Promise<ProfileWithLinks | null> {
  return db.profile.findFirst({
    include: { socialLinks: { orderBy: { order: "asc" } } },
  });
}

export interface UpsertProfileInput {
  fullName: string;
  headline: string;
  bio: string;
  avatarUrl?: string | null;
  resumeUrl?: string | null;
  location?: string | null;
  email?: string | null;
  availability?: string | null;
  yearsExperience?: number | null;
  socialLinks: Array<{ platform: string; url: string; order: number }>;
}

// Profile is a singleton (at most one row). Social links are replaced wholesale on every save
// rather than diffed — the list is always small (a handful of platforms), so a delete+recreate
// inside one transaction is simpler than tracking per-row identity and just as correct.
export async function upsertProfile(input: UpsertProfileInput): Promise<ProfileWithLinks> {
  const existing = await db.profile.findFirst({ select: { id: true } });

  const data = {
    fullName: input.fullName,
    headline: input.headline,
    bio: input.bio,
    avatarUrl: input.avatarUrl || null,
    resumeUrl: input.resumeUrl || null,
    location: input.location || null,
    email: input.email || null,
    availability: input.availability || null,
    yearsExperience: input.yearsExperience ?? null,
  };

  return db.$transaction(async (tx) => {
    const profile = existing
      ? await tx.profile.update({ where: { id: existing.id }, data })
      : await tx.profile.create({ data });

    await tx.socialLink.deleteMany({ where: { profileId: profile.id } });
    if (input.socialLinks.length > 0) {
      await tx.socialLink.createMany({
        data: input.socialLinks.map((link) => ({ ...link, profileId: profile.id })),
      });
    }

    const socialLinks = await tx.socialLink.findMany({
      where: { profileId: profile.id },
      orderBy: { order: "asc" },
    });

    return { ...profile, socialLinks };
  });
}
