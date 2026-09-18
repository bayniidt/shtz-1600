import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { getSiteData } from "@/lib/db";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const { site } = getSiteData();

  return (
    <>
      <SiteHeader site={site} />
      <main className="min-h-screen flex-1">{children}</main>
      <SiteFooter site={site} />
    </>
  );
}
