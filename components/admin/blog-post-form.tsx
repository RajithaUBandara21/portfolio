"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { FileUploader } from "@/components/admin/file-uploader";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { createPostAction, updatePostAction } from "@/features/blog/actions";
import { type BlogPostInput, blogPostSchema } from "@/schemas/blog.schema";

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function BlogPostForm({
  defaultValues,
  postId,
}: {
  defaultValues: BlogPostInput;
  postId?: string;
}) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(blogPostSchema), defaultValues });

  const [tagInput, setTagInput] = useState("");
  const tagNames = watch("tagNames");

  async function onSubmit(values: BlogPostInput) {
    setFormError(null);
    const result = postId ? await updatePostAction(postId, values) : await createPostAction(values);
    if (!result.success) {
      setFormError(result.error);
      return;
    }
    toast.success("Post saved");
    router.push(`/admin/blog/${result.data.id}`);
    router.refresh();
  }

  function addTag() {
    const name = tagInput.trim();
    if (!name || tagNames.includes(name)) return;
    setValue("tagNames", [...tagNames, name]);
    setTagInput("");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl space-y-5" noValidate>
      {formError ? (
        <Alert variant="destructive">
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="post-title">Title</Label>
          <Input
            id="post-title"
            {...register("title")}
            onChange={(e) => {
              setValue("title", e.target.value);
              if (!postId) setValue("slug", slugify(e.target.value));
            }}
          />
          {errors.title ? <p className="text-destructive text-sm">{errors.title.message}</p> : null}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="post-slug">Slug</Label>
          <Input id="post-slug" {...register("slug")} />
          {errors.slug ? <p className="text-destructive text-sm">{errors.slug.message}</p> : null}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="post-excerpt">Excerpt</Label>
        <Textarea id="post-excerpt" rows={2} {...register("excerpt")} />
        {errors.excerpt ? (
          <p className="text-destructive text-sm">{errors.excerpt.message}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="post-cover">Cover image</Label>
        <FileUploader
          value={watch("coverImageUrl")}
          onChange={(url) => setValue("coverImageUrl", url)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="post-content">Content (MDX / Markdown)</Label>
        <Textarea
          id="post-content"
          rows={16}
          className="font-mono text-sm"
          {...register("contentMdx")}
        />
        {errors.contentMdx ? (
          <p className="text-destructive text-sm">{errors.contentMdx.message}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="post-tag-input">Tags</Label>
        <div className="flex gap-2">
          <Input
            id="post-tag-input"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag();
              }
            }}
          />
          <Button type="button" variant="outline" onClick={addTag}>
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {tagNames.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1">
              {tag}
              <button
                type="button"
                onClick={() =>
                  setValue(
                    "tagNames",
                    tagNames.filter((t) => t !== tag),
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
        <Label htmlFor="post-status">Publish status</Label>
        <Select
          defaultValue={defaultValues.contentStatus}
          onValueChange={(v) => setValue("contentStatus", v as BlogPostInput["contentStatus"])}
        >
          <SelectTrigger id="post-status" className="w-48">
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
        {isSubmitting ? "Saving…" : "Save post"}
      </Button>
    </form>
  );
}
