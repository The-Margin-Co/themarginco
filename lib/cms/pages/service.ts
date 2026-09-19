import { z } from "zod";
import {
  facebookAds,
  metaAds,
  websiteDevelopment,
  type ServiceContent as LegacyService,
} from "@/lib/cms/defaults/services";
import { faqItems, field, heading, headingFields, processSteps } from "@/lib/cms/fields";

const titled = (label: string, itemLabel: string, max = 6) =>
  field.list(
    label,
    z.object({ title: field.text("Title", { max: 80 }), description: field.textarea("Text", { max: 300 }) }),
    { max, itemLabel },
  );

export const serviceSchema = z.object({
  name: field.text("Service name", { max: 40, help: "Used in cards, breadcrumbs and headings." }),
  card: field.block(
    "Service card (home & related)",
    {
      icon: field.icon(),
      tag: field.text("Tag", { max: 24 }),
      description: field.textarea("Card text", { max: 240 }),
      points: field.list("Card points", field.text("Point", { max: 60 }), { max: 5, itemLabel: "Point" }),
    }),
  hero: field.block(
    "Hero",
    {
      ...heading(),
      primaryLabel: field.text("Primary button label", { max: 40 }),
      secondaryLabel: field.text("Secondary button label", { max: 40 }),
      metrics: field.list(
        "Hero metrics",
        z.object({ value: field.text("Value", { max: 12 }), label: field.text("Label", { max: 40 }) }),
        { max: 3, itemLabel: "Metric" },
      ),
      snapshotNote: field.text("Snapshot card: left note", { max: 40 }),
      snapshotHighlight: field.text("Snapshot card: right note", { max: 30 }),
    }),
  problems: field.section("Problem vs. approach", {
    ...heading(),
    leaksLabel: field.text("Left card label", { max: 40 }),
    approachLabel: field.text("Right card label", { max: 40 }),
    problems: titled("Problems", "Problem"),
    solutions: titled("Solutions", "Solution"),
  }),
  deliverables: field.section("What's included", {
    ...heading(),
    items: field.list(
      "Deliverables",
      z.object({ icon: field.icon(), title: field.text("Title", { max: 60 }), description: field.textarea("Text", { max: 240 }) }),
      { max: 12, itemLabel: "Deliverable" },
    ),
  }),
  strategy: field.section("Strategy", {
    ...heading(),
    items: field.list(
      "Strategy cards",
      z.object({
        label: field.text("Badge", { max: 24 }),
        title: field.text("Title", { max: 80 }),
        description: field.textarea("Text", { max: 300 }),
        points: field.list("Points", field.text("Point", { max: 60 }), { max: 5, itemLabel: "Point" }),
      }),
      { max: 6, itemLabel: "Card" },
    ),
  }),
  roi: field.section("ROI / performance", {
    ...heading(),
    points: field.list("Points", field.text("Point", { max: 100 }), { max: 5, itemLabel: "Point" }),
  }),
  process: field.section("Process", { ...heading(), steps: processSteps() }),
  faq: field.section("FAQ", { ...headingFields(), items: faqItems() }),
  related: field.section("Related services", headingFields()),
  cta: field.section("Call-to-action band", {
    title: field.text("Heading", { max: 100 }),
    highlight: field.text("Heading highlight (yellow)", { max: 80 }),
  }),
});

export type ServiceContent = z.infer<typeof serviceSchema>;

function fromLegacy(service: LegacyService): ServiceContent {
  return {
    name: service.name,
    card: service.card,
    hero: {
      ...service.hero,
      primaryLabel: "Book a Free Strategy Call",
      secondaryLabel: "See what's included",
      snapshotNote: "Free growth audit included",
      snapshotHighlight: "48h turnaround",
    },
    problems: {
      visible: true,
      eyebrow: "The Problem",
      title: `Why most ${service.name.toLowerCase()} efforts`,
      highlight: "stall.",
      description: "The same few leaks show up in almost every account we audit. Here's how we plug them.",
      leaksLabel: "Where growth leaks",
      approachLabel: "The Margin approach",
      problems: service.problems,
      solutions: service.solutions,
    },
    deliverables: {
      visible: true,
      eyebrow: "What's Included",
      title: "Everything you need,",
      highlight: "done for you.",
      description: `A complete ${service.name} programme, not a menu of disconnected tasks.`,
      items: service.deliverables,
    },
    strategy: { visible: true, ...service.strategy },
    roi: { visible: true, ...service.roi },
    process: {
      visible: true,
      eyebrow: "How It Works",
      title: "From kickoff to",
      highlight: "compounding growth.",
      description: "Clear phases, clear deliverables and a clear owner for every task.",
      steps: service.process,
    },
    faq: { visible: true, eyebrow: "FAQ", title: service.name, highlight: "questions, answered.", items: service.faqs },
    related: { visible: true, eyebrow: "Explore More", title: "Services that", highlight: "work together." },
    cta: { visible: true, title: "Ready to grow with", highlight: `${service.name}?` },
  };
}

export const serviceDocs = {
  "services/meta-ads": { legacy: metaAds, defaults: fromLegacy(metaAds) },
  "services/facebook-ads": { legacy: facebookAds, defaults: fromLegacy(facebookAds) },
  "services/website-development": { legacy: websiteDevelopment, defaults: fromLegacy(websiteDevelopment) },
} as const;
