import Link from "next/link";

import { BlogRowActions } from "@/components/admin/blog-row-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getPostsForAdmin } from "@/features/blog/queries";

export default async function AdminBlogPage() {
  const posts = await getPostsForAdmin();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Blog</h1>
        <Button asChild>
          <Link href="/admin/blog/new">New post</Link>
        </Button>
      </div>

      {posts.length === 0 ? (
        <p className="text-muted-foreground text-sm">No posts yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((post) => (
              <TableRow key={post.id}>
                <TableCell>
                  <Link href={`/admin/blog/${post.id}`} className="font-medium hover:underline">
                    {post.title}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant={post.contentStatus === "PUBLISHED" ? "default" : "outline"}>
                    {post.contentStatus}
                  </Badge>
                </TableCell>
                <TableCell>
                  <BlogRowActions
                    id={post.id}
                    title={post.title}
                    contentStatus={post.contentStatus}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
