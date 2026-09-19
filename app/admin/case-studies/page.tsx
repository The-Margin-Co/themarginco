import { ChartColumn, ExternalLink, Pencil, Plus, Search } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AdminAccessState } from "@/components/admin/AdminAccessState";
import { AdminShell } from "@/components/admin/AdminShell";
import { DeletePostButton } from "@/components/admin/DeletePostButton";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { FormBanner } from "@/components/ui/FormField";
import { getStaffSession } from "@/lib/auth";
import { cn, formatDate } from "@/lib/utils";
import { deleteCaseStudy } from "./actions";

export const metadata: Metadata = { title: "Case studies" };

const FILTERS = [
  { value: "all", label: "All" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Drafts" },
] as const;

type Filter = (typeof FILTERS)[number]["value"];

export default async function AdminCaseStudiesPage({ searchParams }: PageProps<"/admin/case-studies">) {
  const session = await getStaffSession();
  if (session.state !== "staff") return <AdminAccessState session={session} next="/admin/case-studies" />;
  const isAdmin = session.role === "admin";

  const params = await searchParams;
  const filter: Filter = params.status === "published" || params.status === "draft" ? params.status : "all";
  const query = typeof params.q === "string" ? params.q.trim().slice(0, 100) : "";

  const { data, error } = await session.supabase
    .from("case_studies")
    .select("id, title, slug, industry, status, featured_image, published_at, updated_at")
    .order("updated_at", { ascending: false });
  if (error) throw new Error(`Failed to load case studies: ${error.message}`);

  const counts = {
    all: data.length,
    published: data.filter((caseStudy) => caseStudy.status === "published").length,
    draft: data.filter((caseStudy) => caseStudy.status === "draft").length,
  };
  const needle = query.toLowerCase();
  const caseStudies = data.filter(
    (caseStudy) =>
      (filter === "all" || caseStudy.status === filter) &&
      (!needle || caseStudy.title.toLowerCase().includes(needle) || caseStudy.slug.includes(needle)),
  );

  const filterHref = (value: Filter) => {
    const search = new URLSearchParams();
    if (value !== "all") search.set("status", value);
    if (query) search.set("q", query);
    const qs = search.toString();
    return qs ? `/admin/case-studies?${qs}` : "/admin/case-studies";
  };

  return (
    <AdminShell
      email={session.user.email ?? ""}
      role={session.role}
      title="Case studies"
      description={`${counts.published} published · ${counts.draft} ${counts.draft === 1 ? "draft" : "drafts"}`}
      actions={
        isAdmin ? (
          <ButtonLink href="/admin/case-studies/new" size="sm">
            <Plus aria-hidden className="size-4" /> New case study
          </ButtonLink>
        ) : undefined
      }
    >
      {params.deleted === "1" && (
        <div className="mb-5">
          <FormBanner tone="success">Case study deleted.</FormBanner>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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

        <form role="search" action="/admin/case-studies" className="relative sm:w-72">
          {filter !== "all" && <input type="hidden" name="status" value={filter} />}
          <Search aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <label htmlFor="case-study-search" className="sr-only">
            Search case studies
          </label>
          <input
            id="case-study-search"
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search by title or slug…"
            className="h-10 w-full rounded-full border border-line bg-charcoal pl-10 pr-4 text-sm text-fg placeholder:text-zinc-500 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/50"
          />
        </form>
      </div>

      <div className="card mt-5 overflow-hidden">
        {caseStudies.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <span className="grid size-14 place-items-center rounded-2xl bg-accent/10 text-gold">
              <ChartColumn aria-hidden className="size-7" />
            </span>
            <h2 className="mt-5 text-lg font-bold">{query || filter !== "all" ? "No case studies match" : "No case studies yet"}</h2>
            <p className="mt-1 text-sm">
              {query || filter !== "all" ? "Try a different search or filter." : "Write up your first client result to get the library going."}
            </p>
            {isAdmin && (
              <ButtonLink href="/admin/case-studies/new" size="sm" className="mt-6">
                <Plus aria-hidden className="size-4" /> New case study
              </ButtonLink>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[40rem] text-left text-sm">
              <thead className="border-b border-line bg-ink-2/60 text-[11px] uppercase tracking-[0.14em] text-muted">
                <tr>
                  <th scope="col" className="px-5 py-3 font-semibold">Case study</th>
                  <th scope="col" className="hidden px-4 py-3 font-semibold md:table-cell">Industry</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                  <th scope="col" className="hidden px-4 py-3 font-semibold lg:table-cell">Updated</th>
                  <th scope="col" className="px-5 py-3 text-right font-semibold">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {caseStudies.map((caseStudy) => (
                  <tr key={caseStudy.id} className="transition-colors hover:bg-fg/[0.02]">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3.5">
                        <div className="relative h-11 w-16 shrink-0 overflow-hidden rounded-lg border border-line bg-ink-2">
                          {caseStudy.featured_image ? (
                            <Image src={caseStudy.featured_image} alt="" fill sizes="64px" className="object-cover" />
                          ) : (
                            <ChartColumn aria-hidden className="absolute left-1/2 top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 text-zinc-600" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/admin/case-studies/${caseStudy.id}`}
                            className="line-clamp-1 font-semibold text-fg transition-colors hover:text-gold"
                          >
                            {caseStudy.title}
                          </Link>
                          <p className="truncate font-mono text-xs text-zinc-500">/case-studies/{caseStudy.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3.5 md:table-cell">{caseStudy.industry || <span className="text-zinc-600">n/a</span>}</td>
                    <td className="px-4 py-3.5">
                      <Badge tone={caseStudy.status === "published" ? "accent" : "neutral"}>
                        {caseStudy.status === "published" ? "Published" : "Draft"}
                      </Badge>
                    </td>
                    <td className="hidden whitespace-nowrap px-4 py-3.5 lg:table-cell">{formatDate(caseStudy.updated_at)}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/case-studies/${caseStudy.id}`}
                          className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-fg transition-colors hover:bg-fg/5 hover:text-gold"
                        >
                          <Pencil aria-hidden className="size-3.5" /> {isAdmin ? "Edit" : "SEO"}
                        </Link>
                        {caseStudy.status === "published" && (
                          <a
                            href={`/case-studies/${caseStudy.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="View live case study"
                            aria-label={`View “${caseStudy.title}” on the site`}
                            className="grid size-8 place-items-center rounded-lg text-muted transition-colors hover:bg-fg/5 hover:text-fg"
                          >
                            <ExternalLink aria-hidden className="size-4" />
                          </a>
                        )}
                        {isAdmin && <DeletePostButton action={deleteCaseStudy.bind(null, caseStudy.id)} title={caseStudy.title} />}
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
