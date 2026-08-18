"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { type ContactFormInput, contactFormSchema } from "@/schemas/contact.schema";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(contactFormSchema),
    defaultValues: { name: "", email: "", subject: "", message: "", website: "", renderedAt: 0 },
  });

  useEffect(() => {
    // Set on the client, after hydration — an SSR-computed timestamp would reflect render
    // time, not when this user's browser actually loaded the page, defeating the check.
    setValue("renderedAt", Date.now());
  }, [setValue]);

  async function onSubmit(values: ContactFormInput) {
    setStatus("idle");
    setErrorMessage(null);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = await response.json();
      if (!result.success) {
        setStatus("error");
        setErrorMessage(result.error ?? "Something went wrong. Please try again.");
        return;
      }
      setStatus("success");
      // This runs only inside a submit handler, never during render — Date.now() here is safe,
      // but the compiler's purity check flags any impure call reachable from the component body.
      // eslint-disable-next-line react-hooks/purity
      reset({ name: "", email: "", subject: "", message: "", website: "", renderedAt: Date.now() });
    } catch {
      setStatus("error");
      setErrorMessage("Something went wrong. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg space-y-4" noValidate>
      {status === "success" ? (
        <Alert>
          <AlertDescription>Thanks — your message has been sent.</AlertDescription>
        </Alert>
      ) : null}
      {status === "error" ? (
        <Alert variant="destructive">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      ) : null}

      {/* Honeypot: hidden from real users via CSS, not `type="hidden"`, so basic bots that skip
          hidden fields but fill every visible-looking input still get caught. */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" tabIndex={-1} autoComplete="off" {...register("website")} />
      </div>
      <input type="hidden" {...register("renderedAt")} />

      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" {...register("name")} aria-invalid={Boolean(errors.name)} />
        {errors.name ? <p className="text-destructive text-sm">{errors.name.message}</p> : null}
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          {...register("email")}
          aria-invalid={Boolean(errors.email)}
        />
        {errors.email ? <p className="text-destructive text-sm">{errors.email.message}</p> : null}
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="subject">Subject</Label>
        <Input id="subject" {...register("subject")} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          rows={5}
          {...register("message")}
          aria-invalid={Boolean(errors.message)}
        />
        {errors.message ? (
          <p className="text-destructive text-sm">{errors.message.message}</p>
        ) : null}
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
