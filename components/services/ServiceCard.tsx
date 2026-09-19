import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { CmsIcon } from "@/components/cms/CmsIcon";
import { at, EditableText, type Bind } from "@/components/cms/Editable";
import { Badge } from "@/components/ui/Badge";
import type { ServiceContent } from "@/lib/cms/pages/service";

export function ServiceCard({ bind, href, service }: { bind: Bind; href: string; service: ServiceContent }) {
  const card = at(bind, "card");
  return (
    <article className="group card relative flex flex-col p-7 transition duration-300 hover:-translate-y-1 hover:border-accent/50 hover:shadow-glow has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-accent">
      <div className="flex items-start justify-between gap-4">
        <span className="grid size-12 place-items-center rounded-xl border border-accent/30 bg-accent/10 text-gold transition-colors group-hover:bg-accent group-hover:text-on-accent">
          <CmsIcon name={service.card.icon} className="size-6" />
        </span>
        <Badge tone="neutral">
          <EditableText bind={at(card, "tag")} value={service.card.tag} />
        </Badge>
      </div>

      <h3 className="mt-7 text-xl font-bold tracking-tight">
        <Link href={href} className="after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none">
          <EditableText bind={at(bind, "name")} value={service.name} />
        </Link>
      </h3>
      <EditableText bind={at(card, "description")} value={service.card.description} as="p" className="mt-3 block text-sm leading-relaxed" />

      <ul className="mt-6 space-y-2.5 text-sm">
        {service.card.points.map((point, index) => (
          <li key={index} className="flex items-center gap-2.5 text-fg/90">
            <Check aria-hidden className="size-4 shrink-0 text-gold" />
            <EditableText bind={at(card, "points", index)} value={point} />
          </li>
        ))}
      </ul>

      <span aria-hidden className="mt-auto inline-flex items-center gap-2 pt-8 text-sm font-semibold text-gold">
        Explore {service.name}
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
      </span>
    </article>
  );
}
