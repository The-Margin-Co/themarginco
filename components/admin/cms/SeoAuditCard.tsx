"use client";

import { CircleAlert, CircleCheck, CircleX } from "lucide-react";
import { scoreTone, type AuditResult } from "@/lib/seo/audit";
import { cn } from "@/lib/utils";

const TONE = {
  pass: { text: "text-success", ring: "stroke-success", icon: CircleCheck },
  warn: { text: "text-gold", ring: "stroke-accent", icon: CircleAlert },
  fail: { text: "text-danger", ring: "stroke-danger", icon: CircleX },
} as const;

export function ScoreRing({ score, size = 56 }: { score: number; size?: number }) {
  const tone = TONE[scoreTone(score)];
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  return (
    <span className="relative inline-grid shrink-0 place-items-center" style={{ width: size, height: size }}>
      <svg viewBox="0 0 52 52" className="absolute inset-0 -rotate-90" aria-hidden>
        <circle cx="26" cy="26" r={radius} fill="none" strokeWidth="5" className="stroke-line" />
        <circle
          cx="26"
          cy="26"
          r={radius}
          fill="none"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - score / 100)}
          className={tone.ring}
        />
      </svg>
      <span className={cn("font-display text-sm font-extrabold tabular-nums", tone.text)}>{score}</span>
    </span>
  );
}

export function SeoAuditCard({ audit, compact = false }: { audit: AuditResult; compact?: boolean }) {
  const failing = audit.checks.filter((item) => item.status !== "pass");
  const items = compact ? failing.slice(0, 4) : audit.checks;
  return (
    <div>
      <div className="flex items-center gap-3">
        <ScoreRing score={audit.score} />
        <div>
          <p className="font-sans text-sm font-semibold text-fg">SEO score</p>
          <p className="text-xs">
            {failing.length === 0 ? "Everything looks great." : `${failing.length} suggestion${failing.length === 1 ? "" : "s"} to improve.`}
          </p>
        </div>
      </div>
      <ul className="mt-4 space-y-2.5">
        {items.map((item) => {
          const tone = TONE[item.status];
          const Icon = tone.icon;
          return (
            <li key={item.id} className="flex gap-2.5 text-xs">
              <Icon aria-hidden className={cn("mt-px size-4 shrink-0", tone.text)} />
              <span>
                <span className="font-semibold text-fg">{item.label}. </span>
                {item.detail}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
