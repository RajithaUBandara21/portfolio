import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/env", () => ({ env: {}, hasGithubIntegration: false }));

import { fetchGithubRepoStats, parseGithubRepoUrl } from "@/services/githubService";

describe("parseGithubRepoUrl", () => {
  it("extracts owner and repo from a standard GitHub URL", () => {
    expect(parseGithubRepoUrl("https://github.com/octocat/hello-world")).toEqual({
      owner: "octocat",
      repo: "hello-world",
    });
  });

  it("strips a trailing .git suffix", () => {
    expect(parseGithubRepoUrl("https://github.com/octocat/hello-world.git")).toEqual({
      owner: "octocat",
      repo: "hello-world",
    });
  });

  it("returns null for a non-GitHub URL", () => {
    expect(parseGithubRepoUrl("https://gitlab.com/octocat/hello-world")).toBeNull();
  });
});

describe("fetchGithubRepoStats", () => {
  it("returns null without throwing when GitHub integration is not configured", async () => {
    await expect(fetchGithubRepoStats("octocat", "hello-world")).resolves.toBeNull();
  });
});
