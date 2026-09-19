import type { ReactNode } from "react";

export function Highlight({ children }: { children: ReactNode }) {
  return (
    <span className="relative inline-block whitespace-nowrap px-[0.12em]">
      <span
        aria-hidden
        className="absolute inset-x-0 inset-y-[0.1em] -rotate-1 rounded-md bg-accent shadow-[0_0_40px_-6px_rgb(250_204_21/0.6)]"
      />
      <span className="relative text-on-accent">{children}</span>
    </span>
  );
}
