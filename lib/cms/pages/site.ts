import { z } from "zod";
import { stats } from "@/lib/cms/defaults/home";
import { field } from "@/lib/cms/fields";

const serviceMenuItem = (label: string) =>
  field.group(label, {
    name: field.text("Menu label", { max: 40 }),
    blurb: field.text("Menu description", { max: 80 }),
  });

export const siteSchema = z.object({
  brand: field.group("Brand", {
    name: field.text("Brand name", { max: 60 }),
    tagline: field.text("Tagline", { max: 120 }),
    description: field.textarea("Short description (footer)", { max: 300 }),
  }),
  contact: field.group("Contact & booking", {
    email: field.text("Email address", { max: 120 }),
    bookingUrl: field.url("Booking link (Calendly)"),
    instagram: field.url("Instagram profile URL"),
    instagramHandle: field.text("Instagram handle", { max: 40 }),
    responseTime: field.text("Response time promise", { max: 60, help: "Shown as “…a personal reply within 1 business day.”" }),
  }),
  nav: field.group("Header", {
    ctaLabel: field.text("Header button label", { max: 30 }),
    mobileCtaLabel: field.text("Mobile menu button label", { max: 40 }),
    metaAds: serviceMenuItem("Services menu: Meta Ads"),
    facebookAds: serviceMenuItem("Services menu: Facebook Ads"),
    websiteDevelopment: serviceMenuItem("Services menu: Website Development"),
  }),
  footer: field.group("Footer", {
    calendlyText: field.text("Calendly link text", { max: 40 }),
    bottomNote: field.text("Bottom note", { max: 120 }),
  }),
  stats: field.list(
    "Results stats (home & about)",
    z.object({
      value: field.number("Number", { min: 0, max: 1_000_000, step: 0.1 }),
      prefix: field.text("Prefix", { max: 4 }),
      suffix: field.text("Suffix", { max: 6 }),
      decimals: field.number("Decimal places", { min: 0, max: 2 }),
      label: field.text("Label", { max: 60 }),
      detail: field.text("Detail", { max: 80 }),
    }),
    { min: 1, max: 6, itemLabel: "Stat" },
  ),
  cta: field.group("Default call-to-action band", {
    title: field.text("Heading", { max: 120 }),
    highlight: field.text("Heading highlight (yellow)", { max: 80 }),
    description: field.textarea("Text", { max: 300 }),
    buttonLabel: field.text("Button label", { max: 40 }),
    points: field.list("Check points", field.text("Point", { max: 40 }), { max: 4, itemLabel: "Point" }),
    calendlyLabel: field.text("Calendly link text", { max: 40 }),
  }),
});

export type SiteContent = z.infer<typeof siteSchema>;

export const siteDefaults: SiteContent = {
  brand: {
    name: "The Margin Co",
    tagline: "The room where growth gets decided.",
    description:
      "The Margin Co is a performance marketing agency that scales brands with profit-first Meta Ads, Facebook Ads and conversion-engineered websites.",
  },
  contact: {
    // TODO(launch): replace with the agency's real inbox.
    email: "hello@yourdomain.com",
    bookingUrl: "https://calendly.com/d/dtkm-7wt-dxb/margin-co",
    instagram: "https://www.instagram.com/join_margin/",
    instagramHandle: "@join_margin",
    responseTime: "within 1 business day",
  },
  nav: {
    ctaLabel: "Book a Call",
    mobileCtaLabel: "Book a Free Strategy Call",
    metaAds: { name: "Meta Ads", blurb: "Instagram + Facebook growth for DTC & e-commerce" },
    facebookAds: { name: "Facebook Ads", blurb: "Lead generation that fills your calendar" },
    websiteDevelopment: { name: "Website Development", blurb: "Fast, conversion-engineered websites" },
  },
  footer: {
    calendlyText: "Pick a time on Calendly",
    bottomNote: "Built for brands that care about margin, not vanity metrics.",
  },
  stats: stats.map((stat) => ({ prefix: "", suffix: "", decimals: 0, ...stat })),
  cta: {
    title: "Ready to turn ad spend into",
    highlight: "predictable profit?",
    description:
      "Book a complimentary 30-minute strategy call. Zero sales pressure, just an honest look at where your growth is leaking and how to fix it.",
    buttonLabel: "Book a Free Strategy Call",
    points: ["Free 30-min audit", "48h action roadmap", "Zero sales pressure"],
    calendlyLabel: "or pick a time on Calendly",
  },
};
