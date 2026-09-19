import { ArrowLeft, CalendarDays, Clock } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CaseStudyCard } from "@/components/case-studies/CaseStudyCard";
import { CaseStudyMetrics } from "@/components/case-studies/CaseStudyMetrics";
import { PostContent } from "@/components/blog/PostContent";
import { at, EditableText, type Bind } from "@/components/cms/Editable";
import { JsonLd } from "@/components/seo/JsonLd";
import { CtaBand } from "@/components/home/CtaBand";
import { Badge } from "@/components/ui/Badge";
import { Container, Section } from "@/components/ui/Container";
import { getAllCaseStudySlugs, getCaseStudyBySlug, getRecentCaseStudies } from "@/lib/case-studies";
import { getPage, getSite } from "@/lib/cms/load";
import { breadcrumbSchema, customSchemas } from "@/lib/seo/jsonld";
import { absoluteUrl, buildMetadata } from "@/lib/seo/metadata";
import { parsePostSeo } from "@/lib/seo/schema";
import { SITE_URL } from "@/lib/site";
import type { CaseStudyMetric } from "@/lib/types";
import { formatDate, readingTime } from "@/lib/utils";

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await getAllCaseStudySlugs().catch(() => []);
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/case-studies/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const caseStudy = await getCaseStudyBySlug(slug).catch(() => null);
  if (!caseStudy) return { title: "Case study not found" };

  const site = await getSite();
  return buildMetadata({
    seo: {
      ...parsePostSeo(caseStudy.seo),
      meta_title: caseStudy.meta_title ?? "",
      meta_description: caseStudy.meta_description ?? "",
      meta_keywords: caseStudy.meta_keywords ?? "",
      faq_schema: false,
    },
    site,
    path: `/case-studies/${caseStudy.slug}`,
    fallbackTitle: caseStudy.title,
    fallbackDescription: caseStudy.excerpt,
    image: caseStudy.featured_image,
    type: "article",
    article: {
      publishedTime: caseStudy.published_at ?? caseStudy.created_at,
      modifiedTime: caseStudy.updated_at,
      section: caseStudy.industry,
    },
  });
}

export default async function CaseStudyPage({ params }: PageProps<"/case-studies/[slug]">) {
  const { slug } = await params;
  const caseStudy = await getCaseStudyBySlug(slug).catch(() => null);
  if (!caseStudy) notFound();

  const [related, { content }, site] = await Promise.all([
    getRecentCaseStudies(3, caseStudy.slug).catch(() => []),
    getPage("case-studies"),
    getSite(),
  ]);
  const copy = content.caseStudy;
  const metrics = (caseStudy.metrics as CaseStudyMetric[] | null) ?? [];
  const PAGE: Bind = { doc: "case-studies", path: "caseStudy" };

  const seo = parsePostSeo(caseStudy.seo);
  const url = absoluteUrl(seo.canonical || `/case-studies/${caseStudy.slug}`);
  // Schema.org has no dedicated "case study" type; Article is the closest fit.
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      "@id": `${url}#article`,
      headline: caseStudy.title,
      description: caseStudy.meta_description || caseStudy.excerpt,
      datePublished: caseStudy.published_at ?? caseStudy.created_at,
      dateModified: caseStudy.updated_at,
      articleSection: "Case Study",
      inLanguage: site.seo.html_lang,
      ...(caseStudy.featured_image ? { image: [caseStudy.featured_image] } : {}),
      ...(caseStudy.meta_keywords ? { keywords: caseStudy.meta_keywords } : {}),
      mainEntityOfPage: url,
      author: { "@type": "Organization", name: site.content.brand.name, url: SITE_URL },
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
    breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Case Studies", path: "/case-studies" },
      { name: caseStudy.title, path: `/case-studies/${caseStudy.slug}` },
    ]),
    ...customSchemas(seo),
  ];

  return (
    <>
      <JsonLd data={jsonLd} />

      <article>
        <header className="relative overflow-hidden border-b border-line">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_70%_70%_at_50%_0%,black,transparent)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[48rem] -translate-x-1/2 rounded-full bg-accent/[0.08] blur-3xl"
          />
          <Container className="relative max-w-4xl pb-14 pt-10 lg:pb-16 lg:pt-14">
            <Link
              href="/case-studies"
              className="inline-flex items-center gap-2 text-sm font-medium transition-colors hover:text-gold"
            >
              <ArrowLeft aria-hidden className="size-4" />
              <EditableText bind={at(PAGE, "backLabel")} value={copy.backLabel} />
            </Link>
            <div className="mt-8 flex flex-wrap items-center gap-4 text-sm">
              <Badge>{caseStudy.industry}</Badge>
              {caseStudy.channels && <span className="text-muted">{caseStudy.channels}</span>}
              <span className="flex items-center gap-1.5">
                <CalendarDays aria-hidden className="size-4 text-gold" />
                <time dateTime={caseStudy.published_at ?? caseStudy.created_at}>
                  {formatDate(caseStudy.published_at ?? caseStudy.created_at)}
                </time>
              </span>
              <span className="flex items-center gap-1.5">
                <Clock aria-hidden className="size-4 text-gold" />
                {readingTime(caseStudy.content)} min read
              </span>
            </div>
            <h1 className="mt-6 text-balance text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl">
              {caseStudy.title}
            </h1>
            <p className="mt-6 text-pretty text-xl leading-relaxed text-fg/80">{caseStudy.excerpt}</p>
            {metrics.length > 0 && <CaseStudyMetrics metrics={metrics} className="mt-8 grid grid-cols-3 gap-3 sm:max-w-lg" />}
          </Container>
        </header>

        {caseStudy.featured_image && (
          <Container className="max-w-5xl pt-10 lg:pt-14">
            <div className="relative aspect-[1200/630] overflow-hidden rounded-3xl border border-line bg-charcoal shadow-card">
              <Image
                src={caseStudy.featured_image}
                alt={caseStudy.featured_image_alt ?? ""}
                fill
                priority
                sizes="(min-width: 1024px) 64rem, 100vw"
                className="object-cover"
              />
            </div>
          </Container>
        )}

        <Container className="max-w-3xl py-14 lg:py-20">
          <PostContent html={caseStudy.content} />
        </Container>
      </article>

      <CtaBand
        site={site.content}
        heading={{
          title: copy.ctaTitle,
          highlight: copy.ctaHighlight,
          titleBind: at(PAGE, "ctaTitle"),
          highlightBind: at(PAGE, "ctaHighlight"),
        }}
      />

      {related.length > 0 && (
        <Section className="border-t border-line pt-16 sm:pt-20">
          <Container>
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              <EditableText bind={at(PAGE, "relatedTitle")} value={copy.relatedTitle} />{" "}
              <EditableText bind={at(PAGE, "relatedHighlight")} value={copy.relatedHighlight} className="text-highlight" />
            </h2>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {related.map((item) => (
                <CaseStudyCard key={item.id} caseStudy={item} />
              ))}
            </div>
          </Container>
        </Section>
      )}
    </>
  );
}
