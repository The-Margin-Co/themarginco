import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { AdminAccessState } from "@/components/admin/AdminAccessState";
import { AdminShell } from "@/components/admin/AdminShell";
import { CaseStudyEditor } from "@/components/admin/CaseStudyEditor";
import { getAdminSession } from "@/lib/auth";
import { EMPTY_CASE_STUDY } from "@/lib/case-study-form";
import { createCaseStudy } from "../actions";

export const metadata: Metadata = { title: "New case study" };

export default async function NewCaseStudyPage() {
  const session = await getAdminSession();
  if (session.state !== "admin") return <AdminAccessState session={session} next="/admin/case-studies/new" />;

  return (
    <AdminShell
      email={session.user.email ?? ""}
      title="New case study"
      description="Write, optimise and publish a new result."
      actions={
        <Link href="/admin/case-studies" className="flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-fg">
          <ArrowLeft aria-hidden className="size-4" /> All case studies
        </Link>
      }
    >
      <CaseStudyEditor mode="create" initial={EMPTY_CASE_STUDY} initialStatus="draft" action={createCaseStudy} />
    </AdminShell>
  );
}
