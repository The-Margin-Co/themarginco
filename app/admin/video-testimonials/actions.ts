"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getAdminSession } from "@/lib/auth";
import { mediaPathFromUrl, MEDIA_BUCKET, videoPathFromUrl, VIDEO_BUCKET } from "@/lib/media";
import { toFieldErrors, videoTestimonialSchemaFor, type FormState, type VideoTestimonialField } from "@/lib/validation";

type VideoTestimonialFormState = FormState<VideoTestimonialField>;

const SESSION_EXPIRED: VideoTestimonialFormState = {
  status: "error",
  message: "Your session has expired or this account lacks admin access. Please sign in again.",
};

const FIELDS: VideoTestimonialField[] = [
  "name",
  "role",
  "company",
  "video_url",
  "poster_image",
  "poster_image_alt",
  "sort_order",
  "status",
];

function parseVideoTestimonialForm(formData: FormData) {
  const raw = Object.fromEntries(FIELDS.map((field) => [field, String(formData.get(field) ?? "")]));
  const parsed = videoTestimonialSchemaFor(raw.status).safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false as const,
      state: {
        status: "error",
        message: "Please fix the highlighted fields.",
        fieldErrors: toFieldErrors<VideoTestimonialField>(parsed.error),
      } satisfies VideoTestimonialFormState,
    };
  }
  // requirePoster() already guarantees poster_image / poster_image_alt are set when validation succeeds.
  return {
    ok: true as const,
    video: { ...parsed.data, poster_image: parsed.data.poster_image!, poster_image_alt: parsed.data.poster_image_alt! },
  };
}

function revalidateHome() {
  revalidatePath("/");
  revalidatePath("/admin/video-testimonials");
}

const videoId = z.uuid();

type AdminClient = Extract<Awaited<ReturnType<typeof getAdminSession>>, { state: "admin" }>["supabase"];

/** Best-effort: removes storage objects that are no longer referenced so replaced files don't pile up. */
async function removeStale(supabase: AdminClient, before: { video_url: string; poster_image: string }, after?: { video_url: string; poster_image: string }) {
  const videos = before.video_url !== after?.video_url ? videoPathFromUrl(before.video_url) : null;
  const posters = before.poster_image !== after?.poster_image ? mediaPathFromUrl(before.poster_image) : null;
  if (videos) await supabase.storage.from(VIDEO_BUCKET).remove([videos]).catch(() => undefined);
  if (posters) await supabase.storage.from(MEDIA_BUCKET).remove([posters]).catch(() => undefined);
}

export async function createVideoTestimonial(
  _previous: VideoTestimonialFormState,
  formData: FormData,
): Promise<VideoTestimonialFormState> {
  const session = await getAdminSession();
  if (session.state !== "admin") return SESSION_EXPIRED;

  const result = parseVideoTestimonialForm(formData);
  if (!result.ok) return result.state;

  const { data, error } = await session.supabase
    .from("video_testimonials")
    .insert({ ...result.video, published_at: result.video.status === "published" ? new Date().toISOString() : null })
    .select("id")
    .single();

  if (error) {
    console.error("Video testimonial insert failed:", error.message);
    return { status: "error", message: "Couldn't save the video. Please try again." };
  }

  revalidateHome();
  redirect(`/admin/video-testimonials/${data.id}?created=1`);
}

export async function updateVideoTestimonial(
  id: string,
  _previous: VideoTestimonialFormState,
  formData: FormData,
): Promise<VideoTestimonialFormState> {
  const session = await getAdminSession();
  if (session.state !== "admin") return SESSION_EXPIRED;
  if (!videoId.safeParse(id).success) return { status: "error", message: "Unknown video." };

  const result = parseVideoTestimonialForm(formData);
  if (!result.ok) return result.state;

  const { data: existing } = await session.supabase
    .from("video_testimonials")
    .select("published_at, video_url, poster_image")
    .eq("id", id)
    .maybeSingle();
  if (!existing) return { status: "error", message: "This video no longer exists." };

  const publishedAt =
    result.video.status === "published" ? (existing.published_at ?? new Date().toISOString()) : existing.published_at;

  const { error } = await session.supabase
    .from("video_testimonials")
    .update({ ...result.video, published_at: publishedAt })
    .eq("id", id);

  if (error) {
    console.error("Video testimonial update failed:", error.message);
    return { status: "error", message: "Couldn't save the video. Please try again." };
  }

  await removeStale(session.supabase, existing, result.video);
  revalidateHome();
  return {
    status: "success",
    message: result.video.status === "published" ? "Saved. It's live on the homepage." : "Draft saved. It isn't visible on the site.",
  };
}

export async function deleteVideoTestimonial(id: string) {
  const session = await getAdminSession();
  if (session.state !== "admin") redirect("/admin/login");
  if (!videoId.safeParse(id).success) redirect("/admin/video-testimonials");

  const { data: existing } = await session.supabase
    .from("video_testimonials")
    .select("video_url, poster_image")
    .eq("id", id)
    .maybeSingle();
  await session.supabase.from("video_testimonials").delete().eq("id", id);
  if (existing) await removeStale(session.supabase, existing);
  revalidateHome();
  redirect("/admin/video-testimonials?deleted=1");
}
