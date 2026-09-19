import { PageJsonLd } from "@/components/seo/PageJsonLd";
import { RoasCalculator } from "@/components/services/RoasCalculator";
import { ServiceLanding } from "@/components/services/ServiceLanding";
import { pageMetadata } from "@/lib/seo/page";

export function generateMetadata() {
  return pageMetadata("services/meta-ads");
}

export default function MetaAdsPage() {
  return (
    <>
      <PageJsonLd slug="services/meta-ads" />
      <ServiceLanding slug="services/meta-ads" roiPanel={<RoasCalculator variant="ecommerce" defaults={{ spend: 10000, cpc: 0.9, cvr: 3, value: 95 }} />} />
    </>
  );
}
