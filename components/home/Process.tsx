import { Check } from "lucide-react";
import { CmsHeading, type HeadingValue } from "@/components/cms/CmsHeading";
import { at, EditableText, type Bind } from "@/components/cms/Editable";
import { Container, Section } from "@/components/ui/Container";

type Step = { title: string; description: string; deliverables: string[] };

export function Process({ bind, content }: { bind: Bind; content: HeadingValue & { steps: Step[] } }) {
  return (
    <Section>
      <Container>
        <CmsHeading bind={bind} value={content} />

        <div className="relative mt-16">
          <div
            aria-hidden
            className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-7 hidden border-t border-dashed border-accent/30 lg:block"
          />
          <ol className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {content.steps.map((step, index) => {
              const item = at(bind, "steps", index);
              return (
                <li key={index} className="relative flex flex-col">
                  <span className="relative z-10 mx-auto grid size-14 place-items-center rounded-2xl border border-accent/40 bg-ink font-display text-lg font-extrabold text-gold shadow-[0_0_30px_-8px_rgb(250_204_21/0.5)]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="card mt-6 flex flex-1 flex-col p-6">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold">
                      Phase {String(index + 1).padStart(2, "0")}
                    </p>
                    <EditableText bind={at(item, "title")} value={step.title} as="h3" className="mt-2 block text-lg font-bold" />
                    <EditableText
                      bind={at(item, "description")}
                      value={step.description}
                      as="p"
                      className="mt-2 block text-sm leading-relaxed"
                    />
                    <ul className="mt-5 space-y-2 border-t border-line pt-5 text-sm">
                      {step.deliverables.map((deliverable, deliverableIndex) => (
                        <li key={deliverableIndex} className="flex items-center gap-2 text-fg/90">
                          <Check aria-hidden className="size-4 shrink-0 text-gold" />
                          <EditableText bind={at(item, "deliverables", deliverableIndex)} value={deliverable} />
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </Container>
    </Section>
  );
}
