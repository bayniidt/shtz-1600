import type { Metadata } from "next";

import {
  BenefitsSection,
  CityIndexSection,
  CultureSection,
  JobsSection,
} from "@/components/careers/CareersSections";
import { PageHero } from "@/components/layout/PageHero";
import { CtaButton } from "@/components/ui/cta-button";
import { cityCounts, totalPositions } from "@/lib/careers";
import { getLocalizedSiteData } from "@/lib/db";
import { UI_COPY } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Careers",
  description:
    "Join ADFLY and work with globally minded marketers who help ambitious brands grow beyond borders.",
};

export default async function EnglishCareersPage() {
  const { careers } = await getLocalizedSiteData("en");
  const copy = UI_COPY.en;
  const cityTotal = Object.keys(cityCounts(careers)).length;

  return (
    <>
      <PageHero
        eyebrow="JOIN ADFLY"
        title={careers.heroTitle}
        description={careers.heroDescription}
        actions={
          <>
            <CtaButton href="#cities" size="lg">
              {copy.careers.viewOpenings}
            </CtaButton>
            <CtaButton href={`mailto:${careers.applyEmail}`} variant="outline" size="lg">
              {copy.careers.submitResume}
            </CtaButton>
          </>
        }
      />

      <section className="container-x -mt-4 mb-4">
        <div className="rounded-card border border-line bg-white px-6 py-6 text-center md:px-10 md:py-8">
          <p className="text-[clamp(1.2rem,2.4vw,1.8rem)] font-bold text-ink">
            {careers.heroSubtitle}
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[13px] text-ink-3">
            <span>{copy.careers.citiesAndJobs(cityTotal, totalPositions(careers))}</span>
            <a
              href="#cities"
              className="text-brand transition-transform duration-300 hover:translate-x-0.5"
            >
              {copy.careers.cityIndex}
            </a>
            <a
              href="#jobs"
              className="text-brand transition-transform duration-300 hover:translate-x-0.5"
            >
              {copy.careers.featuredJobs}
            </a>
          </div>
        </div>
      </section>

      <CityIndexSection content={careers} locale="en" />
      <CultureSection content={careers} locale="en" />
      <BenefitsSection content={careers} locale="en" />
      <JobsSection content={careers} locale="en" />
    </>
  );
}
