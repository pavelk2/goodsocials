/** A JSON-LD script tag. The body comes from jsonLd() in lib/structured-data.ts. */
export function JsonLd({ data }: { data: string }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: data }}
    />
  );
}
