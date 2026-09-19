import { at, EditableText, type Bind } from "@/components/cms/Editable";
import { Container } from "@/components/ui/Container";
import type { SiteContent } from "@/lib/cms/pages/site";
import { StatCounter } from "./StatCounter";

const STATS: Bind = { doc: "site", path: "stats" };

export function StatsBar({
  stats,
  title,
  titleBind,
}: {
  stats: SiteContent["stats"];
  title?: string;
  titleBind?: Bind;
}) {
  return (
    <section aria-label="Results at a glance" className="py-16">
      <Container>
        {title && titleBind && (
          <EditableText
            bind={titleBind}
            value={title}
            as="p"
            className="block text-center text-xs font-semibold uppercase tracking-[0.2em] text-muted"
          />
        )}
        <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-line bg-line lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div key={index} className="flex flex-col bg-charcoal p-6 sm:p-8">
              <dt className="order-2 mt-3 text-sm font-semibold text-fg">
                <EditableText bind={at(STATS, index, "label")} value={stat.label} />
              </dt>
              <dd className="order-1 font-display text-4xl font-extrabold tracking-tight text-gold sm:text-5xl">
                <StatCounter value={stat.value} prefix={stat.prefix} suffix={stat.suffix} decimals={stat.decimals} />
              </dd>
              <dd className="order-3 mt-1 text-xs">
                <EditableText bind={at(STATS, index, "detail")} value={stat.detail} />
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
