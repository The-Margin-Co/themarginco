import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { at, EditableText, type Bind } from "@/components/cms/Editable";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { EditModeProvider } from "@/components/cms/edit/EditModeProvider";
import { getEditState, getSite } from "@/lib/cms/load";
import { SERVICE_NAV, SITE_URL, THEME } from "@/lib/site";
import { indexingAllowed } from "@/lib/seo/metadata";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  const { seo, content } = site;
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: seo.default_title, template: seo.title_template },
    description: seo.default_description,
    applicationName: content.brand.name,
    openGraph: { type: "website", siteName: content.brand.name, locale: seo.og_locale },
    twitter: { card: "summary_large_image" },
    verification: {
      ...(seo.verification.google ? { google: seo.verification.google } : {}),
      ...(seo.verification.bing ? { other: { "msvalidate.01": seo.verification.bing } } : {}),
    },
    ...(indexingAllowed(seo) ? {} : { robots: { index: false, follow: false } }),
  };
}

export const viewport: Viewport = {
  themeColor: THEME === "light" ? "#ffffff" : "#09090b",
  colorScheme: THEME,
};

const NAV: Bind = { doc: "site", path: "nav" };

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [site, edit] = await Promise.all([getSite(), getEditState()]);
  const { nav, brand } = site.content;

  const header = (
    <Navbar
      services={SERVICE_NAV.map((service) => ({
        slug: service.slug,
        href: service.href,
        name: <EditableText bind={at(NAV, service.key, "name")} value={nav[service.key].name} />,
        blurb: <EditableText bind={at(NAV, service.key, "blurb")} value={nav[service.key].blurb} />,
      }))}
      ctaLabel={<EditableText bind={at(NAV, "ctaLabel")} value={nav.ctaLabel} />}
      mobileCtaLabel={<EditableText bind={at(NAV, "mobileCtaLabel")} value={nav.mobileCtaLabel} />}
      tagline={brand.tagline}
    />
  );

  return (
    <html lang={site.seo.html_lang} data-theme={THEME} className={`${inter.variable} ${jakarta.variable} h-full overflow-x-hidden`}>
      {/* Extensions like Grammarly/ColorZilla inject attributes on <body> before hydration. */}
      <body className="flex min-h-full flex-col overflow-x-hidden" suppressHydrationWarning>
        <a
          href="#main"
          className="sr-only z-[100] rounded-full bg-accent px-4 py-2 font-semibold text-on-accent focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        {edit.editing ? (
          <EditModeProvider role={edit.role}>
            <SiteChrome header={header} footer={<Footer site={site.content} />} editing>
              {children}
            </SiteChrome>
          </EditModeProvider>
        ) : (
          <SiteChrome header={header} footer={<Footer site={site.content} />}>
            {children}
          </SiteChrome>
        )}
      </body>
    </html>
  );
}
