import { ArrowRight } from "lucide-react";
import { LatestPosts } from "@/components/blog/LatestPosts";
import { CmsHeading } from "@/components/cms/CmsHeading";
import { at, EditableSection, EditableText, type Bind } from "@/components/cms/Editable";
import { CaseStudies } from "@/components/home/CaseStudies";
import { CtaBand } from "@/components/home/CtaBand";
import { Faq } from "@/components/home/Faq";
import { Hero } from "@/components/home/Hero";
import { PlatformMarquee } from "@/components/home/PlatformMarquee";
import { Process } from "@/components/home/Process";
import { StatsBar } from "@/components/home/StatsBar";
import { Testimonials } from "@/components/home/Testimonials";
import { VideoTestimonials } from "@/components/home/VideoTestimonials";
import { WhyMargin } from "@/components/home/WhyMargin";
import { PageJsonLd } from "@/components/seo/PageJsonLd";
import { ServiceCard } from "@/components/services/ServiceCard";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Container, Section } from "@/components/ui/Container";
import { Highlight } from "@/components/ui/Highlight";
import { getPage, getSite } from "@/lib/cms/load";
import { PAGES, SERVICE_SLUGS } from "@/lib/cms/registry";
import { pageMetadata } from "@/lib/seo/page";

export function generateMetadata() {
  return pageMetadata("home");
}

export const revalidate = 300;

const HOME: Bind = { doc: "home", path: "" };

export default async function HomePage() {
  const [{ content }, site, ...services] = await Promise.all([
    getPage("home"),
    getSite(),
    ...SERVICE_SLUGS.map((slug) => getPage(slug)),
  ]);
  const section = (key: keyof typeof content) => at(HOME, key);

  return (
    <>
      <PageJsonLd slug="home" />
      <EditableSection bind={section("hero")} label="Hero">
        <Hero bind={section("hero")} content={content.hero} />
      </EditableSection>

      <EditableSection bind={section("stats")} label="Results bar" visible={content.stats.visible}>
        <StatsBar stats={site.content.stats} title={content.stats.title} titleBind={at(HOME, "stats", "title")} />
      </EditableSection>

      <EditableSection bind={section("platforms")} label="Platforms" visible={content.platforms.visible}>
        <PlatformMarquee bind={section("platforms")} content={content.platforms} />
      </EditableSection>

      <EditableSection bind={section("services")} label="Services grid" visible={content.services.visible}>
        <Section id="services" className="scroll-mt-24">
          <Container>
            <CmsHeading bind={section("services")} value={content.services} />
            <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <ServiceCard
                  key={service.slug}
                  bind={{ doc: service.slug, path: "" }}
                  href={PAGES[service.slug].path}
                  service={service.content}
                />
              ))}
            </div>
          </Container>
        </Section>
      </EditableSection>

      <EditableSection bind={section("why")} label="Why Margin" visible={content.why.visible}>
        <WhyMargin bind={section("why")} content={content.why} />
      </EditableSection>

      <EditableSection bind={section("videoTestimonials")} label="Video testimonials" visible={content.videoTestimonials.visible}>
        <VideoTestimonials bind={section("videoTestimonials")} content={content.videoTestimonials} />
      </EditableSection>

      <EditableSection bind={section("caseStudies")} label="Case studies" visible={content.caseStudies.visible}>
        <CaseStudies bind={section("caseStudies")} content={content.caseStudies} />
      </EditableSection>

      <EditableSection bind={section("midCta")} label="Call-to-action band" visible={content.midCta.visible}>
        <CtaBand site={site.content} />
      </EditableSection>

      <EditableSection bind={section("process")} label="Process" visible={content.process.visible}>
        <Process bind={section("process")} content={content.process} />
      </EditableSection>

      <EditableSection bind={section("testimonials")} label="Testimonials" visible={content.testimonials.visible}>
        <Testimonials bind={section("testimonials")} content={content.testimonials} />
      </EditableSection>

      <EditableSection bind={section("insights")} label="Latest articles" visible={content.insights.visible}>
        <LatestPosts bind={section("insights")} content={content.insights} />
      </EditableSection>

      <EditableSection bind={section("faq")} label="FAQ" visible={content.faq.visible}>
        <Faq bind={section("faq")} content={content.faq} />
      </EditableSection>

      <EditableSection bind={section("finalCta")} label="Final call-to-action" visible={content.finalCta.visible}>
        <FinalCta bind={section("finalCta")} content={content.finalCta} />
      </EditableSection>
    </>
  );
}

function FinalCta({ bind, content }: { bind: Bind; content: (typeof PAGES)["home"]["defaults"]["finalCta"] }) {
  return (
    <section className="relative overflow-hidden border-t border-line py-24 sm:py-32">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_60%_70%_at_50%_100%,black,transparent)]" />
      <div aria-hidden className="pointer-events-none absolute -bottom-40 left-1/2 h-80 w-[48rem] -translate-x-1/2 rounded-full bg-accent/10 blur-3xl" />
      <Container className="relative text-center">
        <Badge dot>
          <EditableText bind={at(bind, "badge")} value={content.badge} />
        </Badge>
        <h2 className="mx-auto mt-7 max-w-4xl text-balance text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
          <EditableText bind={at(bind, "title")} value={content.title} />{" "}
          <Highlight>
            <EditableText bind={at(bind, "highlight")} value={content.highlight} />
          </Highlight>
          <span className="text-gold">.</span>
        </h2>
        <EditableText
          bind={at(bind, "description")}
          value={content.description}
          as="p"
          className="mx-auto mt-6 block max-w-2xl text-lg leading-relaxed"
        />
        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href="/contact" size="lg">
            <EditableText bind={at(bind, "primaryLabel")} value={content.primaryLabel} />
            <ArrowRight aria-hidden className="size-5" />
          </ButtonLink>
          <ButtonLink href="/about" variant="secondary" size="lg">
            <EditableText bind={at(bind, "secondaryLabel")} value={content.secondaryLabel} />
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
