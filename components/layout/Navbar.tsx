"use client";

import { ArrowRight, ChevronDown, CodeXml, Megaphone, Menu, Users, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { NAV_LINKS } from "@/lib/site";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";

const serviceIcons = {
  "meta-ads": Megaphone,
  "facebook-ads": Users,
  "website-development": CodeXml,
} as const;

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

const linkBase =
  "rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent";

export type NavServiceItem = {
  slug: keyof typeof serviceIcons;
  href: string;
  name: ReactNode;
  blurb: ReactNode;
};

export function Navbar({
  services,
  ctaLabel,
  mobileCtaLabel,
  tagline,
}: {
  services: NavServiceItem[];
  ctaLabel: ReactNode;
  mobileCtaLabel: ReactNode;
  tagline: ReactNode;
}) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [lastPathname, setLastPathname] = useState(pathname);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const servicesButtonRef = useRef<HTMLButtonElement>(null);

  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setDrawerOpen(false);
    setServicesOpen(false);
  }

  useEffect(() => {
    if (!drawerOpen) return;
    const menuButton = menuButtonRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      menuButton?.focus();
    };
  }, [drawerOpen]);

  const servicesActive = pathname.startsWith("/services");

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
      <nav
        aria-label="Main"
        className="mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-full border border-line/80 bg-charcoal/75 py-2 pl-4 pr-2 shadow-float backdrop-blur-xl"
      >
        <Logo />

        <ul className="hidden items-center gap-1 lg:flex">
          <li
            className="relative"
            onMouseEnter={() => setServicesOpen(true)}
            onMouseLeave={() => setServicesOpen(false)}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                setServicesOpen(false);
              }
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape" && servicesOpen) {
                setServicesOpen(false);
                servicesButtonRef.current?.focus();
              }
            }}
          >
            <button
              ref={servicesButtonRef}
              type="button"
              aria-expanded={servicesOpen}
              aria-controls="services-menu"
              onClick={() => setServicesOpen((open) => !open)}
              className={cn(
                linkBase,
                "flex items-center gap-1",
                servicesActive ? "bg-accent/10 text-gold" : "text-muted hover:text-fg",
              )}
            >
              Services
              <ChevronDown
                aria-hidden
                className={cn("size-4 transition-transform", servicesOpen && "rotate-180")}
              />
            </button>
            <div
              id="services-menu"
              className={cn(
                "absolute left-1/2 top-full w-[22rem] -translate-x-1/2 pt-3 transition duration-200",
                servicesOpen
                  ? "visible translate-y-0 opacity-100"
                  : "invisible -translate-y-1 opacity-0",
              )}
            >
              <ul className="card p-2">
                {services.map((service) => {
                  const Icon = serviceIcons[service.slug];
                  const active = isActive(pathname, service.href);
                  return (
                    <li key={service.slug}>
                      <Link
                        href={service.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-fg/5 focus-visible:bg-fg/5 focus-visible:outline-none",
                          active && "bg-accent/10",
                        )}
                      >
                        <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-accent/30 bg-accent/10 text-gold">
                          <Icon aria-hidden className="size-4" />
                        </span>
                        <span>
                          <span className={cn("block text-sm font-semibold", active ? "text-gold" : "text-fg")}>
                            {service.name}
                          </span>
                          <span className="mt-0.5 block text-xs text-muted">{service.blurb}</span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </li>
          {NAV_LINKS.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(linkBase, active ? "bg-accent/10 text-gold" : "text-muted hover:text-fg")}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <ButtonLink href="/contact" size="sm">
              {ctaLabel}
              <ArrowRight aria-hidden className="size-4" />
            </ButtonLink>
          </div>
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-expanded={drawerOpen}
            aria-controls="mobile-drawer"
            aria-label="Open menu"
            className="grid size-10 place-items-center rounded-full border border-line bg-ink/60 text-fg transition-colors hover:border-accent/60 hover:text-gold lg:hidden"
          >
            <Menu aria-hidden className="size-5" />
          </button>
        </div>
      </nav>

      <div id="mobile-drawer" inert={!drawerOpen} className="lg:hidden">
        <div
          aria-hidden
          onClick={() => setDrawerOpen(false)}
          className={cn(
            "fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm transition-opacity duration-300",
            drawerOpen ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className={cn(
            "fixed inset-y-0 right-0 z-[70] flex w-[min(22rem,88vw)] flex-col border-l border-line bg-charcoal shadow-2xl transition-transform duration-300 ease-out",
            drawerOpen ? "translate-x-0" : "translate-x-full",
          )}
        >
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <Logo />
            <button
              ref={closeButtonRef}
              type="button"
              onClick={() => setDrawerOpen(false)}
              aria-label="Close menu"
              className="grid size-10 place-items-center rounded-full border border-line text-fg transition-colors hover:border-accent/60 hover:text-gold"
            >
              <X aria-hidden className="size-5" />
            </button>
          </div>

          <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-3 py-5">
            <DrawerLink href="/" pathname={pathname} onNavigate={() => setDrawerOpen(false)}>
              Home
            </DrawerLink>
            <p className="px-3 pb-2 pt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
              Services
            </p>
            {services.map((service) => {
              const Icon = serviceIcons[service.slug];
              return (
                <DrawerLink
                  key={service.slug}
                  href={service.href}
                  pathname={pathname}
                  onNavigate={() => setDrawerOpen(false)}
                >
                  <Icon aria-hidden className="size-4 text-gold" />
                  {service.name}
                </DrawerLink>
              );
            })}
            <p className="px-3 pb-2 pt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
              Company
            </p>
            {NAV_LINKS.map((link) => (
              <DrawerLink
                key={link.href}
                href={link.href}
                pathname={pathname}
                onNavigate={() => setDrawerOpen(false)}
              >
                {link.label}
              </DrawerLink>
            ))}
          </nav>

          <div className="border-t border-line p-5">
            <ButtonLink href="/contact" size="lg" className="w-full" onClick={() => setDrawerOpen(false)}>
              {mobileCtaLabel}
              <ArrowRight aria-hidden className="size-4" />
            </ButtonLink>
            <p className="mt-4 text-center text-xs text-muted">{tagline}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

function DrawerLink({
  href,
  pathname,
  onNavigate,
  children,
}: {
  href: string;
  pathname: string;
  onNavigate: () => void;
  children: ReactNode;
}) {
  const active = isActive(pathname, href);
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-3 text-base font-medium transition-colors",
        active ? "bg-accent/10 text-gold" : "text-fg hover:bg-fg/5",
      )}
    >
      {children}
    </Link>
  );
}
