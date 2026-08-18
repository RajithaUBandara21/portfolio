"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { Activity } from "@prisma/client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  createActivityAction,
  deleteActivityAction,
  updateActivityAction,
} from "@/features/activities/actions";
import { type ActivityInput, activitySchema, activityTypeValues } from "@/schemas/activity.schema";

function toDateInput(date: Date | null): string {
  return date ? date.toISOString().slice(0, 10) : "";
}

function ActivityFormFields({
  defaultValues,
  editingId,
  onSaved,
}: {
  defaultValues: ActivityInput;
  editingId?: string;
  onSaved: () => void;
}) {
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(activitySchema), defaultValues });

  async function onSubmit(values: ActivityInput) {
    setFormError(null);
    const result = editingId
      ? await updateActivityAction(editingId, values)
      : await createActivityAction(values);
    if (!result.success) {
      setFormError(result.error);
      return;
    }
    toast.success("Activity saved");
    onSaved();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {formError ? <p className="text-destructive text-sm">{formError}</p> : null}
      <div className="flex flex-col gap-2">
        <Label htmlFor="activity-title">Title</Label>
        <Input id="activity-title" {...register("title")} />
        {errors.title ? <p className="text-destructive text-sm">{errors.title.message}</p> : null}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="activity-type">Type</Label>
          <Select
            defaultValue={defaultValues.type}
            onValueChange={(v) => setValue("type", v as ActivityInput["type"])}
          >
            <SelectTrigger id="activity-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {activityTypeValues.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="activity-date">Date</Label>
          <Input id="activity-date" type="date" {...register("date")} />
          {errors.date ? <p className="text-destructive text-sm">{errors.date.message}</p> : null}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="activity-url">URL</Label>
        <Input id="activity-url" {...register("url")} />
        {errors.url ? <p className="text-destructive text-sm">{errors.url.message}</p> : null}
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="activity-description">Description</Label>
        <Textarea id="activity-description" rows={3} {...register("description")} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="activity-status">Publish status</Label>
        <Select
          defaultValue={defaultValues.contentStatus}
          onValueChange={(v) => setValue("contentStatus", v as ActivityInput["contentStatus"])}
        >
          <SelectTrigger id="activity-status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="DRAFT">DRAFT</SelectItem>
            <SelectItem value="PUBLISHED">PUBLISHED</SelectItem>
            <SelectItem value="ARCHIVED">ARCHIVED</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving…" : "Save activity"}
      </Button>
    </form>
  );
}

export function ActivityManager({ activities }: { activities: Activity[] }) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Activity | null>(null);

  function handleSaved() {
    setCreateOpen(false);
    setEditing(null);
    router.refresh();
  }

  async function handleDelete(activity: Activity) {
    if (!confirm(`Delete "${activity.title}"?`)) return;
    const result = await deleteActivityAction(activity.id);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Activity deleted");
    router.refresh();
  }

  const emptyDefaults: ActivityInput = {
    title: "",
    type: "talk",
    description: "",
    url: "",
    date: "",
    order: activities.length,
    contentStatus: "DRAFT",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Activities</h1>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>New activity</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New activity</DialogTitle>
            </DialogHeader>
            <ActivityFormFields defaultValues={emptyDefaults} onSaved={handleSaved} />
          </DialogContent>
        </Dialog>
      </div>

      {activities.length === 0 ? (
        <p className="text-muted-foreground text-sm">No activities yet.</p>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div>
                <p className="font-medium">{activity.title}</p>
                <p className="text-muted-foreground text-sm">
                  {activity.type} · {toDateInput(activity.date)}
                </p>
                <Badge
                  variant={activity.contentStatus === "PUBLISHED" ? "default" : "outline"}
                  className="mt-1"
                >
                  {activity.contentStatus}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setEditing(activity)}>
                  Edit
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(activity)}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit activity</DialogTitle>
          </DialogHeader>
          {editing ? (
            <ActivityFormFields
              editingId={editing.id}
              defaultValues={{
                title: editing.title,
                type: editing.type as ActivityInput["type"],
                description: editing.description ?? "",
                url: editing.url ?? "",
                date: toDateInput(editing.date),
                order: editing.order,
                contentStatus: editing.contentStatus,
              }}
              onSaved={handleSaved}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
