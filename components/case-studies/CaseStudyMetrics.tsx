import type { CaseStudyMetric } from "@/lib/types";

// Shared metric-badge grid: used on the home teaser, the index card and the detail page.
export function CaseStudyMetrics({ metrics, className }: { metrics: CaseStudyMetric[]; className?: string }) {
  if (metrics.length === 0) return null;
  return (
    <dl className={className ?? "grid grid-cols-3 gap-2"}>
      {metrics.map((metric, index) => (
        <div key={index} className="flex flex-col rounded-xl border border-line bg-ink/60 p-3">
          <dt className="order-2 mt-1 text-[11px] leading-tight">{metric.label}</dt>
          <dd className="order-1 font-display text-xl font-extrabold text-gold">{metric.value}</dd>
          {metric.detail && <dd className="order-3 mt-1 text-[10px] text-zinc-500">{metric.detail}</dd>}
        </div>
      ))}
    </dl>
  );
}
