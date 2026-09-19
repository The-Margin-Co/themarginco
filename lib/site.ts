import { siteDefaults } from "@/lib/cms/pages/site";

// Editable brand/contact content lives in the CMS ("site" document, see lib/cms/pages/site.ts).
// This module only holds values that are configuration rather than content.
/** Site palette (see app/globals.css): "light" = white + yellow, "dark" = black + yellow. */
export const THEME: "light" | "dark" = "light";

/**
 * Canonicals, the sitemap, robots and OG URLs are all built from this, so a silent localhost
 * fallback in production would poison every one of them. Fail the production build instead;
 * local and preview builds keep the convenient default.
 */
function resolveSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/+$/, "");
  const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercelHost) return `https://${vercelHost}`;
  if (process.env.VERCEL_ENV === "production") {
    throw new Error("NEXT_PUBLIC_SITE_URL must be set in production (canonical URLs, sitemap and OG tags depend on it).");
  }
  return "http://localhost:3000";
}

export const SITE_URL = resolveSiteUrl();

/** Static fallback name for admin screens and emails; public pages read the CMS. */
export const SITE_NAME = siteDefaults.brand.name;

export const SERVICE_NAV = [
  { key: "metaAds", slug: "meta-ads", href: "/services/meta-ads", icon: "Megaphone" },
  { key: "facebookAds", slug: "facebook-ads", href: "/services/facebook-ads", icon: "Users" },
  { key: "websiteDevelopment", slug: "website-development", href: "/services/website-development", icon: "CodeXml" },
] as const;

export const NAV_LINKS = [
  { label: "About", href: "/about" },
  { label: "Case Studies", href: "/case-studies" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
] as const;
