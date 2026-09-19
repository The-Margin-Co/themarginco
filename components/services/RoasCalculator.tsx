"use client";

import { Calculator } from "lucide-react";
import { useId, useState } from "react";

type Variant = "ecommerce" | "leadgen";

const copy: Record<
  Variant,
  { conversion: string; value: string; results: string; costPer: string; valueRange: [number, number, number] }
> = {
  ecommerce: {
    conversion: "Conversion rate",
    value: "Average order value",
    results: "Purchases",
    costPer: "Cost per purchase",
    valueRange: [10, 500, 5],
  },
  leadgen: {
    conversion: "Click-to-customer rate",
    value: "Average customer value",
    results: "New customers",
    costPer: "Cost per customer",
    valueRange: [100, 10000, 50],
  },
};

const currency = (value: number, digits = 0) =>
  value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
const number = (value: number) => Math.round(value).toLocaleString("en-US");

export function RoasCalculator({
  variant = "ecommerce",
  defaults,
}: {
  variant?: Variant;
  defaults: { spend: number; cpc: number; cvr: number; value: number };
}) {
  const id = useId();
  const labels = copy[variant];
  const [spend, setSpend] = useState(defaults.spend);
  const [cpc, setCpc] = useState(defaults.cpc);
  const [cvr, setCvr] = useState(defaults.cvr);
  const [value, setValue] = useState(defaults.value);

  const clicks = spend / cpc;
  const results = clicks * (cvr / 100);
  const revenue = results * value;
  const roas = spend > 0 ? revenue / spend : 0;
  const costPer = results > 0 ? spend / results : 0;

  const [valueMin, valueMax, valueStep] = labels.valueRange;

  return (
    <div className="card relative overflow-hidden p-6 sm:p-8">
      <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-accent/10 blur-3xl" />
      <div className="relative flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-accent text-on-accent">
          <Calculator aria-hidden className="size-5" />
        </span>
        <div>
          <p className="font-display font-bold text-fg">ROAS calculator</p>
          <p className="text-xs">Drag the sliders to model your funnel</p>
        </div>
      </div>

      <div className="relative mt-8 space-y-6">
        <Slider id={`${id}-spend`} label="Monthly ad spend" value={spend} min={1000} max={100000} step={500} format={(v) => currency(v)} onChange={setSpend} />
        <Slider id={`${id}-cpc`} label="Cost per click" value={cpc} min={0.2} max={5} step={0.05} format={(v) => currency(v, 2)} onChange={setCpc} />
        <Slider id={`${id}-cvr`} label={labels.conversion} value={cvr} min={0.2} max={15} step={0.1} format={(v) => `${v.toFixed(1)}%`} onChange={setCvr} />
        <Slider id={`${id}-value`} label={labels.value} value={value} min={valueMin} max={valueMax} step={valueStep} format={(v) => currency(v)} onChange={setValue} />
      </div>

      <div className="relative mt-8 rounded-2xl border border-accent/30 bg-accent/[0.06] p-5" aria-live="polite">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">Projected ROAS</p>
            <p className="font-display text-5xl font-extrabold tracking-tight text-fg tabular-nums">
              {roas.toFixed(2)}
              <span className="text-gold">x</span>
            </p>
          </div>
          <p className="text-sm">
            <span className="font-semibold text-fg">{currency(roas, 2)}</span> back per $1 spent
          </p>
        </div>
        <dl className="mt-5 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <Output label="Clicks" value={number(clicks)} />
          <Output label={labels.results} value={number(results)} />
          <Output label="Revenue" value={currency(revenue)} />
          <Output label={labels.costPer} value={currency(costPer, costPer < 100 ? 2 : 0)} />
        </dl>
      </div>

      <p className="relative mt-4 text-xs leading-relaxed text-zinc-500">
        Estimates only. Real results depend on your offer, creative, market and margins. We&apos;ll
        model your actual numbers on the strategy call.
      </p>
    </div>
  );
}

function Slider({
  id,
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (value: number) => string;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-4 text-sm">
        <label htmlFor={id} className="font-medium text-fg">
          {label}
        </label>
        <output htmlFor={id} className="font-display font-bold tabular-nums text-gold">
          {format(value)}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuetext={format(value)}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-3 h-2 w-full cursor-pointer accent-accent"
      />
    </div>
  );
}

function Output({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col rounded-xl border border-line bg-ink/70 p-3">
      <dt className="order-2 mt-0.5 text-[11px]">{label}</dt>
      <dd className="order-1 font-display font-bold tabular-nums text-fg">{value}</dd>
    </div>
  );
}
