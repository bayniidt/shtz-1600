import type { Metadata } from "next";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { getLocalizedSiteData } from "@/lib/db";

export const metadata: Metadata = {
  title: {
    default: "ADFLY | Global AI-Powered Martech Solutions",
    template: "%s | ADFLY",
  },
};

export default async function EnglishSiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { site } = await getLocalizedSiteData("en");

  return (
    <>
      <SiteHeader site={site} locale="en" />
      <main className="min-h-screen flex-1">{children}</main>
      <SiteFooter site={site} locale="en" />
    </>
  );
}
