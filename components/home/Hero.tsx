import { ArrowRight, CircleCheck } from "lucide-react";
import { CmsIcon } from "@/components/cms/CmsIcon";
import { at, EditableText, type Bind } from "@/components/cms/Editable";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Highlight } from "@/components/ui/Highlight";
import type { HomeContent } from "@/lib/cms/pages/home";
import { HeroDashboard } from "./HeroDashboard";

function Dot() {
  return <span className="text-accent">.</span>;
}

export function Hero({ bind, content }: { bind: Bind; content: HomeContent["hero"] }) {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-48 left-1/2 h-[34rem] w-[64rem] -translate-x-1/2 rounded-full bg-accent/[0.08] blur-3xl"
      />

      <Container className="relative grid gap-16 pb-24 pt-14 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-12 lg:pb-32 lg:pt-24">
        <div>
          <Badge dot>
            <EditableText bind={at(bind, "badge")} value={content.badge} />
          </Badge>

          <h1 className="mt-7 text-[2.75rem] font-extrabold leading-[1.02] tracking-tight sm:text-6xl xl:text-7xl">
            <EditableText bind={at(bind, "line1")} value={content.line1} />
            <Dot />
            <br />
            <EditableText bind={at(bind, "line2")} value={content.line2} />
            <Dot />
            <br />
            <Highlight>
              <EditableText bind={at(bind, "highlight")} value={content.highlight} />
            </Highlight>{" "}
            <EditableText bind={at(bind, "line3")} value={content.line3} />
            <Dot />
          </h1>

          <EditableText
            bind={at(bind, "description")}
            value={content.description}
            as="p"
            className="mt-7 block max-w-xl text-pretty text-lg leading-relaxed"
          />

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={content.primaryHref || "/contact"} size="lg">
              <EditableText bind={at(bind, "primaryLabel")} value={content.primaryLabel} />
              <ArrowRight aria-hidden className="size-5" />
            </ButtonLink>
            <ButtonLink href={content.secondaryHref || "#services"} variant="secondary" size="lg">
              <EditableText bind={at(bind, "secondaryLabel")} value={content.secondaryLabel} />
            </ButtonLink>
          </div>

          <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {content.trust.map((item, index) => (
              <li key={index} className="flex items-center gap-2">
                <CircleCheck aria-hidden className="size-4 text-gold" />
                <EditableText bind={at(bind, "trust", index)} value={item} />
              </li>
            ))}
          </ul>

          <ul className="mt-10 hidden grid-cols-3 gap-3 sm:grid">
            {content.highlights.map((item, index) => {
              return (
                <li key={index} className="rounded-2xl border border-line bg-charcoal/60 p-4">
                  <CmsIcon name={item.icon} className="size-5 text-gold" />
                  <EditableText
                    bind={at(bind, "highlights", index, "title")}
                    value={item.title}
                    as="p"
                    className="mt-3 block text-sm font-semibold text-fg"
                  />
                  <EditableText
                    bind={at(bind, "highlights", index, "description")}
                    value={item.description}
                    as="p"
                    className="mt-0.5 block text-xs"
                  />
                </li>
              );
            })}
          </ul>
        </div>

        <HeroDashboard />
      </Container>
    </section>
  );
}
