import Image from "next/image";

import { Counter } from "@/components/motion/Counter";
import { Reveal } from "@/components/motion/Reveal";
import { CtaButton } from "@/components/ui/cta-button";
import type { StrengthSectionContent } from "@/types";

export function StrengthSection({ content }: { content: StrengthSectionContent }) {
  return (
    <section className="section-y relative overflow-hidden bg-white">
      <div className="container-x relative">
        <div className="grid gap-14 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <div>
            <Reveal>
              <h2 className="text-[clamp(1.9rem,3.6vw,3.2rem)] leading-[1.12] font-bold text-ink">
                {content.title}
              </h2>
            </Reveal>
            <Reveal delay={80}>
              <p className="mt-6 max-w-xl text-[14px] leading-relaxed text-ink-3 md:text-[15px]">
                {content.description}
              </p>
            </Reveal>
            <Reveal delay={160} className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
              {content.nodes.map((node) => (
                <span
                  key={node.city}
                  className="inline-flex items-center gap-2 text-[13px] text-ink-3"
                >
                  <span
                    className={
                      node.major && node.major !== "no"
                        ? "size-2 rounded-full bg-brand"
                        : "size-1.5 rounded-full bg-line"
                    }
                  />
                  {node.city}
                </span>
              ))}
            </Reveal>
            <Reveal delay={240} className="mt-9">
              <CtaButton href={content.cta.href} size="lg">
                {content.cta.label}
                <Arrow />
              </CtaButton>
            </Reveal>
          </div>

          <Reveal delay={140} className="relative">
            <div className="relative aspect-[16/11] overflow-hidden rounded-card border border-line bg-surface">
              <Image
                src="/images/adfly/map.jpg"
                alt="ADFLY 全球服务网络"
                fill
                sizes="(min-width: 1024px) 640px, 100vw"
                className="object-cover opacity-90"
                priority={false}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white/70 via-transparent to-white/40" />

              {content.nodes.map((node, i) => (
                <div
                  key={node.city}
                  className="group absolute"
                  style={{ left: `${Number(node.x)}%`, top: `${Number(node.y)}%` }}
                >
                  <span className="relative flex items-center gap-2">
                    <span className="relative grid place-items-center">
                      <span className="absolute size-6 animate-ping rounded-full bg-brand/30" />
                      <span
                        className={
                          node.major && node.major !== "no"
                            ? "relative size-3 rounded-full border-2 border-white bg-brand shadow-[0_0_0_4px_rgba(30,150,212,.25)]"
                            : "relative size-2.5 rounded-full border-2 border-white bg-brand-glow"
                        }
                      />
                    </span>
                    <span
                      className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-medium whitespace-nowrap text-ink shadow-sm backdrop-blur transition-transform duration-300 group-hover:-translate-y-0.5"
                      style={{ animation: `float-slow ${6 + i}s ease-in-out infinite` }}
                    >
                      {node.city}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-5">
          {content.stats.map((stat, i) => (
            <Reveal
              key={stat.label}
              delay={i * 80}
              className="card-surface border border-transparent px-6 py-7 text-center"
            >
              <p className="text-[clamp(1.8rem,3.4vw,2.6rem)] leading-none font-bold text-ink">
                <Counter value={stat.value} suffix={stat.suffix} />
              </p>
              <p className="mt-3 text-[13px] text-ink-4">{stat.label}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Arrow() {
  return (
    <svg viewBox="0 0 16 16" className="size-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">
      <path d="M2 8h11M9 3.5 13.5 8 9 12.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
