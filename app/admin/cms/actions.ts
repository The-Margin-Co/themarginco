"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getStaffSession, type StaffSession } from "@/lib/auth";
import { parseWithFallback } from "@/lib/cms/load";
import { schemaAt } from "@/lib/cms/fields";
import { docDefaults, docPaths, docSchema, isDocSlug, PAGES, type DocSlug } from "@/lib/cms/registry";
import { loadEditorDoc } from "@/lib/cms/editor-data";
import { getAt, setAt } from "@/lib/cms/paths";
import { pageSeoSchema, siteSeoSchema, type PageSeo, type SiteSeo } from "@/lib/seo/schema";

export type CmsResult = {
  ok: boolean;
  message: string;
  /** Validation errors keyed by dot path, e.g. "faq.items.2.question". */
  errors?: Record<string, string>;
};

type Part = "content" | "seo";

function issuesToErrors(error: z.ZodError) {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".");
    errors[key] ??= issue.message;
  }
  return errors;
}

type Staff = Extract<StaffSession, { state: "staff" }>;

async function requireStaff(part: Part): Promise<{ error: string } | { session: Staff }> {
  const session = await getStaffSession();
  if (session.state !== "staff") return { error: "Your session has expired. Please sign in again." };
  if (part === "content" && session.role !== "admin") return { error: "Only admins can edit page content." };
  return { session };
}

function revalidateDoc(slug: DocSlug, parts: Part[]) {
  const { path, type } = docPaths(slug);
  revalidatePath(path, type);
  if (parts.includes("seo")) {
    revalidatePath("/sitemap.xml");
    revalidatePath("/robots.txt");
  }
  if (slug.startsWith("services/")) revalidatePath("/");
}

export async function saveDraft(slugInput: string, part: Part, data: unknown): Promise<CmsResult> {
  if (!isDocSlug(slugInput)) return { ok: false, message: "Unknown page." };
  const slug = slugInput;
  const auth = await requireStaff(part);
  if ("error" in auth) return { ok: false, message: auth.error };

  return writeDraft(auth.session, slug, part, data);
}

async function writeDraft(session: Staff, slug: DocSlug, part: Part, data: unknown): Promise<CmsResult> {
  const schema = part === "content" ? docSchema(slug) : slug === "site" ? siteSeoSchema : pageSeoSchema;
  const parsed = (schema as z.ZodType).safeParse(data);
  if (!parsed.success) {
    return { ok: false, message: "Some fields need attention before saving.", errors: issuesToErrors(parsed.error) };
  }

  const { supabase } = session;
  const { error } =
    part === "content"
      ? await supabase.from("page_content_drafts").upsert({ slug, content: parsed.data as never })
      : await supabase.from("page_seo_drafts").upsert({ slug, seo: parsed.data as never });
  if (error) {
    console.error(`[cms] saveDraft ${slug}/${part}:`, error.message);
    return { ok: false, message: "Couldn't save the draft. Please try again." };
  }
  return { ok: true, message: "Draft saved. Only signed-in editors can see it until you publish." };
}

export async function publishDoc(slugInput: string, parts: Part[]): Promise<CmsResult> {
  if (!isDocSlug(slugInput)) return { ok: false, message: "Unknown page." };
  const slug = slugInput;
  const wanted = parts.filter((part): part is Part => part === "content" || part === "seo");
  if (wanted.length === 0) return { ok: false, message: "Nothing to publish." };

  const session = await getStaffSession();
  if (session.state !== "staff") return { ok: false, message: "Your session has expired. Please sign in again." };
  const allowed = session.role === "admin" ? wanted : wanted.filter((part) => part === "seo");
  if (allowed.length === 0) return { ok: false, message: "Only admins can publish page content." };

  const { error } = await session.supabase.rpc("publish_page", { p_slug: slug, p_parts: allowed });
  if (error) {
    console.error(`[cms] publish ${slug}:`, error.message);
    return { ok: false, message: error.code === "42501" ? "You don't have permission to publish this." : "Publishing failed. Please try again." };
  }
  revalidateDoc(slug, allowed);
  const label = slug === "site" ? "Site-wide changes are" : `${PAGES[slug as keyof typeof PAGES]?.label ?? "Page"} is`;
  return { ok: true, message: `${label} live.` };
}

export async function discardDraft(slugInput: string, part: Part): Promise<CmsResult> {
  if (!isDocSlug(slugInput)) return { ok: false, message: "Unknown page." };
  const auth = await requireStaff(part);
  if ("error" in auth) return { ok: false, message: auth.error };
  const table = part === "content" ? "page_content_drafts" : "page_seo_drafts";
  const { error } = await auth.session.supabase.from(table).delete().eq("slug", slugInput);
  if (error) return { ok: false, message: "Couldn't discard the draft." };
  return { ok: true, message: "Draft discarded. Showing the live version." };
}

export async function restoreRevision(id: string): Promise<CmsResult> {
  if (!z.uuid().safeParse(id).success) return { ok: false, message: "Unknown revision." };
  const session = await getStaffSession();
  if (session.state !== "staff") return { ok: false, message: "Your session has expired. Please sign in again." };
  const { error } = await session.supabase.rpc("restore_page_revision", { p_id: id });
  if (error) {
    return { ok: false, message: error.code === "42501" ? "You don't have permission to restore this." : "Restore failed." };
  }
  return { ok: true, message: "Revision loaded into the draft. Review it, then publish." };
}

const patchesSchema = z
  .array(z.object({ path: z.string().max(200).regex(/^[A-Za-z0-9_.]+$/), value: z.unknown() }))
  .min(1)
  .max(500);

/**
 * Inline editor save: applies field-level patches on top of the current draft (or the live
 * version), so edits made elsewhere in the meantime are kept. The full document is re-validated.
 */
export async function saveInlineDraft(slugInput: string, patches: unknown): Promise<CmsResult> {
  if (!isDocSlug(slugInput)) return { ok: false, message: "Unknown page." };
  const slug = slugInput;
  const auth = await requireStaff("content");
  if ("error" in auth) return { ok: false, message: auth.error };

  const parsed = patchesSchema.safeParse(patches);
  if (!parsed.success) return { ok: false, message: "Nothing valid to save." };
  const schema = docSchema(slug) as z.ZodObject;
  if (parsed.data.some((patch) => !schemaAt(schema, patch.path))) return { ok: false, message: "Some edits point at unknown fields." };

  const db = auth.session.supabase;
  const [draft, live] = await Promise.all([
    db.from("page_content_drafts").select("content").eq("slug", slug).maybeSingle(),
    db.from("pages").select("content").eq("slug", slug).maybeSingle(),
  ]);
  let content: Record<string, unknown> = parseWithFallback(schema, docDefaults(slug), draft.data?.content ?? live.data?.content, slug);
  for (const patch of parsed.data) content = setAt(content, patch.path, patch.value);
  return writeDraft(auth.session, slug, "content", content);
}

/** Status for the inline edit bar: drafts, draft-aware SEO and the inputs for the live audit. */
export async function loadInlineStatus(slugInput: string) {
  if (!isDocSlug(slugInput) || slugInput === "site") return null;
  const session = await getStaffSession();
  if (session.state !== "staff") return null;
  const [page, site] = await Promise.all([loadEditorDoc(session, slugInput), loadEditorDoc(session, "site")]);
  const def = PAGES[slugInput];
  const siteSeo = site.seo as SiteSeo;
  const faq = def.faqPath ? (getAt(page.content, def.faqPath) as { visible?: boolean; items?: unknown[] } | undefined) : undefined;
  return {
    seo: page.seo as PageSeo,
    hasContentDraft: page.hasContentDraft,
    hasSeoDraft: page.hasSeoDraft,
    siteHasContentDraft: site.hasContentDraft,
    fallbackTitle: siteSeo.title_template.replace("%s", def.label),
    fallbackDescription: siteSeo.default_description,
    hasFaqs: Boolean(faq && faq.visible !== false && (faq.items?.length ?? 0) > 0),
  };
}

export type InlineStatus = NonNullable<Awaited<ReturnType<typeof loadInlineStatus>>>;
