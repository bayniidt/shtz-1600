import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  CaseBlocks,
  CaseDetailHero,
  CaseStats,
  RelatedCases,
} from "@/components/cases/CaseDetail";
import { getCaseById, getSiteData } from "@/lib/db";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const item = getCaseById(id);
  if (!item) return { title: "案例未找到" };
  return {
    title: item.title,
    description: item.summary,
  };
}

export default async function CaseDetailPage({ params }: PageProps) {
  const { id } = await params;
  const { cases } = getSiteData();
  const item = getCaseById(id);

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
