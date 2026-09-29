import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { getSiteDataFromAPI } from "@/lib/db";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const { site } = await getSiteDataFromAPI();
  return {
    title: {
      default: site.seo.title,
      template: `%s｜${site.logoText} ${site.logoSub}`,
    },
    description: site.seo.description,
    keywords: site.seo.keywords,
    openGraph: {
      title: site.seo.title,
      description: site.seo.description,
      type: "website",
      siteName: `${site.logoText} ${site.logoSub}`,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={`${montserrat.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-surface text-ink-2">
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
