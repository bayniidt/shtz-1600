import type { Metadata } from "next";

import { CasesExplorer } from "@/components/cases/CasesExplorer";
import { PageHero } from "@/components/layout/PageHero";
import { getSiteDataFromAPI } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "客户案例",
  description:
    "ADFLY 飞书汇出海营销成功案例：覆盖电商、游戏、APP 三大行业，以数据与创意驱动的全球化增长实践。",
};

export default async function CasesPage() {
  const { cases } = await getSiteDataFromAPI();

  return (
    <>
      <PageHero
        eyebrow="CUSTOMER CASES"
        title={cases.page.title}
        description={cases.page.subtitle}
      />

      <section className="section-y pt-0">
        <div className="container-x">
          <CasesExplorer items={cases.items} page={cases.page} />
        </div>
      </section>
    </>
  );
}
