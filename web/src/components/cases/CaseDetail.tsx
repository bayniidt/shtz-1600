import Image from "next/image";
import Link from "next/link";

import { CaseCard } from "@/components/cases/CaseCard";
import { Reveal } from "@/components/motion/Reveal";
import { UI_COPY, localizedHref, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { CaseItem, CasesPageContent } from "@/types";

export function CaseDetailHero({
  item,
  industryLabel,
  locale = "zh",
}: {
  item: CaseItem;
  industryLabel: string;
  locale?: Locale;
}) {
  const copy = UI_COPY[locale];
  const meta = [
    { label: copy.cases.client, value: item.client },
    { label: copy.cases.industry, value: industryLabel },
    { label: copy.cases.region, value: item.region },
    { label: copy.cases.year, value: item.year },
  ];

  return (
    <section className="relative pt-32 md:pt-40">
      <div className="container-x">
        <Reveal className="flex items-center gap-2 text-[13px] text-ink-4">
          <Link href={localizedHref("/cases", locale)} className="transition-colors hover:text-brand">
            {copy.cases.breadcrumb}
          </Link>
          <span>/</span>
          <span className="text-ink-3">{item.client}</span>
        </Reveal>

        <Reveal delay={60} className="mt-6 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-brand-soft px-3 py-1 text-[11px] font-semibold text-brand">
            {industryLabel}
          </span>
          {item.awards.map((award) => (
            <span
              key={award}
              className="rounded-full border border-line bg-white px-3 py-1 text-[11px] font-medium text-ink-3"
            >
              🏆 {award}
            </span>
          ))}
        </Reveal>

        <Reveal delay={120}>
          <h1 className="mt-5 max-w-4xl text-[clamp(1.8rem,3.8vw,3rem)] leading-[1.16] font-bold text-ink">
            {item.title}
          </h1>
        </Reveal>

        <Reveal delay={180}>
          <p className="mt-5 max-w-3xl text-[15px] leading-relaxed text-ink-3">{item.summary}</p>
        </Reveal>

        <Reveal delay={220} className="mt-8 grid grid-cols-2 gap-4 border-y border-line py-6 sm:grid-cols-4">
          {meta.map((row) => (
            <div key={row.label}>
              <p className="text-[11px] tracking-[0.16em] text-ink-4 uppercase">{row.label}</p>
              <p className="mt-1.5 text-[15px] font-medium text-ink">{row.value}</p>
            </div>
          ))}
        </Reveal>
      </div>

      <Reveal delay={120} className="container-x mt-10">
        <div className="relative aspect-[16/9] overflow-hidden rounded-card border border-line bg-surface md:aspect-[21/9]">
          <Image
            src={item.cover}
            alt={item.title}
            fill
            sizes="(min-width: 1280px) 1200px, 100vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-night/40 to-transparent" />
        </div>
      </Reveal>
    </section>
  );
}

export function CaseStats({ stats }: { stats: CaseItem["stats"] }) {
  return (
    <section className="container-x -mt-2 md:mt-10">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat, i) => (
          <Reveal
            key={stat.label}
            delay={i * 90}
            className="card-surface border border-transparent px-6 py-7 text-center"
          >
            <p className="text-[clamp(1.7rem,3vw,2.4rem)] leading-none font-bold text-ink">
              {stat.value}
              <span className="text-brand">{stat.unit}</span>
            </p>
            <p className="mt-3 text-[13px] text-ink-4">{stat.label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function CaseBlocks({
  blocks,
  locale = "zh",
}: {
  blocks: CaseItem["blocks"];
  locale?: Locale;
}) {
  const copy = UI_COPY[locale];

  return (
    <section className="section-y pt-16">
      <div className="container-x grid gap-12 lg:grid-cols-[240px_1fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="text-[11px] tracking-[0.2em] text-ink-4 uppercase">CASE STUDY</p>
          <h2 className="mt-3 text-2xl font-bold text-ink">{copy.cases.projectReview}</h2>
          <nav className="mt-6 hidden flex-col gap-3 lg:flex">
            {blocks.map((block) => (
              <a
                key={block.key}
                href={`#${block.key}`}
                className="text-[14px] text-ink-3 transition-all duration-300 hover:translate-x-1 hover:text-brand"
              >
                {block.title}
              </a>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-12">
          {blocks.map((block, i) => (
            <Reveal key={block.key} delay={i * 60} className="scroll-mt-28" >
              <div id={block.key} className="scroll-mt-28">
                <div className="flex items-center gap-4">
                  <span className="text-[13px] font-bold text-brand">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-xl font-semibold text-ink md:text-2xl">{block.title}</h3>
                </div>
                <div className="mt-5 space-y-4 border-l-2 border-line pl-6">
                  {block.body.map((paragraph) => (
                    <p key={paragraph} className="text-[15px] leading-relaxed text-ink-3">
                      {paragraph}
                    </p>
                  ))}
                  {block.points?.length ? (
                    <ul className="mt-5 grid gap-3">
                      {block.points.map((point) => (
                        <li key={point} className="flex items-start gap-3 text-[14px] text-ink-2">
                          <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function RelatedCases({
  items,
  page,
  currentId,
  className,
  locale = "zh",
}: {
  items: CaseItem[];
  page: CasesPageContent;
  currentId: string;
  className?: string;
  locale?: Locale;
}) {
  const copy = UI_COPY[locale];
  const related = items.filter((item) => item.id !== currentId).slice(0, 3);
  const labelOf = (key: string) => page.filters.find((f) => f.key === key)?.label ?? key;

  if (!related.length) return null;

  return (
    <section className={cn("section-y bg-white", className)}>
      <div className="container-x">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] tracking-[0.2em] text-ink-4 uppercase">MORE CASES</p>
            <h2 className="mt-3 text-2xl font-bold text-ink md:text-[32px]">
              {copy.cases.relatedCases}
            </h2>
          </div>
          <Link
            href={localizedHref("/cases", locale)}
            className="inline-flex items-center gap-1.5 text-[14px] font-medium text-brand transition-transform duration-300 hover:translate-x-1"
          >
            {copy.cases.viewAll}
          </Link>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {related.map((item, i) => (
            <CaseCard
              key={item.id}
              item={item}
              industryLabel={labelOf(item.industry)}
              delay={i * 70}
              locale={locale}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
