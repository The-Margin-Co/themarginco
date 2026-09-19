import type { IconName } from "@/lib/cms/icons";

// PLACEHOLDER CONTENT: every metric, case study and testimonial in this file is
// illustrative. Replace with verified client data before launch (CLAUDE.md → M8).

export type Stat = {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  label: string;
  detail: string;
};

export type ProcessStep = { title: string; description: string; deliverables: string[] };
export type Faq = { question: string; answer: string };
export type Feature = { icon: IconName; title: string; description: string; tag?: string };

export const heroTrust = ["Free 30-min growth audit", "48h action roadmap", "No lock-in contracts"];

export const heroHighlights: Feature[] = [
  { icon: "Crosshair", title: "Target right", description: "Signal-rich audiences" },
  { icon: "Scissors", title: "Cut waste", description: "Kill losers in 72h" },
  { icon: "TrendingUp", title: "Scale profit", description: "Margin-led budgets" },
];

export const stats: Stat[] = [
  { value: 4.2, suffix: "x", decimals: 1, label: "Avg. blended ROAS", detail: "Across active e-commerce accounts" },
  { value: 38, suffix: "%", label: "Lower cost per acquisition", detail: "Median within the first 90 days" },
  { value: 2.5, prefix: "$", suffix: "M+", decimals: 1, label: "Ad spend managed", detail: "Across Meta & Facebook campaigns" },
  { value: 48, suffix: "h", label: "Audit turnaround", detail: "From strategy call to roadmap" },
];

export const platforms = [
  "Meta",
  "Instagram",
  "Facebook",
  "WhatsApp",
  "Shopify",
  "WooCommerce",
  "Next.js",
  "Google Analytics 4",
  "Google Tag Manager",
  "Klaviyo",
  "Vercel",
  "Supabase",
];

export const pillars: Feature[] = [
  {
    icon: "ChartLine",
    title: "Profit-first media buying",
    description: "We optimise for contribution margin and MER, so growth shows up in your bank account, not just in Ads Manager.",
    tag: "MER-led",
  },
  {
    icon: "Sparkles",
    title: "Creative testing engine",
    description: "Structured sprints of hooks, angles and formats keep a pipeline of fresh winners and stop fatigue before it starts.",
    tag: "30+ tests / mo",
  },
  {
    icon: "Crosshair",
    title: "Server-side tracking",
    description: "Conversions API, deduplicated events and clean first-party data give the algorithm the signal it needs.",
    tag: "CAPI + GA4",
  },
  {
    icon: "Gauge",
    title: "Conversion-focused web",
    description: "Fast, custom landing pages and websites turn expensive clicks into customers instead of bounces.",
    tag: "Sub-2s loads",
  },
];

// Case studies moved to the `case_studies` table (see lib/case-studies.ts) and
// supabase/seed.sql, which carries these same 3 examples forward as real rows.

export const processSteps: ProcessStep[] = [
  {
    title: "Discovery & strategy call",
    description:
      "We map your margins, offer, current performance and growth targets. No sales script, just an honest fit check.",
    deliverables: ["Margin & KPI mapping", "Opportunity sizing", "Go / no-go recommendation"],
  },
  {
    title: "Audit & growth roadmap",
    description:
      "A 360° audit of your ad accounts, tracking and funnel, delivered as a prioritised 90-day roadmap within 48 hours.",
    deliverables: ["Account & pixel audit", "Funnel teardown", "90-day roadmap"],
  },
  {
    title: "Build & launch",
    description:
      "We rebuild campaign structure, fix tracking with CAPI, produce creative tests and ship conversion-focused landing pages.",
    deliverables: ["Campaign architecture", "Server-side tracking", "Creative test matrix"],
  },
  {
    title: "Optimise & scale",
    description:
      "Weekly iteration on creative, audiences and budgets, scaling winners by the numbers and never by gut feel.",
    deliverables: ["Weekly reporting", "Budget scaling rules", "Quarterly strategy reviews"],
  },
];

export type Testimonial = { quote: string; role: string; company: string };

export const testimonials: Testimonial[] = [
  {
    quote:
      "Within 90 days we went from barely breaking even on Meta to the best numbers we've ever had. Every conversation is about margin, not clicks.",
    role: "Founder",
    company: "DTC skincare brand",
  },
  {
    quote:
      "Our sales team finally gets leads that pick up the phone. The CRM integration alone changed how we forecast the month.",
    role: "Operations Director",
    company: "Home-services company",
  },
  {
    quote:
      "The new site loads instantly and the paid traffic that used to bounce now buys. It paid for itself in the first month.",
    role: "Co-founder",
    company: "Fitness apparel store",
  },
];

export const faqs: Faq[] = [
  {
    question: "How quickly will I see results?",
    answer:
      "Most accounts see efficiency gains (lower CPA, cleaner tracking) within the first 2–4 weeks. Sustainable scale typically compounds over 60–90 days as creative testing and data quality improve.",
  },
  {
    question: "Do you require long-term contracts?",
    answer:
      "No. After an initial 90-day growth sprint we work on rolling monthly agreements. We'd rather earn your business every month.",
  },
  {
    question: "What ad budget do I need?",
    answer:
      "We do our best work with brands spending at least $5,000/month on paid social, or ready to once tracking and offer are dialled in. On the strategy call we'll tell you honestly if we're a fit.",
  },
  {
    question: "Who owns the ad accounts, creative and website?",
    answer:
      "You do. Everything is built inside your Business Manager, pixel, domain and codebase. If we ever part ways, you keep 100% of it.",
  },
  {
    question: "Do you only work with e-commerce brands?",
    answer:
      "No. Our Meta Ads programmes are built for DTC and e-commerce, our Facebook Ads programmes focus on lead generation for service businesses, and our web team builds for both.",
  },
  {
    question: "How do you report on performance?",
    answer:
      "A live dashboard plus a weekly written update covering spend, revenue, ROAS/MER, CPA, creative learnings and next actions. No vanity metrics.",
  },
];
