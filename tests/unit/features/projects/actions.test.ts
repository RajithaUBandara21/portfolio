import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  requireAdminSessionMock,
  setProjectFlagsMock,
  updateTagMock,
  revalidatePathMock,
} = vi.hoisted(() => ({
  requireAdminSessionMock: vi.fn(),
  setProjectFlagsMock: vi.fn(),
  updateTagMock: vi.fn(),
  revalidatePathMock: vi.fn(),
}));

vi.mock("next/cache", () => ({
  updateTag: updateTagMock,
  revalidatePath: revalidatePathMock,
}));

vi.mock("@/features/auth/session", () => ({
  requireAdminSession: requireAdminSessionMock,
}));

vi.mock("@/features/projects/queries", () => ({
  PROJECTS_CACHE_TAG: "projects",
}));

vi.mock("@/services/projectService", () => ({
  createProject: vi.fn(),
  deleteProject: vi.fn(),
  updateProject: vi.fn(),
  setProjectFlags: setProjectFlagsMock,
}));

import { setProjectFlagsAction } from "@/features/projects/actions";

describe("setProjectFlagsAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireAdminSessionMock.mockResolvedValue(undefined);
    setProjectFlagsMock.mockResolvedValue(undefined);
  });

  it("revalidates project pages after publishing state changes", async () => {
    const result = await setProjectFlagsAction("project-id", { contentStatus: "DRAFT" });

    expect(result).toEqual({ success: true, data: undefined });
    expect(setProjectFlagsMock).toHaveBeenCalledWith("project-id", { contentStatus: "DRAFT" });
    expect(updateTagMock).toHaveBeenCalledWith("projects");
    expect(revalidatePathMock).toHaveBeenCalledWith("/projects");
    expect(revalidatePathMock).toHaveBeenCalledWith("/projects/[slug]", "page");
  });
});
