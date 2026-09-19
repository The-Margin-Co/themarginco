"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getAdminSession, getStaffSession } from "@/lib/auth";
import { postSeoSchema, type PostSeo } from "@/lib/seo/schema";
import { sanitizePostHtml } from "@/lib/sanitize";
import { caseStudySchemaFor, toFieldErrors, type CaseStudyField, type FormState } from "@/lib/validation";

type CaseStudyFormState = FormState<CaseStudyField>;

const SESSION_EXPIRED: CaseStudyFormState = {
  status: "error",
  message: "Your session has expired or this account lacks admin access. Please sign in again.",
};

const SLUG_TAKEN: CaseStudyFormState = {
  status: "error",
  message: "That slug is already taken.",
  fieldErrors: { slug: "A case study with this slug already exists. Choose another." },
};

const FIELDS: CaseStudyField[] = [
  "title",
  "slug",
  "industry",
  "channels",
  "excerpt",
  "content",
  "status",
  "metrics",
  "meta_title",
  "meta_description",
  "meta_keywords",
  "featured_image",
  "featured_image_alt",
];

/** Advanced SEO (canonical, robots, OG, hreflang, sitemap, schema) arrives as one JSON field. */
function parseSeoField(formData: FormData): { ok: true; seo: PostSeo } | { ok: false; state: CaseStudyFormState } {
  let raw: unknown;
  try {
    raw = JSON.parse(String(formData.get("seo") ?? "{}"));
  } catch {
    return { ok: false, state: { status: "error", message: "The SEO settings couldn't be read. Reload and try again." } };
  }
  const parsed = postSeoSchema.safeParse(raw);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const where = issue?.path.length ? `${issue.path.join(" › ")}: ` : "";
    return { ok: false, state: { status: "error", message: `SEO settings: ${where}${issue?.message ?? "invalid value"}` } };
  }
  return { ok: true, seo: parsed.data };
}

function parseCaseStudyForm(formData: FormData) {
  const raw = Object.fromEntries(FIELDS.map((field) => [field, String(formData.get(field) ?? "")]));
  const parsed = caseStudySchemaFor(raw.status).safeParse(raw);
  const seo = parseSeoField(formData);
  if (!seo.ok) return seo;
  if (!parsed.success) {
    return {
      ok: false as const,
      state: {
        status: "error",
        message: "Please fix the highlighted fields.",
        fieldErrors: toFieldErrors<CaseStudyField>(parsed.error),
      } satisfies CaseStudyFormState,
    };
  }
  return { ok: true as const, caseStudy: { ...parsed.data, content: sanitizePostHtml(parsed.data.content), seo: seo.seo } };
}

function revalidatePublic(...slugs: string[]) {
  revalidatePath("/");
  revalidatePath("/case-studies");
  revalidatePath("/sitemap.xml");
  for (const slug of new Set(slugs)) revalidatePath(`/case-studies/${slug}`);
}

const caseStudyId = z.uuid();

export async function createCaseStudy(_previous: CaseStudyFormState, formData: FormData): Promise<CaseStudyFormState> {
  const session = await getAdminSession();
  if (session.state !== "admin") return SESSION_EXPIRED;

  const result = parseCaseStudyForm(formData);
  if (!result.ok) return result.state;
  const { caseStudy } = result;

  const { data, error } = await session.supabase
    .from("case_studies")
    .insert({ ...caseStudy, published_at: caseStudy.status === "published" ? new Date().toISOString() : null })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") return SLUG_TAKEN;
    console.error("Case study insert failed:", error.message);
    return { status: "error", message: "Couldn't save the case study. Please try again." };
  }

  if (caseStudy.status === "published") revalidatePublic(caseStudy.slug);
  redirect(`/admin/case-studies/${data.id}?created=1`);
}

export async function updateCaseStudy(
  id: string,
  _previous: CaseStudyFormState,
  formData: FormData,
): Promise<CaseStudyFormState> {
  const session = await getAdminSession();
  if (session.state !== "admin") return SESSION_EXPIRED;
  if (!caseStudyId.safeParse(id).success) return { status: "error", message: "Unknown case study." };

  const result = parseCaseStudyForm(formData);
  if (!result.ok) return result.state;
  const { caseStudy } = result;

  const { data: existing } = await session.supabase
    .from("case_studies")
    .select("slug, published_at")
    .eq("id", id)
    .maybeSingle();
  if (!existing) return { status: "error", message: "This case study no longer exists." };

  const publishedAt =
    caseStudy.status === "published" ? (existing.published_at ?? new Date().toISOString()) : existing.published_at;

  const { error } = await session.supabase
    .from("case_studies")
    .update({ ...caseStudy, published_at: publishedAt })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") return SLUG_TAKEN;
    console.error("Case study update failed:", error.message);
    return { status: "error", message: "Couldn't save the case study. Please try again." };
  }

  revalidatePublic(existing.slug, caseStudy.slug);
  return {
    status: "success",
    message: caseStudy.status === "published" ? "Saved. Your changes are live." : "Draft saved. It isn't visible on the site.",
  };
}

const SEO_FIELDS = ["meta_title", "meta_description", "meta_keywords"] as const;
const seoMetaSchema = z.object({
  meta_title: z.string().trim().max(70, "Keep the meta title under 70 characters."),
  meta_description: z.string().trim().max(170, "Keep the meta description under 170 characters."),
  meta_keywords: z.string().trim().max(255, "Keep keywords under 255 characters."),
});

/** SEO-only save used by SEO editors (and admins on the SEO view): goes through update_case_study_seo(). */
export async function updateCaseStudySeo(
  id: string,
  _previous: CaseStudyFormState,
  formData: FormData,
): Promise<CaseStudyFormState> {
  const session = await getStaffSession();
  if (session.state !== "staff") return SESSION_EXPIRED;
  if (!caseStudyId.safeParse(id).success) return { status: "error", message: "Unknown case study." };

  const meta = seoMetaSchema.safeParse(Object.fromEntries(SEO_FIELDS.map((field) => [field, String(formData.get(field) ?? "")])));
  if (!meta.success) {
    return { status: "error", message: "Please fix the highlighted fields.", fieldErrors: toFieldErrors<CaseStudyField>(meta.error) };
  }
  const seo = parseSeoField(formData);
  if (!seo.ok) return seo.state;

  const { error } = await session.supabase.rpc("update_case_study_seo", {
    p_id: id,
    p_meta_title: meta.data.meta_title,
    p_meta_description: meta.data.meta_description,
    p_meta_keywords: meta.data.meta_keywords,
    p_seo: seo.seo,
  });
  if (error) {
    console.error("Case study SEO update failed:", error.message);
    return { status: "error", message: error.code === "42501" ? "You don't have permission to edit SEO." : "Couldn't save the SEO settings." };
  }

  const { data } = await session.supabase.from("case_studies").select("slug").eq("id", id).maybeSingle();
  if (data) revalidatePublic(data.slug);
  return { status: "success", message: "SEO settings saved." };
}

export async function deleteCaseStudy(id: string) {
  const session = await getAdminSession();
  if (session.state !== "admin") redirect("/admin/login");
  if (!caseStudyId.safeParse(id).success) redirect("/admin/case-studies");

  const { data } = await session.supabase.from("case_studies").delete().eq("id", id).select("slug").maybeSingle();
  if (data) revalidatePublic(data.slug);
  redirect("/admin/case-studies?deleted=1");
}
