import { at, EditableText, type Bind } from "@/components/cms/Editable";
import { Container } from "@/components/ui/Container";
import type { HomeContent } from "@/lib/cms/pages/home";

export function PlatformMarquee({ bind, content }: { bind: Bind; content: HomeContent["platforms"] }) {
  const { items } = content;
  return (
    <section aria-labelledby="platforms-heading" className="pb-8">
      <Container>
        <h2
          id="platforms-heading"
          className="text-center font-sans text-xs font-semibold uppercase tracking-[0.2em] text-muted"
        >
          <EditableText bind={at(bind, "title")} value={content.title} />
        </h2>
      </Container>
      <div className="relative mt-8 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
        <ul className="flex w-max animate-marquee hover:[animation-play-state:paused]">
          {[...items, ...items].map((platform, index) => (
            <li
              key={`${platform}-${index}`}
              aria-hidden={index >= items.length || undefined}
              className="mr-3 whitespace-nowrap rounded-full border border-line bg-charcoal px-5 py-2.5 font-display text-sm font-bold text-fg/80"
            >
              {platform}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
