import { ArrowRight, Check } from "lucide-react";
import { CmsHeading } from "@/components/cms/CmsHeading";
import { CmsIcon } from "@/components/cms/CmsIcon";
import { at, EditableImage, EditableSection, EditableText, type Bind } from "@/components/cms/Editable";
import { CtaBand } from "@/components/home/CtaBand";
import { StatsBar } from "@/components/home/StatsBar";
import { PageJsonLd } from "@/components/seo/PageJsonLd";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Container, Section } from "@/components/ui/Container";
import { Highlight } from "@/components/ui/Highlight";
import { getEditState, getPage, getSite } from "@/lib/cms/load";
import { pageMetadata } from "@/lib/seo/page";

export function generateMetadata() {
  return pageMetadata("about");
}

const ABOUT: Bind = { doc: "about", path: "" };

export default async function AboutPage() {
  const [{ content }, site, edit] = await Promise.all([getPage("about"), getSite(), getEditState()]);
  const section = (key: keyof typeof content) => at(ABOUT, key);
  const { hero, mission } = content;
  const showMissionImage = Boolean(mission.image) || edit.editing;

  return (
    <>
      <PageJsonLd slug="about" />
      <EditableSection bind={section("hero")} label="Hero">
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -top-48 left-1/2 h-[30rem] w-[56rem] -translate-x-1/2 rounded-full bg-accent/[0.08] blur-3xl"
          />
          <Container className="relative pb-20 pt-14 text-center lg:pb-24 lg:pt-24">
            <Badge dot>
              <EditableText bind={at(ABOUT, "hero", "badge")} value={hero.badge} />
            </Badge>
            <h1 className="mx-auto mt-7 max-w-5xl text-balance text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl xl:text-7xl">
              <EditableText bind={at(ABOUT, "hero", "title")} value={hero.title} />{" "}
              <Highlight>
                <EditableText bind={at(ABOUT, "hero", "highlight")} value={hero.highlight} />
              </Highlight>
              <span className="text-gold">.</span>
            </h1>
            <EditableText
              bind={at(ABOUT, "hero", "description")}
              value={hero.description}
              as="p"
              className="mx-auto mt-7 block max-w-2xl text-pretty text-lg leading-relaxed"
            />
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <ButtonLink href={hero.primaryHref || "/contact"} size="lg">
                <EditableText bind={at(ABOUT, "hero", "primaryLabel")} value={hero.primaryLabel} />
                <ArrowRight aria-hidden className="size-5" />
              </ButtonLink>
              <ButtonLink href={hero.secondaryHref || "/#services"} variant="secondary" size="lg">
                <EditableText bind={at(ABOUT, "hero", "secondaryLabel")} value={hero.secondaryLabel} />
              </ButtonLink>
            </div>
          </Container>
        </section>
      </EditableSection>

      <EditableSection bind={section("mission")} label="Mission" visible={mission.visible}>
        <Section className="border-y border-line bg-ink-2/60">
          <Container className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            <div>
              <Badge>
                <EditableText bind={at(ABOUT, "mission", "badge")} value={mission.badge} />
              </Badge>
              <p className="mt-6 font-display text-3xl font-extrabold leading-tight tracking-tight text-fg sm:text-4xl">
                <EditableText bind={at(ABOUT, "mission", "statement")} value={mission.statement} />{" "}
                <EditableText bind={at(ABOUT, "mission", "highlight")} value={mission.highlight} className="text-highlight" />
              </p>
              {showMissionImage && (
                <EditableImage
                  bind={at(ABOUT, "mission", "image")}
                  altBind={at(ABOUT, "mission", "imageAlt")}
                  src={mission.image}
                  alt={mission.imageAlt}
                  sizes="(min-width: 1024px) 36rem, 100vw"
                  frameClassName="mt-10 aspect-[4/3] overflow-hidden rounded-3xl border border-line"
                  className="object-cover"
                />
              )}
            </div>
            <div className="space-y-5 text-lg leading-relaxed">
              {mission.paragraphs.map((paragraph, index) => (
                <EditableText key={index} bind={at(ABOUT, "mission", "paragraphs", index)} value={paragraph} as="p" className="block" />
              ))}
              <EditableText bind={at(ABOUT, "mission", "closing")} value={mission.closing} as="p" className="block text-fg" />
            </div>
          </Container>
        </Section>
      </EditableSection>

      <EditableSection bind={section("values")} label="Growth ethos" visible={content.values.visible}>
        <Section>
          <Container>
            <CmsHeading bind={section("values")} value={content.values} />
            <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {content.values.items.map((value, index) => {
                const item = at(ABOUT, "values", "items", index);
                return (
                  <li key={index} className="group card relative p-7 transition duration-300 hover:border-accent/50 hover:shadow-glow">
                    <span aria-hidden className="absolute right-6 top-6 font-display text-4xl font-extrabold text-fg/5">
                      0{index + 1}
                    </span>
                    <span className="grid size-12 place-items-center rounded-xl bg-accent text-on-accent">
                      <CmsIcon name={value.icon} className="size-6" />
                    </span>
                    <EditableText bind={at(item, "title")} value={value.title} as="h3" className="mt-6 block text-lg font-bold" />
                    <EditableText bind={at(item, "description")} value={value.description} as="p" className="mt-2 block text-sm leading-relaxed" />
                  </li>
                );
              })}
            </ul>
          </Container>
        </Section>
      </EditableSection>

      <EditableSection bind={section("expertise")} label="Expertise" visible={content.expertise.visible}>
        <Section className="bg-ink-2/60">
          <Container>
            <CmsHeading bind={section("expertise")} value={content.expertise} />
            <ul className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {content.expertise.items.map((area, index) => {
                const item = at(ABOUT, "expertise", "items", index);
                return (
                  <li key={index} className="card flex flex-col p-7">
                    <span className="grid size-11 place-items-center rounded-xl border border-accent/30 bg-accent/10 text-gold">
                      <CmsIcon name={area.icon} className="size-5" />
                    </span>
                    <EditableText bind={at(item, "title")} value={area.title} as="h3" className="mt-5 block text-lg font-bold" />
                    <EditableText bind={at(item, "description")} value={area.description} as="p" className="mt-2 block text-sm leading-relaxed" />
                    <ul className="mt-5 flex flex-wrap gap-2">
                      {area.capabilities.map((capability, capabilityIndex) => (
                        <li key={capabilityIndex} className="rounded-full border border-line bg-ink/70 px-3 py-1 text-xs font-medium text-fg/80">
                          <EditableText bind={at(item, "capabilities", capabilityIndex)} value={capability} />
                        </li>
                      ))}
                    </ul>
                  </li>
                );
              })}
            </ul>
          </Container>
        </Section>
      </EditableSection>

      <EditableSection bind={section("commitments")} label="Commitments" visible={content.commitments.visible}>
        <Section>
          <Container className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <CmsHeading bind={section("commitments")} value={content.commitments} align="left" />
            <ul className="grid gap-4 sm:grid-cols-2">
              {content.commitments.items.map((commitment, index) => (
                <li key={index} className="card flex items-start gap-3 p-5">
                  <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-accent text-on-accent">
                    <Check aria-hidden className="size-3.5" />
                  </span>
                  <EditableText bind={at(ABOUT, "commitments", "items", index)} value={commitment} className="text-sm font-medium text-fg" />
                </li>
              ))}
            </ul>
          </Container>
        </Section>
      </EditableSection>

      <EditableSection bind={section("stats")} label="Results bar" visible={content.stats.visible}>
        <StatsBar stats={site.content.stats} />
      </EditableSection>

      <EditableSection bind={section("cta")} label="Call-to-action band" visible={content.cta.visible}>
        <CtaBand site={site.content} heading={{ ...content.cta, titleBind: at(section("cta"), "title"), highlightBind: at(section("cta"), "highlight") }} />
      </EditableSection>
    </>
  );
}
