import { ArrowRight } from "lucide-react";
import { CaseStudyCard } from "@/components/case-studies/CaseStudyCard";
import { CmsHeading } from "@/components/cms/CmsHeading";
import { at, EditableText, type Bind } from "@/components/cms/Editable";
import { ButtonLink } from "@/components/ui/Button";
import { Container, Section } from "@/components/ui/Container";
import { getRecentCaseStudies } from "@/lib/case-studies";
import type { HomeContent } from "@/lib/cms/pages/home";

export async function CaseStudies({ bind, content }: { bind: Bind; content: HomeContent["caseStudies"] }) {
  const caseStudies = await getRecentCaseStudies(3).catch((error: unknown) => {
    console.error(error);
    return [];
  });
  if (caseStudies.length === 0) return null;

  return (
    <Section id="results" className="scroll-mt-24 bg-ink-2/60">
      <Container>
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <CmsHeading bind={bind} value={content} align="left" />
          <ButtonLink href="/case-studies" variant="secondary">
            <EditableText bind={at(bind, "buttonLabel")} value={content.buttonLabel} />
            <ArrowRight aria-hidden className="size-4" />
          </ButtonLink>
        </div>
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {caseStudies.map((caseStudy) => (
            <CaseStudyCard key={caseStudy.id} caseStudy={caseStudy} />
          ))}
        </div>
      </Container>
    </Section>
  );
}
