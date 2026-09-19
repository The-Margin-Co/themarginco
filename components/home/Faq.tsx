import { Plus } from "lucide-react";
import { CmsHeading } from "@/components/cms/CmsHeading";
import { at, EditableText, type Bind } from "@/components/cms/Editable";
import { Container, Section } from "@/components/ui/Container";

type FaqContent = {
  eyebrow: string;
  title: string;
  highlight: string;
  items: { question: string; answer: string }[];
};

export function Faq({ bind, content }: { bind: Bind; content: FaqContent }) {
  return (
    <Section>
      <Container>
        <CmsHeading bind={bind} value={content} />
        <div className="card mx-auto mt-12 max-w-3xl divide-y divide-line overflow-hidden">
          {content.items.map((item, index) => {
            const faq = at(bind, "items", index);
            return (
              <details key={index} className="group open:bg-fg/[0.02]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 p-6 text-left font-semibold text-fg transition-colors hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent">
                  <EditableText bind={at(faq, "question")} value={item.question} />
                  <span
                    aria-hidden
                    className="grid size-8 shrink-0 place-items-center rounded-full border border-line text-gold transition duration-300 group-open:rotate-45 group-open:border-accent/60 group-open:bg-accent/10"
                  >
                    <Plus className="size-4" />
                  </span>
                </summary>
                <EditableText
                  bind={at(faq, "answer")}
                  value={item.answer}
                  as="p"
                  className="-mt-2 block px-6 pb-6 text-sm leading-relaxed"
                />
              </details>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
