"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { Skill } from "@prisma/client";

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { createSkillAction, deleteSkillAction, updateSkillAction } from "@/features/skills/actions";
import {
  type SkillInput,
  skillCategoryLabels,
  skillCategoryValues,
  skillLevelValues,
  skillSchema,
} from "@/schemas/skill.schema";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function SkillFormFields({
  defaultValues,
  onSaved,
  editingId,
}: {
  defaultValues: SkillInput;
  onSaved: () => void;
  editingId?: string;
}) {
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(skillSchema), defaultValues });

  async function onSubmit(values: SkillInput) {
    setFormError(null);
    const result = editingId
      ? await updateSkillAction(editingId, values)
      : await createSkillAction(values);
    if (!result.success) {
      setFormError(result.error);
      return;
    }
    toast.success("Skill saved");
    onSaved();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {formError ? <p className="text-destructive text-sm">{formError}</p> : null}
      <div className="flex flex-col gap-2">
        <Label htmlFor="skill-name">Name</Label>
        <Input
          id="skill-name"
          {...register("name")}
          onChange={(e) => {
            setValue("name", e.target.value);
            if (!editingId) setValue("slug", slugify(e.target.value));
          }}
        />
        {errors.name ? <p className="text-destructive text-sm">{errors.name.message}</p> : null}
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="skill-slug">Slug</Label>
        <Input id="skill-slug" {...register("slug")} />
        {errors.slug ? <p className="text-destructive text-sm">{errors.slug.message}</p> : null}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="skill-category">Category</Label>
          <Select
            defaultValue={defaultValues.category}
            onValueChange={(v) => setValue("category", v as SkillInput["category"])}
          >
            <SelectTrigger id="skill-category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {skillCategoryValues.map((c) => (
                <SelectItem key={c} value={c}>
                  {skillCategoryLabels[c]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="skill-level">Level</Label>
          <Select
            defaultValue={defaultValues.level}
            onValueChange={(v) => setValue("level", v as SkillInput["level"])}
          >
            <SelectTrigger id="skill-level">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {skillLevelValues.map((l) => (
                <SelectItem key={l} value={l}>
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="skill-description">Description</Label>
        <Textarea id="skill-description" rows={3} {...register("description")} />
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving…" : "Save skill"}
      </Button>
    </form>
  );
}

export function SkillManager({ skills }: { skills: Skill[] }) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);

  function handleSaved() {
    setCreateOpen(false);
    setEditingSkill(null);
    router.refresh();
  }

  async function handleDelete(skill: Skill) {
    if (!confirm(`Delete "${skill.name}"?`)) return;
    const result = await deleteSkillAction(skill.id);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Skill deleted");
    router.refresh();
  }

  const emptyDefaults: SkillInput = {
    name: "",
    slug: "",
    category: "LANGUAGE",
    level: "PROFICIENT",
    description: "",
    order: skills.length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Skills</h1>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>New skill</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New skill</DialogTitle>
            </DialogHeader>
            <SkillFormFields defaultValues={emptyDefaults} onSaved={handleSaved} />
          </DialogContent>
        </Dialog>
      </div>

      {skills.length === 0 ? (
        <p className="text-muted-foreground text-sm">No skills yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Level</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {skills.map((skill) => (
              <TableRow key={skill.id}>
                <TableCell className="font-medium">{skill.name}</TableCell>
                <TableCell>
                  <Badge variant="outline">{skillCategoryLabels[skill.category]}</Badge>
                </TableCell>
                <TableCell>{skill.level}</TableCell>
                <TableCell className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => setEditingSkill(skill)}>
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(skill)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={editingSkill !== null} onOpenChange={(open) => !open && setEditingSkill(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit skill</DialogTitle>
          </DialogHeader>
          {editingSkill ? (
            <SkillFormFields
              editingId={editingSkill.id}
              defaultValues={{
                name: editingSkill.name,
                slug: editingSkill.slug,
                category: editingSkill.category,
                level: editingSkill.level,
                description: editingSkill.description ?? "",
                order: editingSkill.order,
              }}
              onSaved={handleSaved}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
