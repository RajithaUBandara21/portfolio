import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <Card>
        <CardHeader>
          <CardTitle>Content management</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground text-sm">
          Profile, project, and content management panels land here as each phase is built.
        </CardContent>
      </Card>
    </div>
  );
}
