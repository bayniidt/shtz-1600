import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  CaseBlocks,
  CaseDetailHero,
  CaseStats,
  RelatedCases,
} from "@/components/cases/CaseDetail";
import { getSiteDataFromAPI } from "@/lib/db";

type PageProps = { params: Promise<{ id: string }> };

export async function generateStaticParams() {
  const { cases } = await getSiteDataFromAPI();
  return cases.items.map(({ id }) => ({ id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const { cases } = await getSiteDataFromAPI();
  const item = cases.items.find((caseItem) => caseItem.id === id);
  if (!item) return { title: "案例未找到" };
  return {
    title: item.title,
    description: item.summary,
  };
}

export default async function CaseDetailPage({ params }: PageProps) {
  const { id } = await params;
  const { cases } = await getSiteDataFromAPI();
  const item = cases.items.find((caseItem) => caseItem.id === id);

  if (!item) notFound();

  const industryLabel =
    cases.page.filters.find((f) => f.key === item.industry)?.label ?? item.industry;

  return (
    <>
      <CaseDetailHero item={item} industryLabel={industryLabel} />
      <CaseStats stats={item.stats} />
      <CaseBlocks blocks={item.blocks} />
      <RelatedCases items={cases.items} page={cases.page} currentId={item.id} />
    </>
  );
}
