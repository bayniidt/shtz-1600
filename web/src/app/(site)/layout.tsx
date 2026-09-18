import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { getSiteDataFromAPI } from "@/lib/db";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { site } = await getSiteDataFromAPI();

  return (
    <>
      <SiteHeader site={site} />
      <main className="min-h-screen flex-1">{children}</main>
      <SiteFooter site={site} />
    </>
  );
}
