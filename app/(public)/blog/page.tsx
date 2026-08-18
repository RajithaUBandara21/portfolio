import Link from "next/link";
import type { Metadata } from "next";

import { BlogCard } from "@/components/blog/blog-card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { getAllTags, getPublishedPosts } from "@/features/blog/queries";

const description =
  "Engineering notes and technical write-ups on backend, distributed systems, and cloud infrastructure.";

export const metadata: Metadata = {
  title: "Blog",
  description,
  alternates: { canonical: "/blog" },
  openGraph: { title: "Blog", description, url: "/blog" },
  twitter: { title: "Blog", description },
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string; q?: string }>;
}) {
  const { tag, q } = await searchParams;
  const [posts, tags] = await Promise.all([
    getPublishedPosts({ tagSlug: tag, search: q }),
    getAllTags(),
  ]);

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-16">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Blog</h1>
        <p className="text-muted-foreground">Engineering notes and write-ups.</p>
      </div>

      <form className="max-w-sm" action="/blog" method="get">
        {tag ? <input type="hidden" name="tag" value={tag} /> : null}
        <Input type="search" name="q" defaultValue={q} placeholder="Search posts…" />
      </form>

      {tags.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          <Link href="/blog">
            <Badge variant={tag ? "outline" : "default"} className="cursor-pointer">
              All
            </Badge>
          </Link>
          {tags.map((t) => (
            <Link key={t.id} href={`/blog?tag=${t.slug}`}>
              <Badge variant={tag === t.slug ? "default" : "outline"} className="cursor-pointer">
                {t.name}
              </Badge>
            </Link>
          ))}
        </div>
      ) : null}

      {posts.length === 0 ? (
        <p className="text-muted-foreground rounded-lg border border-dashed p-12 text-center text-sm">
          No posts published yet.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
