import { ArrowLeft, CalendarDays, Clock } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogCard } from "@/components/blog/BlogCard";
import { PostContent } from "@/components/blog/PostContent";
import { JsonLd } from "@/components/seo/JsonLd";
import { at, EditableText, type Bind } from "@/components/cms/Editable";
import { CtaBand } from "@/components/home/CtaBand";
import { Badge } from "@/components/ui/Badge";
import { Container, Section } from "@/components/ui/Container";
import { getPage, getSite } from "@/lib/cms/load";
import { getAllSlugs, getPostBySlug, getRecentPosts } from "@/lib/posts";
import { SITE_URL } from "@/lib/site";
import { breadcrumbSchema, customSchemas } from "@/lib/seo/jsonld";
import { absoluteUrl, buildMetadata } from "@/lib/seo/metadata";
import { parsePostSeo } from "@/lib/seo/schema";
import { formatDate, readingTime } from "@/lib/utils";

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await getAllSlugs().catch(() => []);
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug).catch(() => null);
  if (!post) return { title: "Article not found" };

  const site = await getSite();
  return buildMetadata({
    seo: {
      ...parsePostSeo(post.seo),
      meta_title: post.meta_title ?? "",
      meta_description: post.meta_description ?? "",
      meta_keywords: post.meta_keywords ?? "",
      faq_schema: false,
    },
    site,
    path: `/blog/${post.slug}`,
    fallbackTitle: post.title,
    fallbackDescription: post.excerpt,
    image: post.featured_image,
    type: "article",
    article: {
      publishedTime: post.published_at ?? post.created_at,
      modifiedTime: post.updated_at,
      section: post.category,
    },
  });
}

export default async function BlogPostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = await getPostBySlug(slug).catch(() => null);
  if (!post) notFound();

  const [related, { content }, site] = await Promise.all([
    getRecentPosts(3, post.slug).catch(() => []),
    getPage("blog"),
    getSite(),
  ]);
  const copy = content.post;
  const POST: Bind = { doc: "blog", path: "post" };

  const postSeo = parsePostSeo(post.seo);
  const url = absoluteUrl(postSeo.canonical || `/blog/${post.slug}`);
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "@id": `${url}#article`,
      headline: post.title,
      description: post.meta_description || post.excerpt,
      datePublished: post.published_at ?? post.created_at,
      dateModified: post.updated_at,
      articleSection: post.category,
      inLanguage: site.seo.html_lang,
      ...(post.featured_image ? { image: [post.featured_image] } : {}),
      ...(post.meta_keywords ? { keywords: post.meta_keywords } : {}),
      mainEntityOfPage: url,
      author: { "@type": "Organization", name: site.content.brand.name, url: SITE_URL },
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
    breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Blog", path: "/blog" },
      { name: post.title, path: `/blog/${post.slug}` },
    ]),
    ...customSchemas(postSeo),
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
              href="/blog"
              className="inline-flex items-center gap-2 text-sm font-medium transition-colors hover:text-gold"
            >
              <ArrowLeft aria-hidden className="size-4" />
              <EditableText bind={at(POST, "backLabel")} value={copy.backLabel} />
            </Link>
            <div className="mt-8 flex flex-wrap items-center gap-4 text-sm">
              <Badge>{post.category}</Badge>
              <span className="flex items-center gap-1.5">
                <CalendarDays aria-hidden className="size-4 text-gold" />
                <time dateTime={post.published_at ?? post.created_at}>
                  {formatDate(post.published_at ?? post.created_at)}
                </time>
              </span>
              <span className="flex items-center gap-1.5">
                <Clock aria-hidden className="size-4 text-gold" />
                {readingTime(post.content)} min read
              </span>
            </div>
            <h1 className="mt-6 text-balance text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl">
              {post.title}
            </h1>
            <p className="mt-6 text-pretty text-xl leading-relaxed text-zinc-300">{post.excerpt}</p>
          </Container>
        </header>

        {post.featured_image && (
          <Container className="max-w-5xl pt-10 lg:pt-14">
            <div className="relative aspect-[1200/630] overflow-hidden rounded-3xl border border-line bg-charcoal shadow-card">
              <Image
                src={post.featured_image}
                alt={post.featured_image_alt ?? ""}
                fill
                priority
                sizes="(min-width: 1024px) 64rem, 100vw"
                className="object-cover"
              />
            </div>
          </Container>
        )}

        <Container className="max-w-3xl py-14 lg:py-20">
          <PostContent html={post.content} />
        </Container>
      </article>

      <CtaBand
        site={site.content}
        heading={{
          title: copy.ctaTitle,
          highlight: copy.ctaHighlight,
          titleBind: at(POST, "ctaTitle"),
          highlightBind: at(POST, "ctaHighlight"),
        }}
      />

      {related.length > 0 && (
        <Section className="border-t border-line pt-16 sm:pt-20">
          <Container>
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              <EditableText bind={at(POST, "relatedTitle")} value={copy.relatedTitle} />{" "}
              <EditableText bind={at(POST, "relatedHighlight")} value={copy.relatedHighlight} className="text-highlight" />
            </h2>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {related.map((item) => (
                <BlogCard key={item.id} post={item} />
              ))}
            </div>
          </Container>
        </Section>
      )}
    </>
  );
}
