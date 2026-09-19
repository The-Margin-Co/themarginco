import type { z } from "zod";
import { aboutDefaults, aboutSchema } from "@/lib/cms/pages/about";
import { blogDefaults, blogSchema } from "@/lib/cms/pages/blog";
import { caseStudiesDefaults, caseStudiesSchema } from "@/lib/cms/pages/case-studies";
import { contactDefaults, contactSchema } from "@/lib/cms/pages/contact";
import { homeDefaults, homeSchema } from "@/lib/cms/pages/home";
import { serviceDocs, serviceSchema } from "@/lib/cms/pages/service";
import { siteDefaults, siteSchema } from "@/lib/cms/pages/site";
import { pageSeoDefaults, type PageSeo } from "@/lib/seo/schema";

export type AutoSchema = "Organization" | "WebSite" | "WebPage" | "BreadcrumbList" | "Service" | "FAQPage" | "Blog";

type PageDef<S extends z.ZodObject> = {
  label: string;
  path: string;
  description: string;
  schema: S;
  defaults: z.infer<S>;
  seo: PageSeo;
  autoSchemas: AutoSchema[];
  /** Section key holding FAQs that feed FAQPage schema. */
  faqPath?: string;
};

const page = <S extends z.ZodObject>(def: PageDef<S>) => def;

const serviceSeo = (slug: keyof typeof serviceDocs, priority = 0.9) =>
  pageSeoDefaults({
    meta_title: `${serviceDocs[slug].legacy.seo.title} | The Margin Co`,
    meta_description: serviceDocs[slug].legacy.seo.description,
    sitemap: { include: true, priority, changefreq: "monthly" },
  });

// The one place that knows every editable page: loaders, revalidation, sitemap and admin all read from here.
export const PAGES = {
  home: page({
    label: "Home",
    path: "/",
    description: "Hero, services, case studies, process, testimonials, FAQ",
    schema: homeSchema,
    defaults: homeDefaults,
    seo: pageSeoDefaults({
      meta_title: "The Margin Co | Performance Marketing & Web Development Agency",
      meta_description: siteDefaults.brand.description,
      sitemap: { include: true, priority: 1, changefreq: "weekly" },
    }),
    autoSchemas: ["Organization", "WebSite", "WebPage", "FAQPage"],
    faqPath: "faq",
  }),
  about: page({
    label: "About",
    path: "/about",
    description: "Mission, values, expertise, commitments",
    schema: aboutSchema,
    defaults: aboutDefaults,
    seo: pageSeoDefaults({
      meta_title: "About Us | The Margin Co",
      meta_description:
        "The Margin Co is a performance marketing agency built around one number: the profit you keep. Meet our mission, growth ethos and expertise.",
    }),
    autoSchemas: ["WebPage", "BreadcrumbList"],
  }),
  contact: page({
    label: "Contact",
    path: "/contact",
    description: "Contact options and lead form",
    schema: contactSchema,
    defaults: contactDefaults,
    seo: pageSeoDefaults({
      meta_title: "Contact | The Margin Co",
      meta_description:
        "Book a free 30-minute strategy call with The Margin Co. Get an honest audit of your Meta Ads, Facebook Ads or website and a 48-hour action roadmap.",
      sitemap: { include: true, priority: 0.8, changefreq: "yearly" },
    }),
    autoSchemas: ["WebPage", "BreadcrumbList"],
  }),
  "services/meta-ads": page({
    label: "Meta Ads",
    path: "/services/meta-ads",
    description: "Service landing page",
    schema: serviceSchema,
    defaults: serviceDocs["services/meta-ads"].defaults,
    seo: serviceSeo("services/meta-ads"),
    autoSchemas: ["WebPage", "BreadcrumbList", "Service", "FAQPage"],
    faqPath: "faq",
  }),
  "services/facebook-ads": page({
    label: "Facebook Ads",
    path: "/services/facebook-ads",
    description: "Service landing page",
    schema: serviceSchema,
    defaults: serviceDocs["services/facebook-ads"].defaults,
    seo: serviceSeo("services/facebook-ads"),
    autoSchemas: ["WebPage", "BreadcrumbList", "Service", "FAQPage"],
    faqPath: "faq",
  }),
  "services/website-development": page({
    label: "Website Development",
    path: "/services/website-development",
    description: "Service landing page",
    schema: serviceSchema,
    defaults: serviceDocs["services/website-development"].defaults,
    seo: serviceSeo("services/website-development"),
    autoSchemas: ["WebPage", "BreadcrumbList", "Service", "FAQPage"],
    faqPath: "faq",
  }),
  blog: page({
    label: "Blog index",
    path: "/blog",
    description: "Blog header, empty state and article-page labels",
    schema: blogSchema,
    defaults: blogDefaults,
    seo: pageSeoDefaults({
      meta_title: "Blog | The Margin Co",
      meta_description:
        "Meta Ads playbooks, Facebook lead-gen strategy and conversion-focused web insights from The Margin Co.",
      sitemap: { include: true, priority: 0.8, changefreq: "weekly" },
    }),
    autoSchemas: ["WebPage", "BreadcrumbList", "Blog"],
  }),
  "case-studies": page({
    label: "Case studies index",
    path: "/case-studies",
    description: "Case studies header, empty state and detail-page labels",
    schema: caseStudiesSchema,
    defaults: caseStudiesDefaults,
    seo: pageSeoDefaults({
      meta_title: "Case Studies | The Margin Co",
      meta_description:
        "Real results from The Margin Co's Meta Ads, Facebook Ads and website development clients: the challenge, the approach and the numbers.",
      sitemap: { include: true, priority: 0.8, changefreq: "weekly" },
    }),
    autoSchemas: ["WebPage", "BreadcrumbList"],
  }),
};

export type PageSlug = keyof typeof PAGES;
export type PageContent<S extends PageSlug> = z.infer<(typeof PAGES)[S]["schema"]>;
export const PAGE_SLUGS = Object.keys(PAGES) as PageSlug[];

export const SITE = { label: "Site-wide content", schema: siteSchema, defaults: siteDefaults } as const;

export type DocSlug = PageSlug | "site";
export const DOC_SLUGS: DocSlug[] = ["site", ...PAGE_SLUGS];

export function isDocSlug(value: unknown): value is DocSlug {
  return typeof value === "string" && (value === "site" || value in PAGES);
}

export function docSchema(slug: DocSlug) {
  return slug === "site" ? SITE.schema : PAGES[slug].schema;
}

export function docDefaults(slug: DocSlug) {
  return slug === "site" ? SITE.defaults : PAGES[slug].defaults;
}

export function docLabel(slug: DocSlug) {
  return slug === "site" ? SITE.label : PAGES[slug].label;
}

/** Public paths that must be revalidated when this document is published. */
export function docPaths(slug: DocSlug): { path: string; type?: "layout" } {
  if (slug === "site") return { path: "/", type: "layout" };
  return { path: PAGES[slug].path };
}

export const SERVICE_SLUGS = ["services/meta-ads", "services/facebook-ads", "services/website-development"] as const;
export type ServiceDocSlug = (typeof SERVICE_SLUGS)[number];
