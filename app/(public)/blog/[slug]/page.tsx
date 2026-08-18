import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { MdxContent } from "@/components/blog/mdx-content";
import { JsonLd } from "@/components/json-ld";
import { Badge } from "@/components/ui/badge";
import { siteConfig } from "@/config/site";
import { getPublishedPostBySlug, getRelatedPosts } from "@/features/blog/queries";
import { formatDate } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url: `/blog/${post.slug}`,
      publishedTime: post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined,
      authors: [siteConfig.name],
      tags: post.tags.map((t) => t.tag.name),
      ...(post.coverImageUrl ? { images: [{ url: post.coverImageUrl }] } : {}),
    },
    twitter: {
      title: post.title,
      description: post.excerpt,
      ...(post.coverImageUrl ? { images: [post.coverImageUrl] } : {}),
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) notFound();

  const related = await getRelatedPosts(
    post.id,
    post.tags.map((t) => t.tagId),
  );

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-16">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.excerpt,
          url: `${siteConfig.url}/blog/${post.slug}`,
          ...(post.publishedAt ? { datePublished: new Date(post.publishedAt).toISOString() } : {}),
          dateModified: new Date(post.updatedAt).toISOString(),
          author: { "@type": "Person", name: siteConfig.name, url: siteConfig.url },
          ...(post.coverImageUrl ? { image: post.coverImageUrl } : {}),
          keywords: post.tags.map((t) => t.tag.name).join(", "),
        }}
      />
      <header className="space-y-4">
        <div className="flex flex-wrap gap-1.5">
          {post.tags.map(({ tag }) => (
            <Badge key={tag.id} variant="secondary">
              {tag.name}
            </Badge>
          ))}
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{post.title}</h1>
        <p className="text-muted-foreground text-sm">
          {formatDate(post.publishedAt)}
          {" · "}
          {post.readingTimeMin} min read
        </p>
      </header>

      {post.coverImageUrl ? (
        <div className="bg-muted relative aspect-video overflow-hidden rounded-lg">
          <Image src={post.coverImageUrl} alt={post.title} fill className="object-cover" />
        </div>
      ) : null}

      <MdxContent source={post.contentMdx} />

      {related.length > 0 ? (
        <section className="space-y-4 border-t pt-8">
          <h2 className="text-xl font-semibold">Related posts</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {related.map((r) => (
              <Link
                key={r.id}
                href={`/blog/${r.slug}`}
                className="hover:bg-accent block rounded-lg border p-3 transition-colors"
              >
                <p className="font-medium">{r.title}</p>
                <p className="text-muted-foreground text-sm">{r.excerpt}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
