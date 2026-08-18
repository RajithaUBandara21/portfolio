import type { Activity } from "@prisma/client";

import { db } from "@/services/db";

export function listPublishedActivities(): Promise<Activity[]> {
  return db.activity.findMany({
    where: { contentStatus: "PUBLISHED" },
    orderBy: { date: "desc" },
  });
}

export function listActivitiesForAdmin(): Promise<Activity[]> {
  return db.activity.findMany({ orderBy: { date: "desc" } });
}

export interface SaveActivityInput {
  title: string;
  type: string;
  description: string | null;
  url: string | null;
  date: Date;
  order: number;
  contentStatus: Activity["contentStatus"];
}

export function createActivity(input: SaveActivityInput): Promise<Activity> {
  return db.activity.create({ data: input });
}

export function updateActivity(id: string, input: SaveActivityInput): Promise<Activity> {
  return db.activity.update({ where: { id }, data: input });
}

export function deleteActivity(id: string): Promise<void> {
  return db.activity.delete({ where: { id } }).then(() => undefined);
}
