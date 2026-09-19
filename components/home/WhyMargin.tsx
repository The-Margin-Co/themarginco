import { CmsHeading } from "@/components/cms/CmsHeading";
import { CmsIcon } from "@/components/cms/CmsIcon";
import { at, EditableText, type Bind } from "@/components/cms/Editable";
import { Container, Section } from "@/components/ui/Container";
import { Highlight } from "@/components/ui/Highlight";
import type { HomeContent } from "@/lib/cms/pages/home";

export function WhyMargin({ bind, content }: { bind: Bind; content: HomeContent["why"] }) {
  return (
    <Section>
      <Container className="grid gap-14 lg:grid-cols-[1fr_1.15fr] lg:items-center">
        <div>
          <CmsHeading bind={bind} value={content} align="left" />

          <figure className="card mt-10 p-7">
            <blockquote className="font-display text-2xl font-extrabold leading-snug tracking-tight text-fg">
              &ldquo;<EditableText bind={at(bind, "quoteBefore")} value={content.quoteBefore} />{" "}
              <Highlight>
                <EditableText bind={at(bind, "quoteHighlight")} value={content.quoteHighlight} />
              </Highlight>{" "}
              <EditableText bind={at(bind, "quoteAfter")} value={content.quoteAfter} />
              &rdquo;
            </blockquote>
            <figcaption className="mt-4 text-sm">
              <EditableText bind={at(bind, "quoteCaption")} value={content.quoteCaption} />
            </figcaption>
          </figure>

          <ul className="mt-6 flex flex-wrap gap-2">
            {content.chips.map((chip, index) => (
              <li key={index} className="rounded-full border border-line bg-charcoal px-3.5 py-1.5 text-xs font-semibold text-fg/80">
                <span aria-hidden className="mr-1.5 text-gold">
                  ✦
                </span>
                <EditableText bind={at(bind, "chips", index)} value={chip} />
              </li>
            ))}
          </ul>
        </div>

        <ul className="grid gap-5 sm:grid-cols-2">
          {content.pillars.map((pillar, index) => {
            const item = at(bind, "pillars", index);
            return (
              <li key={index} className="group card p-6 transition duration-300 hover:border-accent/50 hover:shadow-glow">
                <div className="flex items-center justify-between">
                  <span className="grid size-11 place-items-center rounded-xl bg-accent/10 text-gold">
                    <CmsIcon name={pillar.icon} className="size-5" />
                  </span>
                  {pillar.tag && (
                    <EditableText
                      bind={at(item, "tag")}
                      value={pillar.tag}
                      className="rounded-full bg-accent/10 px-2.5 py-1 text-[11px] font-semibold text-gold"
                    />
                  )}
                </div>
                <EditableText bind={at(item, "title")} value={pillar.title} as="h3" className="mt-5 block text-lg font-bold" />
                <EditableText
                  bind={at(item, "description")}
                  value={pillar.description}
                  as="p"
                  className="mt-2 block text-sm leading-relaxed"
                />
              </li>
            );
          })}
        </ul>
      </Container>
    </Section>
  );
}
