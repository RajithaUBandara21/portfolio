"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { Certification } from "@prisma/client";

import { FileUploader } from "@/components/admin/file-uploader";
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
import { CATEGORY_LABELS } from "@/config/project";
import {
  createCertificationAction,
  deleteCertificationAction,
  updateCertificationAction,
} from "@/features/certifications/actions";
import { type CertificationInput, certificationSchema } from "@/schemas/certification.schema";
import { projectCategoryValues } from "@/schemas/project.schema";

function toDateInput(date: Date | null): string {
  return date ? date.toISOString().slice(0, 10) : "";
}

function CertificationFormFields({
  defaultValues,
  editingId,
  onSaved,
}: {
  defaultValues: CertificationInput;
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
  } = useForm({ resolver: zodResolver(certificationSchema), defaultValues });

  async function onSubmit(values: CertificationInput) {
    setFormError(null);
    const result = editingId
      ? await updateCertificationAction(editingId, values)
      : await createCertificationAction(values);
    if (!result.success) {
      setFormError(result.error);
      return;
    }
    toast.success("Certification saved");
    onSaved();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {formError ? <p className="text-destructive text-sm">{formError}</p> : null}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="cert-name">Name</Label>
          <Input id="cert-name" {...register("name")} />
          {errors.name ? <p className="text-destructive text-sm">{errors.name.message}</p> : null}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="cert-issuer">Issuer</Label>
          <Input id="cert-issuer" {...register("issuer")} />
          {errors.issuer ? (
            <p className="text-destructive text-sm">{errors.issuer.message}</p>
          ) : null}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="cert-category">Category</Label>
        <Select
          defaultValue={defaultValues.category}
          onValueChange={(v) => setValue("category", v as CertificationInput["category"])}
        >
          <SelectTrigger id="cert-category">
            <SelectValue placeholder="None" />
          </SelectTrigger>
          <SelectContent>
            {projectCategoryValues.map((c) => (
              <SelectItem key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="cert-issue-date">Issue date</Label>
          <Input id="cert-issue-date" type="date" {...register("issueDate")} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="cert-expiry-date">Expiry date</Label>
          <Input id="cert-expiry-date" type="date" {...register("expiryDate")} />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="cert-credential-url">Credential URL</Label>
        <Input id="cert-credential-url" {...register("credentialUrl")} />
        {errors.credentialUrl ? (
          <p className="text-destructive text-sm">{errors.credentialUrl.message}</p>
        ) : null}
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="cert-file">Certificate file (image or PDF)</Label>
        <FileUploader
          value={watch("fileUrl")}
          onChange={(url) => setValue("fileUrl", url)}
          accept="image/png,image/jpeg,image/webp,application/pdf"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="cert-status">Publish status</Label>
        <Select
          defaultValue={defaultValues.contentStatus}
          onValueChange={(v) => setValue("contentStatus", v as CertificationInput["contentStatus"])}
        >
          <SelectTrigger id="cert-status">
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
        {isSubmitting ? "Saving…" : "Save certification"}
      </Button>
    </form>
  );
}

export function CertificationManager({ certifications }: { certifications: Certification[] }) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Certification | null>(null);

  function handleSaved() {
    setCreateOpen(false);
    setEditing(null);
    router.refresh();
  }

  async function handleDelete(certification: Certification) {
    if (!confirm(`Delete "${certification.name}"?`)) return;
    const result = await deleteCertificationAction(certification.id);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Certification deleted");
    router.refresh();
  }

  const emptyDefaults: CertificationInput = {
    name: "",
    issuer: "",
    category: undefined,
    issueDate: "",
    expiryDate: "",
    credentialUrl: "",
    fileUrl: "",
    order: certifications.length,
    contentStatus: "DRAFT",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Certifications</h1>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>New certification</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>New certification</DialogTitle>
            </DialogHeader>
            <CertificationFormFields defaultValues={emptyDefaults} onSaved={handleSaved} />
          </DialogContent>
        </Dialog>
      </div>

      {certifications.length === 0 ? (
        <p className="text-muted-foreground text-sm">No certifications yet.</p>
      ) : (
        <div className="space-y-3">
          {certifications.map((certification) => (
            <div
              key={certification.id}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div>
                <p className="font-medium">
                  {certification.name} · {certification.issuer}
                </p>
                <p className="text-muted-foreground text-sm">
                  {toDateInput(certification.issueDate) || "No issue date"}
                </p>
                <Badge
                  variant={certification.contentStatus === "PUBLISHED" ? "default" : "outline"}
                  className="mt-1"
                >
                  {certification.contentStatus}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setEditing(certification)}>
                  Edit
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(certification)}>
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
            <DialogTitle>Edit certification</DialogTitle>
          </DialogHeader>
          {editing ? (
            <CertificationFormFields
              editingId={editing.id}
              defaultValues={{
                name: editing.name,
                issuer: editing.issuer,
                category: editing.category ?? undefined,
                issueDate: toDateInput(editing.issueDate),
                expiryDate: toDateInput(editing.expiryDate),
                credentialUrl: editing.credentialUrl ?? "",
                fileUrl: editing.fileUrl ?? "",
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
