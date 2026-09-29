import { ClientsSection } from "@/components/home/ClientsSection";
import { FlowSection } from "@/components/home/FlowSection";
import { HeroSection } from "@/components/home/HeroSection";
import { HonorsSection } from "@/components/home/HonorsSection";
import { MediaSection } from "@/components/home/MediaSection";
import { StrengthSection } from "@/components/home/StrengthSection";
import { getSiteDataFromAPI } from "@/lib/db";
import { getShtzCompanyLogos } from "@/lib/shtz-assets";

export default async function HomePage() {
  const { home } = await getSiteDataFromAPI();
  const companyLogos = getShtzCompanyLogos();

  return (
    <>
      <HeroSection content={home.hero} mediaLogos={companyLogos} />
      <MediaSection content={home.media} />
      <FlowSection content={home.flow} />
      <ClientsSection content={home.clients} />
      <StrengthSection content={home.strength} />
      <HonorsSection content={home.honors} />
    </>
  );
}
