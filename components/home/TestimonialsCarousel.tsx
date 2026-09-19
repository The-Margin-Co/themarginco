"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Scroll-snap carousel chrome around server-rendered testimonial cards. This component
 * only manages scroll position — the cards themselves (passed as children) stay
 * server-rendered so their inline-editable `EditableText` fields keep working exactly
 * as they do today; no CMS binding logic lives in here.
 */
export function TestimonialsCarousel({ children }: { children: ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const updateEdges = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setEdges({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
  }, []);

  useEffect(() => {
    updateEdges();
    window.addEventListener("resize", updateEdges);
    return () => window.removeEventListener("resize", updateEdges);
  }, [updateEdges]);

  function scroll(direction: 1 | -1) {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-carousel-item]");
    const amount = (card?.offsetWidth ?? el.clientWidth) + 24; // card width + gap-6
    el.scrollBy({ left: direction * amount, behavior: "smooth" });
  }

  return (
    <div className="relative mt-14">
      <div
        ref={scrollRef}
        role="region"
        aria-label="Client testimonials"
        aria-roledescription="carousel"
        tabIndex={0}
        onScroll={updateEdges}
        className={cn(
          "focus-visible:outline-offset-4",
          "flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-2",
          "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        )}
      >
        {children}
      </div>

      <div className="mt-6 flex justify-center gap-2">
        <button
          type="button"
          onClick={() => scroll(-1)}
          disabled={edges.start}
          aria-label="Previous testimonial"
          className="grid size-10 place-items-center rounded-full border border-line text-fg transition-colors hover:border-accent/60 hover:text-gold disabled:opacity-40"
        >
          <ChevronLeft aria-hidden className="size-5" />
        </button>
        <button
          type="button"
          onClick={() => scroll(1)}
          disabled={edges.end}
          aria-label="Next testimonial"
          className="grid size-10 place-items-center rounded-full border border-line text-fg transition-colors hover:border-accent/60 hover:text-gold disabled:opacity-40"
        >
          <ChevronRight aria-hidden className="size-5" />
        </button>
      </div>
    </div>
  );
}
