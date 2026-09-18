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
import { getSiteDataFromAPI } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "关于我们",
  description:
    "上海翼投智能科技有限公司（ADFLY 飞书汇）成立于 2017 年，专注效果类出海营销解决方案，累计服务超过 10000 家客户。",
};

export default async function AboutPage() {
  const { about } = await getSiteDataFromAPI();

  return (
    <>
      <PageHero
        eyebrow={about.heroEyebrow}
        title={about.heroTitle}
        description={about.heroDescription}
        actions={
          <>
            <CtaButton href="#contact" size="lg">
              联系我们
            </CtaButton>
            <CtaButton href="/careers" variant="outline" size="lg">
              加入我们
            </CtaButton>
          </>
        }
      />

      <AboutStats stats={about.stats} />
      <VisionSection content={about} />
      <TimelineSection items={about.timeline} />
      <TeamSection content={about} />
      <OfficesSection offices={about.offices} />
    </>
  );
}
