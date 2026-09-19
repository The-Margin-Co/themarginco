import { PageJsonLd } from "@/components/seo/PageJsonLd";
import { PerformanceScorecard } from "@/components/services/PerformanceScorecard";
import { ServiceLanding } from "@/components/services/ServiceLanding";
import { pageMetadata } from "@/lib/seo/page";

export function generateMetadata() {
  return pageMetadata("services/website-development");
}

export default function WebsiteDevelopmentPage() {
  return (
    <>
      <PageJsonLd slug="services/website-development" />
      <ServiceLanding slug="services/website-development" roiPanel={<PerformanceScorecard />} />
    </>
  );
}
