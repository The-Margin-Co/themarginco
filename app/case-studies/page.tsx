import { ChartColumn, Database } from "lucide-react";
import { CaseStudyCard } from "@/components/case-studies/CaseStudyCard";
import { CmsHeading } from "@/components/cms/CmsHeading";
import { at, EditableSection, EditableText, type Bind } from "@/components/cms/Editable";
import { CtaBand } from "@/components/home/CtaBand";
import { PageJsonLd } from "@/components/seo/PageJsonLd";
import { Container, Section } from "@/components/ui/Container";
import { getCaseStudies } from "@/lib/case-studies";
import { getPage, getSite } from "@/lib/cms/load";
import type { CaseStudiesContent } from "@/lib/cms/pages/case-studies";
import { pageMetadata } from "@/lib/seo/page";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export function generateMetadata() {
  return pageMetadata("case-studies");
}

export const revalidate = 60;

const CASE_STUDIES: Bind = { doc: "case-studies", path: "" };

export default async function CaseStudiesPage() {
  const [caseStudies, { content }, site] = await Promise.all([
    getCaseStudies().catch((error: unknown) => {
      console.error(error);
      return [];
    }),
    getPage("case-studies"),
    getSite(),
  ]);
  const [featured, ...rest] = caseStudies;

  return (
    <>
      <PageJsonLd slug="case-studies" />
      <EditableSection bind={at(CASE_STUDIES, "hero")} label="Case studies header">
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]"
          />
          <Container className="relative pb-12 pt-14 lg:pt-20">
            <CmsHeading bind={at(CASE_STUDIES, "hero")} value={content.hero} as="h1" />
          </Container>
        </section>
      </EditableSection>

      <Section className="pt-4 sm:pt-6">
        <Container>
          {featured ? (
            <>
              <h2 className="sr-only">Case studies</h2>
              <CaseStudyCard caseStudy={featured} featured />
              {rest.length > 0 && (
                <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {rest.map((caseStudy) => (
                    <CaseStudyCard key={caseStudy.id} caseStudy={caseStudy} />
                  ))}
                </div>
              )}
            </>
          ) : (
            <EmptyState
              configured={isSupabaseConfigured() || process.env.NODE_ENV === "production"}
              copy={content.empty}
            />
          )}
        </Container>
      </Section>

      <EditableSection bind={at(CASE_STUDIES, "cta")} label="Call-to-action band" visible={content.cta.visible}>
        <CtaBand
          site={site.content}
          heading={{ ...content.cta, titleBind: at(CASE_STUDIES, "cta", "title"), highlightBind: at(CASE_STUDIES, "cta", "highlight") }}
        />
      </EditableSection>
    </>
  );
}

function EmptyState({ configured, copy }: { configured: boolean; copy: CaseStudiesContent["empty"] }) {
  const Icon = configured ? ChartColumn : Database;
  return (
    <div className="card mx-auto max-w-2xl p-10 text-center">
      <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-accent/10 text-gold">
        <Icon aria-hidden className="size-7" />
      </span>
      {configured ? (
        <>
          <EditableText bind={at(CASE_STUDIES, "empty", "title")} value={copy.title} as="h2" className="mt-6 block text-2xl font-extrabold" />
          <EditableText bind={at(CASE_STUDIES, "empty", "text")} value={copy.text} as="p" className="mt-3 block leading-relaxed" />
        </>
      ) : (
        <>
          <h2 className="mt-6 text-2xl font-extrabold">Connect Supabase to load case studies</h2>
          <p className="mt-3 leading-relaxed">
            Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY, then run the SQL migrations in supabase/migrations.
          </p>
        </>
      )}
    </div>
  );
}
