import { Quote, Star } from "lucide-react";
import { CmsHeading } from "@/components/cms/CmsHeading";
import { at, EditableText, type Bind } from "@/components/cms/Editable";
import { Container, Section } from "@/components/ui/Container";
import type { HomeContent } from "@/lib/cms/pages/home";
import { TestimonialsCarousel } from "./TestimonialsCarousel";

function initials(company: string) {
  return company
    .split(/[\s-]+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}

export function Testimonials({ bind, content }: { bind: Bind; content: HomeContent["testimonials"] }) {
  return (
    <Section className="bg-ink-2/60">
      <Container>
        <CmsHeading bind={bind} value={content} />

        <TestimonialsCarousel>
          {content.items.map((testimonial, index) => {
            const item = at(bind, "items", index);
            return (
              <div
                key={index}
                data-carousel-item
                className="w-[85%] shrink-0 snap-center sm:w-[46%] lg:w-[31%]"
              >
                <figure className="card relative flex h-full flex-col p-7">
                  <Quote aria-hidden className="absolute right-6 top-6 size-10 text-gold/15" />
                  <div className="flex gap-0.5" role="img" aria-label="Rated 5 out of 5">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star key={i} aria-hidden className="size-4 fill-accent text-gold" />
                    ))}
                  </div>
                  <blockquote className="mt-5 flex-1 text-[15px] leading-relaxed text-fg/90">
                    &ldquo;<EditableText bind={at(item, "quote")} value={testimonial.quote} />&rdquo;
                  </blockquote>
                  <figcaption className="mt-7 flex items-center gap-3 border-t border-line pt-5">
                    <span
                      aria-hidden
                      className="grid size-11 place-items-center rounded-full bg-accent font-display text-sm font-extrabold text-on-accent"
                    >
                      {initials(testimonial.company)}
                    </span>
                    <span className="text-sm">
                      <EditableText bind={at(item, "role")} value={testimonial.role} className="block font-semibold text-fg" />
                      <EditableText bind={at(item, "company")} value={testimonial.company} />
                    </span>
                  </figcaption>
                </figure>
              </div>
            );
          })}
        </TestimonialsCarousel>
      </Container>
    </Section>
  );
}
