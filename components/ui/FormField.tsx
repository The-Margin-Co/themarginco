import { CircleAlert, CircleCheck } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function inputStyles(invalid?: boolean, className?: string) {
  return cn(
    "w-full rounded-xl border bg-ink/70 px-4 py-3 text-[15px] text-fg placeholder:text-zinc-500 transition-colors",
    "focus-visible:outline-none focus:border-accent focus:ring-2 focus:ring-accent/60",
    invalid ? "border-danger/80" : "border-line hover:border-zinc-600",
    className,
  );
}

export function FormField({
  id,
  label,
  error,
  hint,
  required,
  children,
}: {
  id: string;
  label: string;
  error?: string | null;
  hint?: ReactNode;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-fg">
          {label}
          {required && (
            <span aria-hidden className="ml-0.5 text-gold">
              *
            </span>
          )}
        </label>
        {hint && <span className="text-xs text-muted">{hint}</span>}
      </div>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-2 flex items-center gap-1.5 text-sm text-danger">
          <CircleAlert aria-hidden className="size-4 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

const bannerTones = {
  error: "border-danger/40 bg-danger/10 text-red-200",
  info: "border-accent/30 bg-accent/10 text-fg",
  success: "border-success/30 bg-success/10 text-green-200",
} as const;

export function FormBanner({ tone, children }: { tone: keyof typeof bannerTones; children: ReactNode }) {
  const Icon = tone === "success" ? CircleCheck : CircleAlert;
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn("flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm", bannerTones[tone])}
    >
      <Icon aria-hidden className="mt-0.5 size-4 shrink-0" />
      <div>{children}</div>
    </div>
  );
}
