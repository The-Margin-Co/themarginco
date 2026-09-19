import type { Metadata } from "next";
import type { SiteData } from "@/lib/cms/load";
import { SITE_URL } from "@/lib/site";
import { signOgTitle } from "@/lib/seo/og-sign";
import type { PageSeo, SiteSeo } from "@/lib/seo/schema";

export function absoluteUrl(pathOrUrl: string) {
  return new URL(pathOrUrl || "/", SITE_URL).toString();
}

/** Preview deployments and the "discourage search engines" switch both force noindex. */
export function indexingAllowed(siteSeo: SiteSeo) {
  const previewDeployment = Boolean(process.env.VERCEL_ENV) && process.env.VERCEL_ENV !== "production";
  return !siteSeo.robots.discourage && !previewDeployment;
}

export function splitKeywords(value: string) {
  return value
    .split(",")
    .map((keyword) => keyword.trim())
    .filter(Boolean);
}

export function defaultOgImage(title: string) {
  const trimmed = title.slice(0, 110).replace(/\s+/g, " ").trim();
  const signature = signOgTitle(trimmed);
  const query = new URLSearchParams({ title: trimmed, ...(signature ? { s: signature } : {}) });
  return `/og?${query.toString()}`;
}

type BuildOptions = {
  seo: PageSeo;
  site: SiteData;
  path: string;
  fallbackTitle: string;
  fallbackDescription?: string;
  image?: string | null;
  type?: "website" | "article";
  article?: { publishedTime?: string; modifiedTime?: string; section?: string };
};

export function resolveSeo({ seo, site, path, fallbackTitle, fallbackDescription, image }: BuildOptions) {
  const title = seo.meta_title || site.seo.title_template.replace("%s", fallbackTitle);
  const description = seo.meta_description || fallbackDescription || site.seo.default_description;
  const canonical = absoluteUrl(seo.canonical || path);
  const ogTitle = seo.og_title || title;
  const ogDescription = seo.og_description || description;
  const ogImage = seo.og_image || image || site.seo.default_og_image || defaultOgImage(ogTitle);
  const languages: Record<string, string> = {};
  for (const entry of seo.hreflang) languages[entry.lang] = entry.href ? absoluteUrl(entry.href) : canonical;
  if (Object.keys(languages).length > 0 && !languages["x-default"]) languages["x-default"] = canonical;
  const index = seo.robots.index && indexingAllowed(site.seo);
  return { title, description, canonical, ogTitle, ogDescription, ogImage, languages, index, follow: seo.robots.follow };
}

/** One place that turns page SEO + site defaults into Next metadata (used by every public page). */
export function buildMetadata(options: BuildOptions): Metadata {
  const { seo, site, type = "website", article } = options;
  const resolved = resolveSeo(options);
  const keywords = splitKeywords(seo.meta_keywords || site.seo.default_keywords);
  const handle = site.seo.twitter_handle ? `@${site.seo.twitter_handle.replace(/^@/, "")}` : undefined;

  return {
    title: { absolute: resolved.title },
    description: resolved.description,
    keywords: keywords.length ? keywords : undefined,
    alternates: {
      canonical: resolved.canonical,
      languages: Object.keys(resolved.languages).length ? resolved.languages : undefined,
    },
    robots: {
      index: resolved.index,
      follow: resolved.follow,
      googleBot: { index: resolved.index, follow: resolved.follow, "max-image-preview": "large" },
    },
    openGraph: {
      type,
      url: resolved.canonical,
      siteName: site.content.brand.name,
      locale: site.seo.og_locale,
      title: resolved.ogTitle,
      description: resolved.ogDescription,
      images: [{ url: resolved.ogImage, width: 1200, height: 630, alt: resolved.ogTitle }],
      ...(type === "article" && article ? article : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: resolved.ogTitle,
      description: resolved.ogDescription,
      images: [resolved.ogImage],
      ...(handle ? { site: handle, creator: handle } : {}),
    },
  };
}
