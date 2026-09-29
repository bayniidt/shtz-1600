import type { Metadata } from "next";

import {
  AboutStats,
  OfficesSection,
  TeamSection,
  TimelineSection,
  VisionSection,
} from "@/components/about/AboutSections";
import { PageHero } from "@/components/layout/PageHero";
import { CtaButton } from "@/components/ui/cta-button";
import { getLocalizedSiteData } from "@/lib/db";
import { UI_COPY } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Founded in Shanghai in 2017, ADFLY delivers performance marketing solutions that help brands grow globally.",
};

export default async function EnglishAboutPage() {
  const { about } = await getLocalizedSiteData("en");
  const copy = UI_COPY.en;

  return (
    <>
      <PageHero
        eyebrow={about.heroEyebrow}
        title={about.heroTitle}
        description={about.heroDescription}
        actions={
          <>
            <CtaButton href="#contact" size="lg">
              {copy.about.contactUs}
            </CtaButton>
            <CtaButton href="/en/careers" variant="outline" size="lg">
              {copy.about.joinUs}
            </CtaButton>
          </>
        }
      />

      <AboutStats stats={about.stats} />
      <VisionSection content={about} />
      <TimelineSection items={about.timeline} locale="en" />
      <TeamSection content={about} locale="en" />
      <OfficesSection offices={about.offices} locale="en" />
    </>
  );
}
