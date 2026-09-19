import { ArrowRight, ArrowUpRight, CircleCheck } from "lucide-react";
import { at, EditableText, type Bind } from "@/components/cms/Editable";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import type { SiteContent } from "@/lib/cms/pages/site";

const SITE_CTA: Bind = { doc: "site", path: "cta" };

/**
 * The shared call-to-action band. Copy comes from Site settings; a page can override the
 * heading with its own text and field bindings (e.g. "Ready to grow with Meta Ads?").
 */
export function CtaBand({
  site,
  heading,
  href = "/contact",
}: {
  site: SiteContent;
  heading?: { title: string; highlight: string; titleBind: Bind; highlightBind: Bind };
  href?: string;
}) {
  const cta = site.cta;
  const title = heading ?? {
    title: cta.title,
    highlight: cta.highlight,
    titleBind: at(SITE_CTA, "title"),
    highlightBind: at(SITE_CTA, "highlight"),
  };

  return (
    <section className="py-16 sm:py-20">
      <Container>
        <div className="relative overflow-hidden rounded-3xl border border-accent/25 bg-gradient-to-br from-charcoal via-charcoal to-ink p-8 shadow-card sm:p-12 lg:p-14">
          <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-accent/15 blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-grid opacity-40 [mask-image:linear-gradient(to_left,black,transparent_60%)]" />

          <div className="relative grid items-center gap-10 lg:grid-cols-[1.6fr_auto]">
            <div>
              <h2 className="text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">
                <EditableText bind={title.titleBind} value={title.title} />{" "}
                <EditableText bind={title.highlightBind} value={title.highlight} className="text-highlight" />
              </h2>
              <EditableText
                bind={at(SITE_CTA, "description")}
                value={cta.description}
                as="p"
                className="mt-4 block max-w-2xl text-pretty leading-relaxed"
              />
              <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                {cta.points.map((point, index) => (
                  <li key={index} className="flex items-center gap-2 text-fg/90">
                    <CircleCheck aria-hidden className="size-4 text-gold" />
                    <EditableText bind={at(SITE_CTA, "points", index)} value={point} />
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col items-start gap-4 lg:items-center">
              <ButtonLink href={href} size="lg">
                <EditableText bind={at(SITE_CTA, "buttonLabel")} value={cta.buttonLabel} />
                <ArrowRight aria-hidden className="size-5" />
              </ButtonLink>
              <a
                href={site.contact.bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-gold"
              >
                <EditableText bind={at(SITE_CTA, "calendlyLabel")} value={cta.calendlyLabel} />
                <ArrowUpRight aria-hidden className="size-3.5" />
              </a>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
