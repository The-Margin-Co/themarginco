import type { PageSlug } from "@/lib/cms/registry";
import { pageJsonLd } from "@/lib/seo/page";
import { JsonLd } from "./JsonLd";

export async function PageJsonLd({ slug }: { slug: PageSlug }) {
  return <JsonLd data={await pageJsonLd(slug)} />;
}
