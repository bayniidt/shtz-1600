import type { Metadata } from "next";

import { ClientsSection } from "@/components/home/ClientsSection";
import { FlowSection } from "@/components/home/FlowSection";
import { HeroSection } from "@/components/home/HeroSection";
import { HonorsSection } from "@/components/home/HonorsSection";
import { MediaSection } from "@/components/home/MediaSection";
import { StrengthSection } from "@/components/home/StrengthSection";
import { getLocalizedSiteData } from "@/lib/db";
import { getShtzCompanyLogos } from "@/lib/shtz-assets";

export const metadata: Metadata = {
  title: "Global AI-Powered Martech Solutions",
  description:
    "ADFLY helps brands grow globally with performance marketing, AI-driven creative production and direct access to 50+ leading media channels.",
};

export default async function EnglishHomePage() {
  const { home } = await getLocalizedSiteData("en");
  const companyLogos = getShtzCompanyLogos();

  return (
    <>
      <HeroSection content={home.hero} mediaLogos={companyLogos} locale="en" />
      <MediaSection content={home.media} locale="en" />
      <FlowSection content={home.flow} />
      <ClientsSection content={home.clients} />
      <StrengthSection content={home.strength} />
      <HonorsSection content={home.honors} locale="en" />
    </>
  );
}
