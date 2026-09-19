import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * TMC monogram: geometric T, M and C sitting on a "margin" rule. The same paths are used for
 * `app/icon.svg`, `app/apple-icon.tsx` and the OG image so every surface shows one mark.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn("size-9 shrink-0", className)}>
      <rect width="32" height="32" rx="8" fill="#FACC15" />
      <g transform="translate(0 -1.7)" fill="none" stroke="#09090B" strokeWidth="2.6" strokeLinejoin="round">
        <path d="M3.1 10.3H10.5M6.8 10.3V21" />
        <path d="M13.6 21V10.5l2.4 5 2.4-5V21" />
        <path d="M28.9 10.3H25a2.2 2.2 0 0 0-2.2 2.2v5a2.2 2.2 0 0 0 2.2 2.2h3.9" />
        <rect x="3.1" y="24" width="25.8" height="2.4" rx="1.2" fill="#09090B" stroke="none" />
      </g>
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
