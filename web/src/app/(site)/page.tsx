import { ClientsSection } from "@/components/home/ClientsSection";
import { FlowSection } from "@/components/home/FlowSection";
import { HeroSection } from "@/components/home/HeroSection";
import { HonorsSection } from "@/components/home/HonorsSection";
import { MediaSection } from "@/components/home/MediaSection";
import { StrengthSection } from "@/components/home/StrengthSection";
import { getSiteDataFromAPI } from "@/lib/db";

export default async function HomePage() {
  const { home } = await getSiteDataFromAPI();

  return (
    <>
      <HeroSection content={home.hero} />
      <MediaSection content={home.media} />
      <FlowSection content={home.flow} />
      <ClientsSection content={home.clients} />
      <StrengthSection content={home.strength} />
      <HonorsSection content={home.honors} />
    </>
  );
}
