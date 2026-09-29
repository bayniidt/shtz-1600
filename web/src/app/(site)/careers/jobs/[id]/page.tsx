import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PositionDetailSection } from "@/components/careers/CareerPages";
import { getSiteDataFromAPI } from "@/lib/db";
import { positionCities, positionSummary } from "@/lib/careers";

interface PositionPageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const { careers } = await getSiteDataFromAPI();
  return careers.positions.map(({ id }) => ({ id }));
}

export async function generateMetadata({ params }: PositionPageProps): Promise<Metadata> {
  const { id } = await params;
  const { careers } = await getSiteDataFromAPI();
  const position = careers.positions.find((item) => item.id === id);
  if (!position) return { title: "招聘职位" };

  const cities = positionCities(careers, position).map((city) => city.name);
  return {
    title: `${position.title} - ${cities.join("/")}招聘`,
    description: positionSummary(position),
  };
}

export default async function CareersPositionPage({ params }: PositionPageProps) {
  const { id } = await params;
  const { careers } = await getSiteDataFromAPI();
  const position = careers.positions.find((item) => item.id === id);
  if (!position) notFound();

  return (
    <>
      <div className="pt-28 md:pt-36" />
      <PositionDetailSection content={careers} position={position} />
    </>
  );
}
