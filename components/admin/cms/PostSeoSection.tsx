"use client";

import { pageSeoDefaults, postSeoSchema, type PageSeo, type PostSeo } from "@/lib/seo/schema";
import { PageSeoFields } from "./PageSeoFields";
import { SchemaBlocks } from "./SchemaBlocks";

export type PostMeta = { meta_title: string; meta_description: string; meta_keywords: string };

function toPostSeo(seo: PageSeo): PostSeo {
  return Object.fromEntries(Object.keys(postSeoSchema.shape).map((key) => [key, seo[key as keyof PageSeo]])) as PostSeo;
}

/**
 * Blog posts share the page SEO UI: title/description/keywords live on the post row,
 * everything else (canonical, robots, OG, hreflang, sitemap, schema) in posts.seo.
 */
export function PostSeoSection({
  meta,
  seo,
  onMetaChange,
  onSeoChange,
  errors,
  slug,
  fallbackTitle,
  fallbackDescription,
  image,
}: {
  meta: PostMeta;
  seo: PostSeo;
  onMetaChange: (meta: PostMeta) => void;
  onSeoChange: (seo: PostSeo) => void;
  errors: Record<string, string>;
  slug: string;
  fallbackTitle: string;
  fallbackDescription: string;
  image: string;
}) {
  const combined: PageSeo = { ...pageSeoDefaults(), ...seo, ...meta, faq_schema: false };

  return (
    <div className="space-y-6">
      <PageSeoFields
        seo={combined}
        onChange={(next) => {
          if (next.meta_title !== meta.meta_title || next.meta_description !== meta.meta_description || next.meta_keywords !== meta.meta_keywords) {
            onMetaChange({ meta_title: next.meta_title, meta_description: next.meta_description, meta_keywords: next.meta_keywords });
          }
          onSeoChange(toPostSeo(next));
        }}
        errors={errors}
        path={`/blog/${slug || "your-post-slug"}`}
        fallbackTitle={fallbackTitle}
        fallbackDescription={fallbackDescription}
        showFaqToggle={false}
        imageFallback={image}
      />
      <SchemaBlocks
        blocks={seo.schemas}
        onChange={(schemas) => onSeoChange({ ...seo, schemas })}
        autoSchemas={[
          { name: "BlogPosting", active: true, note: "headline, dates, image, author" },
          { name: "BreadcrumbList", active: true },
        ]}
      />
    </div>
  );
}
