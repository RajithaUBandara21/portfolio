"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { Education } from "@prisma/client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
  createEducationAction,
  deleteEducationAction,
  updateEducationAction,
} from "@/features/education/actions";
import { type EducationInput, educationSchema } from "@/schemas/education.schema";

function toDateInput(date: Date | null): string {
  return date ? date.toISOString().slice(0, 10) : "";
}

function EducationFormFields({
  defaultValues,
  editingId,
  onSaved,
}: {
  defaultValues: EducationInput;
  editingId?: string;
  onSaved: () => void;
}) {
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(educationSchema), defaultValues });

  async function onSubmit(values: EducationInput) {
    setFormError(null);
    const result = editingId
      ? await updateEducationAction(editingId, values)
      : await createEducationAction(values);
    if (!result.success) {
      setFormError(result.error);
      return;
    }
    toast.success("Education saved");
    onSaved();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {formError ? <p className="text-destructive text-sm">{formError}</p> : null}
      <div className="flex flex-col gap-2">
        <Label htmlFor="edu-institution">Institution</Label>
        <Input id="edu-institution" {...register("institution")} />
        {errors.institution ? (
          <p className="text-destructive text-sm">{errors.institution.message}</p>
        ) : null}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="edu-degree">Degree</Label>
          <Input id="edu-degree" {...register("degree")} />
          {errors.degree ? (
            <p className="text-destructive text-sm">{errors.degree.message}</p>
          ) : null}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="edu-field">Field of study</Label>
          <Input id="edu-field" {...register("fieldOfStudy")} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="edu-start">Start date</Label>
          <Input id="edu-start" type="date" {...register("startDate")} />
          {errors.startDate ? (
            <p className="text-destructive text-sm">{errors.startDate.message}</p>
          ) : null}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="edu-end">End date</Label>
          <Input id="edu-end" type="date" {...register("endDate")} disabled={watch("current")} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox
          id="edu-current"
          checked={watch("current")}
          onCheckedChange={(checked) => setValue("current", checked === true)}
        />
        <Label htmlFor="edu-current">Currently studying here</Label>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="edu-description">Description</Label>
        <Textarea id="edu-description" rows={3} {...register("description")} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="edu-status">Publish status</Label>
        <Select
          defaultValue={defaultValues.contentStatus}
          onValueChange={(v) => setValue("contentStatus", v as EducationInput["contentStatus"])}
        >
          <SelectTrigger id="edu-status">
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
        {isSubmitting ? "Saving…" : "Save education"}
      </Button>
    </form>
  );
}

export function EducationManager({ educationEntries }: { educationEntries: Education[] }) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Education | null>(null);

  function handleSaved() {
    setCreateOpen(false);
    setEditing(null);
    router.refresh();
  }

  async function handleDelete(education: Education) {
    if (!confirm(`Delete "${education.degree} at ${education.institution}"?`)) return;
    const result = await deleteEducationAction(education.id);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Education deleted");
    router.refresh();
  }

  const emptyDefaults: EducationInput = {
    institution: "",
    degree: "",
    fieldOfStudy: "",
    startDate: "",
    endDate: "",
    current: false,
    description: "",
    order: educationEntries.length,
    contentStatus: "DRAFT",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Education</h1>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>New education</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>New education</DialogTitle>
            </DialogHeader>
            <EducationFormFields defaultValues={emptyDefaults} onSaved={handleSaved} />
          </DialogContent>
        </Dialog>
      </div>

      {educationEntries.length === 0 ? (
        <p className="text-muted-foreground text-sm">No education entries yet.</p>
      ) : (
        <div className="space-y-3">
          {educationEntries.map((education) => (
            <div
              key={education.id}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div>
                <p className="font-medium">
                  {education.degree} · {education.institution}
                </p>
                <p className="text-muted-foreground text-sm">
                  {toDateInput(education.startDate)} —{" "}
                  {education.current ? "Present" : toDateInput(education.endDate)}
                </p>
                <Badge
                  variant={education.contentStatus === "PUBLISHED" ? "default" : "outline"}
                  className="mt-1"
                >
                  {education.contentStatus}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setEditing(education)}>
                  Edit
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(education)}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit education</DialogTitle>
          </DialogHeader>
          {editing ? (
            <EducationFormFields
              editingId={editing.id}
              defaultValues={{
                institution: editing.institution,
                degree: editing.degree,
                fieldOfStudy: editing.fieldOfStudy ?? "",
                startDate: toDateInput(editing.startDate),
                endDate: toDateInput(editing.endDate),
                current: editing.current,
                description: editing.description ?? "",
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
