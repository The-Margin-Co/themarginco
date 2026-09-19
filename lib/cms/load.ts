import { draftMode } from "next/headers";
import { cache } from "react";
import type { z } from "zod";
import { getStaffSession, type StaffRole } from "@/lib/auth";
import { deepMerge } from "@/lib/cms/paths";
import { PAGES, SITE, type DocSlug, type PageContent, type PageSlug } from "@/lib/cms/registry";
import type { SiteContent } from "@/lib/cms/pages/site";
import { pageSeoSchema, siteSeoDefaults, siteSeoSchema, type PageSeo, type SiteSeo } from "@/lib/seo/schema";
import { createPublicClient } from "@/lib/supabase/public";

export type EditState =
  | { editing: false }
  | { editing: true; role: StaffRole; email: string; canEditContent: boolean };

/**
 * Edit mode = Draft Mode cookie + a verified staff session. Visitors never have the
 * cookie, so reading draftMode() keeps their pages static and nothing else runs.
 */
export const getEditState = cache(async (): Promise<EditState> => {
  const draft = await draftMode();
  if (!draft.isEnabled) return { editing: false };
  const session = await getStaffSession();
  if (session.state !== "staff") return { editing: false };
  return {
    editing: true,
    role: session.role,
    email: session.user.email ?? "",
    canEditContent: session.role === "admin",
  };
});

// Invalid sections fall back to their defaults so one bad field never breaks a page.
export function parseWithFallback<S extends z.ZodObject>(schema: S, defaults: z.infer<S>, raw: unknown, label: string): z.infer<S> {
  const merged = deepMerge(defaults, raw ?? {});
  const full = schema.safeParse(merged);
  if (full.success) return full.data;

  const result: Record<string, unknown> = {};
  for (const [key, sectionSchema] of Object.entries(schema.shape)) {
    const section = (sectionSchema as z.ZodType).safeParse((merged as Record<string, unknown>)[key]);
    if (section.success) result[key] = section.data;
    else {
      console.error(`[cms] ${label}.${key} is invalid; using defaults.`, section.error.issues.slice(0, 3));
      result[key] = (defaults as Record<string, unknown>)[key];
    }
  }
  return result as z.infer<S>;
}

type RawDoc = {
  content: unknown;
  seo: unknown;
  contentPublishedAt: string | null;
  seoPublishedAt: string | null;
  hasContentDraft: boolean;
  hasSeoDraft: boolean;
};

const readDoc = cache(async (slug: DocSlug): Promise<RawDoc> => {
  const edit = await getEditState();
  const doc: RawDoc = {
    content: null,
    seo: null,
    contentPublishedAt: null,
    seoPublishedAt: null,
    hasContentDraft: false,
    hasSeoDraft: false,
  };

  const publicClient = createPublicClient();
  if (publicClient) {
    const { data, error } = await publicClient
      .from("pages")
      .select("content, seo, content_published_at, seo_published_at")
      .eq("slug", slug)
      .maybeSingle();
    if (error) console.error(`[cms] Failed to load "${slug}"; rendering defaults.`, error.message);
    if (data) {
      doc.content = data.content;
      doc.seo = data.seo;
      doc.contentPublishedAt = data.content_published_at;
      doc.seoPublishedAt = data.seo_published_at;
    }
  }

  if (edit.editing) {
    const session = await getStaffSession();
    if (session.state === "staff") {
      const [contentDraft, seoDraft] = await Promise.all([
        session.supabase.from("page_content_drafts").select("content").eq("slug", slug).maybeSingle(),
        session.supabase.from("page_seo_drafts").select("seo").eq("slug", slug).maybeSingle(),
      ]);
      if (contentDraft.data) {
        doc.content = contentDraft.data.content;
        doc.hasContentDraft = true;
      }
      if (seoDraft.data) {
        doc.seo = seoDraft.data.seo;
        doc.hasSeoDraft = true;
      }
    }
  }
  return doc;
});

export type PageData<S extends PageSlug> = {
  slug: S;
  content: PageContent<S>;
  seo: PageSeo;
  contentPublishedAt: string | null;
  seoPublishedAt: string | null;
  hasContentDraft: boolean;
  hasSeoDraft: boolean;
};

export async function getPage<S extends PageSlug>(slug: S): Promise<PageData<S>> {
  const def = PAGES[slug];
  const raw = await readDoc(slug);
  return {
    slug,
    content: parseWithFallback(def.schema as z.ZodObject, def.defaults, raw.content, slug) as PageContent<S>,
    seo: parseWithFallback(pageSeoSchema, def.seo, raw.seo, `${slug}.seo`),
    contentPublishedAt: raw.contentPublishedAt,
    seoPublishedAt: raw.seoPublishedAt,
    hasContentDraft: raw.hasContentDraft,
    hasSeoDraft: raw.hasSeoDraft,
  };
}

export type SiteData = {
  content: SiteContent;
  seo: SiteSeo;
  hasContentDraft: boolean;
  hasSeoDraft: boolean;
};

export async function getSite(): Promise<SiteData> {
  const raw = await readDoc("site");
  return {
    content: parseWithFallback(SITE.schema, SITE.defaults, raw.content, "site"),
    seo: parseWithFallback(siteSeoSchema, siteSeoDefaults, raw.seo, "site.seo"),
    hasContentDraft: raw.hasContentDraft,
    hasSeoDraft: raw.hasSeoDraft,
  };
}

/** Published rows only, without Draft Mode (safe for robots.txt, sitemap and the admin list). */
export async function getPublishedDocs() {
  const client = createPublicClient();
  if (!client) return [];
  // `published_by` is deliberately not selected: staff user ids aren't granted to anon.
  const { data, error } = await client.from("pages").select("slug, seo, content_published_at, seo_published_at");
  if (error) {
    console.error("[cms] Failed to list pages", error.message);
    return [];
  }
  return data;
}

function latest(...dates: Array<string | null | undefined>) {
  const times = dates.filter((date): date is string => Boolean(date)).sort();
  return times.at(-1) ?? null;
}

/** Published SEO for the site and every registry page, parsed with defaults. */
export async function getPublishedSeo() {
  const rows = await getPublishedDocs();
  const bySlug = new Map(rows.map((row) => [row.slug, row]));
  return {
    site: parseWithFallback(siteSeoSchema, siteSeoDefaults, bySlug.get("site")?.seo, "site.seo"),
    pages: (Object.keys(PAGES) as PageSlug[]).map((slug) => {
      const row = bySlug.get(slug);
      return {
        slug,
        seo: parseWithFallback(pageSeoSchema, PAGES[slug].seo, row?.seo, `${slug}.seo`),
        publishedAt: latest(row?.content_published_at, row?.seo_published_at),
      };
    }),
  };
}

/** Parsed content of any document (draft-aware in edit mode). */
export async function getDocContent(slug: DocSlug): Promise<Record<string, unknown>> {
  return slug === "site" ? (await getSite()).content : (await getPage(slug)).content;
}
