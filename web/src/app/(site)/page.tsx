import { ClientsSection } from "@/components/home/ClientsSection";
import { FlowSection } from "@/components/home/FlowSection";
import { HeroSection } from "@/components/home/HeroSection";
import { HonorsSection } from "@/components/home/HonorsSection";
import { MediaSection } from "@/components/home/MediaSection";
import { StrengthSection } from "@/components/home/StrengthSection";
import { getSiteData } from "@/lib/db";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const { home } = getSiteData();

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
