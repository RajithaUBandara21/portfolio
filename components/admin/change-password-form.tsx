"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changePasswordAction } from "@/features/auth/settings-actions";
import { type ChangePasswordInput, changePasswordSchema } from "@/schemas/auth.schema";

export function ChangePasswordForm() {
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordInput>({ resolver: zodResolver(changePasswordSchema) });

  async function onSubmit(values: ChangePasswordInput) {
    setFormError(null);
    setSuccess(false);

    const result = await changePasswordAction(values);
    if (!result.success) {
      setFormError(result.error);
      return;
    }

    setSuccess(true);
    reset();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex max-w-sm flex-col gap-4" noValidate>
      {formError ? (
        <Alert variant="destructive">
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      ) : null}
      {success ? (
        <Alert>
          <AlertDescription>
            Password updated. All other sessions have been signed out.
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-col gap-2">
        <Label htmlFor="currentPassword">Current password</Label>
        <Input
          id="currentPassword"
          type="password"
          autoComplete="current-password"
          {...register("currentPassword")}
          aria-invalid={Boolean(errors.currentPassword)}
        />
        {errors.currentPassword ? (
          <p className="text-destructive text-sm">{errors.currentPassword.message}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="newPassword">New password</Label>
        <Input
          id="newPassword"
          type="password"
          autoComplete="new-password"
          {...register("newPassword")}
          aria-invalid={Boolean(errors.newPassword)}
        />
        {errors.newPassword ? (
          <p className="text-destructive text-sm">{errors.newPassword.message}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="confirmPassword">Confirm new password</Label>
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          {...register("confirmPassword")}
          aria-invalid={Boolean(errors.confirmPassword)}
        />
        {errors.confirmPassword ? (
          <p className="text-destructive text-sm">{errors.confirmPassword.message}</p>
        ) : null}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Updating…" : "Update password"}
      </Button>
    </form>
  );
}
