import { z } from "zod";
import { field, heading } from "@/lib/cms/fields";

// Case studies live in the `case_studies` table (like blog posts); this doc only
// holds the index page's chrome and the per-detail-page static labels.
export const caseStudiesSchema = z.object({
  hero: field.block("Case studies header", heading()),
  empty: field.block(
    "Empty state",
    { title: field.text("Heading", { max: 80 }), text: field.textarea("Text", { max: 300 }) }),
  cta: field.section("Call-to-action band", {
    title: field.text("Heading", { max: 100 }),
    highlight: field.text("Heading highlight (yellow)", { max: 80 }),
  }),
  caseStudy: field.block(
    "Case study page",
    {
      backLabel: field.text("Back link label", { max: 40 }),
      ctaTitle: field.text("CTA heading", { max: 100 }),
      ctaHighlight: field.text("CTA highlight (yellow)", { max: 80 }),
      relatedTitle: field.text("Related case studies heading", { max: 60 }),
      relatedHighlight: field.text("Related case studies highlight", { max: 40 }),
    }),
});

export type CaseStudiesContent = z.infer<typeof caseStudiesSchema>;

export const caseStudiesDefaults: CaseStudiesContent = {
  hero: {
    eyebrow: "Selected Work",
    title: "Real campaigns.",
    highlight: "Real growth.",
    description: "A look at how profit-first strategy, sharper creative and faster websites turn ad spend into compounding revenue.",
  },
  empty: {
    title: "New results are on the way",
    text: "We're writing up our latest client work right now. Check back soon, or book a call and hear it first-hand.",
  },
  cta: { visible: true, title: "Want results", highlight: "like these?" },
  caseStudy: {
    backLabel: "All case studies",
    ctaTitle: "Want results",
    ctaHighlight: "like this?",
    relatedTitle: "More",
    relatedHighlight: "case studies.",
  },
};
