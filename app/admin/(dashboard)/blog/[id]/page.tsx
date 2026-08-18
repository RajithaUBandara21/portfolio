import { notFound } from "next/navigation";

import { BlogPostForm } from "@/components/admin/blog-post-form";
import { getPostForAdmin } from "@/features/blog/queries";
import type { BlogPostInput } from "@/schemas/blog.schema";

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getPostForAdmin(id);
  if (!post) notFound();

  const defaultValues: BlogPostInput = {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    contentMdx: post.contentMdx,
    coverImageUrl: post.coverImageUrl ?? "",
    contentStatus: post.contentStatus,
    tagNames: post.tags.map((t) => t.tag.name),
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Edit post</h1>
      <BlogPostForm defaultValues={defaultValues} postId={post.id} />
    </div>
  );
}
