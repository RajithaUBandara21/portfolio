import { NextResponse } from "next/server";

import { fetchGithubRepoStats, parseGithubRepoUrl } from "@/services/githubService";
import { hasGithubIntegration } from "@/lib/env";

export async function GET(request: Request) {
  const url = new URL(request.url).searchParams.get("repoUrl");
  if (!url) {
    return NextResponse.json({ available: false, error: "Missing repoUrl" }, { status: 400 });
  }

  if (!hasGithubIntegration) {
    return NextResponse.json({ available: false });
  }

  const parsed = parseGithubRepoUrl(url);
  if (!parsed) {
    return NextResponse.json(
      { available: false, error: "Not a GitHub repository URL" },
      { status: 400 },
    );
  }

  const stats = await fetchGithubRepoStats(parsed.owner, parsed.repo);
  if (!stats) {
    return NextResponse.json({ available: false });
  }

  return NextResponse.json({ available: true, ...stats });
}
