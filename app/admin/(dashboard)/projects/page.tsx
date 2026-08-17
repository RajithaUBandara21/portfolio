import Link from "next/link";

import { ProjectRowActions } from "@/components/admin/project-row-actions";
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
import { getProjectsForAdmin } from "@/features/projects/queries";

export default async function AdminProjectsPage() {
  const projects = await getProjectsForAdmin();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Projects</h1>
        <Button asChild>
          <Link href="/admin/projects/new">New project</Link>
        </Button>
      </div>

      {projects.length === 0 ? (
        <p className="text-muted-foreground text-sm">No projects yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => (
              <TableRow key={project.id}>
                <TableCell>
                  <Link
                    href={`/admin/projects/${project.id}`}
                    className="font-medium hover:underline"
                  >
                    {project.title}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant={project.contentStatus === "PUBLISHED" ? "default" : "outline"}>
                    {project.contentStatus}
                  </Badge>
                </TableCell>
                <TableCell>{project.featured ? "Yes" : "—"}</TableCell>
                <TableCell>
                  <ProjectRowActions
                    id={project.id}
                    title={project.title}
                    contentStatus={project.contentStatus}
                    featured={project.featured}
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
