import { ExternalLink, Pencil, Plus, Video } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AdminAccessState } from "@/components/admin/AdminAccessState";
import { AdminShell } from "@/components/admin/AdminShell";
import { DeletePostButton } from "@/components/admin/DeletePostButton";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { FormBanner } from "@/components/ui/FormField";
import { getAdminSession } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { deleteVideoTestimonial } from "./actions";

export const metadata: Metadata = { title: "Video testimonials" };

const FILTERS = [
  { value: "all", label: "All" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Drafts" },
] as const;

type Filter = (typeof FILTERS)[number]["value"];

export default async function AdminVideoTestimonialsPage({ searchParams }: PageProps<"/admin/video-testimonials">) {
  const session = await getAdminSession();
  if (session.state !== "admin") return <AdminAccessState session={session} next="/admin/video-testimonials" />;

  const params = await searchParams;
  const filter: Filter = params.status === "published" || params.status === "draft" ? params.status : "all";

  const { data, error } = await session.supabase
    .from("video_testimonials")
    .select("id, name, role, company, poster_image, status, sort_order, updated_at")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(`Failed to load video testimonials: ${error.message}`);

  const counts = {
    all: data.length,
    published: data.filter((v) => v.status === "published").length,
    draft: data.filter((v) => v.status === "draft").length,
  };
  const videos = data.filter((v) => filter === "all" || v.status === filter);
  const filterHref = (value: Filter) => (value === "all" ? "/admin/video-testimonials" : `/admin/video-testimonials?status=${value}`);

  return (
    <AdminShell
      email={session.user.email ?? ""}
      role="admin"
      title="Video testimonials"
      description={`${counts.published} published · ${counts.draft} ${counts.draft === 1 ? "draft" : "drafts"}`}
      actions={
        <ButtonLink href="/admin/video-testimonials/new" size="sm">
          <Plus aria-hidden className="size-4" /> New video
        </ButtonLink>
      }
    >
      {params.deleted === "1" && (
        <div className="mb-5">
          <FormBanner tone="success">Video deleted.</FormBanner>
        </div>
      )}

      <nav aria-label="Filter by status" className="flex w-fit gap-1 rounded-full border border-line bg-charcoal p-1">
        {FILTERS.map(({ value, label }) => (
          <Link
            key={value}
            href={filterHref(value)}
            aria-current={filter === value ? "page" : undefined}
            className={cn(
              "flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors",
              filter === value ? "bg-accent text-on-accent" : "text-muted hover:text-fg",
            )}
          >
            {label}
            <span className={cn("text-xs", filter === value ? "text-on-accent/70" : "text-zinc-500")}>{counts[value]}</span>
          </Link>
        ))}
      </nav>

      <div className="card mt-5 overflow-hidden">
        {videos.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <span className="grid size-14 place-items-center rounded-2xl bg-accent/10 text-gold">
              <Video aria-hidden className="size-7" />
            </span>
            <h2 className="mt-5 text-lg font-bold">{filter === "all" ? "No videos yet" : "No videos match"}</h2>
            <p className="mt-1 text-sm">
              {filter === "all" ? "Add your first client video testimonial." : "Try a different filter."}
            </p>
            <ButtonLink href="/admin/video-testimonials/new" size="sm" className="mt-6">
              <Plus aria-hidden className="size-4" /> New video
            </ButtonLink>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[40rem] text-left text-sm">
              <thead className="border-b border-line bg-ink-2/60 text-[11px] uppercase tracking-[0.14em] text-muted">
                <tr>
                  <th scope="col" className="px-5 py-3 font-semibold">Video</th>
                  <th scope="col" className="hidden px-4 py-3 font-semibold md:table-cell">Order</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                  <th scope="col" className="px-5 py-3 text-right font-semibold">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {videos.map((video) => (
                  <tr key={video.id} className="transition-colors hover:bg-fg/[0.02]">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3.5">
                        <div className="relative h-11 w-16 shrink-0 overflow-hidden rounded-lg border border-line bg-ink-2">
                          {video.poster_image ? (
                            <Image src={video.poster_image} alt="" fill sizes="64px" className="object-cover" />
                          ) : (
                            <Video aria-hidden className="absolute left-1/2 top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 text-zinc-600" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/admin/video-testimonials/${video.id}`}
                            className="line-clamp-1 font-semibold text-fg transition-colors hover:text-gold"
                          >
                            {video.name}
                          </Link>
                          <p className="truncate text-xs text-zinc-500">{[video.role, video.company].filter(Boolean).join(", ") || "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3.5 md:table-cell">{video.sort_order}</td>
                    <td className="px-4 py-3.5">
                      <Badge tone={video.status === "published" ? "accent" : "neutral"}>
                        {video.status === "published" ? "Published" : "Draft"}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/video-testimonials/${video.id}`}
                          className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-fg transition-colors hover:bg-fg/5 hover:text-gold"
                        >
                          <Pencil aria-hidden className="size-3.5" /> Edit
                        </Link>
                        {video.status === "published" && (
                          <a
                            href="/"
                            target="_blank"
                            rel="noopener noreferrer"
                            title="View on the homepage"
                            aria-label={`View “${video.name}” on the homepage`}
                            className="grid size-8 place-items-center rounded-lg text-muted transition-colors hover:bg-fg/5 hover:text-fg"
                          >
                            <ExternalLink aria-hidden className="size-4" />
                          </a>
                        )}
                        <DeletePostButton action={deleteVideoTestimonial.bind(null, video.id)} title={video.name} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
