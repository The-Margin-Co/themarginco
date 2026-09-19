import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "accent" | "neutral";

const tones: Record<Tone, string> = {
  accent: "border-accent/30 bg-accent/10 text-gold",
  neutral: "border-line bg-charcoal text-muted",
};

export function Badge({
  children,
  tone = "accent",
  dot = false,
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  dot?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]",
        tones[tone],
        className,
      )}
    >
      {dot && <span aria-hidden className="size-1.5 rounded-full bg-accent animate-pulse-dot" />}
      {children}
    </span>
  );
}
