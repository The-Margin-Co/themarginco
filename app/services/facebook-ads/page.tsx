import { PageJsonLd } from "@/components/seo/PageJsonLd";
import { RoasCalculator } from "@/components/services/RoasCalculator";
import { ServiceLanding } from "@/components/services/ServiceLanding";
import { pageMetadata } from "@/lib/seo/page";

export function generateMetadata() {
  return pageMetadata("services/facebook-ads");
}

export default function FacebookAdsPage() {
  return (
    <>
      <PageJsonLd slug="services/facebook-ads" />
      <ServiceLanding slug="services/facebook-ads" roiPanel={<RoasCalculator variant="leadgen" defaults={{ spend: 5000, cpc: 0.9, cvr: 0.4, value: 1200 }} />} />
    </>
  );
}
