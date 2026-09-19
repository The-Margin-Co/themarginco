import { z } from "zod";
import { field, heading } from "@/lib/cms/fields";

export const blogSchema = z.object({
  hero: field.block("Blog header", heading()),
  empty: field.block(
    "Empty state",
    { title: field.text("Heading", { max: 80 }), text: field.textarea("Text", { max: 300 }) }),
  cta: field.section("Call-to-action band", {
    title: field.text("Heading", { max: 100 }),
    highlight: field.text("Heading highlight (yellow)", { max: 80 }),
  }),
  post: field.block(
    "Article page",
    {
      backLabel: field.text("Back link label", { max: 40 }),
      ctaTitle: field.text("CTA heading", { max: 100 }),
      ctaHighlight: field.text("CTA highlight (yellow)", { max: 80 }),
      relatedTitle: field.text("Related posts heading", { max: 60 }),
      relatedHighlight: field.text("Related posts highlight", { max: 40 }),
    }),
});

export type BlogContent = z.infer<typeof blogSchema>;

export const blogDefaults: BlogContent = {
  hero: {
    eyebrow: "The Margin Blog",
    title: "Growth notes from",
    highlight: "the room.",
    description: "Playbooks, teardowns and hard-won lessons on paid social, lead generation and high-converting websites.",
  },
  empty: {
    title: "Fresh articles are on the way",
    text: "We're writing new playbooks right now. Check back soon, or book a call and get the insights first-hand.",
  },
  cta: { visible: true, title: "Want these playbooks", highlight: "run on your account?" },
  post: {
    backLabel: "All articles",
    ctaTitle: "Want this playbook",
    ctaHighlight: "applied to your brand?",
    relatedTitle: "More from",
    relatedHighlight: "the room.",
  },
};
