"use client";

import Image from "next/image";
import { useState } from "react";

import { Reveal } from "@/components/motion/Reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { assetPath } from "@/lib/asset-path";
import { cn } from "@/lib/utils";
import type { ClientsSectionContent } from "@/types";

const INDUSTRY_IMAGES: Record<string, string> = {
  ecommerce: assetPath("/shtz/合作客户/合作客户-电商.png"),
  game: assetPath("/shtz/合作客户/合作客户-游戏.png"),
  app: assetPath("/shtz/合作客户/合作客户-APP.png"),
};

export function ClientsSection({ content }: { content: ClientsSectionContent }) {
  const [active, setActive] = useState(content.industries[0]?.key ?? "ecommerce");

  return (
    <section className="section-y relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/3 -left-32 size-[520px] rounded-full opacity-60 blur-3xl"
        style={{
          background: "radial-gradient(circle, rgba(235,52,7,.2) 0%, rgba(242,242,242,0) 70%)",
        }}
      />
      <div className="container-x relative">
        <SectionHeading title={content.title} description={content.subtitle} />

        <Reveal delay={100} className="mt-12 grid gap-4 md:grid-cols-3">
          {content.industries.map((industry) => {
            const isActive = industry.key === active;
            return (
              <button
                key={industry.key}
                type="button"
                onClick={() => setActive(industry.key)}
                aria-pressed={isActive}
                className={cn(
                  "card-surface group cursor-pointer overflow-hidden border text-left transition-all duration-400 ease-[var(--ease-out-soft)]",
                  isActive
                    ? "-translate-y-1.5 border-brand/40 shadow-[var(--shadow-card-hover)]"
                    : "border-transparent hover:-translate-y-1",
                )}
              >
                <div className="relative aspect-[16/8] overflow-hidden border-b border-line/70 bg-white">
                  <Image
                    src={INDUSTRY_IMAGES[industry.key] ?? INDUSTRY_IMAGES.game}
                    alt={`${industry.name}合作客户`}
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className={cn(
                      "object-contain p-3 transition-all duration-700 ease-[var(--ease-out-soft)]",
                      isActive ? "scale-[1.03]" : "opacity-85 group-hover:opacity-100",
                    )}
                  />
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-transparent"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-ink">{industry.name}</h3>
                    <span
                      className={cn(
                        "size-2.5 rounded-full transition-colors duration-300",
                        isActive ? "bg-brand" : "bg-line",
                      )}
                    />
                  </div>
                  <p className="mt-2 text-[13px] leading-relaxed text-ink-3">
                    {industry.description}
                  </p>
                  <p className="mt-4 border-t border-line pt-4 text-[13px] font-medium text-brand">
                    {industry.stat}
                  </p>
                </div>
              </button>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
