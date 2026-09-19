import { ArrowUpRight, CalendarDays, Clock, Mail } from "lucide-react";
import { at, EditableSection, EditableText, type Bind } from "@/components/cms/Editable";
import { ContactForm } from "@/components/contact/ContactForm";
import { PageJsonLd } from "@/components/seo/PageJsonLd";
import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";
import { getPage, getSite } from "@/lib/cms/load";
import { pageMetadata } from "@/lib/seo/page";
import { isServiceValue } from "@/lib/validation";

export function generateMetadata() {
  return pageMetadata("contact");
}

const CONTACT: Bind = { doc: "contact", path: "" };

export default async function ContactPage({ searchParams }: PageProps<"/contact">) {
  const [{ service }, { content }, site] = await Promise.all([searchParams, getPage("contact"), getSite()]);
  const initialService = isServiceValue(service) ? service : "";
  const { hero, channels, nextSteps, form } = content;
  const contact = site.content.contact;

  return (
    <>
      <PageJsonLd slug="contact" />
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_70%_50%_at_20%_0%,black,transparent)]"
        />
        <div aria-hidden className="pointer-events-none absolute -top-40 right-0 h-[30rem] w-[44rem] rounded-full bg-accent/[0.08] blur-3xl" />

        <Container className="relative grid gap-12 pb-24 pt-12 lg:grid-cols-[1fr_1.2fr] lg:gap-16 lg:pt-20">
          <div>
            <EditableSection bind={at(CONTACT, "hero")} label="Intro">
              <Badge dot>
                <EditableText bind={at(CONTACT, "hero", "badge")} value={hero.badge} />
              </Badge>
              <h1 className="mt-6 text-balance text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                <EditableText bind={at(CONTACT, "hero", "title")} value={hero.title} />{" "}
                <EditableText bind={at(CONTACT, "hero", "highlight")} value={hero.highlight} className="text-highlight" />
              </h1>
              <EditableText
                bind={at(CONTACT, "hero", "description")}
                value={hero.description}
                as="p"
                className="mt-6 block max-w-xl text-pretty text-lg leading-relaxed"
              />
            </EditableSection>

            <EditableSection bind={at(CONTACT, "channels")} label="Contact options" visible={channels.visible}>
              <ul className="mt-10 space-y-3">
                <li>
                  <a href={`mailto:${contact.email}`} className="group card flex items-center gap-4 p-4 transition hover:border-accent/50">
                    <span className="grid size-11 place-items-center rounded-xl bg-accent/10 text-gold">
                      <Mail aria-hidden className="size-5" />
                    </span>
                    <span>
                      <EditableText
                        bind={at(CONTACT, "channels", "emailLabel")}
                        value={channels.emailLabel}
                        className="block text-[11px] font-semibold uppercase tracking-[0.16em]"
                      />
                      <span className="font-medium text-fg group-hover:text-gold">{contact.email}</span>
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    href={contact.bookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group card flex items-center gap-4 p-4 transition hover:border-accent/50"
                  >
                    <span className="grid size-11 place-items-center rounded-xl bg-accent/10 text-gold">
                      <CalendarDays aria-hidden className="size-5" />
                    </span>
                    <span className="flex-1">
                      <EditableText
                        bind={at(CONTACT, "channels", "calendlyLabel")}
                        value={channels.calendlyLabel}
                        className="block text-[11px] font-semibold uppercase tracking-[0.16em]"
                      />
                      <EditableText
                        bind={at(CONTACT, "channels", "calendlyText")}
                        value={channels.calendlyText}
                        className="font-medium text-fg group-hover:text-gold"
                      />
                    </span>
                    <ArrowUpRight aria-hidden className="size-4 text-muted group-hover:text-gold" />
                  </a>
                </li>
              </ul>

              <div className="mt-6 flex items-start gap-4 rounded-2xl border border-accent/30 bg-accent/[0.06] p-5">
                <Clock aria-hidden className="mt-0.5 size-5 shrink-0 text-gold" />
                <p className="text-sm leading-relaxed">
                  <EditableText bind={at(CONTACT, "channels", "responseTitle")} value={channels.responseTitle} className="font-semibold text-fg" />{" "}
                  <EditableText bind={at(CONTACT, "channels", "responseText")} value={channels.responseText} /> {contact.responseTime}.
                </p>
              </div>
            </EditableSection>

            <EditableSection bind={at(CONTACT, "nextSteps")} label="What happens next" visible={nextSteps.visible}>
              <div className="mt-10">
                <EditableText
                  bind={at(CONTACT, "nextSteps", "title")}
                  value={nextSteps.title}
                  as="h2"
                  className="block font-sans text-xs font-semibold uppercase tracking-[0.18em] text-muted"
                />
                <ol className="mt-5 space-y-5">
                  {nextSteps.items.map((step, index) => (
                    <li key={index} className="flex gap-4">
                      <span className="grid size-8 shrink-0 place-items-center rounded-full border border-accent/40 font-display text-sm font-bold text-gold">
                        {index + 1}
                      </span>
                      <div>
                        <EditableText bind={at(CONTACT, "nextSteps", "items", index, "title")} value={step.title} as="p" className="block font-semibold text-fg" />
                        <EditableText
                          bind={at(CONTACT, "nextSteps", "items", index, "description")}
                          value={step.description}
                          as="p"
                          className="mt-0.5 block text-sm"
                        />
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </EditableSection>
          </div>

          <EditableSection bind={at(CONTACT, "form")} label="Form">
            <div className="relative">
              <div aria-hidden className="absolute -inset-4 rounded-[2rem] bg-accent/[0.07] blur-2xl" />
              <div className="card relative p-6 sm:p-8 lg:p-10">
                <EditableText bind={at(CONTACT, "form", "title")} value={form.title} as="h2" className="block text-2xl font-extrabold tracking-tight" />
                <EditableText bind={at(CONTACT, "form", "description")} value={form.description} as="p" className="mt-2 block text-sm" />
                <div className="mt-8">
                  <ContactForm initialService={initialService} copy={form} bookingUrl={contact.bookingUrl} />
                </div>
              </div>
            </div>
          </EditableSection>
        </Container>
      </section>
    </>
  );
}
