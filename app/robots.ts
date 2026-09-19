import type { MetadataRoute } from "next";
import { getPublishedSeo } from "@/lib/cms/load";
import { SITE_URL } from "@/lib/site";
import { indexingAllowed } from "@/lib/seo/metadata";

export const revalidate = 3600;

// The admin and API are never crawlable, whatever custom rules say.
const ALWAYS_BLOCKED = ["/admin", "/api"];

export default async function robots(): Promise<MetadataRoute.Robots> {
  const { site } = await getPublishedSeo();
  const sitemap = new URL("/sitemap.xml", SITE_URL).toString();

  if (!indexingAllowed(site)) {
    return { rules: { userAgent: "*", disallow: "/" }, sitemap };
  }

  const custom = site.robots.rules.map((rule) => ({
    userAgent: rule.user_agent,
    ...(rule.allow.length ? { allow: rule.allow } : {}),
    disallow: [...new Set([...rule.disallow, ...ALWAYS_BLOCKED])],
  }));
  const hasWildcard = custom.some((rule) => rule.userAgent === "*");

  return {
    rules: [...(hasWildcard ? [] : [{ userAgent: "*", allow: "/", disallow: ALWAYS_BLOCKED }]), ...custom],
    sitemap,
    host: SITE_URL,
  };
}
