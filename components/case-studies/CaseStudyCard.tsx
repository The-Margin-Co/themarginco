import { ArrowRight, ChartColumn } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { CaseStudyMetrics } from "@/components/case-studies/CaseStudyMetrics";
import { Badge } from "@/components/ui/Badge";
import type { CaseStudyMetric, CaseStudySummary } from "@/lib/types";
import { cn } from "@/lib/utils";

export function CaseStudyCard({ caseStudy, featured = false }: { caseStudy: CaseStudySummary; featured?: boolean }) {
  const metrics = ((caseStudy.metrics as CaseStudyMetric[] | null) ?? []).slice(0, featured ? 3 : 2);

  return (
    <article
      className={cn(
        "group card relative flex overflow-hidden transition duration-300 hover:-translate-y-1 hover:border-accent/50 hover:shadow-glow has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-accent",
        featured ? "flex-col lg:flex-row" : "flex-col",
      )}
    >
      <div
        className={cn(
          "relative grid aspect-[1200/630] place-items-center overflow-hidden border-b border-line bg-ink-2",
          featured && "lg:aspect-auto lg:min-h-80 lg:w-1/2 lg:border-b-0 lg:border-r",
        )}
      >
        {caseStudy.featured_image ? (
          <Image
            src={caseStudy.featured_image}
            alt={caseStudy.featured_image_alt ?? ""}
            fill
            sizes={featured ? "(min-width: 1024px) 40rem, 100vw" : "(min-width: 768px) 24rem, 100vw"}
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <>
            <div aria-hidden className="absolute inset-0 bg-grid opacity-70" />
            <div aria-hidden className="absolute size-44 rounded-full bg-accent/15 blur-3xl transition-colors duration-500 group-hover:bg-accent/30" />
            <span
              aria-hidden
              className={cn(
                "relative grid place-items-center rounded-2xl border border-accent/40 bg-accent/10 text-gold transition duration-500 group-hover:scale-110 group-hover:bg-accent group-hover:text-on-accent",
                featured ? "size-20" : "size-14",
              )}
            >
              <ChartColumn className={featured ? "size-9" : "size-6"} />
            </span>
          </>
        )}
      </div>

      <div className={cn("flex flex-1 flex-col p-6", featured && "lg:justify-center lg:p-10")}>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Badge>{caseStudy.industry}</Badge>
          {caseStudy.channels && <span className="text-muted">{caseStudy.channels}</span>}
        </div>
        <h3 className={cn("mt-4 text-balance font-bold tracking-tight", featured ? "text-2xl sm:text-3xl" : "text-lg")}>
          <Link href={`/case-studies/${caseStudy.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none">
            {caseStudy.title}
          </Link>
        </h3>
        <p className={cn("mt-3 text-sm leading-relaxed", !featured && "line-clamp-3")}>{caseStudy.excerpt}</p>
        {metrics.length > 0 && (
          <CaseStudyMetrics metrics={metrics} className={cn("mt-6 grid gap-2", featured ? "grid-cols-3" : "grid-cols-2")} />
        )}
        <span aria-hidden className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-semibold text-gold">
          Read case study
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </article>
  );
}
