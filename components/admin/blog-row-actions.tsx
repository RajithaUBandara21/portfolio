"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import type { ContentStatus } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { deletePostAction, setPostStatusAction } from "@/features/blog/actions";

export function BlogRowActions({
  id,
  title,
  contentStatus,
}: {
  id: string;
  title: string;
  contentStatus: ContentStatus;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function togglePublish() {
    setPending(true);
    const result = await setPostStatusAction(
      id,
      contentStatus === "PUBLISHED" ? "DRAFT" : "PUBLISHED",
    );
    setPending(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm(`Delete "${title}"?`)) return;
    setPending(true);
    const result = await deletePostAction(id);
    setPending(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Post deleted");
    router.refresh();
  }

  return (
    <div className="flex justify-end gap-2">
      <Button variant="outline" size="sm" disabled={pending} onClick={togglePublish}>
        {contentStatus === "PUBLISHED" ? "Unpublish" : "Publish"}
      </Button>
      <Button variant="ghost" size="sm" disabled={pending} onClick={handleDelete}>
        Delete
      </Button>
    </div>
  );
}
