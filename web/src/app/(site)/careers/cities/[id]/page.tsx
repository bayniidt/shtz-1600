import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CityPositionsSection } from "@/components/careers/CareerPages";
import { getSiteDataFromAPI } from "@/lib/db";
import { findCity } from "@/lib/careers";

export const dynamic = "force-dynamic";

interface CityPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  const { id } = await params;
  const { careers } = await getSiteDataFromAPI();
  const city = findCity(careers, id);
  if (!city) return { title: "招聘城市" };

  return {
    title: `${city.name}招聘`,
    description: `${city.summary ?? `${city.name}在招职位`} — ADFLY 招聘`,
  };
}

export default async function CareersCityPage({ params }: CityPageProps) {
  const { id } = await params;
  const { careers } = await getSiteDataFromAPI();
  const city = findCity(careers, id);
  if (!city) notFound();

  return (
    <>
      <div className="pt-28 md:pt-36" />
      <CityPositionsSection content={careers} city={city} />
    </>
  );
}
