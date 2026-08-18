import { Skeleton } from "@/components/ui/skeleton";

// Generic fallback for any public page without a more specific loading.tsx (project/blog lists
// below have layout-matched skeletons; this covers everything else with a minimal placeholder).
export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-16">
      <Skeleton className="h-9 w-1/3" />
      <Skeleton className="h-4 w-2/3" />
      <div className="space-y-3 pt-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}
