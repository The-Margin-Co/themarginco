import { getCaseStudies } from "@/lib/case-studies";
import { getPublishedSeo } from "@/lib/cms/load";
import { PAGES } from "@/lib/cms/registry";
import { getPosts } from "@/lib/posts";
import { absoluteUrl, indexingAllowed } from "@/lib/seo/metadata";
import { parsePostSeo, type PostSeo } from "@/lib/seo/schema";

function languages(seo: Pick<PostSeo, "hreflang">, url: string) {
  if (seo.hreflang.length === 0) return undefined;
  const entries: Record<string, string> = {};
  for (const entry of seo.hreflang) entries[entry.lang] = entry.href ? absoluteUrl(entry.href) : url;
  entries["x-default"] ??= url;
  return { languages: entries };
}

export type SitemapEntry = {
  url: string;
  lastModified?: Date;
  changeFrequency: string;
  priority: number;
  alternates?: { languages: Record<string, string> };
};

export async function getSitemapEntries(): Promise<SitemapEntry[]> {
  const [{ site, pages }, posts, caseStudies] = await Promise.all([
    getPublishedSeo(),
    getPosts().catch(() => []),
    getCaseStudies().catch(() => []),
  ]);
  if (!indexingAllowed(site)) return [];

  // Pages set to noindex or excluded in their SEO settings never appear here.
  const pageEntries = pages
    .filter(({ seo }) => seo.robots.index && seo.sitemap.include)
    .map(({ slug, seo, publishedAt }) => {
      const url = absoluteUrl(seo.canonical || PAGES[slug].path);
      return {
        url,
        ...(publishedAt ? { lastModified: new Date(publishedAt) } : {}),
        changeFrequency: seo.sitemap.changefreq,
        priority: seo.sitemap.priority,
        alternates: languages(seo, url),
      };
    });

  const postEntries = posts
    .map((post) => ({ post, seo: parsePostSeo(post.seo) }))
    .filter(({ seo }) => seo.robots.index && seo.sitemap.include)
    .map(({ post, seo }) => {
      const url = absoluteUrl(seo.canonical || `/blog/${post.slug}`);
      return {
        url,
        lastModified: new Date(post.updated_at),
        changeFrequency: seo.sitemap.changefreq,
        priority: seo.sitemap.priority,
        alternates: languages(seo, url),
      };
    });

  const caseStudyEntries = caseStudies
    .map((caseStudy) => ({ caseStudy, seo: parsePostSeo(caseStudy.seo) }))
    .filter(({ seo }) => seo.robots.index && seo.sitemap.include)
    .map(({ caseStudy, seo }) => {
      const url = absoluteUrl(seo.canonical || `/case-studies/${caseStudy.slug}`);
      return {
        url,
        lastModified: new Date(caseStudy.updated_at),
        changeFrequency: seo.sitemap.changefreq,
        priority: seo.sitemap.priority,
        alternates: languages(seo, url),
      };
    });

  // Listing pages change whenever their newest item does, so borrow that date when the page
  // itself has none. (Only real dates are emitted: a made-up lastmod teaches crawlers to ignore it.)
  const newest = (items: { lastModified: Date }[]) =>
    items.reduce<Date | undefined>((max, item) => (!max || item.lastModified > max ? item.lastModified : max), undefined);
  const listingDates: Record<string, Date | undefined> = { "/blog": newest(postEntries), "/case-studies": newest(caseStudyEntries) };
  const pageList = pageEntries.map((entry) => {
    const path = new URL(entry.url).pathname.replace(/\/$/, "") || "/";
    const listed = listingDates[path];
    return !entry.lastModified && listed ? { ...entry, lastModified: listed } : entry;
  });

  return [...pageList, ...postEntries, ...caseStudyEntries];
}
