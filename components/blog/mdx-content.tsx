import { MDXRemote } from "next-mdx-remote/rsc";

export function MdxContent({ source }: { source: string }) {
  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none">
      <MDXRemote source={source} />
    </div>
  );
}
