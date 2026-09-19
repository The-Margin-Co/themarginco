import { getSitemapEntries } from "@/lib/seo/sitemap";

export const revalidate = 300;

const escapeXml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

/**
 * Served as a route handler (not `app/sitemap.ts`) so it can link an XSL stylesheet: browsers show
 * a readable table for people, while crawlers still get plain sitemap XML.
 */
export async function GET() {
  const entries = await getSitemapEntries().catch(() => []);

  const urls = entries
    .map((entry) => {
      const alternates = Object.entries(entry.alternates?.languages ?? {})
        .map(([lang, href]) => `<xhtml:link rel="alternate" hreflang="${escapeXml(lang)}" href="${escapeXml(href)}"/>`)
        .join("");
      return [
        "<url>",
        `<loc>${escapeXml(entry.url)}</loc>`,
        entry.lastModified ? `<lastmod>${entry.lastModified.toISOString()}</lastmod>` : "",
        `<changefreq>${entry.changeFrequency}</changefreq>`,
        `<priority>${entry.priority.toFixed(1)}</priority>`,
        alternates,
        "</url>",
      ].join("");
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`;

  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
