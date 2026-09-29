import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CityPositionsSection } from "@/components/careers/CareerPages";
import { findCity } from "@/lib/careers";
import { getLocalizedSiteData } from "@/lib/db";

interface CityPageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const { careers } = await getLocalizedSiteData("en");
  return careers.cities.map(({ id }) => ({ id }));
}

export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  const { id } = await params;
  const { careers } = await getLocalizedSiteData("en");
  const city = findCity(careers, id);
  if (!city) return { title: "Hiring City" };

  const cityName = city.nameEn ?? city.name;
  return {
    title: `${cityName} Careers`,
    description: `${city.summary ?? `Open roles in ${cityName}`} - ADFLY Careers`,
  };
}

export default async function EnglishCareersCityPage({ params }: CityPageProps) {
  const { id } = await params;
  const { careers } = await getLocalizedSiteData("en");
  const city = findCity(careers, id);
  if (!city) notFound();

  return (
    <>
      <div className="pt-28 md:pt-36" />
      <CityPositionsSection content={careers} city={city} locale="en" />
    </>
  );
}
