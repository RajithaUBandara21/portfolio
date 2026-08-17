import type { ProjectCategory, ProjectStatus } from "@prisma/client";

export const CATEGORY_LABELS: Record<ProjectCategory, string> = {
  AI_ML: "AI / ML",
  SOFTWARE_ENGINEERING: "Software Engineering",
  DISTRIBUTED_SYSTEMS: "Distributed Systems",
  CLOUD: "Cloud",
  DEVOPS: "DevOps",
  RESEARCH: "Research",
  BACKEND: "Backend",
  FRONTEND: "Frontend",
  MOBILE: "Mobile",
  DATA_ENGINEERING: "Data Engineering",
};

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  PLANNED: "Planned",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
  MAINTAINED: "Maintained",
  ARCHIVED: "Archived",
};

export const PROJECT_CATEGORIES = Object.keys(CATEGORY_LABELS) as ProjectCategory[];
export const PROJECT_STATUSES = Object.keys(STATUS_LABELS) as ProjectStatus[];
