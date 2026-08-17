"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { Experience } from "@prisma/client";

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
  createExperienceAction,
  deleteExperienceAction,
  updateExperienceAction,
} from "@/features/experience/actions";
import { type ExperienceInput, experienceSchema } from "@/schemas/experience.schema";

function toDateInput(date: Date | null): string {
  return date ? date.toISOString().slice(0, 10) : "";
}

function ExperienceFormFields({
  defaultValues,
  editingId,
  onSaved,
}: {
  defaultValues: ExperienceInput;
  editingId?: string;
  onSaved: () => void;
}) {
  const [formError, setFormError] = useState<string | null>(null);
  const [highlightsText, setHighlightsText] = useState(defaultValues.highlights.join("\n"));
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(experienceSchema), defaultValues });

  const [techInput, setTechInput] = useState("");
  const technologies = watch("technologies");

  async function onSubmit(values: ExperienceInput) {
    setFormError(null);
    const highlights = highlightsText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    const payload = { ...values, highlights };
    const result = editingId
      ? await updateExperienceAction(editingId, payload)
      : await createExperienceAction(payload);
    if (!result.success) {
      setFormError(result.error);
      return;
    }
    toast.success("Experience saved");
    onSaved();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {formError ? <p className="text-destructive text-sm">{formError}</p> : null}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="exp-company">Company</Label>
          <Input id="exp-company" {...register("company")} />
          {errors.company ? (
            <p className="text-destructive text-sm">{errors.company.message}</p>
          ) : null}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="exp-role">Role</Label>
          <Input id="exp-role" {...register("role")} />
          {errors.role ? <p className="text-destructive text-sm">{errors.role.message}</p> : null}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="exp-location">Location</Label>
        <Input id="exp-location" {...register("location")} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="exp-start">Start date</Label>
          <Input id="exp-start" type="date" {...register("startDate")} />
          {errors.startDate ? (
            <p className="text-destructive text-sm">{errors.startDate.message}</p>
          ) : null}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="exp-end">End date</Label>
          <Input id="exp-end" type="date" {...register("endDate")} disabled={watch("current")} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox
          id="exp-current"
          checked={watch("current")}
          onCheckedChange={(checked) => setValue("current", checked === true)}
        />
        <Label htmlFor="exp-current">Current role</Label>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="exp-summary">Summary</Label>
        <Textarea id="exp-summary" rows={3} {...register("summary")} />
        {errors.summary ? (
          <p className="text-destructive text-sm">{errors.summary.message}</p>
        ) : null}
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="exp-highlights">Highlights (one per line)</Label>
        <Textarea
          id="exp-highlights"
          rows={4}
          value={highlightsText}
          onChange={(e) => setHighlightsText(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="exp-tech-input">Technologies</Label>
        <div className="flex gap-2">
          <Input
            id="exp-tech-input"
            value={techInput}
            onChange={(e) => setTechInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const name = techInput.trim();
                if (name && !technologies.includes(name)) {
                  setValue("technologies", [...technologies, name]);
                }
                setTechInput("");
              }
            }}
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {technologies.map((t) => (
            <Badge key={t} variant="secondary" className="gap-1">
              {t}
              <button
                type="button"
                onClick={() =>
                  setValue(
                    "technologies",
                    technologies.filter((x) => x !== t),
                  )
                }
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="exp-status">Publish status</Label>
        <Select
          defaultValue={defaultValues.contentStatus}
          onValueChange={(v) => setValue("contentStatus", v as ExperienceInput["contentStatus"])}
        >
          <SelectTrigger id="exp-status">
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
        {isSubmitting ? "Saving…" : "Save experience"}
      </Button>
    </form>
  );
}

export function ExperienceManager({ experiences }: { experiences: Experience[] }) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Experience | null>(null);

  function handleSaved() {
    setCreateOpen(false);
    setEditing(null);
    router.refresh();
  }

  async function handleDelete(experience: Experience) {
    if (!confirm(`Delete "${experience.role} at ${experience.company}"?`)) return;
    const result = await deleteExperienceAction(experience.id);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Experience deleted");
    router.refresh();
  }

  const emptyDefaults: ExperienceInput = {
    company: "",
    role: "",
    location: "",
    startDate: "",
    endDate: "",
    current: false,
    summary: "",
    highlights: [],
    technologies: [],
    order: experiences.length,
    contentStatus: "DRAFT",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Experience</h1>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>New experience</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>New experience</DialogTitle>
            </DialogHeader>
            <ExperienceFormFields defaultValues={emptyDefaults} onSaved={handleSaved} />
          </DialogContent>
        </Dialog>
      </div>

      {experiences.length === 0 ? (
        <p className="text-muted-foreground text-sm">No experience entries yet.</p>
      ) : (
        <div className="space-y-3">
          {experiences.map((experience) => (
            <div
              key={experience.id}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div>
                <p className="font-medium">
                  {experience.role} · {experience.company}
                </p>
                <p className="text-muted-foreground text-sm">
                  {toDateInput(experience.startDate)} —{" "}
                  {experience.current ? "Present" : toDateInput(experience.endDate)}
                </p>
                <Badge
                  variant={experience.contentStatus === "PUBLISHED" ? "default" : "outline"}
                  className="mt-1"
                >
                  {experience.contentStatus}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setEditing(experience)}>
                  Edit
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(experience)}>
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
            <DialogTitle>Edit experience</DialogTitle>
          </DialogHeader>
          {editing ? (
            <ExperienceFormFields
              editingId={editing.id}
              defaultValues={{
                company: editing.company,
                role: editing.role,
                location: editing.location ?? "",
                startDate: toDateInput(editing.startDate),
                endDate: toDateInput(editing.endDate),
                current: editing.current,
                summary: editing.summary,
                highlights: editing.highlights,
                technologies: editing.technologies,
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
