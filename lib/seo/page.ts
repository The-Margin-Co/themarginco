import type { Metadata } from "next";
import { getPage, getSite } from "@/lib/cms/load";
import { getAt } from "@/lib/cms/paths";
import { PAGES, type PageSlug } from "@/lib/cms/registry";
import {
  breadcrumbSchema,
  customSchemas,
  faqSchema,
  organizationSchema,
  serviceSchema,
  webPageSchema,
  websiteSchema,
} from "@/lib/seo/jsonld";
import { buildMetadata, resolveSeo } from "@/lib/seo/metadata";

export async function pageMetadata(slug: PageSlug): Promise<Metadata> {
  const [page, site] = await Promise.all([getPage(slug), getSite()]);
  const def = PAGES[slug];
  return buildMetadata({ seo: page.seo, site, path: def.path, fallbackTitle: def.label });
}

type FaqBlock = { visible?: boolean; items?: { question: string; answer: string }[] };

/** Automatic schemas for a page (from the registry) plus the admin's custom blocks. */
export async function pageJsonLd(slug: PageSlug) {
  const [page, site] = await Promise.all([getPage(slug), getSite()]);
  const def = PAGES[slug];
  const resolved = resolveSeo({ seo: page.seo, site, path: def.path, fallbackTitle: def.label });
  const content = page.content as Record<string, unknown>;
  const name = typeof content.name === "string" ? content.name : def.label;
  const blocks: Record<string, unknown>[] = [];

  for (const schema of def.autoSchemas) {
    switch (schema) {
      case "Organization":
        blocks.push(organizationSchema(site));
        break;
      case "WebSite":
        blocks.push(websiteSchema(site));
        break;
      case "WebPage":
      case "Blog":
        blocks.push(
          webPageSchema({
            url: resolved.canonical,
            title: resolved.title,
            description: resolved.description,
            lang: site.seo.html_lang,
            type: schema === "Blog" ? "Blog" : slug === "about" ? "AboutPage" : slug === "contact" ? "ContactPage" : "WebPage",
          }),
        );
        break;
      case "BreadcrumbList":
        blocks.push(
          breadcrumbSchema([
            { name: "Home", path: "/" },
            ...(def.path.startsWith("/services/") ? [{ name: "Services", path: "/#services" }] : []),
            { name, path: def.path },
          ]),
        );
        break;
      case "Service":
        blocks.push(serviceSchema({ name, description: resolved.description, url: resolved.canonical }));
        break;
      case "FAQPage": {
        const faq = (def.faqPath ? getAt(content, def.faqPath) : undefined) as FaqBlock | undefined;
        const items = faq?.items ?? [];
        if (page.seo.faq_schema && faq?.visible !== false && items.length > 0) blocks.push(faqSchema(items));
        break;
      }
    }
  }

  return [...blocks, ...customSchemas(page.seo)];
}
