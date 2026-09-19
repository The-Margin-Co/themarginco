import type { IconName } from "@/lib/cms/icons";
import type { Faq, ProcessStep } from "./home";

// PLACEHOLDER CONTENT: hero metrics are illustrative. Replace with verified
// client data before launch (CLAUDE.md → M8).

export type ServiceSlug = "meta-ads" | "facebook-ads" | "website-development";

type Heading = { eyebrow: string; title: string; highlight: string; description: string };

export type ServiceContent = {
  slug: ServiceSlug;
  name: string;
  href: string;
  seo: { title: string; description: string };
  card: { icon: IconName; tag: string; description: string; points: string[] };
  hero: Heading & { metrics: { value: string; label: string }[] };
  problems: { title: string; description: string }[];
  solutions: { title: string; description: string }[];
  deliverables: { icon: IconName; title: string; description: string }[];
  strategy: Heading & {
    items: { label: string; title: string; description: string; points: string[] }[];
  };
  roi: Heading & { points: string[] };
  process: ProcessStep[];
  faqs: Faq[];
};

export const metaAds: ServiceContent = {
  slug: "meta-ads",
  name: "Meta Ads",
  href: "/services/meta-ads",
  seo: {
    title: "Meta Ads Management for DTC & E-commerce",
    description:
      "Profit-first Meta Ads management for DTC and e-commerce brands: Advantage+ campaigns, creative testing, Conversions API tracking and margin-led scaling.",
  },
  card: {
    icon: "Megaphone",
    tag: "DTC & E-com",
    description:
      "Full-funnel Instagram and Facebook campaigns engineered around your margins, from Advantage+ structure to Reels creative.",
    points: ["Advantage+ Shopping campaigns", "UGC & Reels creative testing", "Conversions API tracking"],
  },
  hero: {
    eyebrow: "Meta Ads Management",
    title: "Scale on Instagram & Facebook",
    highlight: "without burning margin.",
    description:
      "We build Meta ad systems for DTC and e-commerce brands: profit-first account structure, relentless creative testing and server-side tracking that feeds the algorithm the data it needs to find your best buyers.",
    metrics: [
      { value: "4.2x", label: "Avg. blended ROAS" },
      { value: "-38%", label: "Median CPA in 90 days" },
      { value: "30+", label: "Creative tests / month" },
    ],
  },
  problems: [
    {
      title: "Creative fatigue every two weeks",
      description:
        "Winning ads die fast on Meta. Without a testing engine, performance decays and CPMs creep up.",
    },
    {
      title: "Broken tracking, blind algorithm",
      description:
        "Pixel-only setups miss a meaningful share of conversions, so Meta optimises on incomplete data.",
    },
    {
      title: "Scaling that kills ROAS",
      description:
        "Doubling budgets overnight resets learning and tanks efficiency. Scale needs rules, not guesswork.",
    },
  ],
  solutions: [
    {
      title: "A creative engine, not one-off ads",
      description:
        "Hooks, angles and formats tested in structured sprints so there's always a new winner in the pipeline.",
    },
    {
      title: "Conversions API + clean signals",
      description:
        "Server-side events, deduplication and value optimisation teach Meta who your profitable customers are.",
    },
    {
      title: "Margin-led scaling rules",
      description:
        "Budgets move on MER, contribution margin and marginal ROAS, never on a single-day spike.",
    },
  ],
  deliverables: [
    {
      icon: "ChartColumn",
      title: "Account architecture",
      description: "Consolidated Advantage+ and manual campaigns structured for fast learning and clean reporting.",
    },
    {
      icon: "Clapperboard",
      title: "Creative strategy & testing",
      description: "Monthly concept sprints across UGC, static, Reels and carousel with a documented test log.",
    },
    {
      icon: "Radar",
      title: "Conversions API setup",
      description: "Server-side tracking, event match quality optimisation and deduplicated pixel events.",
    },
    {
      icon: "Users",
      title: "Audience & signal strategy",
      description: "Broad targeting done right: first-party lists, exclusions and seed audiences that guide the algorithm.",
    },
    {
      icon: "ShoppingBag",
      title: "Catalog & dynamic ads",
      description: "Product feed optimisation and dynamic retargeting that recovers abandoned carts.",
    },
    {
      icon: "ChartLine",
      title: "Weekly reporting",
      description: "MER, ROAS, CPA and creative insights in plain English, every single week.",
    },
  ],
  strategy: {
    eyebrow: "Targeting & Scaling Framework",
    title: "How we scale Meta accounts",
    highlight: "predictably.",
    description:
      "Three layers work together: the right structure, the right signals and the right scaling rules.",
    items: [
      {
        label: "Layer 01",
        title: "Prospecting with Advantage+",
        description:
          "Broad, signal-driven prospecting lets Meta's AI find buyers, guided by creative diversity and customer-list exclusions.",
        points: ["Advantage+ Shopping campaigns", "Broad vs. interest stack tests", "Existing-customer caps"],
      },
      {
        label: "Layer 02",
        title: "Retargeting that respects frequency",
        description:
          "Tiered retargeting windows with offer and message sequencing, so warm audiences convert without fatigue.",
        points: ["1–3, 4–14 and 15–30 day windows", "Dynamic catalog ads", "Frequency guardrails"],
      },
      {
        label: "Layer 03",
        title: "Scaling on margin, not mood",
        description:
          "Vertical and horizontal scaling triggered by contribution margin and marginal ROAS thresholds.",
        points: ["20% budget-step rule", "Winning-creative duplication", "MER-based guardrails"],
      },
    ],
  },
  roi: {
    eyebrow: "ROI Breakdown",
    title: "Model your",
    highlight: "return on ad spend.",
    description:
      "Adjust the inputs to see how cost per click, conversion rate and order value compound into ROAS. On your strategy call we'll build this model with your real numbers.",
    points: [
      "Lower CPC through stronger creative and relevance",
      "Higher conversion rate via landing-page CRO",
      "Higher AOV with bundles and post-purchase offers",
    ],
  },
  process: [
    {
      title: "Account & tracking audit",
      description: "We review structure, creative history, pixel and CAPI health, and your unit economics.",
      deliverables: ["Event match audit", "Wasted-spend report", "Target CPA & MER"],
    },
    {
      title: "Restructure & tracking fix",
      description: "Consolidated campaigns, server-side events and clean conversion values go live.",
      deliverables: ["New account structure", "Conversions API", "Value optimisation"],
    },
    {
      title: "Creative sprint",
      description: "The first wave of hooks, angles and formats is produced and launched as structured tests.",
      deliverables: ["Concept board", "UGC briefs", "Test log"],
    },
    {
      title: "Scale & compound",
      description: "Winners get budget by the rules; losers get cut fast. Every week, a sharper account.",
      deliverables: ["Weekly optimisation", "Scaling playbook", "Monthly strategy review"],
    },
  ],
  faqs: [
    {
      question: "Do you produce the ad creative?",
      answer:
        "Yes. We handle creative strategy, briefs and editing, and coordinate UGC creators when needed. You approve everything before it goes live.",
    },
    {
      question: "Is Advantage+ right for my brand?",
      answer:
        "For most e-commerce brands with healthy purchase volume, yes, as part of a wider structure. We test it against manual campaigns before committing budget.",
    },
    {
      question: "Why does server-side tracking matter?",
      answer:
        "Browser privacy changes mean the pixel alone misses conversions. The Conversions API sends events from your server, improving attribution and optimisation.",
    },
    {
      question: "How do you decide when to scale?",
      answer:
        "We scale on contribution margin and marginal ROAS thresholds agreed with you upfront, increasing budgets in controlled steps to protect efficiency.",
    },
  ],
};

export const facebookAds: ServiceContent = {
  slug: "facebook-ads",
  name: "Facebook Ads",
  href: "/services/facebook-ads",
  seo: {
    title: "Facebook Ads Lead Generation Agency",
    description:
      "Facebook Ads lead generation for service businesses and B2B teams: qualifying Instant Forms, speed-to-lead automation and CRM-powered optimisation.",
  },
  card: {
    icon: "Users",
    tag: "Lead Gen",
    description:
      "Facebook lead generation for service businesses: qualified leads, instant follow-up and a pipeline you can actually forecast.",
    points: ["Instant Forms & landing pages", "Lead-quality optimisation", "CRM & WhatsApp follow-up"],
  },
  hero: {
    eyebrow: "Facebook Ads for Lead Generation",
    title: "Leads that pick up the phone,",
    highlight: "not just fill a form.",
    description:
      "We run Facebook Ads for service businesses, local brands and B2B teams that need a steady pipeline of qualified leads, with qualifying forms, follow-up automation and CRM feedback loops that teach Facebook what a good lead looks like.",
    metrics: [
      { value: "-52%", label: "Cost per booked call" },
      { value: "3.1x", label: "Lead-to-call rate" },
      { value: "<5 min", label: "Automated speed-to-lead" },
    ],
  },
  problems: [
    {
      title: "Cheap leads, zero intent",
      description:
        "Low-friction forms attract tyre-kickers. Your cost per lead looks great; your cost per customer doesn't.",
    },
    {
      title: "Slow follow-up",
      description:
        "Leads contacted hours later rarely convert. Every minute between form fill and first touch costs you deals.",
    },
    {
      title: "No feedback loop",
      description:
        "Facebook optimises for form submissions unless you tell it which leads actually became customers.",
    },
  ],
  solutions: [
    {
      title: "Qualifying forms",
      description:
        "Higher-intent Instant Forms with custom questions, conditional logic and friction exactly where it counts.",
    },
    {
      title: "Speed-to-lead automation",
      description:
        "Instant SMS, email and WhatsApp follow-up plus real-time CRM routing to your sales team.",
    },
    {
      title: "Conversion Leads optimisation",
      description:
        "CRM stages sync back to Meta so the algorithm optimises for booked calls and sales, not just submissions.",
    },
  ],
  deliverables: [
    {
      icon: "Lightbulb",
      title: "Offer & funnel strategy",
      description: "An irresistible, specific offer and a funnel designed around how your buyers actually decide.",
    },
    {
      icon: "FileText",
      title: "Instant Forms & landing pages",
      description: "Form flows and landing pages that qualify leads before they ever reach your team.",
    },
    {
      icon: "MapPin",
      title: "Local & radius targeting",
      description: "Service-area targeting across Feed, Marketplace, Stories and Reels placements.",
    },
    {
      icon: "Repeat",
      title: "Retargeting funnels",
      description: "Proof-driven retargeting for video viewers, page engagers and form openers.",
    },
    {
      icon: "Workflow",
      title: "CRM integration",
      description: "Leads routed instantly to your CRM, inbox or WhatsApp, with outcomes synced back to Meta.",
    },
    {
      icon: "ChartLine",
      title: "Lead-quality reporting",
      description: "Cost per qualified lead, booked call and customer, not just cost per form fill.",
    },
  ],
  strategy: {
    eyebrow: "Targeting Strategy",
    title: "A lead engine built on",
    highlight: "three audiences.",
    description:
      "Cold, warm and customer audiences each get a job, a message and a budget, so no lead source is left to chance.",
    items: [
      {
        label: "Cold",
        title: "Local & broad prospecting",
        description:
          "Radius, interest and broad targeting tested head-to-head, with creative that pre-qualifies before the click.",
        points: ["Radius & postcode targeting", "Feed, Marketplace & Reels", "Pre-qualifying creative"],
      },
      {
        label: "Warm",
        title: "Engagement retargeting",
        description:
          "Video viewers, page engagers and site visitors see proof-driven ads: testimonials, case studies and offers.",
        points: ["Video-view audiences", "Lead-form openers", "Social-proof sequences"],
      },
      {
        label: "Customer",
        title: "CRM-powered lookalikes",
        description:
          "Your best customers become seed audiences, and closed deals feed Conversion Leads optimisation.",
        points: ["Value-based lookalikes", "Offline conversion sync", "Customer exclusions"],
      },
    ],
  },
  roi: {
    eyebrow: "ROI Breakdown",
    title: "See what a lead engine is",
    highlight: "worth to you.",
    description:
      "Play with cost per click, click-to-customer rate and customer value to see how lead-quality improvements change your return.",
    points: [
      "Qualifying forms trade cheap leads for profitable ones",
      "Faster follow-up lifts close rates without more spend",
      "CRM feedback teaches Facebook to find buyers, not browsers",
    ],
  },
  process: [
    {
      title: "Offer & funnel audit",
      description: "We pressure-test your offer, current lead flow and how fast your team follows up.",
      deliverables: ["Offer scorecard", "Funnel map", "Lead-quality baseline"],
    },
    {
      title: "Build the lead engine",
      description: "Forms, landing pages, CRM routing and follow-up automations are built and tested end to end.",
      deliverables: ["Instant Forms", "CRM integration", "Follow-up automations"],
    },
    {
      title: "Launch & qualify",
      description: "Campaigns go live across cold, warm and customer audiences with lead-quality tracking.",
      deliverables: ["Campaign launch", "Creative variants", "Quality scoring"],
    },
    {
      title: "Optimise for revenue",
      description: "CRM outcomes feed back into Meta so spend shifts toward leads that actually close.",
      deliverables: ["Conversion Leads setup", "Weekly reporting", "Scaling plan"],
    },
  ],
  faqs: [
    {
      question: "Instant Forms or a landing page?",
      answer:
        "Both have a place. Instant Forms win on volume and mobile convenience; landing pages win on intent. We usually test both and let cost per qualified lead decide.",
    },
    {
      question: "Can you connect leads to my CRM?",
      answer:
        "Yes. We integrate with HubSpot, GoHighLevel, Pipedrive, Zoho and most CRMs via native integrations or Zapier/Make, plus email, SMS and WhatsApp notifications.",
    },
    {
      question: "How do you improve lead quality?",
      answer:
        "Qualifying questions, higher-intent form types, better offers and, most importantly, sending closed-deal data back to Meta so it optimises for real customers.",
    },
    {
      question: "Do you work with local businesses?",
      answer:
        "Absolutely. Radius targeting, local proof and fast follow-up make Facebook one of the most effective channels for home services, clinics, trades and professional services.",
    },
  ],
};

export const websiteDevelopment: ServiceContent = {
  slug: "website-development",
  name: "Website Development",
  href: "/services/website-development",
  seo: {
    title: "Website Development & High-Converting Landing Pages",
    description:
      "Custom Next.js websites and landing pages engineered for speed, SEO and conversion, so every ad click lands somewhere worth landing.",
  },
  card: {
    icon: "CodeXml",
    tag: "Sub-2s loads",
    description:
      "Custom Next.js websites and landing pages engineered for speed, SEO and conversion, so every click lands somewhere worth landing.",
    points: ["Custom Next.js & headless builds", "Conversion-rate optimisation", "Core Web Vitals in the green"],
  },
  hero: {
    eyebrow: "Website Development",
    title: "Websites engineered to",
    highlight: "convert paid traffic.",
    description:
      "Your ads are only as good as the page they land on. We design and build fast, custom websites and landing pages with conversion psychology baked in, on a modern stack you fully own.",
    metrics: [
      { value: "<2s", label: "Target mobile load (LCP)" },
      { value: "95+", label: "Lighthouse performance target" },
      { value: "100%", label: "Code & content ownership" },
    ],
  },
  problems: [
    {
      title: "Slow pages leak revenue",
      description:
        "Every extra second of mobile load time costs conversions, and you're paying for every click that bounces.",
    },
    {
      title: "Template sites that all look the same",
      description: "Off-the-shelf themes are bloated, generic and painful to optimise.",
    },
    {
      title: "Pretty, but doesn't sell",
      description: "Design without a conversion strategy wins awards, not customers.",
    },
  ],
  solutions: [
    {
      title: "Performance engineering",
      description: "Server-rendered Next.js, optimised media and lean code for near-instant loads on any device.",
    },
    {
      title: "Custom, on-brand design",
      description: "Designed from scratch around your brand, audience and offer. No bloated themes.",
    },
    {
      title: "Conversion architecture",
      description: "Message hierarchy, social proof, friction audits and A/B testing built into every page.",
    },
  ],
  deliverables: [
    {
      icon: "PenTool",
      title: "Custom website design",
      description: "Bespoke UI and UX in Figma, built around your brand and your buyer's journey.",
    },
    {
      icon: "CodeXml",
      title: "Next.js development",
      description: "Type-safe, component-driven builds on Next.js, TypeScript and Tailwind CSS.",
    },
    {
      icon: "MousePointerClick",
      title: "High-converting landing pages",
      description: "Campaign-specific pages that match ad intent and turn clicks into customers.",
    },
    {
      icon: "ShoppingCart",
      title: "E-commerce builds",
      description: "Headless Shopify and custom storefronts that load instantly and check out smoothly.",
    },
    {
      icon: "Search",
      title: "Technical SEO",
      description: "Semantic markup, structured data, sitemaps and metadata handled properly from day one.",
    },
    {
      icon: "Gauge",
      title: "Analytics & tracking",
      description: "GA4, GTM and Meta Conversions API wired in, so every visit is measurable.",
    },
  ],
  strategy: {
    eyebrow: "How We Build",
    title: "Engineering and design,",
    highlight: "working as one.",
    description:
      "Our stack: Next.js, TypeScript, Tailwind CSS, Supabase and Vercel's global edge network, chosen for speed, security and scale.",
    items: [
      {
        label: "Strategy",
        title: "Conversion architecture",
        description:
          "We map the buyer journey, objections and proof points before a single pixel is designed.",
        points: ["Message-market fit review", "Wireframes & copy hierarchy", "Trust & proof placement"],
      },
      {
        label: "Engineering",
        title: "Performance by default",
        description:
          "Server components, static rendering and edge caching deliver pages in milliseconds, not seconds.",
        points: ["Static & ISR rendering", "Image & font optimisation", "Global CDN delivery"],
      },
      {
        label: "Growth",
        title: "Measure & iterate",
        description:
          "Analytics wired from launch, plus heatmaps and A/B tests to keep improving conversion rate after go-live.",
        points: ["Event-level analytics", "Heatmaps & session replays", "Ongoing CRO sprints"],
      },
    ],
  },
  roi: {
    eyebrow: "Performance Standards",
    title: "Built to pass",
    highlight: "Core Web Vitals.",
    description:
      "Speed is a conversion feature. Every build ships with performance budgets and is tested against Google's Core Web Vitals on real mobile devices.",
    points: [
      "Performance budgets enforced before launch",
      "Tested on mid-range mobile over 4G",
      "Monitored after launch, not just on day one",
    ],
  },
  process: [
    {
      title: "Discovery & strategy",
      description: "Goals, audience, offer and competitors, distilled into a clear site map and conversion plan.",
      deliverables: ["Site map", "Conversion plan", "Content outline"],
    },
    {
      title: "Design",
      description: "Wireframes, then high-fidelity designs for desktop and mobile, iterated with your feedback.",
      deliverables: ["Wireframes", "UI design", "Interactive prototype"],
    },
    {
      title: "Build & integrate",
      description: "Pixel-perfect development with CMS, analytics, forms and integrations wired in.",
      deliverables: ["Next.js build", "CMS setup", "Tracking & integrations"],
    },
    {
      title: "Launch & optimise",
      description: "QA across devices, performance tuning, launch, then CRO sprints on real traffic.",
      deliverables: ["QA & speed tuning", "Go-live", "CRO roadmap"],
    },
  ],
  faqs: [
    {
      question: "How long does a website take?",
      answer:
        "Landing pages typically take 1–2 weeks. Full marketing websites take 4–8 weeks depending on scope, content and integrations.",
    },
    {
      question: "Can I edit the content myself?",
      answer:
        "Yes. We connect a CMS so your team can publish pages, blog posts and updates without touching code.",
    },
    {
      question: "Why Next.js instead of WordPress?",
      answer:
        "Next.js delivers faster load times, stronger security and better Core Web Vitals out of the box, which means better SEO and higher conversion rates on paid traffic.",
    },
    {
      question: "Do you offer hosting and maintenance?",
      answer:
        "We deploy to Vercel's global edge network and offer optional monthly care plans covering updates, monitoring and CRO experiments.",
    },
  ],
};

export const services: ServiceContent[] = [metaAds, facebookAds, websiteDevelopment];
