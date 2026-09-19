import { ArrowLeft, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { AdminAccessState } from "@/components/admin/AdminAccessState";
import { AdminShell } from "@/components/admin/AdminShell";
import { VideoTestimonialEditor } from "@/components/admin/VideoTestimonialEditor";
import { ButtonLink } from "@/components/ui/Button";
import { getAdminSession } from "@/lib/auth";
import { toFormValues } from "@/lib/video-testimonial-form";
import { updateVideoTestimonial } from "../actions";

export const metadata: Metadata = { title: "Edit video testimonial" };

export default async function EditVideoTestimonialPage({ params, searchParams }: PageProps<"/admin/video-testimonials/[id]">) {
  const { id } = await params;
  const session = await getAdminSession();
  if (session.state !== "admin") return <AdminAccessState session={session} next={`/admin/video-testimonials/${id}`} />;
  if (!z.uuid().safeParse(id).success) notFound();

  const { data: video } = await session.supabase.from("video_testimonials").select("*").eq("id", id).maybeSingle();
  if (!video) notFound();

  const { created } = await searchParams;
  const status = video.status === "published" ? "published" : "draft";

  return (
    <AdminShell
      email={session.user.email ?? ""}
      title="Edit video testimonial"
      description={video.name}
      actions={
        <>
          <Link href="/admin/video-testimonials" className="hidden items-center gap-1.5 text-sm font-semibold text-muted hover:text-fg sm:flex">
            <ArrowLeft aria-hidden className="size-4" /> All videos
          </Link>
          <ButtonLink href="/admin/video-testimonials/new" size="sm" variant="secondary">
            <Plus aria-hidden className="size-4" /> New video
          </ButtonLink>
        </>
      }
    >
      <VideoTestimonialEditor
        mode="edit"
        initial={toFormValues(video)}
        initialStatus={status}
        action={updateVideoTestimonial.bind(null, video.id)}
        notice={created === "1" ? (status === "published" ? "Video published. It's live on the homepage." : "Draft created.") : undefined}
        publishedAt={video.published_at}
        updatedAt={video.updated_at}
      />
    </AdminShell>
  );
}
