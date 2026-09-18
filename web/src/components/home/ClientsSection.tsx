"use client";

import { useState } from "react";

import { Reveal } from "@/components/motion/Reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { cn } from "@/lib/utils";
import type { ClientsSectionContent } from "@/types";

export function ClientsSection({ content }: { content: ClientsSectionContent }) {
  const [active, setActive] = useState(content.industries[0]?.key ?? "ecommerce");
  const logos = content.logos.filter((logo) => logo.industry === active);

  return (
    <section className="section-y relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/3 -left-32 size-[520px] rounded-full opacity-60 blur-3xl"
        style={{
          background: "radial-gradient(circle, rgba(30,150,212,.2) 0%, rgba(242,242,242,0) 70%)",
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
                  "card-surface group cursor-pointer border p-6 text-left transition-all duration-400 ease-[var(--ease-out-soft)]",
                  isActive
                    ? "-translate-y-1.5 border-brand/40 shadow-[var(--shadow-card-hover)]"
                    : "border-transparent hover:-translate-y-1",
                )}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "grid size-11 place-items-center rounded-2xl text-sm font-bold transition-colors duration-300",
                      isActive ? "bg-brand-gradient text-white" : "bg-brand-soft text-brand",
                    )}
                  >
                    {industry.name.slice(0, 1)}
                  </span>
                  <span
                    className={cn(
                      "size-2.5 rounded-full transition-colors duration-300",
                      isActive ? "bg-brand" : "bg-line",
                    )}
                  />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-ink">{industry.name}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-ink-3">
                  {industry.description}
                </p>
                <p className="mt-4 border-t border-line pt-4 text-[13px] font-medium text-brand">
                  {industry.stat}
                </p>
              </button>
            );
          })}
        </Reveal>

        <Reveal delay={160} className="mt-12">
          <p className="mb-5 text-center text-xs tracking-[0.2em] text-ink-4 uppercase">
            部分合作客户
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {logos.map((logo, i) => (
              <div
                key={logo.name}
                className="group grid h-16 place-items-center rounded-2xl border border-line/70 bg-white transition-all duration-400 ease-[var(--ease-out-soft)] hover:-translate-y-1 hover:border-brand/30 hover:shadow-[var(--shadow-card)]"
                style={{ animation: `fade-in-up .5s var(--ease-out-soft) ${i * 40}ms both` }}
              >
                <span className="text-[15px] font-semibold text-ink-3 transition-colors duration-300 group-hover:text-brand">
                  {logo.name}
                </span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
