"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type LoginInput, loginSchema } from "@/schemas/auth.schema";

export function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginInput) {
    setFormError(null);

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const result = await response.json();

    if (!result.success) {
      setFormError(result.error ?? "Something went wrong. Try again.");
      return;
    }

    router.push(next);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      {formError ? (
        <Alert variant="destructive">
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          {...register("email")}
          aria-invalid={Boolean(errors.email)}
        />
        {errors.email ? <p className="text-destructive text-sm">{errors.email.message}</p> : null}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          {...register("password")}
          aria-invalid={Boolean(errors.password)}
        />
        {errors.password ? (
          <p className="text-destructive text-sm">{errors.password.message}</p>
        ) : null}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
