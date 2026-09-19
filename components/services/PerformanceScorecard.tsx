import { Gauge } from "lucide-react";

const scores = [
  { label: "Performance", value: 95 },
  { label: "Accessibility", value: 100 },
  { label: "Best Practices", value: 100 },
  { label: "SEO", value: 100 },
];

const vitals = [
  { metric: "LCP", name: "Largest Contentful Paint", target: "< 2.0s", threshold: "Google 'good': ≤ 2.5s", fill: 80 },
  { metric: "INP", name: "Interaction to Next Paint", target: "< 150ms", threshold: "Google 'good': ≤ 200ms", fill: 75 },
  { metric: "CLS", name: "Cumulative Layout Shift", target: "< 0.05", threshold: "Google 'good': ≤ 0.1", fill: 50 },
];

const RADIUS = 26;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function PerformanceScorecard() {
  return (
    <div className="card relative overflow-hidden p-6 sm:p-8">
      <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-accent/10 blur-3xl" />
      <div className="relative flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-accent text-on-accent">
          <Gauge aria-hidden className="size-5" />
        </span>
        <div>
          <p className="font-display font-bold text-fg">Launch scorecard</p>
          <p className="text-xs">Minimum targets every build must hit before go-live</p>
        </div>
      </div>

      <ul className="relative mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {scores.map((score) => (
          <li key={score.label} className="flex flex-col items-center text-center">
            <svg viewBox="0 0 64 64" className="size-20 -rotate-90" aria-hidden>
              <circle cx="32" cy="32" r={RADIUS} fill="none" stroke="#27272A" strokeWidth="6" />
              <circle
                cx="32"
                cy="32"
                r={RADIUS}
                fill="none"
                stroke="#FACC15"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={CIRCUMFERENCE * (1 - score.value / 100)}
              />
            </svg>
            <p className="-mt-[3.4rem] mb-8 font-display text-xl font-extrabold text-fg">
              {score.value}
              {score.value < 100 && <span className="text-sm text-gold">+</span>}
            </p>
            <p className="text-xs font-medium">{score.label}</p>
          </li>
        ))}
      </ul>

      <ul className="relative mt-8 space-y-4">
        {vitals.map((vital) => (
          <li key={vital.metric} className="rounded-xl border border-line bg-ink/70 p-4">
            <div className="flex items-center justify-between gap-3 text-sm">
              <p>
                <span className="font-display font-bold text-fg">{vital.metric}</span>
                <span className="ml-2 text-xs">{vital.name}</span>
              </p>
              <p className="font-display font-bold text-gold">{vital.target}</p>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-line">
              <div className="h-full rounded-full bg-accent" style={{ width: `${vital.fill}%` }} />
            </div>
            <p className="mt-2 text-[11px] text-zinc-500">{vital.threshold}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
