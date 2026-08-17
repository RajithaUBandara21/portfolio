"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { deleteProjectAction, setProjectFlagsAction } from "@/features/projects/actions";
import type { ContentStatus } from "@prisma/client";

export function ProjectRowActions({
  id,
  title,
  contentStatus,
  featured,
}: {
  id: string;
  title: string;
  contentStatus: ContentStatus;
  featured: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function togglePublish() {
    setPending(true);
    const nextStatus: ContentStatus = contentStatus === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    const result = await setProjectFlagsAction(id, { contentStatus: nextStatus });
    setPending(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success(nextStatus === "PUBLISHED" ? "Published" : "Unpublished");
    router.refresh();
  }

  async function toggleFeatured() {
    setPending(true);
    const result = await setProjectFlagsAction(id, { featured: !featured });
    setPending(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setPending(true);
    const result = await deleteProjectAction(id);
    setPending(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Project deleted");
    router.refresh();
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <Button variant="outline" size="sm" disabled={pending} onClick={toggleFeatured}>
        {featured ? "Unfeature" : "Feature"}
      </Button>
      <Button variant="outline" size="sm" disabled={pending} onClick={togglePublish}>
        {contentStatus === "PUBLISHED" ? "Unpublish" : "Publish"}
      </Button>
      <Button variant="ghost" size="sm" disabled={pending} onClick={handleDelete}>
        Delete
      </Button>
    </div>
  );
}
