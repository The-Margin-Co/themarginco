import { z } from "zod";
import { commitments, expertise, values } from "@/lib/cms/defaults/about";
import { field, heading } from "@/lib/cms/fields";

export const aboutSchema = z.object({
  hero: field.block(
    "Hero",
    {
      badge: field.text("Badge", { max: 60 }),
      title: field.text("Heading", { max: 100 }),
      highlight: field.text("Highlighted word (yellow block)", { max: 30 }),
      description: field.textarea("Intro text", { max: 400 }),
      primaryLabel: field.text("Primary button label", { max: 40 }),
      primaryHref: field.url("Primary button link"),
      secondaryLabel: field.text("Secondary button label", { max: 40 }),
      secondaryHref: field.url("Secondary button link"),
    }),
  mission: field.section("Mission", {
    badge: field.text("Badge", { max: 40 }),
    statement: field.text("Statement", { max: 120 }),
    highlight: field.text("Statement highlight (yellow)", { max: 80 }),
    paragraphs: field.list("Paragraphs", field.textarea("Paragraph", { max: 600 }), { max: 4, itemLabel: "Paragraph" }),
    closing: field.textarea("Closing line", { max: 200 }),
    image: field.image("Image (optional)", { help: "Shown beside the mission text when set." }),
    imageAlt: field.text("Image alt text", { max: 160 }),
  }),
  values: field.section("Growth ethos", {
    ...heading(),
    items: field.list(
      "Values",
      z.object({ icon: field.icon(), title: field.text("Title", { max: 60 }), description: field.textarea("Text", { max: 300 }) }),
      { max: 8, itemLabel: "Value" },
    ),
  }),
  expertise: field.section("Expertise", {
    ...heading(),
    items: field.list(
      "Expertise areas",
      z.object({
        icon: field.icon(),
        title: field.text("Title", { max: 60 }),
        description: field.textarea("Text", { max: 200 }),
        capabilities: field.list("Capabilities", field.text("Capability", { max: 40 }), { max: 5, itemLabel: "Capability" }),
      }),
      { max: 9, itemLabel: "Area" },
    ),
  }),
  commitments: field.section("Commitments", {
    ...heading(),
    items: field.list("Commitments", field.text("Commitment", { max: 100 }), { max: 8, itemLabel: "Commitment" }),
  }),
  stats: field.section("Results bar", {}),
  cta: field.section("Call-to-action band", {
    title: field.text("Heading", { max: 100 }),
    highlight: field.text("Heading highlight (yellow)", { max: 80 }),
  }),
});

export type AboutContent = z.infer<typeof aboutSchema>;

export const aboutDefaults: AboutContent = {
  hero: {
    badge: "About The Margin Co",
    title: "The room where growth gets",
    highlight: "decided",
    description:
      "We're a performance marketing and web engineering agency for brands that measure success in profit, not impressions. Strategy, media, creative and code, all in one room.",
    primaryLabel: "Book a Free Strategy Call",
    primaryHref: "/contact",
    secondaryLabel: "Our Services",
    secondaryHref: "/#services",
  },
  mission: {
    visible: true,
    badge: "Our Mission",
    statement: "Make every marketing dollar",
    highlight: "accountable to profit.",
    paragraphs: [
      "Too many brands are sold growth that never reaches the bank account: rising revenue on the dashboard, shrinking margin in reality. We started The Margin Co to fix that.",
      "Our name is our operating principle. Every campaign, creative test and landing page is judged by the margin it creates. When we scale, we scale what's profitable. When something isn't working, we say so, and we change it.",
    ],
    closing: "The result: growth you can forecast, explain and actually keep.",
    image: "",
    imageAlt: "",
  },
  values: {
    visible: true,
    eyebrow: "Growth Ethos",
    title: "What we believe,",
    highlight: "how we operate.",
    description: "Four principles shape every decision we make on your account.",
    items: values,
  },
  expertise: {
    visible: true,
    eyebrow: "Expertise",
    title: "One team, every",
    highlight: "growth lever.",
    description: "Specialists across media, creative, data and engineering, working from the same scoreboard.",
    items: expertise,
  },
  commitments: {
    visible: true,
    eyebrow: "Working Together",
    title: "What you can",
    highlight: "count on.",
    description: "Great partnerships are built on clear expectations. Here's our side of the deal.",
    items: commitments,
  },
  stats: { visible: true },
  cta: { visible: true, title: "Let's find the margin", highlight: "hiding in your growth." },
};
