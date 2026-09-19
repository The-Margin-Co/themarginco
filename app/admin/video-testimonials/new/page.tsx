import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { AdminAccessState } from "@/components/admin/AdminAccessState";
import { AdminShell } from "@/components/admin/AdminShell";
import { VideoTestimonialEditor } from "@/components/admin/VideoTestimonialEditor";
import { getAdminSession } from "@/lib/auth";
import { EMPTY_VIDEO_TESTIMONIAL } from "@/lib/video-testimonial-form";
import { createVideoTestimonial } from "../actions";

export const metadata: Metadata = { title: "New video testimonial" };

export default async function NewVideoTestimonialPage() {
  const session = await getAdminSession();
  if (session.state !== "admin") return <AdminAccessState session={session} next="/admin/video-testimonials/new" />;

  return (
    <AdminShell
      email={session.user.email ?? ""}
      title="New video testimonial"
      description="Add a client video for the homepage."
      actions={
        <Link href="/admin/video-testimonials" className="flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-fg">
          <ArrowLeft aria-hidden className="size-4" /> All videos
        </Link>
      }
    >
      <VideoTestimonialEditor mode="create" initial={EMPTY_VIDEO_TESTIMONIAL} initialStatus="draft" action={createVideoTestimonial} />
    </AdminShell>
  );
}
