"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";

import { FileUploader } from "@/components/admin/file-uploader";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateProfileAction } from "@/features/profile/actions";
import { type ProfileInput, profileSchema } from "@/schemas/profile.schema";

export function ProfileForm({ defaultValues }: { defaultValues: ProfileInput }) {
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(profileSchema), defaultValues });

  const { fields, append, remove } = useFieldArray({ control, name: "socialLinks" });

  async function onSubmit(values: ProfileInput) {
    setFormError(null);
    const result = await updateProfileAction(values);
    if (!result.success) {
      setFormError(result.error);
      return;
    }
    toast.success("Profile saved");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6" noValidate>
      {formError ? (
        <Alert variant="destructive">
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="fullName">Full name</Label>
          <Input id="fullName" {...register("fullName")} aria-invalid={Boolean(errors.fullName)} />
          {errors.fullName ? (
            <p className="text-destructive text-sm">{errors.fullName.message}</p>
          ) : null}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="headline">Headline</Label>
          <Input id="headline" {...register("headline")} aria-invalid={Boolean(errors.headline)} />
          {errors.headline ? (
            <p className="text-destructive text-sm">{errors.headline.message}</p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea id="bio" rows={6} {...register("bio")} aria-invalid={Boolean(errors.bio)} />
        {errors.bio ? <p className="text-destructive text-sm">{errors.bio.message}</p> : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="location">Location</Label>
          <Input id="location" {...register("location")} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Public email</Label>
          <Input id="email" type="email" {...register("email")} />
          {errors.email ? <p className="text-destructive text-sm">{errors.email.message}</p> : null}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="availability">Availability</Label>
          <Input id="availability" {...register("availability")} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="yearsExperience">Years of experience</Label>
          <Input
            id="yearsExperience"
            type="number"
            min={0}
            {...register("yearsExperience", { valueAsNumber: true })}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Avatar</Label>
          <FileUploader
            value={watch("avatarUrl")}
            onChange={(url) => setValue("avatarUrl", url, { shouldValidate: true })}
            accept="image/png,image/jpeg,image/webp"
          />
          {errors.avatarUrl ? (
            <p className="text-destructive text-sm">{errors.avatarUrl.message}</p>
          ) : null}
        </div>
        <div className="flex flex-col gap-2">
          <Label>Résumé (PDF)</Label>
          <FileUploader
            value={watch("resumeUrl")}
            onChange={(url) => setValue("resumeUrl", url, { shouldValidate: true })}
            accept="application/pdf"
          />
          {errors.resumeUrl ? (
            <p className="text-destructive text-sm">{errors.resumeUrl.message}</p>
          ) : null}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Social links</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ platform: "", url: "", order: fields.length })}
          >
            Add link
          </Button>
        </div>
        {fields.map((field, index) => (
          <div key={field.id} className="flex gap-2">
            <Input
              placeholder="Platform (e.g. github)"
              {...register(`socialLinks.${index}.platform`)}
              className="w-40"
            />
            <Input
              placeholder="https://..."
              {...register(`socialLinks.${index}.url`)}
              className="flex-1"
            />
            <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}>
              Remove
            </Button>
          </div>
        ))}
        {errors.socialLinks?.length ? (
          <p className="text-destructive text-sm">Check the social link URLs above.</p>
        ) : null}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving…" : "Save profile"}
      </Button>
    </form>
  );
}
