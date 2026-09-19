import type { CaseStudy, CaseStudyMetric } from "@/lib/types";
import type { CaseStudyField } from "@/lib/validation";

export type CaseStudyFormValues = Record<Exclude<CaseStudyField, "status" | "metrics">, string> & {
  metrics: CaseStudyMetric[];
};

export const EMPTY_CASE_STUDY: CaseStudyFormValues = {
  title: "",
  slug: "",
  industry: "",
  channels: "",
  excerpt: "",
  content: "",
  meta_title: "",
  meta_description: "",
  meta_keywords: "",
  featured_image: "",
  featured_image_alt: "",
  metrics: [],
};

export function toFormValues(caseStudy: CaseStudy): CaseStudyFormValues {
  return {
    title: caseStudy.title,
    slug: caseStudy.slug,
    industry: caseStudy.industry,
    channels: caseStudy.channels ?? "",
    excerpt: caseStudy.excerpt,
    content: caseStudy.content,
    meta_title: caseStudy.meta_title ?? "",
    meta_description: caseStudy.meta_description ?? "",
    meta_keywords: caseStudy.meta_keywords ?? "",
    featured_image: caseStudy.featured_image ?? "",
    featured_image_alt: caseStudy.featured_image_alt ?? "",
    metrics: (caseStudy.metrics as CaseStudyMetric[] | null) ?? [],
  };
}
