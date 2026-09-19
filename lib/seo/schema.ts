import { z } from "zod";
import { isMediaUrl } from "@/lib/media";

export const CHANGE_FREQS = ["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"] as const;
export type ChangeFreq = (typeof CHANGE_FREQS)[number];

const HREFLANG = /^([a-z]{2,3}(-[A-Za-z]{2,4})?|x-default)$/;
// `/^\/(?!\/)/` so a protocol-relative "//evil.com" is not mistaken for a local path.
const PATH_OR_HTTPS = (value: string) =>
  value === "" || (/^\/(?!\/)/.test(value) && !value.includes("..")) || /^https:\/\//.test(value);

export function isJsonObject(value: string) {
  try {
    const parsed: unknown = JSON.parse(value);
    return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed);
  } catch {
    return false;
  }
}

const trimmed = (max: number) => z.string().trim().max(max);

export const customSchemaBlock = z.object({
  id: z.string().min(1).max(40),
  type: trimmed(40),
  enabled: z.boolean(),
  json: z.string().max(20_000, "Keep each schema under 20 KB.").refine(isJsonObject, "Enter a valid JSON object."),
});

export const pageSeoSchema = z.object({
  meta_title: trimmed(70),
  meta_description: trimmed(170),
  meta_keywords: trimmed(255),
  focus_keyword: trimmed(80),
  canonical: trimmed(500).refine(PATH_OR_HTTPS, "Use a /path or an https:// URL."),
  robots: z.object({ index: z.boolean(), follow: z.boolean() }),
  og_title: trimmed(95),
  og_description: trimmed(200),
  og_image: z.string().trim().refine((url) => url === "" || isMediaUrl(url), "Upload the image with the uploader."),
  hreflang: z
    .array(
      z.object({
        lang: z.string().trim().regex(HREFLANG, "Use a language code like en, en-GB or ar."),
        href: trimmed(500).refine(PATH_OR_HTTPS, "Use a /path or an https:// URL (blank = this page)."),
      }),
    )
    .max(12),
  sitemap: z.object({
    include: z.boolean(),
    priority: z.number().min(0).max(1),
    changefreq: z.enum(CHANGE_FREQS),
  }),
  faq_schema: z.boolean(),
  schemas: z.array(customSchemaBlock).max(20),
});

export type PageSeo = z.infer<typeof pageSeoSchema>;

export function pageSeoDefaults(overrides: Partial<PageSeo> = {}): PageSeo {
  return {
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
    focus_keyword: "",
    canonical: "",
    robots: { index: true, follow: true },
    og_title: "",
    og_description: "",
    og_image: "",
    hreflang: [{ lang: "en", href: "" }],
    sitemap: { include: true, priority: 0.7, changefreq: "monthly" },
    faq_schema: true,
    schemas: [],
    ...overrides,
  };
}

/** Advanced SEO for blog posts; title/description/keywords live on the post row itself. */
export const postSeoSchema = pageSeoSchema.omit({
  meta_title: true,
  meta_description: true,
  meta_keywords: true,
  faq_schema: true,
});

export type PostSeo = z.infer<typeof postSeoSchema>;

export function postSeoDefaults(): PostSeo {
  // Parsing strips the page-only keys that postSeoSchema omits.
  return postSeoSchema.parse(pageSeoDefaults({ sitemap: { include: true, priority: 0.6, changefreq: "monthly" } }));
}

export function parsePostSeo(raw: unknown): PostSeo {
  const defaults = postSeoDefaults();
  const merged = { ...defaults, ...(typeof raw === "object" && raw ? raw : {}) };
  const result = postSeoSchema.safeParse(merged);
  return result.success ? result.data : defaults;
}

const pathList = z.array(trimmed(200).refine((path) => path.startsWith("/"), "Paths must start with /")).max(30);

export const siteSeoSchema = z.object({
  title_template: trimmed(80).refine((value) => value.includes("%s"), "Include %s where the page title goes."),
  default_title: trimmed(70),
  default_description: trimmed(170),
  default_keywords: trimmed(255),
  default_og_image: z.string().trim().refine((url) => url === "" || isMediaUrl(url), "Upload the image with the uploader."),
  html_lang: z.string().trim().regex(/^[a-z]{2,3}(-[A-Z]{2})?$/, "Use a language code like en or en-GB."),
  og_locale: z.string().trim().regex(/^[a-z]{2}_[A-Z]{2}$/, "Use a locale like en_US."),
  twitter_handle: trimmed(30),
  organization: z.object({
    name: trimmed(100),
    logo: z.string().trim().refine((url) => url === "" || isMediaUrl(url), "Upload the logo with the uploader."),
    email: trimmed(120),
    phone: trimmed(40),
    same_as: z.array(trimmed(300).refine((url) => /^https:\/\//.test(url), "Use https:// profile URLs.")).max(10),
  }),
  verification: z.object({ google: trimmed(120), bing: trimmed(120) }),
  robots: z.object({
    discourage: z.boolean(),
    rules: z
      .array(z.object({ user_agent: trimmed(80).min(1), allow: pathList, disallow: pathList }))
      .max(10),
  }),
});

export type SiteSeo = z.infer<typeof siteSeoSchema>;

export const siteSeoDefaults: SiteSeo = {
  title_template: "%s | The Margin Co",
  default_title: "The Margin Co | Performance Marketing & Web Development Agency",
  default_description:
    "The Margin Co is a performance marketing agency that scales brands with profit-first Meta Ads, Facebook Ads and conversion-engineered websites.",
  default_keywords: "performance marketing agency, meta ads agency, facebook ads agency, website development",
  default_og_image: "",
  html_lang: "en",
  og_locale: "en_US",
  twitter_handle: "",
  organization: {
    name: "The Margin Co",
    logo: "",
    email: "",
    phone: "",
    same_as: ["https://www.instagram.com/join_margin/"],
  },
  verification: { google: "", bing: "" },
  robots: { discourage: false, rules: [] },
};

export const SCHEMA_TEMPLATES: Record<string, object> = {
  Service: {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "",
    description: "",
    provider: { "@type": "Organization", name: "The Margin Co" },
    areaServed: "Worldwide",
  },
  ProfessionalService: {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "The Margin Co",
    url: "",
    email: "",
    priceRange: "$$",
  },
  LocalBusiness: {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "",
    telephone: "",
    address: { "@type": "PostalAddress", streetAddress: "", addressLocality: "", addressCountry: "" },
    openingHours: "Mo-Fr 09:00-18:00",
  },
  HowTo: {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "",
    step: [{ "@type": "HowToStep", name: "", text: "" }],
  },
  Review: {
    "@context": "https://schema.org",
    "@type": "Review",
    itemReviewed: { "@type": "Organization", name: "The Margin Co" },
    reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
    author: { "@type": "Person", name: "" },
    reviewBody: "",
  },
  VideoObject: {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: "",
    description: "",
    thumbnailUrl: "",
    uploadDate: "",
    contentUrl: "",
  },
  Custom: { "@context": "https://schema.org", "@type": "" },
};
