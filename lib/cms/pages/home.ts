import { z } from "zod";
import {
  faqs,
  heroHighlights,
  heroTrust,
  pillars,
  platforms,
  processSteps as defaultSteps,
  testimonials,
} from "@/lib/cms/defaults/home";
import { faqItems, field, heading, headingFields, processSteps } from "@/lib/cms/fields";

export const homeSchema = z.object({
  hero: field.block(
    "Hero",
    {
      badge: field.text("Badge", { max: 60 }),
      line1: field.text("Headline line 1", { max: 40 }),
      line2: field.text("Headline line 2", { max: 40 }),
      highlight: field.text("Highlighted word (yellow block)", { max: 24 }),
      line3: field.text("Headline line 3 (after highlight)", { max: 40 }),
      description: field.textarea("Intro text", { max: 300 }),
      primaryLabel: field.text("Primary button label", { max: 40 }),
      primaryHref: field.url("Primary button link"),
      secondaryLabel: field.text("Secondary button label", { max: 40 }),
      secondaryHref: field.url("Secondary button link"),
      trust: field.list("Trust points", field.text("Point", { max: 40 }), { max: 4, itemLabel: "Point" }),
      highlights: field.list(
        "Mini feature cards",
        z.object({
          icon: field.icon(),
          title: field.text("Title", { max: 30 }),
          description: field.text("Text", { max: 40 }),
        }),
        { max: 3, itemLabel: "Card" },
      ),
    }),
  stats: field.section("Results bar", { title: field.text("Label above stats", { max: 100 }) }),
  platforms: field.section("Platforms marquee", {
    title: field.text("Label", { max: 80 }),
    items: field.list("Platforms", field.text("Platform", { max: 30 }), { max: 24, itemLabel: "Platform" }),
  }),
  services: field.section("Services grid", heading()),
  why: field.section("Why Margin", {
    ...heading(),
    quoteBefore: field.text("Quote: before highlight", { max: 60 }),
    quoteHighlight: field.text("Quote: highlighted word", { max: 24 }),
    quoteAfter: field.text("Quote: after highlight", { max: 60 }),
    quoteCaption: field.text("Quote caption", { max: 80 }),
    chips: field.list("Chips", field.text("Chip", { max: 30 }), { max: 8, itemLabel: "Chip" }),
    pillars: field.list(
      "Pillars",
      z.object({
        icon: field.icon(),
        title: field.text("Title", { max: 60 }),
        description: field.textarea("Text", { max: 240 }),
        tag: field.text("Tag", { max: 24 }),
      }),
      { max: 6, itemLabel: "Pillar" },
    ),
  }),
  // Cards are live-fetched from the `video_testimonials` table; this section only holds
  // the heading copy.
  videoTestimonials: field.section("Video testimonials", heading()),
  // Cards are live-fetched from the `case_studies` table (like `insights` below); this
  // section only holds the heading and the "see all" button label.
  caseStudies: field.section("Case studies", { ...heading(), buttonLabel: field.text("Button label", { max: 30 }) }),
  midCta: field.section("Call-to-action band", {}),
  process: field.section("Process", { ...heading(), steps: processSteps() }),
  testimonials: field.section("Testimonials", {
    ...heading(),
    items: field.list(
      "Testimonials",
      z.object({
        quote: field.textarea("Quote", { max: 400 }),
        role: field.text("Role", { max: 60 }),
        company: field.text("Company", { max: 60 }),
      }),
      { max: 9, itemLabel: "Testimonial" },
    ),
  }),
  insights: field.section("Latest articles", { ...heading(), buttonLabel: field.text("Button label", { max: 30 }) }),
  faq: field.section("FAQ", { ...headingFields(), items: faqItems() }),
  finalCta: field.section("Final call-to-action", {
    badge: field.text("Badge", { max: 60 }),
    title: field.text("Heading", { max: 100 }),
    highlight: field.text("Highlighted word", { max: 30 }),
    description: field.textarea("Text", { max: 300 }),
    primaryLabel: field.text("Primary button label", { max: 40 }),
    secondaryLabel: field.text("Secondary button label", { max: 40 }),
  }),
});

export type HomeContent = z.infer<typeof homeSchema>;

export const homeDefaults: HomeContent = {
  hero: {
    badge: "Now onboarding growth partners",
    line1: "More Revenue",
    line2: "Lower CAC",
    highlight: "Margin",
    line3: "that scales",
    description:
      "We help ambitious brands turn Meta and Facebook ad spend into predictable, profitable growth, and build the high-converting websites that close the loop.",
    primaryLabel: "Book a Free Strategy Call",
    primaryHref: "/contact",
    secondaryLabel: "Explore Services",
    secondaryHref: "#services",
    trust: heroTrust,
    highlights: heroHighlights.map(({ icon, title, description }) => ({ icon, title, description })),
  },
  stats: { visible: true, title: "Helping ambitious brands grow with performance marketing" },
  platforms: { visible: true, title: "Platforms & tools we build and scale on", items: platforms },
  services: {
    visible: true,
    eyebrow: "Core Services",
    title: "Everything you need to",
    highlight: "grow profitably.",
    description:
      "Three disciplines, one growth system. Pick the service you need today; we'll make sure it plays nicely with the rest.",
  },
  why: {
    visible: true,
    eyebrow: "Growth Architecture",
    title: "More than running ads.",
    highlight: "We engineer margin.",
    description:
      "Most agencies chase cheap clicks and pretty dashboards. We combine media buying, creative, tracking and web engineering into one system built around a single number: the profit you keep.",
    quoteBefore: "Revenue is vanity.",
    quoteHighlight: "Margin",
    quoteAfter: "is sanity.",
    quoteCaption: "The Margin Co operating principle",
    chips: ["Meta Ads", "Facebook Lead Gen", "Conversions API", "CRO", "Next.js Builds"],
    pillars: pillars.map(({ icon, title, description, tag }) => ({ icon, title, description, tag: tag ?? "" })),
  },
  videoTestimonials: {
    visible: true,
    eyebrow: "Client Stories",
    title: "Hear it straight",
    highlight: "from our clients.",
    description: "Real client voices on what changed after working with us.",
  },
  caseStudies: {
    visible: true,
    eyebrow: "Selected Work",
    title: "Real campaigns.",
    highlight: "Real growth.",
    description:
      "A look at how profit-first strategy, sharper creative and faster websites turn ad spend into compounding revenue.",
    buttonLabel: "All case studies",
  },
  midCta: { visible: true },
  process: {
    visible: true,
    eyebrow: "Execution Plan",
    title: "Simple process.",
    highlight: "Serious execution.",
    description: "A proven four-phase system that takes you from first call to compounding, profitable growth.",
    steps: defaultSteps,
  },
  testimonials: {
    visible: true,
    eyebrow: "Client Feedback",
    title: "Real results.",
    highlight: "Real feedback.",
    description: "Don't just take our word for it. Here's what founders and operators say after working with us.",
    items: testimonials,
  },
  insights: {
    visible: true,
    eyebrow: "Insights",
    title: "Growth notes from",
    highlight: "the room.",
    description: "Playbooks, teardowns and lessons from the accounts we manage.",
    buttonLabel: "All articles",
  },
  faq: { visible: true, eyebrow: "FAQ", title: "Questions?", highlight: "Answered.", items: faqs },
  finalCta: {
    visible: true,
    badge: "Limited onboarding slots each quarter",
    title: "The room where growth gets",
    highlight: "decided",
    description:
      "Get a free 30-minute strategy call and a 48-hour action roadmap, whether or not you decide to work with us.",
    primaryLabel: "Book a Free Strategy Call",
    secondaryLabel: "Meet The Margin Co",
  },
};
