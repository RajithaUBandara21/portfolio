// Renders a JSON-LD <script> tag per Next.js's documented pattern. JSON.stringify alone doesn't
// sanitize `<` sequences that could break out of the script tag context (e.g. a bio or blog title
// containing "</script>"), so every embed goes through this one component rather than being
// inlined ad hoc at each call site.
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
