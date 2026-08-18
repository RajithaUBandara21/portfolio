import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import type { BlogPostWithTags } from "@/services/blogService";

export function BlogCard({ post }: { post: BlogPostWithTags }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <Card className="h-full overflow-hidden py-0 transition-all duration-200 group-hover:shadow-md motion-safe:group-hover:-translate-y-1">
        {post.coverImageUrl ? (
          <div className="bg-muted relative aspect-video w-full overflow-hidden">
            <Image src={post.coverImageUrl} alt={post.title} fill className="object-cover" />
          </div>
        ) : null}
        <CardHeader className="pt-5">
          <h3 className="text-lg font-semibold">{post.title}</h3>
          <p className="text-muted-foreground text-xs">
            {formatDate(post.publishedAt, { month: "short", day: "numeric", year: "numeric" })}
            {" · "}
            {post.readingTimeMin} min read
          </p>
        </CardHeader>
        <CardContent className="space-y-3 pb-5">
          <p className="text-muted-foreground text-sm">{post.excerpt}</p>
          {post.tags.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {post.tags.map(({ tag }) => (
                <Badge key={tag.id} variant="outline" className="text-xs">
                  {tag.name}
                </Badge>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </Link>
  );
}
