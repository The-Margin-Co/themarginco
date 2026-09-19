import type { IconName } from "@/lib/cms/icons";

export const values: { icon: IconName; title: string; description: string }[] = [
  {
    icon: "ChartLine",
    title: "Profit over vanity",
    description:
      "Clicks, impressions and even ROAS can lie. We report on contribution margin, MER and customer value, the numbers that pay salaries.",
  },
  {
    icon: "Eye",
    title: "Radical transparency",
    description:
      "Live dashboards, plain-English weekly updates and honest calls when something isn't working. No black boxes, no smoke.",
  },
  {
    icon: "Rocket",
    title: "Testing velocity",
    description:
      "The brands that win test more, learn faster and act on data sooner. We run structured experiments every single week.",
  },
  {
    icon: "ShieldCheck",
    title: "You own everything",
    description:
      "Ad accounts, pixels, creative, code and data all live in your name. We earn the relationship; we never hold it hostage.",
  },
];

export const expertise: { icon: IconName; title: string; description: string; capabilities: string[] }[] = [
  {
    icon: "Brain",
    title: "Paid social strategy",
    description: "Account architecture and media buying across Meta's full ecosystem.",
    capabilities: ["Advantage+ campaigns", "Lead generation", "Budget scaling systems"],
  },
  {
    icon: "Clapperboard",
    title: "Creative strategy",
    description: "Hooks, angles and formats engineered for thumb-stopping performance.",
    capabilities: ["UGC & Reels", "Concept testing", "Creative analytics"],
  },
  {
    icon: "Radar",
    title: "Tracking & analytics",
    description: "Clean, server-side data so every decision rests on the truth.",
    capabilities: ["Conversions API", "GA4 & GTM", "Attribution modelling"],
  },
  {
    icon: "CodeXml",
    title: "Web engineering",
    description: "Fast, custom websites built on a modern, secure stack.",
    capabilities: ["Next.js & TypeScript", "Headless commerce", "Supabase backends"],
  },
  {
    icon: "MousePointerClick",
    title: "Conversion optimisation",
    description: "Turning more of the traffic you already pay for into customers.",
    capabilities: ["Landing-page CRO", "A/B testing", "Funnel analysis"],
  },
  {
    icon: "Handshake",
    title: "Growth partnership",
    description: "A strategic seat at the table, not just an order-taker.",
    capabilities: ["Offer strategy", "Unit economics", "Quarterly planning"],
  },
];

export const commitments = [
  "A dedicated strategist who knows your numbers",
  "Weekly written performance updates",
  "Response to every message within 1 business day",
  "Rolling monthly terms after the first 90 days",
];
