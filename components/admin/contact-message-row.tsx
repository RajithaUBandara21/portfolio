"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import type { ContactMessageStatus } from "@prisma/client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateContactMessageStatusAction } from "@/features/contact/actions";

export function ContactMessageStatusSelect({
  id,
  status,
}: {
  id: string;
  status: ContactMessageStatus;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleChange(value: string) {
    setPending(true);
    const result = await updateContactMessageStatusAction(id, value as ContactMessageStatus);
    setPending(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <Select defaultValue={status} disabled={pending} onValueChange={handleChange}>
      <SelectTrigger className="w-32">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="NEW">NEW</SelectItem>
        <SelectItem value="READ">READ</SelectItem>
        <SelectItem value="ARCHIVED">ARCHIVED</SelectItem>
        <SelectItem value="SPAM">SPAM</SelectItem>
      </SelectContent>
    </Select>
  );
}
