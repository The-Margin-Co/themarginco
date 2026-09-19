import { ExternalLink, FileCode2, Map } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { AdminAccessState } from "@/components/admin/AdminAccessState";
import { AdminShell } from "@/components/admin/AdminShell";
import { DocEditor } from "@/components/admin/cms/DocEditor";
import { ScoreRing } from "@/components/admin/cms/SeoAuditCard";
import { getStaffSession } from "@/lib/auth";
import { loadEditorDoc, loadPagesOverview } from "@/lib/cms/editor-data";
import { PAGES } from "@/lib/cms/registry";

export const metadata: Metadata = { title: "SEO" };

export default async function AdminSeoPage() {
  const session = await getStaffSession();
  if (session.state !== "staff") return <AdminAccessState session={session} next="/admin/seo" />;

  const [doc, overview] = await Promise.all([loadEditorDoc(session, "site"), loadPagesOverview(session)]);
  const ranked = [...overview.pages].sort((a, b) => a.audit.score - b.audit.score);

  return (
    <AdminShell
      email={session.user.email ?? ""}
      role={session.role}
      title="SEO"
      description="Site-wide defaults, structured data, robots.txt and a health check of every page."
      actions={
        <div className="flex gap-2">
          <a href="/robots.txt" target="_blank" rel="noopener noreferrer" className="flex h-9 items-center gap-1.5 rounded-full border border-line px-3 text-xs font-semibold text-fg hover:border-accent/60 hover:text-gold">
            <FileCode2 aria-hidden className="size-3.5" /> robots.txt
          </a>
          <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="flex h-9 items-center gap-1.5 rounded-full border border-line px-3 text-xs font-semibold text-fg hover:border-accent/60 hover:text-gold">
            <Map aria-hidden className="size-3.5" /> sitemap.xml
          </a>
        </div>
      }
    >
      <section aria-labelledby="audit-heading" className="card mb-8 overflow-hidden">
        <header className="border-b border-line bg-ink-2/50 px-5 py-4">
          <h2 id="audit-heading" className="font-sans text-sm font-semibold text-fg">
            Site audit
          </h2>
          <p className="text-xs">Pages with the lowest score first. Open a page to fix its issues.</p>
        </header>
        <ul className="divide-y divide-line">
          {ranked.map((page) => {
            const issues = page.audit.checks.filter((check) => check.status !== "pass");
            return (
              <li key={page.slug} className="flex flex-wrap items-center gap-4 px-5 py-3.5">
                <ScoreRing score={page.audit.score} size={44} />
                <div className="min-w-0 flex-1">
                  <Link href={`/admin/pages/${page.slug}?tab=seo`} className="font-semibold text-fg hover:text-gold">
                    {PAGES[page.slug].label}
                  </Link>
                  <p className="truncate text-xs">
                    {issues.length === 0 ? "No issues" : issues.map((issue) => issue.label).join(" · ")}
                  </p>
                </div>
                <span className="hidden text-xs sm:block">{page.seo.robots.index ? (page.seo.sitemap.include ? "In sitemap" : "Not in sitemap") : "Noindex"}</span>
                <a href={PAGES[page.slug].path} target="_blank" rel="noopener noreferrer" aria-label={`View ${PAGES[page.slug].label}`} className="grid size-8 place-items-center rounded-lg text-muted hover:bg-fg/5 hover:text-fg">
                  <ExternalLink aria-hidden className="size-4" />
                </a>
              </li>
            );
          })}
        </ul>
      </section>

      <h2 className="mb-4 text-lg font-extrabold tracking-tight">Site-wide SEO settings</h2>
      <DocEditor
        key={doc.version}
        slug="site"
        kind="site-seo"
        path={null}
        role={session.role}
        tabs={["seo", "history"]}
        initialTab="seo"
        initialContent={doc.content}
        initialSeo={doc.seo}
        hasContentDraft={false}
        hasSeoDraft={doc.hasSeoDraft}
        contentPublishedAt={null}
        seoPublishedAt={doc.seoPublishedAt}
        revisions={doc.revisions.filter((revision) => revision.part === "seo")}
      />
    </AdminShell>
  );
}
