import { ExternalLink, PencilRuler, SearchCheck, Settings, SquarePen } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { AdminAccessState } from "@/components/admin/AdminAccessState";
import { AdminShell } from "@/components/admin/AdminShell";
import { ScoreRing } from "@/components/admin/cms/SeoAuditCard";
import { getStaffSession } from "@/lib/auth";
import { loadPagesOverview } from "@/lib/cms/editor-data";
import { PAGES } from "@/lib/cms/registry";
import { cn, formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Pages" };

function StatusChip({ draft, live, label }: { draft: boolean; live: boolean; label: string }) {
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        draft ? "bg-accent/15 text-gold" : live ? "bg-success/10 text-success" : "bg-fg/5 text-muted",
      )}
    >
      {label}: {draft ? "Draft" : live ? "Live" : "Default"}
    </span>
  );
}

export default async function AdminPagesPage() {
  const session = await getStaffSession();
  if (session.state !== "staff") return <AdminAccessState session={session} next="/admin/pages" />;
  const isAdmin = session.role === "admin";
  const { pages } = await loadPagesOverview(session);
  const average = Math.round(pages.reduce((sum, page) => sum + page.audit.score, 0) / pages.length);

  return (
    <AdminShell
      email={session.user.email ?? ""}
      role={session.role}
      title="Pages"
      description={`${pages.length} editable pages · average SEO score ${average}`}
    >
      <div className="grid gap-4 md:grid-cols-2">
        {isAdmin && (
          <Link href="/admin/settings" className="card flex items-center gap-4 p-5 transition hover:border-accent/50">
            <span className="grid size-11 place-items-center rounded-xl bg-accent/10 text-gold">
              <Settings aria-hidden className="size-5" />
            </span>
            <span>
              <span className="block font-semibold text-fg">Site-wide content</span>
              <span className="text-sm">Brand, contact details, header, footer, stats and the shared call-to-action.</span>
            </span>
          </Link>
        )}
        <Link href="/admin/seo" className="card flex items-center gap-4 p-5 transition hover:border-accent/50">
          <span className="grid size-11 place-items-center rounded-xl bg-accent/10 text-gold">
            <SearchCheck aria-hidden className="size-5" />
          </span>
          <span>
            <span className="block font-semibold text-fg">Global SEO</span>
            <span className="text-sm">Title template, defaults, organization schema, robots.txt, sitemap and site audit.</span>
          </span>
        </Link>
      </div>

      <div className="card mt-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[46rem] text-left text-sm">
            <thead className="border-b border-line bg-ink-2/60 text-[11px] uppercase tracking-[0.14em] text-muted">
              <tr>
                <th scope="col" className="px-5 py-3 font-semibold">Page</th>
                <th scope="col" className="px-4 py-3 font-semibold">SEO</th>
                <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                <th scope="col" className="hidden px-4 py-3 font-semibold lg:table-cell">Last published</th>
                <th scope="col" className="px-5 py-3 text-right font-semibold">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {pages.map((page) => {
                const def = PAGES[page.slug];
                const topIssue = page.audit.checks.find((check) => check.status === "fail") ?? page.audit.checks.find((check) => check.status === "warn");
                return (
                  <tr key={page.slug} className="transition-colors hover:bg-fg/[0.02]">
                    <td className="px-5 py-4">
                      <Link href={`/admin/pages/${page.slug}`} className="font-semibold text-fg hover:text-gold">
                        {def.label}
                      </Link>
                      <p className="font-mono text-xs text-zinc-500">{def.path}</p>
                      <p className="mt-0.5 text-xs">{def.description}</p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <ScoreRing score={page.audit.score} size={44} />
                        {topIssue && <span className="hidden max-w-44 text-xs xl:block">{topIssue.label}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col items-start gap-1">
                        <StatusChip label="Content" draft={page.hasContentDraft} live={Boolean(page.publishedAt)} />
                        <StatusChip label="SEO" draft={page.hasSeoDraft} live={Boolean(page.publishedAt)} />
                      </div>
                    </td>
                    <td className="hidden whitespace-nowrap px-4 py-4 lg:table-cell">
                      {page.publishedAt ? formatDate(page.publishedAt) : <span className="text-zinc-500">Not yet</span>}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/pages/${page.slug}${isAdmin ? "" : "?tab=seo"}`}
                          className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-fg hover:bg-fg/5 hover:text-gold"
                        >
                          <SquarePen aria-hidden className="size-3.5" /> {isAdmin ? "Edit" : "SEO"}
                        </Link>
                        <form action="/api/admin/edit-mode" method="post">
                          <input type="hidden" name="path" value={def.path} />
                          <button
                            type="submit"
                            title="Edit on the live site"
                            className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-gold hover:bg-accent/10"
                          >
                            <PencilRuler aria-hidden className="size-3.5" /> On site
                          </button>
                        </form>
                        <a
                          href={def.path}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`View ${def.label}`}
                          className="grid size-8 place-items-center rounded-lg text-muted hover:bg-fg/5 hover:text-fg"
                        >
                          <ExternalLink aria-hidden className="size-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
