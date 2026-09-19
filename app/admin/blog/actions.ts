"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getAdminSession, getStaffSession } from "@/lib/auth";
import { postSeoSchema, type PostSeo } from "@/lib/seo/schema";
import { sanitizePostHtml } from "@/lib/sanitize";
import { postSchemaFor, toFieldErrors, type FormState, type PostField } from "@/lib/validation";

type PostFormState = FormState<PostField>;

const SESSION_EXPIRED: PostFormState = {
  status: "error",
  message: "Your session has expired or this account lacks admin access. Please sign in again.",
};

const SLUG_TAKEN: PostFormState = {
  status: "error",
  message: "That slug is already taken.",
  fieldErrors: { slug: "A post with this slug already exists. Choose another." },
};

const FIELDS: PostField[] = [
  "title",
  "slug",
  "category",
  "excerpt",
  "content",
  "status",
  "meta_title",
  "meta_description",
  "meta_keywords",
  "featured_image",
  "featured_image_alt",
];

/** Advanced SEO (canonical, robots, OG, hreflang, sitemap, schema) arrives as one JSON field. */
function parseSeoField(formData: FormData): { ok: true; seo: PostSeo } | { ok: false; state: PostFormState } {
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

function parsePostForm(formData: FormData) {
  const raw = Object.fromEntries(FIELDS.map((field) => [field, String(formData.get(field) ?? "")]));
  const parsed = postSchemaFor(raw.status).safeParse(raw);
  const seo = parseSeoField(formData);
  if (!seo.ok) return seo;
  if (!parsed.success) {
    return {
      ok: false as const,
      state: {
        status: "error",
        message: "Please fix the highlighted fields.",
        fieldErrors: toFieldErrors<PostField>(parsed.error),
      } satisfies PostFormState,
    };
  }
  return { ok: true as const, post: { ...parsed.data, content: sanitizePostHtml(parsed.data.content), seo: seo.seo } };
}

function revalidatePublic(...slugs: string[]) {
  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath("/sitemap.xml");
  for (const slug of new Set(slugs)) revalidatePath(`/blog/${slug}`);
}

const postId = z.uuid();

export async function createPost(_previous: PostFormState, formData: FormData): Promise<PostFormState> {
  const session = await getAdminSession();
  if (session.state !== "admin") return SESSION_EXPIRED;

  const result = parsePostForm(formData);
  if (!result.ok) return result.state;
  const { post } = result;

  const { data, error } = await session.supabase
    .from("posts")
    .insert({ ...post, published_at: post.status === "published" ? new Date().toISOString() : null })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") return SLUG_TAKEN;
    console.error("Post insert failed:", error.message);
    return { status: "error", message: "Couldn't save the post. Please try again." };
  }

  if (post.status === "published") revalidatePublic(post.slug);
  redirect(`/admin/blog/${data.id}?created=1`);
}

export async function updatePost(
  id: string,
  _previous: PostFormState,
  formData: FormData,
): Promise<PostFormState> {
  const session = await getAdminSession();
  if (session.state !== "admin") return SESSION_EXPIRED;
  if (!postId.safeParse(id).success) return { status: "error", message: "Unknown post." };

  const result = parsePostForm(formData);
  if (!result.ok) return result.state;
  const { post } = result;

  const { data: existing } = await session.supabase
    .from("posts")
    .select("slug, published_at")
    .eq("id", id)
    .maybeSingle();
  if (!existing) return { status: "error", message: "This post no longer exists." };

  const publishedAt =
    post.status === "published" ? (existing.published_at ?? new Date().toISOString()) : existing.published_at;

  const { error } = await session.supabase
    .from("posts")
    .update({ ...post, published_at: publishedAt })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") return SLUG_TAKEN;
    console.error("Post update failed:", error.message);
    return { status: "error", message: "Couldn't save the post. Please try again." };
  }

  revalidatePublic(existing.slug, post.slug);
  return {
    status: "success",
    message: post.status === "published" ? "Saved. Your changes are live." : "Draft saved. It isn't visible on the site.",
  };
}

const SEO_FIELDS = ["meta_title", "meta_description", "meta_keywords"] as const;
const seoMetaSchema = z.object({
  meta_title: z.string().trim().max(70, "Keep the meta title under 70 characters."),
  meta_description: z.string().trim().max(170, "Keep the meta description under 170 characters."),
  meta_keywords: z.string().trim().max(255, "Keep keywords under 255 characters."),
});

/** SEO-only save used by SEO editors (and admins on the SEO view): goes through update_post_seo(). */
export async function updatePostSeo(
  id: string,
  _previous: PostFormState,
  formData: FormData,
): Promise<PostFormState> {
  const session = await getStaffSession();
  if (session.state !== "staff") return SESSION_EXPIRED;
  if (!postId.safeParse(id).success) return { status: "error", message: "Unknown post." };

  const meta = seoMetaSchema.safeParse(Object.fromEntries(SEO_FIELDS.map((field) => [field, String(formData.get(field) ?? "")])));
  if (!meta.success) {
    return { status: "error", message: "Please fix the highlighted fields.", fieldErrors: toFieldErrors<PostField>(meta.error) };
  }
  const seo = parseSeoField(formData);
  if (!seo.ok) return seo.state;

  const { error } = await session.supabase.rpc("update_post_seo", {
    p_id: id,
    p_meta_title: meta.data.meta_title,
    p_meta_description: meta.data.meta_description,
    p_meta_keywords: meta.data.meta_keywords,
    p_seo: seo.seo,
  });
  if (error) {
    console.error("Post SEO update failed:", error.message);
    return { status: "error", message: error.code === "42501" ? "You don't have permission to edit SEO." : "Couldn't save the SEO settings." };
  }

  const { data } = await session.supabase.from("posts").select("slug").eq("id", id).maybeSingle();
  if (data) revalidatePublic(data.slug);
  return { status: "success", message: "SEO settings saved." };
}

export async function deletePost(id: string) {
  const session = await getAdminSession();
  if (session.state !== "admin") redirect("/admin/login");
  if (!postId.safeParse(id).success) redirect("/admin/blog");

  const { data } = await session.supabase.from("posts").delete().eq("id", id).select("slug").maybeSingle();
  if (data) revalidatePublic(data.slug);
  redirect("/admin/blog?deleted=1");
}
