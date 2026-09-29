import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  CaseBlocks,
  CaseDetailHero,
  CaseStats,
  RelatedCases,
} from "@/components/cases/CaseDetail";
import { getLocalizedSiteData } from "@/lib/db";

type PageProps = { params: Promise<{ id: string }> };

export async function generateStaticParams() {
  const { cases } = await getLocalizedSiteData("en");
  return cases.items.map(({ id }) => ({ id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const { cases } = await getLocalizedSiteData("en");
  const item = cases.items.find((caseItem) => caseItem.id === id);
  if (!item) return { title: "Case Not Found" };
  return {
    title: item.title,
    description: item.summary,
  };
}

export default async function EnglishCaseDetailPage({ params }: PageProps) {
  const { id } = await params;
  const { cases } = await getLocalizedSiteData("en");
  const item = cases.items.find((caseItem) => caseItem.id === id);

  if (!item) notFound();

  const industryLabel =
    cases.page.filters.find((filter) => filter.key === item.industry)?.label ?? item.industry;

  return (
    <>
      <CaseDetailHero item={item} industryLabel={industryLabel} locale="en" />
      <CaseStats stats={item.stats} />
      <CaseBlocks blocks={item.blocks} locale="en" />
      <RelatedCases
        items={cases.items}
        page={cases.page}
        currentId={item.id}
        locale="en"
      />
    </>
  );
}
