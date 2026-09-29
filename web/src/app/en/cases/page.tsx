import type { Metadata } from "next";

import { CasesExplorer } from "@/components/cases/CasesExplorer";
import { PageHero } from "@/components/layout/PageHero";
import { getLocalizedSiteData } from "@/lib/db";

export const metadata: Metadata = {
  title: "Customer Cases",
  description:
    "Explore ADFLY success stories across ecommerce, gaming and apps, powered by data and creative excellence.",
};

export default async function EnglishCasesPage() {
  const { cases } = await getLocalizedSiteData("en");

  return (
    <>
      <PageHero
        eyebrow="CUSTOMER CASES"
        title={cases.page.title}
        description={cases.page.subtitle}
      />

      <section className="section-y pt-0">
        <div className="container-x">
          <CasesExplorer items={cases.items} page={cases.page} locale="en" />
        </div>
      </section>
    </>
  );
}
