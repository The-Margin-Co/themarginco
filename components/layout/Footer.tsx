import { ArrowUpRight, CalendarDays, Mail } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { at, EditableText, type Bind } from "@/components/cms/Editable";
import type { SiteContent } from "@/lib/cms/pages/site";
import { NAV_LINKS, SERVICE_NAV } from "@/lib/site";
import { Logo } from "./Logo";

const SITE: Bind = { doc: "site", path: "" };

export function Footer({ site }: { site: SiteContent }) {
  const { brand, contact, nav, footer } = site;
  return (
    <footer className="mt-auto border-t border-line bg-ink-2">
      <Container className="grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div className="max-w-sm">
          <Logo />
          <EditableText bind={at(SITE, "brand", "description")} value={brand.description} as="p" className="mt-5 block text-sm leading-relaxed" />
          <p className="mt-4 font-display text-sm font-bold text-fg">
            &ldquo;<EditableText bind={at(SITE, "brand", "tagline")} value={brand.tagline} />&rdquo;
          </p>
        </div>

        <FooterColumn title="Services">
          {SERVICE_NAV.map((service) => (
            <FooterLink key={service.href} href={service.href}>
              {nav[service.key].name}
            </FooterLink>
          ))}
        </FooterColumn>

        <FooterColumn title="Company">
          {NAV_LINKS.map((link) => (
            <FooterLink key={link.href} href={link.href}>
              {link.label}
            </FooterLink>
          ))}
        </FooterColumn>

        <FooterColumn title="Get in touch">
          <li>
            <a href={`mailto:${contact.email}`} className="inline-flex items-center gap-2 text-sm transition-colors hover:text-gold">
              <Mail aria-hidden className="size-4" />
              {contact.email}
            </a>
          </li>
          <li>
            <a
              href={contact.bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm transition-colors hover:text-gold"
            >
              <CalendarDays aria-hidden className="size-4" />
              <EditableText bind={at(SITE, "footer", "calendlyText")} value={footer.calendlyText} />
              <ArrowUpRight aria-hidden className="size-3.5" />
            </a>
          </li>
          <li>
            <a
              href={contact.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm transition-colors hover:text-gold"
            >
              <InstagramIcon />
              {contact.instagramHandle}
            </a>
          </li>
        </FooterColumn>
      </Container>

      <div className="border-t border-line">
        <Container className="flex flex-col items-center justify-between gap-3 py-6 text-xs sm:flex-row">
          <p>
            &copy; {new Date().getFullYear()} {brand.name}. All rights reserved.
          </p>
          <p className="flex items-center gap-2">
            <span aria-hidden className="size-1.5 rounded-full bg-accent" />
            <EditableText bind={at(SITE, "footer", "bottomNote")} value={footer.bottomNote} />
          </p>
        </Container>
      </div>
    </footer>
  );
}

function InstagramIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
    </svg>
  );
}

function FooterColumn({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-fg">{title}</h2>
      <ul className="mt-5 space-y-3">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-sm transition-colors hover:text-gold">
        {children}
      </Link>
    </li>
  );
}
