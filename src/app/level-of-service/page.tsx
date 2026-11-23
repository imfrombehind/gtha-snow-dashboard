import type { Metadata } from "next";
import losJson from "@/data/level-of-service.json";
import SiteHeader from "@/components/SiteHeader";
import ServiceCompare, { BackToLevelOfService } from "@/components/ServiceCompare";
import type { ServiceCategory, ServiceProfile } from "@/components/ServiceLevels";
import { LEAD, PAGE_TITLE } from "@/lib/typography";

const los = losJson as unknown as { categories: ServiceCategory[]; municipalities: ServiceProfile[] };

const TITLE = "Compare Levels of Service | GTHA Winter Maintenance";
const DESCRIPTION =
  "Compare published winter plowing triggers, completion times and target surfaces by road type across GTHA municipalities and Regions.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION, type: "website", locale: "en_CA" },
  twitter: { card: "summary", title: TITLE, description: DESCRIPTION },
};

export default function LevelOfServicePage() {
  return (
    <>
      <SiteHeader active="profile" />
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 text-ink sm:px-5 sm:py-10">
        <BackToLevelOfService profiles={los.municipalities} />
        <header>
          <h1 className={PAGE_TITLE}>Compare levels of service</h1>
          <p className={`${LEAD} max-w-3xl`}>
            See what each municipality and Region publishes for one road type. These are published targets, not measures of
            how well a service performs, and a gap means the detail is not available here.
          </p>
        </header>
        <ServiceCompare profiles={los.municipalities} categories={los.categories} />
      </main>
    </>
  );
}
