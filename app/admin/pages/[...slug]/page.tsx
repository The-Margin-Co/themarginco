import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminAccessState } from "@/components/admin/AdminAccessState";
import { AdminShell } from "@/components/admin/AdminShell";
import { DocEditor, type EditorTab } from "@/components/admin/cms/DocEditor";
import { getStaffSession } from "@/lib/auth";
import { loadEditorDoc, loadPagesOverview } from "@/lib/cms/editor-data";
import { PAGES, type PageSlug } from "@/lib/cms/registry";
import type { PageSeo } from "@/lib/seo/schema";

export async function generateMetadata({ params }: PageProps<"/admin/pages/[...slug]">): Promise<Metadata> {
  const slug = (await params).slug.join("/");
  return { title: slug in PAGES ? `Edit ${PAGES[slug as PageSlug].label}` : "Edit page" };
}

const AUTO_LABELS: Record<string, string> = {
  Organization: "Organization",
  WebSite: "WebSite",
  WebPage: "WebPage",
  BreadcrumbList: "BreadcrumbList",
  Service: "Service",
  FAQPage: "FAQPage",
  Blog: "Blog",
};

export default async function EditPagePage({ params, searchParams }: PageProps<"/admin/pages/[...slug]">) {
  const slug = (await params).slug.join("/");
  const session = await getStaffSession();
  if (session.state !== "staff") return <AdminAccessState session={session} next={`/admin/pages/${slug}`} />;
  if (!(slug in PAGES)) notFound();

  const pageSlug = slug as PageSlug;
  const def = PAGES[pageSlug];
  const [doc, overview, query] = await Promise.all([loadEditorDoc(session, pageSlug), loadPagesOverview(session), searchParams]);
  const current = overview.pages.find((page) => page.slug === pageSlug);
  const others = overview.pages.filter((page) => page.slug !== pageSlug);
  const seo = doc.seo as PageSeo;

  const tabs: EditorTab[] = session.role === "admin" ? ["content", "seo", "schema", "history"] : ["seo", "schema", "history"];
  const requested = typeof query.tab === "string" ? (query.tab as EditorTab) : tabs[0];

  return (
    <AdminShell
      email={session.user.email ?? ""}
      role={session.role}
      title={def.label}
      description={def.path}
      actions={
        <Link href="/admin/pages" className="flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-fg">
          <ArrowLeft aria-hidden className="size-4" /> All pages
        </Link>
      }
    >
      <DocEditor
        key={doc.version}
        slug={pageSlug}
        kind="page"
        path={def.path}
        role={session.role}
        tabs={tabs}
        initialTab={requested}
        initialContent={doc.content}
        initialSeo={seo}
        hasContentDraft={doc.hasContentDraft}
        hasSeoDraft={doc.hasSeoDraft}
        contentPublishedAt={doc.contentPublishedAt}
        seoPublishedAt={doc.seoPublishedAt}
        revisions={session.role === "admin" ? doc.revisions : doc.revisions.filter((revision) => revision.part === "seo")}
        seoContext={{
          fallbackTitle: overview.siteSeo.title_template.replace("%s", def.label),
          fallbackDescription: overview.siteSeo.default_description,
          hasFaqs: current?.hasFaqs ?? false,
          autoSchemas: def.autoSchemas.map((name) => ({
            name: AUTO_LABELS[name] ?? name,
            active: name !== "FAQPage" || (seo.faq_schema && Boolean(current?.hasFaqs)),
            note: name === "FAQPage" ? "from this page's FAQ section" : undefined,
          })),
          otherTitles: others.map((page) => page.title),
          otherDescriptions: others.map((page) => page.description),
        }}
      />
    </AdminShell>
  );
}
