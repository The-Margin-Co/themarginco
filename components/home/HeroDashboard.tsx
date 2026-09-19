import { ArrowDownRight, ArrowUpRight, ShieldCheck, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const kpis = [
  { label: "ROAS", value: "4.8x", delta: "+38%", up: true },
  { label: "Cost / purchase", value: "$18.40", delta: "-27%", up: false },
  { label: "Purchases", value: "2,914", delta: "+44%", up: true },
  { label: "Revenue", value: "$250K", delta: "+61%", up: true },
];

const revenue = [22, 25, 24, 30, 28, 34, 37, 35, 42, 46, 44, 52, 57, 55, 64];
const spend = [14, 15, 15, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 21];

const campaignMix = [
  { name: "Advantage+ Shopping", share: 52 },
  { name: "Retargeting", share: 27 },
  { name: "Prospecting tests", share: 21 },
];

const CHART_W = 320;
const CHART_H = 110;
const CHART_MAX = 70;

function linePath(values: number[]) {
  const step = CHART_W / (values.length - 1);
  return values
    .map((value, i) => `${i === 0 ? "M" : "L"}${(i * step).toFixed(1)},${(CHART_H - (value / CHART_MAX) * CHART_H).toFixed(1)}`)
    .join(" ");
}

export function HeroDashboard() {
  const revenueLine = linePath(revenue);
  const revenueArea = `${revenueLine} L${CHART_W},${CHART_H} L0,${CHART_H} Z`;

  return (
    <div className="relative mx-auto w-full max-w-xl lg:max-w-none" aria-label="Illustrative Meta Ads performance dashboard" role="img">
      <div aria-hidden className="absolute -inset-6 rounded-[2.5rem] bg-accent/10 blur-3xl" />

      <div aria-hidden className="card relative overflow-hidden rounded-3xl p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-zinc-600" />
            <span className="size-2.5 rounded-full bg-zinc-600" />
            <span className="size-2.5 rounded-full bg-accent" />
          </div>
          <div className="truncate rounded-full border border-line bg-ink/70 px-3 py-1 font-mono text-[11px] text-muted">
            ads-manager <span className="text-gold">·</span> live view
          </div>
          <span className="w-12" />
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-display text-base font-bold text-fg">Meta Ads Performance</p>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
              <span className="size-1.5 rounded-full bg-accent animate-pulse-dot" /> Synced 2 min ago
              <span className="text-zinc-600">·</span>
              <span className="uppercase tracking-wider text-zinc-500">Illustrative data</span>
            </p>
          </div>
          <div className="flex rounded-full border border-line bg-ink/60 p-1 text-[11px] font-semibold">
            {["7D", "30D", "90D"].map((range) => (
              <span
                key={range}
                className={cn("rounded-full px-2.5 py-1", range === "30D" ? "bg-accent text-on-accent" : "text-muted")}
              >
                {range}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="rounded-xl border border-line bg-ink/60 p-3">
              <p className="text-[11px] text-muted">{kpi.label}</p>
              <p className="mt-1 font-display text-lg font-extrabold text-fg">{kpi.value}</p>
              <p className="mt-1 inline-flex items-center gap-0.5 rounded-full bg-accent/10 px-1.5 py-0.5 text-[10px] font-semibold text-gold">
                {kpi.up ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
                {kpi.delta}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-3 rounded-xl border border-line bg-ink/60 p-3 sm:p-4">
          <div className="flex items-center justify-between text-[11px]">
            <p className="font-semibold text-fg">Revenue vs. spend</p>
            <div className="flex items-center gap-3 text-muted">
              <span className="flex items-center gap-1.5">
                <span className="h-0.5 w-3 rounded bg-accent" /> Revenue
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-0.5 w-3 rounded bg-zinc-500" /> Spend
              </span>
            </div>
          </div>
          <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="mt-3 h-28 w-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="hero-revenue-fill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#FACC15" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#FACC15" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[0.25, 0.5, 0.75].map((fraction) => (
              <line
                key={fraction}
                x1="0"
                x2={CHART_W}
                y1={CHART_H * fraction}
                y2={CHART_H * fraction}
                stroke="#27272A"
                strokeDasharray="3 4"
              />
            ))}
            <path d={revenueArea} fill="url(#hero-revenue-fill)" />
            <path d={linePath(spend)} fill="none" stroke="#71717A" strokeWidth="1.5" strokeDasharray="4 3" vectorEffect="non-scaling-stroke" />
            <path d={revenueLine} fill="none" stroke="#FACC15" strokeWidth="2.5" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          </svg>
          <div className="mt-2 flex justify-between text-[10px] text-muted">
            <span>Week 1</span>
            <span>Week 2</span>
            <span>Week 3</span>
            <span>Week 4</span>
          </div>
        </div>

        <div className="mt-3 space-y-2.5 rounded-xl border border-line bg-ink/60 p-3 sm:p-4">
          <p className="text-[11px] font-semibold text-fg">Campaign mix</p>
          {campaignMix.map((campaign) => (
            <div key={campaign.name} className="flex items-center gap-3 text-[11px]">
              <span className="w-32 shrink-0 truncate text-muted">{campaign.name}</span>
              <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
                <span className="block h-full rounded-full bg-accent" style={{ width: `${campaign.share}%` }} />
              </span>
              <span className="w-8 text-right font-semibold text-fg">{campaign.share}%</span>
            </div>
          ))}
        </div>
      </div>

      <div aria-hidden className="absolute -right-3 -top-5 hidden items-center gap-2.5 rounded-2xl border border-line bg-charcoal/95 px-3.5 py-2.5 shadow-xl backdrop-blur sm:flex">
        <span className="grid size-8 place-items-center rounded-lg bg-accent/15 text-gold">
          <ShieldCheck className="size-4" />
        </span>
        <span className="text-xs">
          <span className="block font-semibold text-fg">CAPI connected</span>
          <span className="text-muted">Event match: Great</span>
        </span>
      </div>

      <div aria-hidden className="absolute -bottom-6 -left-4 hidden items-center gap-2.5 rounded-2xl border border-line bg-charcoal/95 px-3.5 py-2.5 shadow-xl backdrop-blur sm:flex">
        <span className="grid size-8 place-items-center rounded-lg bg-accent text-on-accent">
          <Sparkles className="size-4" />
        </span>
        <span className="text-xs">
          <span className="block font-semibold text-fg">36 creative tests</span>
          <span className="text-muted">Launched this month</span>
        </span>
      </div>
    </div>
  );
}
