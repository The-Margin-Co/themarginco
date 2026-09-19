"use client";

import { Plus, Trash2 } from "lucide-react";
import { FormField, inputStyles } from "@/components/ui/FormField";
import type { CaseStudyMetric } from "@/lib/types";

const MAX_METRICS = 6;

export function CaseStudyMetricsField({
  metrics,
  onChange,
}: {
  metrics: CaseStudyMetric[];
  onChange: (metrics: CaseStudyMetric[]) => void;
}) {
  function update(index: number, patch: Partial<CaseStudyMetric>) {
    onChange(metrics.map((metric, i) => (i === index ? { ...metric, ...patch } : metric)));
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-fg">Results / metrics</p>
      {metrics.map((metric, index) => (
        <div key={index} className="grid grid-cols-[1fr_1fr_1fr_auto] items-end gap-2 rounded-xl border border-line bg-ink/60 p-3">
          <FormField id={`metric-${index}-value`} label="Value">
            <input
              id={`metric-${index}-value`}
              type="text"
              placeholder="4.6x"
              maxLength={12}
              value={metric.value}
              onChange={(event) => update(index, { value: event.target.value })}
              className={inputStyles(false, "py-2 text-sm")}
            />
          </FormField>
          <FormField id={`metric-${index}-label`} label="Label">
            <input
              id={`metric-${index}-label`}
              type="text"
              placeholder="ROAS"
              maxLength={30}
              value={metric.label}
              onChange={(event) => update(index, { label: event.target.value })}
              className={inputStyles(false, "py-2 text-sm")}
            />
          </FormField>
          <FormField id={`metric-${index}-detail`} label="Detail (optional)">
            <input
              id={`metric-${index}-detail`}
              type="text"
              placeholder="from 1.9x"
              maxLength={30}
              value={metric.detail ?? ""}
              onChange={(event) => update(index, { detail: event.target.value })}
              className={inputStyles(false, "py-2 text-sm")}
            />
          </FormField>
          <button
            type="button"
            aria-label={`Remove metric ${index + 1}`}
            onClick={() => onChange(metrics.filter((_, i) => i !== index))}
            className="grid size-9 shrink-0 place-items-center rounded-lg text-muted transition-colors hover:bg-danger/10 hover:text-danger"
          >
            <Trash2 aria-hidden className="size-4" />
          </button>
        </div>
      ))}
      {metrics.length < MAX_METRICS && (
        <button
          type="button"
          onClick={() => onChange([...metrics, { value: "", label: "", detail: "" }])}
          className="flex h-9 items-center gap-1.5 rounded-lg border border-dashed border-line px-3 text-xs font-semibold text-muted transition-colors hover:border-accent/60 hover:text-gold"
        >
          <Plus aria-hidden className="size-3.5" /> Add metric
        </button>
      )}
    </div>
  );
}
