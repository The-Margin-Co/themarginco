import type { Metadata } from "next";
import { AdminAccessState } from "@/components/admin/AdminAccessState";
import { AdminShell } from "@/components/admin/AdminShell";
import { DocEditor } from "@/components/admin/cms/DocEditor";
import { getAdminSession, getStaffSession } from "@/lib/auth";
import { loadEditorDoc } from "@/lib/cms/editor-data";

export const metadata: Metadata = { title: "Site settings" };

export default async function SiteSettingsPage() {
  const admin = await getAdminSession();
  if (admin.state !== "admin") return <AdminAccessState session={admin} next="/admin/settings" />;
  const session = await getStaffSession();
  if (session.state !== "staff") return <AdminAccessState session={session} next="/admin/settings" />;

  const doc = await loadEditorDoc(session, "site");

  return (
    <AdminShell
      email={session.user.email ?? ""}
      role={session.role}
      title="Site settings"
      description="Content shared by every page: brand, contact details, header, footer, stats and the call-to-action band."
    >
      <DocEditor
        key={doc.version}
        slug="site"
        kind="site-content"
        path={null}
        role={session.role}
        tabs={["content", "history"]}
        initialTab="content"
        initialContent={doc.content}
        initialSeo={doc.seo}
        hasContentDraft={doc.hasContentDraft}
        hasSeoDraft={false}
        contentPublishedAt={doc.contentPublishedAt}
        seoPublishedAt={null}
        revisions={doc.revisions.filter((revision) => revision.part === "content")}
      />
    </AdminShell>
  );
}
