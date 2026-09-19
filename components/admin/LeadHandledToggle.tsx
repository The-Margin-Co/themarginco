"use client";

import { Check, LoaderCircle } from "lucide-react";
import { useState, useTransition } from "react";
import { toggleLeadHandled } from "@/app/admin/leads/actions";
import { cn } from "@/lib/utils";

export function LeadHandledToggle({ id, handled }: { id: string; handled: boolean }) {
  const [optimistic, setOptimistic] = useState(handled);
  const [pending, startTransition] = useTransition();

  function toggle() {
    const next = !optimistic;
    setOptimistic(next);
    startTransition(async () => {
      try {
        await toggleLeadHandled(id, next);
      } catch {
        setOptimistic(!next);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-pressed={optimistic}
      className={cn(
        "flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-colors disabled:opacity-60",
        optimistic ? "border-accent/40 bg-accent/10 text-gold" : "border-line text-muted hover:text-fg",
      )}
    >
      {pending ? (
        <LoaderCircle aria-hidden className="size-3.5 animate-spin" />
      ) : (
        <Check aria-hidden className={cn("size-3.5", !optimistic && "opacity-0")} />
      )}
      {optimistic ? "Handled" : "Mark handled"}
    </button>
  );
}
