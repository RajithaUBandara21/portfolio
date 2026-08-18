import { Star, GitFork } from "lucide-react";

import { fetchGithubRepoStats, parseGithubRepoUrl } from "@/services/githubService";

export async function GithubStats({ repoUrl }: { repoUrl: string }) {
  const parsed = parseGithubRepoUrl(repoUrl);
  if (!parsed) return null;

  const stats = await fetchGithubRepoStats(parsed.owner, parsed.repo);
  // Gracefully render nothing when GitHub integration isn't configured or the API call fails
  // — the rest of the page (which already links to `repoUrl` directly) is unaffected.
  if (!stats) return null;

  return (
    <div className="text-muted-foreground flex items-center gap-4 text-sm">
      <span className="flex items-center gap-1">
        <Star className="size-4" /> {stats.stars}
      </span>
      <span className="flex items-center gap-1">
        <GitFork className="size-4" /> {stats.forks}
      </span>
      {stats.language ? <span>{stats.language}</span> : null}
    </div>
  );
}
