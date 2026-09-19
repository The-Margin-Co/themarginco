import { ArrowLeft, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { AdminAccessState } from "@/components/admin/AdminAccessState";
import { AdminShell } from "@/components/admin/AdminShell";
import { CaseStudyEditor } from "@/components/admin/CaseStudyEditor";
import { CaseStudySeoEditor } from "@/components/admin/CaseStudySeoEditor";
import { ButtonLink } from "@/components/ui/Button";
import { toFormValues } from "@/lib/case-study-form";
import { getStaffSession } from "@/lib/auth";
import { parsePostSeo } from "@/lib/seo/schema";
import { updateCaseStudy, updateCaseStudySeo } from "../actions";

export const metadata: Metadata = { title: "Edit case study" };

export default async function EditCaseStudyPage({ params, searchParams }: PageProps<"/admin/case-studies/[id]">) {
  const { id } = await params;
  const session = await getStaffSession();
  if (session.state !== "staff") return <AdminAccessState session={session} next={`/admin/case-studies/${id}`} />;
  if (!z.uuid().safeParse(id).success) notFound();

  const { data: caseStudy } = await session.supabase.from("case_studies").select("*").eq("id", id).maybeSingle();
  if (!caseStudy) notFound();

  const { created } = await searchParams;
  const status = caseStudy.status === "published" ? "published" : "draft";
  const seo = parsePostSeo(caseStudy.seo);

  if (session.role !== "admin") {
    return (
      <AdminShell
        email={session.user.email ?? ""}
        role={session.role}
        title="Case study SEO"
        description={caseStudy.title}
        actions={
          <Link href="/admin/case-studies" className="hidden items-center gap-1.5 text-sm font-semibold text-muted hover:text-fg sm:flex">
            <ArrowLeft aria-hidden className="size-4" /> All case studies
          </Link>
        }
      >
        <CaseStudySeoEditor
          action={updateCaseStudySeo.bind(null, caseStudy.id)}
          caseStudy={{ title: caseStudy.title, slug: caseStudy.slug, excerpt: caseStudy.excerpt, status, featuredImage: caseStudy.featured_image ?? "" }}
          initialMeta={{
            meta_title: caseStudy.meta_title ?? "",
            meta_description: caseStudy.meta_description ?? "",
            meta_keywords: caseStudy.meta_keywords ?? "",
          }}
          initialSeo={seo}
        />
      </AdminShell>
    );
  }

  return (
    <AdminShell
      email={session.user.email ?? ""}
      title="Edit case study"
      description={caseStudy.title}
      actions={
        <>
          <Link href="/admin/case-studies" className="hidden items-center gap-1.5 text-sm font-semibold text-muted hover:text-fg sm:flex">
            <ArrowLeft aria-hidden className="size-4" /> All case studies
          </Link>
          <ButtonLink href="/admin/case-studies/new" size="sm" variant="secondary">
            <Plus aria-hidden className="size-4" /> New case study
          </ButtonLink>
        </>
      }
    >
      <CaseStudyEditor
        mode="edit"
        initial={toFormValues(caseStudy)}
        initialStatus={status}
        action={updateCaseStudy.bind(null, caseStudy.id)}
        notice={created === "1" ? (status === "published" ? "Case study published. It's live." : "Draft created.") : undefined}
        publishedAt={caseStudy.published_at}
        updatedAt={caseStudy.updated_at}
        initialSeo={seo}
      />
    </AdminShell>
  );
}
