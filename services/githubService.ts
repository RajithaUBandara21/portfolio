import "server-only";

import { env, hasGithubIntegration } from "@/lib/env";
import { logger } from "@/lib/logger";

export interface GithubRepoStats {
  stars: number;
  forks: number;
  language: string | null;
  updatedAt: string;
}

export function parseGithubRepoUrl(url: string): { owner: string; repo: string } | null {
  const match = url.match(/^https?:\/\/github\.com\/([^/]+)\/([^/?#]+)/);
  if (!match) return null;
  return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
}

// Never throws — GitHub being unreachable/misconfigured/rate-limited degrades to `null` so
// callers can render a "GitHub stats unavailable" state instead of crashing the page.
export async function fetchGithubRepoStats(
  owner: string,
  repo: string,
): Promise<GithubRepoStats | null> {
  if (!hasGithubIntegration) return null;

  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${env.GITHUB_TOKEN}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      logger.warn({ owner, repo, status: response.status }, "GitHub API returned a non-OK status");
      return null;
    }

    const data = await response.json();
    return {
      stars: data.stargazers_count ?? 0,
      forks: data.forks_count ?? 0,
      language: data.language ?? null,
      updatedAt: data.pushed_at ?? data.updated_at,
    };
  } catch (error) {
    logger.warn({ err: error, owner, repo }, "GitHub API request failed");
    return null;
  }
}
