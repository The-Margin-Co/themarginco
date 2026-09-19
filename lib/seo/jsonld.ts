import type { SiteData } from "@/lib/cms/load";
import { SITE_URL } from "@/lib/site";
import { absoluteUrl } from "@/lib/seo/metadata";
import type { PageSeo } from "@/lib/seo/schema";

type JsonLd = Record<string, unknown>;

export function organizationSchema(site: SiteData): JsonLd {
  const org = site.seo.organization;
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: org.name || site.content.brand.name,
    url: SITE_URL,
    logo: org.logo || absoluteUrl("/icon.svg"),
    description: site.content.brand.description,
    ...(org.email ? { email: org.email } : {}),
    ...(org.phone ? { telephone: org.phone } : {}),
    ...(org.same_as.length ? { sameAs: org.same_as } : {}),
  };
}

export function websiteSchema(site: SiteData): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: site.content.brand.name,
    url: SITE_URL,
    inLanguage: site.seo.html_lang,
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}

export function webPageSchema(opts: { url: string; title: string; description: string; lang: string; type?: string }): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": opts.type ?? "WebPage",
    "@id": `${opts.url}#webpage`,
    url: opts.url,
    name: opts.title,
    description: opts.description,
    inLanguage: opts.lang,
    isPartOf: { "@id": `${SITE_URL}/#website` },
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function serviceSchema(opts: { name: string; description: string; url: string }): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: opts.name,
    description: opts.description,
    url: opts.url,
    serviceType: opts.name,
    areaServed: "Worldwide",
    provider: { "@id": `${SITE_URL}/#organization` },
  };
}

export function faqSchema(items: { question: string; answer: string }[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

/** Admin-authored JSON-LD blocks; invalid JSON is skipped rather than breaking the page. */
export function customSchemas(seo: Pick<PageSeo, "schemas">): JsonLd[] {
  const blocks: JsonLd[] = [];
  for (const block of seo.schemas) {
    if (!block.enabled) continue;
    try {
      const parsed = JSON.parse(block.json) as unknown;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        blocks.push({ "@context": "https://schema.org", ...(parsed as JsonLd) });
      }
    } catch {
      console.error(`[seo] Skipping invalid custom schema "${block.type}".`);
    }
  }
  return blocks;
}
