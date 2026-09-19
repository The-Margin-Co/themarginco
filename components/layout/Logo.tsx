import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn("size-9 shrink-0", className)}>
      <rect width="32" height="32" rx="8" fill="#FACC15" />
      <path
        d="M8 23V9.5l8 9 8-9V23"
        fill="none"
        stroke="#09090B"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn("group flex items-center gap-2.5 rounded-full", className)}
      aria-label="The Margin Co home"
    >
      <LogoMark className="transition-transform duration-300 group-hover:-rotate-6" />
      <span className="flex flex-col whitespace-nowrap leading-none">
        <span className="font-display text-[15px] font-extrabold tracking-tight text-fg">
          The Margin Co
        </span>
        <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
          Performance Marketing
        </span>
      </span>
    </Link>
  );
}
