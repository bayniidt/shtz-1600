import Image from "next/image";

import { Reveal } from "@/components/motion/Reveal";
import { CtaButton } from "@/components/ui/cta-button";
import { assetPath } from "@/lib/asset-path";
import type { ShtzLogo } from "@/lib/shtz-assets";
import type { HeroContent } from "@/types";

export function HeroSection({
  content,
  mediaLogos,
}: {
  content: HeroContent;
  mediaLogos: ShtzLogo[];
}) {
  return (
    <section className="relative overflow-hidden pt-32 pb-16 md:pt-40 lg:pt-44 lg:pb-24">
      <div aria-hidden className="grain-grid absolute inset-0 opacity-70" />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 right-[-10%] size-[620px] rounded-full opacity-70 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(235,52,7,.26) 0%, rgba(242,242,242,0) 65%)",
        }}
      />

      <div className="container-x relative grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
        <div>
          <Reveal className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-white/80 px-4 py-2 text-[11px] font-semibold tracking-[0.16em] text-brand uppercase shadow-[0_6px_20px_rgba(235,52,7,.12)]">
            <span className="size-1.5 animate-pulse rounded-full bg-brand" />
            {content.eyebrow}
          </Reveal>

          <Reveal delay={80}>
            <h1 className="mt-6 text-[clamp(2.2rem,5vw,4rem)] leading-[1.08] font-bold text-ink">
              {content.title}
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="mt-5 max-w-xl text-pretty text-[15px] leading-relaxed text-ink-3 md:text-base">
              {content.description}
            </p>
          </Reveal>

          <Reveal delay={240} className="mt-9 flex flex-wrap items-center gap-4">
            <CtaButton href={content.primaryCta.href} size="lg">
              {content.primaryCta.label}
              <Arrow />
            </CtaButton>
            <CtaButton href={content.secondaryCta.href} variant="outline" size="lg">
              {content.secondaryCta.label}
            </CtaButton>
          </Reveal>

          <Reveal
            delay={320}
            className="mt-12 grid max-w-xl grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-4"
          >
            {content.stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-bold text-ink md:text-[28px]">{stat.value}</p>
                <p className="mt-1 text-xs text-ink-4">{stat.label}</p>
              </div>
            ))}
          </Reveal>
        </div>

        <Reveal delay={200} className="relative">
          <HeroVisual />
        </Reveal>
      </div>

      <Reveal delay={120} className="relative mt-16 lg:mt-20">
        <div className="flex items-center gap-3 text-xs tracking-[0.2em] text-ink-4 uppercase">
          <span className="container-x w-full">合作媒体资源</span>
        </div>
        <div className="relative mt-4 overflow-hidden border-y border-line bg-white/60 py-4">
          {mediaLogos.length > 0 ? (
            <div
              aria-hidden
              className="logo-marquee flex w-max animate-[var(--animate-marquee)] gap-3 pr-3"
              style={{ animationDuration: "120s" }}
            >
              {[...mediaLogos, ...mediaLogos].map((logo, index) => (
                <div
                  key={`${logo.src}-${index}`}
                  className="flex h-14 w-28 shrink-0 items-center justify-center rounded-xl border border-line/60 bg-white px-3"
                >
                  <Image
                    src={logo.src}
                    alt=""
                    width={88}
                    height={36}
                    className="max-h-9 w-auto max-w-[88px] object-contain"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex w-max animate-[var(--animate-marquee)] gap-14 pr-14">
              {[...content.marquee, ...content.marquee].map((name, i) => (
                <span
                  key={`${name}-${i}`}
                  className="text-lg font-semibold whitespace-nowrap text-ink-4"
                >
                  {name}
                </span>
              ))}
            </div>
          )}
        </div>
      </Reveal>
    </section>
  );
}

function HeroVisual() {
  return (
    <div className="relative mx-auto max-w-[520px]">
      <div className="card-surface relative overflow-visible border border-line/70 p-6">
        <div className="flex items-center justify-between pr-20 sm:pr-24">
          <div>
            <p className="text-xs tracking-[0.18em] text-ink-4 uppercase">Flow AI · Live</p>
            <p className="mt-1 text-lg font-semibold text-ink">投放效果实时看板</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1 text-xs font-medium text-brand">
            <span className="size-1.5 rounded-full bg-brand" />
            运行中
          </span>
        </div>

        <div className="mt-7 flex h-40 items-end gap-3">
          {[38, 52, 46, 68, 74, 61, 88, 96].map((h, i) => (
            <div key={i} className="flex-1">
              <div
                className="w-full rounded-t-md bg-brand-gradient transition-[height] duration-700"
                style={{ height: `${h}%`, opacity: 0.55 + i * 0.055 }}
              />
            </div>
          ))}
        </div>
        <div className="mt-3 flex justify-between text-[11px] text-ink-4">
          <span>曝光</span>
          <span>点击</span>
          <span>转化</span>
          <span>ROI</span>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3">
          {[
            { k: "ROI", v: "3.8" },
            { k: "CTR", v: "4.2%" },
            { k: "CPA", v: "-38%" },
          ].map((item) => (
            <div key={item.k} className="rounded-xl bg-surface px-3 py-3">
              <p className="text-[11px] text-ink-4">{item.k}</p>
              <p className="mt-1 text-base font-semibold text-ink">{item.v}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute -top-10 -right-3 z-10 size-28 overflow-hidden rounded-full border-[6px] border-white bg-white shadow-[0_18px_45px_rgba(7,3,1,.2)] sm:-right-6 sm:size-32">
        <Image
          src={assetPath("/shtz/robot.jpg")}
          alt="Flow AI 智能助手"
          fill
          sizes="128px"
          className="scale-[1.08] object-cover"
        />
      </div>

      <div className="card-surface absolute -top-5 -left-4 hidden animate-[var(--animate-float-slow)] items-center gap-2 px-4 py-3 sm:flex">
        <span className="grid size-8 place-items-center rounded-lg bg-brand-soft text-sm font-bold text-brand">
          AI
        </span>
        <span className="text-xs font-medium text-ink">素材自动生成</span>
      </div>
      <div
        className="card-surface absolute -right-4 -bottom-6 hidden animate-[var(--animate-float-slow)] items-center gap-2 px-4 py-3 sm:flex"
        style={{ animationDelay: "1.4s" }}
      >
        <span className="grid size-8 place-items-center rounded-lg bg-brand-soft text-sm font-bold text-brand">
          50+
        </span>
        <span className="text-xs font-medium text-ink">媒体渠道直连</span>
      </div>
    </div>
  );
}

function Arrow() {
  return (
    <svg viewBox="0 0 16 16" className="size-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">
      <path d="M2 8h11M9 3.5 13.5 8 9 12.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
