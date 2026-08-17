import type { Technology } from "@prisma/client";
import type { Prisma } from "@prisma/client";

import { db } from "@/services/db";

export function listTechnologies(): Promise<Technology[]> {
  return db.technology.findMany({ orderBy: { name: "asc" } });
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Called inside the caller's transaction so technology creation and the project's join-table
// writes commit atomically.
export async function findOrCreateTechnologiesByNames(
  tx: Prisma.TransactionClient,
  names: string[],
): Promise<Technology[]> {
  const unique = Array.from(new Set(names.map((n) => n.trim()).filter(Boolean)));
  const results: Technology[] = [];
  for (const name of unique) {
    const technology = await tx.technology.upsert({
      where: { name },
      update: {},
      create: { name, slug: slugify(name) },
    });
    results.push(technology);
  }
  return results;
}
