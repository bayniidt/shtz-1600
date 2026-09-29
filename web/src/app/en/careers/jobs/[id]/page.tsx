import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PositionDetailSection } from "@/components/careers/CareerPages";
import { positionCities, positionSummary } from "@/lib/careers";
import { getLocalizedSiteData } from "@/lib/db";

interface PositionPageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const { careers } = await getLocalizedSiteData("en");
  return careers.positions.map(({ id }) => ({ id }));
}

export async function generateMetadata({ params }: PositionPageProps): Promise<Metadata> {
  const { id } = await params;
  const { careers } = await getLocalizedSiteData("en");
  const position = careers.positions.find((item) => item.id === id);
  if (!position) return { title: "Open Role" };

  const cities = positionCities(careers, position).map((city) => city.nameEn ?? city.name);
  return {
    title: `${position.title} - ${cities.join("/")}`,
    description: positionSummary(position),
  };
}

export default async function EnglishCareersPositionPage({ params }: PositionPageProps) {
  const { id } = await params;
  const { careers } = await getLocalizedSiteData("en");
  const position = careers.positions.find((item) => item.id === id);
  if (!position) notFound();

  return (
    <>
      <div className="pt-28 md:pt-36" />
      <PositionDetailSection content={careers} position={position} locale="en" />
    </>
  );
}
