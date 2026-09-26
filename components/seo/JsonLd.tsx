/**
 * Server-rendered JSON-LD. `<` is escaped so no string in the data (a quote,
 * a verse, a question) can ever close the script tag early.
 */
export default function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
