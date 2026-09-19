import { ArrowRight, Check, ChevronRight, X } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { CmsHeading } from "@/components/cms/CmsHeading";
import { CmsIcon } from "@/components/cms/CmsIcon";
import { at, EditableSection, EditableText, type Bind } from "@/components/cms/Editable";
import { CtaBand } from "@/components/home/CtaBand";
import { Faq } from "@/components/home/Faq";
import { Process } from "@/components/home/Process";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Container, Section } from "@/components/ui/Container";
import { getPage, getSite } from "@/lib/cms/load";
import { PAGES, SERVICE_SLUGS, type ServiceDocSlug } from "@/lib/cms/registry";
import { ServiceCard } from "./ServiceCard";

const SERVICE_PARAM: Record<ServiceDocSlug, string> = {
  "services/meta-ads": "meta-ads",
  "services/facebook-ads": "facebook-ads",
  "services/website-development": "website-development",
};

export async function ServiceLanding({ slug, roiPanel }: { slug: ServiceDocSlug; roiPanel: ReactNode }) {
  const otherSlugs = SERVICE_SLUGS.filter((other) => other !== slug);
  const [{ content }, site, ...others] = await Promise.all([
    getPage(slug),
    getSite(),
    ...otherSlugs.map((other) => getPage(other)),
  ]);

  const root: Bind = { doc: slug, path: "" };
  const section = (key: keyof typeof content) => at(root, key);
  const { hero, card } = content;
    const contactHref = `/contact?service=${SERVICE_PARAM[slug]}`;

  return (
    <>
      <EditableSection bind={section("hero")} label="Hero">
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_70%_60%_at_30%_0%,black,transparent)]"
          />
          <div aria-hidden className="pointer-events-none absolute -top-40 left-0 h-[30rem] w-[50rem] rounded-full bg-accent/[0.08] blur-3xl" />
          <Container className="relative grid gap-14 pb-20 pt-10 lg:grid-cols-[1.25fr_1fr] lg:items-center lg:pb-28 lg:pt-16">
            <div>
              <nav aria-label="Breadcrumb">
                <ol className="flex items-center gap-1.5 text-xs">
                  <li>
                    <Link href="/" className="transition-colors hover:text-gold">
                      Home
                    </Link>
                  </li>
                  <li aria-hidden>
                    <ChevronRight className="size-3.5" />
                  </li>
                  <li>
                    <Link href="/#services" className="transition-colors hover:text-gold">
                      Services
                    </Link>
                  </li>
                  <li aria-hidden>
                    <ChevronRight className="size-3.5" />
                  </li>
                  <li aria-current="page" className="text-fg">
                    {content.name}
                  </li>
                </ol>
              </nav>

              <Badge dot className="mt-8">
                <EditableText bind={at(root, "hero", "eyebrow")} value={hero.eyebrow} />
              </Badge>
              <h1 className="mt-6 text-balance text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl xl:text-6xl">
                <EditableText bind={at(root, "hero", "title")} value={hero.title} />{" "}
                <EditableText bind={at(root, "hero", "highlight")} value={hero.highlight} className="text-highlight" />
              </h1>
              <EditableText
                bind={at(root, "hero", "description")}
                value={hero.description}
                as="p"
                className="mt-6 block max-w-2xl text-pretty text-lg leading-relaxed"
              />

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <ButtonLink href={contactHref} size="lg">
                  <EditableText bind={at(root, "hero", "primaryLabel")} value={hero.primaryLabel} />
                  <ArrowRight aria-hidden className="size-5" />
                </ButtonLink>
                <ButtonLink href="#included" variant="secondary" size="lg">
                  <EditableText bind={at(root, "hero", "secondaryLabel")} value={hero.secondaryLabel} />
                </ButtonLink>
              </div>

              <dl className="mt-10 grid max-w-2xl grid-cols-3 gap-3">
                {hero.metrics.map((metric, index) => (
                  <div key={index} className="flex flex-col rounded-2xl border border-line bg-charcoal/70 p-4">
                    <dt className="order-2 mt-1 text-xs leading-tight">
                      <EditableText bind={at(root, "hero", "metrics", index, "label")} value={metric.label} />
                    </dt>
                    <dd className="order-1 font-display text-2xl font-extrabold text-gold sm:text-3xl">
                      <EditableText bind={at(root, "hero", "metrics", index, "value")} value={metric.value} />
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <aside aria-label={`${content.name} at a glance`} className="relative">
              <div aria-hidden className="absolute -inset-6 rounded-[2.5rem] bg-accent/10 blur-3xl" />
              <div className="card relative p-7 sm:p-8">
                <div className="flex items-center gap-4">
                  <span className="grid size-14 place-items-center rounded-2xl bg-accent text-on-accent">
                    <CmsIcon name={card.icon} className="size-7" />
                  </span>
                  <div>
                    <EditableText bind={at(root, "name")} value={content.name} as="p" className="block font-display text-xl font-extrabold text-fg" />
                    <EditableText bind={at(root, "card", "tag")} value={card.tag} as="p" className="block text-sm text-gold" />
                  </div>
                </div>
                <EditableText bind={at(root, "card", "description")} value={card.description} as="p" className="mt-6 block text-sm leading-relaxed" />
                <ul className="mt-6 space-y-3">
                  {card.points.map((point, index) => (
                    <li key={index} className="flex items-center gap-3 text-sm text-fg/90">
                      <span className="grid size-6 place-items-center rounded-full bg-accent/15 text-gold">
                        <Check aria-hidden className="size-3.5" />
                      </span>
                      <EditableText bind={at(root, "card", "points", index)} value={point} />
                    </li>
                  ))}
                </ul>
                <div className="mt-7 flex items-center justify-between border-t border-line pt-5 text-xs">
                  <EditableText bind={at(root, "hero", "snapshotNote")} value={hero.snapshotNote} />
                  <EditableText bind={at(root, "hero", "snapshotHighlight")} value={hero.snapshotHighlight} className="font-semibold text-gold" />
                </div>
              </div>
            </aside>
          </Container>
        </section>
      </EditableSection>

      <EditableSection bind={section("problems")} label="Problem vs. approach" visible={content.problems.visible}>
        <Section className="bg-ink-2/60">
          <Container>
            <CmsHeading bind={section("problems")} value={content.problems} />
            <div className="mt-14 grid gap-6 lg:grid-cols-2">
              <div className="card p-7 sm:p-8">
                <EditableText
                  bind={at(root, "problems", "leaksLabel")}
                  value={content.problems.leaksLabel}
                  as="p"
                  className="block text-xs font-semibold uppercase tracking-[0.18em] text-muted"
                />
                <ul className="mt-6 space-y-6">
                  {content.problems.problems.map((problem, index) => (
                    <li key={index} className="flex gap-4">
                      <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full border border-danger/30 bg-danger/10 text-danger">
                        <X aria-hidden className="size-4" />
                      </span>
                      <div>
                        <EditableText bind={at(root, "problems", "problems", index, "title")} value={problem.title} as="h3" className="block font-bold" />
                        <EditableText
                          bind={at(root, "problems", "problems", index, "description")}
                          value={problem.description}
                          as="p"
                          className="mt-1 block text-sm leading-relaxed"
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="card border-accent/40 p-7 shadow-glow sm:p-8">
                <EditableText
                  bind={at(root, "problems", "approachLabel")}
                  value={content.problems.approachLabel}
                  as="p"
                  className="block text-xs font-semibold uppercase tracking-[0.18em] text-gold"
                />
                <ul className="mt-6 space-y-6">
                  {content.problems.solutions.map((solution, index) => (
                    <li key={index} className="flex gap-4">
                      <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-accent text-on-accent">
                        <Check aria-hidden className="size-4" />
                      </span>
                      <div>
                        <EditableText bind={at(root, "problems", "solutions", index, "title")} value={solution.title} as="h3" className="block font-bold" />
                        <EditableText
                          bind={at(root, "problems", "solutions", index, "description")}
                          value={solution.description}
                          as="p"
                          className="mt-1 block text-sm leading-relaxed"
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Container>
        </Section>
      </EditableSection>

      <EditableSection bind={section("deliverables")} label="What's included" visible={content.deliverables.visible}>
        <Section id="included" className="scroll-mt-24">
          <Container>
            <CmsHeading bind={section("deliverables")} value={content.deliverables} />
            <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {content.deliverables.items.map((item, index) => {
                return (
                  <li key={index} className="group card p-6 transition duration-300 hover:-translate-y-1 hover:border-accent/50 hover:shadow-glow">
                    <span className="grid size-11 place-items-center rounded-xl border border-accent/30 bg-accent/10 text-gold transition-colors group-hover:bg-accent group-hover:text-on-accent">
                      <CmsIcon name={item.icon} className="size-5" />
                    </span>
                    <EditableText bind={at(root, "deliverables", "items", index, "title")} value={item.title} as="h3" className="mt-5 block text-lg font-bold" />
                    <EditableText
                      bind={at(root, "deliverables", "items", index, "description")}
                      value={item.description}
                      as="p"
                      className="mt-2 block text-sm leading-relaxed"
                    />
                  </li>
                );
              })}
            </ul>
          </Container>
        </Section>
      </EditableSection>

      <EditableSection bind={section("strategy")} label="Strategy" visible={content.strategy.visible}>
        <Section className="bg-ink-2/60">
          <Container>
            <CmsHeading bind={section("strategy")} value={content.strategy} />
            <div className="mt-14 grid gap-6 lg:grid-cols-3">
              {content.strategy.items.map((item, index) => {
                const card = at(root, "strategy", "items", index);
                return (
                  <article key={index} className="card flex flex-col p-7">
                    <Badge className="self-start">
                      <EditableText bind={at(card, "label")} value={item.label} />
                    </Badge>
                    <EditableText bind={at(card, "title")} value={item.title} as="h3" className="mt-5 block text-xl font-bold tracking-tight" />
                    <EditableText bind={at(card, "description")} value={item.description} as="p" className="mt-3 block text-sm leading-relaxed" />
                    <ul className="mt-6 space-y-2.5 border-t border-line pt-6 text-sm">
                      {item.points.map((point, pointIndex) => (
                        <li key={pointIndex} className="flex items-center gap-2.5 text-fg/90">
                          <Check aria-hidden className="size-4 shrink-0 text-gold" />
                          <EditableText bind={at(card, "points", pointIndex)} value={point} />
                        </li>
                      ))}
                    </ul>
                  </article>
                );
              })}
            </div>
          </Container>
        </Section>
      </EditableSection>

      <EditableSection bind={section("roi")} label="ROI / performance" visible={content.roi.visible}>
        <Section>
          <Container className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center">
            <div>
              <CmsHeading bind={section("roi")} value={content.roi} align="left" />
              <ul className="mt-8 space-y-4">
                {content.roi.points.map((point, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-accent text-on-accent">
                      <Check aria-hidden className="size-3.5" />
                    </span>
                    <EditableText bind={at(root, "roi", "points", index)} value={point} className="text-fg/90" />
                  </li>
                ))}
              </ul>
            </div>
            {roiPanel}
          </Container>
        </Section>
      </EditableSection>

      <EditableSection bind={section("process")} label="Process" visible={content.process.visible}>
        <Process bind={section("process")} content={content.process} />
      </EditableSection>

      <EditableSection bind={section("faq")} label="FAQ" visible={content.faq.visible}>
        <Faq bind={section("faq")} content={content.faq} />
      </EditableSection>

      <EditableSection bind={section("related")} label="Related services" visible={content.related.visible}>
        <Section className="bg-ink-2/60">
          <Container>
            <CmsHeading bind={section("related")} value={content.related} />
            <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2">
              {others.map((other) => (
                <ServiceCard key={other.slug} bind={{ doc: other.slug, path: "" }} href={PAGES[other.slug].path} service={other.content} />
              ))}
            </div>
          </Container>
        </Section>
      </EditableSection>

      <EditableSection bind={section("cta")} label="Call-to-action band" visible={content.cta.visible}>
        <CtaBand site={site.content} heading={{ ...content.cta, titleBind: at(section("cta"), "title"), highlightBind: at(section("cta"), "highlight") }} href={contactHref} />
      </EditableSection>
    </>
  );
}
