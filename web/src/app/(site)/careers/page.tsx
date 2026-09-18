import type { Metadata } from "next";

import { BenefitsSection, CityIndexSection, CultureSection, JobsSection } from "@/components/careers/CareersSections";
import { PageHero } from "@/components/layout/PageHero";
import { CtaButton } from "@/components/ui/cta-button";
import { getSiteData } from "@/lib/db";
import { cityCounts, totalPositions } from "@/lib/careers";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "加入我们",
  description:
    "加入 ADFLY 飞书汇，与具有全球化视野、积极进取且富有创新精神的出海营销人一起，助力中国企业走向全球。",
};

export default function CareersPage() {
  const { careers } = getSiteData();
  const counts = cityCounts(careers);
  const cityTotal = Object.values(counts).length;

  return (
    <>
      <PageHero
        eyebrow="JOIN ADFLY"
        title={careers.heroTitle}
        description={careers.heroDescription}
        actions={
          <>
            <CtaButton href="#cities" size="lg">
              查看在招岗位
            </CtaButton>
            <CtaButton href={`mailto:${careers.applyEmail}`} variant="outline" size="lg">
              投递简历
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
            <span>
              {cityTotal} 个招聘城市 · {totalPositions(careers)} 个在招职位
            </span>
            <a
              href="#cities"
              className="text-brand transition-transform duration-300 hover:translate-x-0.5"
            >
              招聘城市索引 →
            </a>
            <a
              href="#jobs"
              className="text-brand transition-transform duration-300 hover:translate-x-0.5"
            >
              热招职位 →
            </a>
          </div>
        </div>
      </section>

      <CityIndexSection content={careers} />
      <CultureSection content={careers} />
      <BenefitsSection content={careers} />
      <JobsSection content={careers} />
    </>
  );
}
