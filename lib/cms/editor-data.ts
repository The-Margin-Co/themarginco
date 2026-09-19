import type { z } from "zod";
import type { StaffSession } from "@/lib/auth";
import { parseWithFallback } from "@/lib/cms/load";
import { getAt } from "@/lib/cms/paths";
import { docDefaults, docSchema, PAGES, PAGE_SLUGS, type DocSlug, type PageSlug } from "@/lib/cms/registry";
import { auditPageSeo, type AuditResult } from "@/lib/seo/audit";
import { pageSeoSchema, siteSeoDefaults, siteSeoSchema, type PageSeo, type SiteSeo } from "@/lib/seo/schema";

type Staff = Extract<StaffSession, { state: "staff" }>;

/** Everything the portal editor needs for one document, read through the user's session (RLS applies). */
export async function loadEditorDoc(session: Staff, slug: DocSlug) {
  const db = session.supabase;
  const [live, contentDraft, seoDraft, revisions] = await Promise.all([
    db.from("pages").select("content, seo, content_published_at, seo_published_at").eq("slug", slug).maybeSingle(),
    db.from("page_content_drafts").select("content, updated_at").eq("slug", slug).maybeSingle(),
    db.from("page_seo_drafts").select("seo, updated_at").eq("slug", slug).maybeSingle(),
    db
      .from("page_revisions")
      .select("id, part, created_at, published_by")
      .eq("slug", slug)
      .order("created_at", { ascending: false })
      .limit(40),
  ]);

  const rawContent = contentDraft.data?.content ?? live.data?.content;
  const rawSeo = seoDraft.data?.seo ?? live.data?.seo;
  const content = parseWithFallback(docSchema(slug) as z.ZodObject, docDefaults(slug), rawContent, slug) as Record<string, unknown>;
  const seo =
    slug === "site"
      ? parseWithFallback(siteSeoSchema, siteSeoDefaults, rawSeo, "site.seo")
      : parseWithFallback(pageSeoSchema, PAGES[slug].seo, rawSeo, `${slug}.seo`);

  const names = await publisherNames(session);
  return {
    content,
    seo,
    hasContentDraft: Boolean(contentDraft.data),
    hasSeoDraft: Boolean(seoDraft.data),
    contentPublishedAt: live.data?.content_published_at ?? null,
    seoPublishedAt: live.data?.seo_published_at ?? null,
    revisions: (revisions.data ?? []).map((row) => ({
      id: row.id,
      part: row.part as "content" | "seo",
      createdAt: row.created_at,
      publisher: (row.published_by && names.get(row.published_by)) || "a team member",
    })),
    version: [contentDraft.data?.updated_at, seoDraft.data?.updated_at, live.data?.content_published_at, live.data?.seo_published_at].join("|"),
  };
}

async function publisherNames(session: Staff) {
  const names = new Map<string, string>([[session.user.id, "you"]]);
  if (session.role !== "admin") return names;
  const { data } = await session.supabase.rpc("list_staff");
  for (const member of data ?? []) {
    if (member.user_id !== session.user.id) names.set(member.user_id, member.email);
  }
  return names;
}

export type PageOverview = {
  slug: PageSlug;
  seo: PageSeo;
  title: string;
  description: string;
  audit: AuditResult;
  hasContentDraft: boolean;
  hasSeoDraft: boolean;
  publishedAt: string | null;
  hasFaqs: boolean;
};

/** Draft-aware SEO + audit for every page (drives the Pages list, SEO overview and duplicate checks). */
export async function loadPagesOverview(session: Staff): Promise<{ siteSeo: SiteSeo; pages: PageOverview[] }> {
  const db = session.supabase;
  const [live, contentDrafts, seoDrafts] = await Promise.all([
    db.from("pages").select("slug, content, seo, content_published_at, seo_published_at"),
    db.from("page_content_drafts").select("slug, content"),
    db.from("page_seo_drafts").select("slug, seo"),
  ]);
  const liveBySlug = new Map((live.data ?? []).map((row) => [row.slug, row]));
  const contentDraftBySlug = new Map((contentDrafts.data ?? []).map((row) => [row.slug, row.content]));
  const seoDraftBySlug = new Map((seoDrafts.data ?? []).map((row) => [row.slug, row.seo]));

  const siteSeo = parseWithFallback(siteSeoSchema, siteSeoDefaults, seoDraftBySlug.get("site") ?? liveBySlug.get("site")?.seo, "site.seo");

  const base = PAGE_SLUGS.map((slug) => {
    const def = PAGES[slug];
    const row = liveBySlug.get(slug);
    const seo = parseWithFallback(pageSeoSchema, def.seo, seoDraftBySlug.get(slug) ?? row?.seo, `${slug}.seo`);
    const content = parseWithFallback(def.schema as z.ZodObject, def.defaults, contentDraftBySlug.get(slug) ?? row?.content, slug);
    const faq = def.faqPath ? (getAt(content, def.faqPath) as { visible?: boolean; items?: unknown[] } | undefined) : undefined;
    const times = [row?.content_published_at, row?.seo_published_at].filter((value): value is string => Boolean(value)).sort();
    return {
      slug,
      seo,
      title: seo.meta_title || siteSeo.title_template.replace("%s", def.label),
      description: seo.meta_description || siteSeo.default_description,
      hasContentDraft: contentDraftBySlug.has(slug),
      hasSeoDraft: seoDraftBySlug.has(slug),
      publishedAt: times.at(-1) ?? null,
      hasFaqs: Boolean(faq && faq.visible !== false && (faq.items?.length ?? 0) > 0),
    };
  });

  const pages = base.map((page) => ({
    ...page,
    audit: auditPageSeo({
      seo: page.seo,
      title: page.title,
      description: page.description,
      hasFaqs: page.hasFaqs,
      duplicateTitle: base.some((other) => other.slug !== page.slug && other.title === page.title),
      duplicateDescription: base.some((other) => other.slug !== page.slug && other.description === page.description),
    }),
  }));

  return { siteSeo, pages };
}
