import Image from "next/image";
import Link from "next/link";

import { Reveal } from "@/components/motion/Reveal";
import { UI_COPY, localizedHref, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { CaseItem } from "@/types";

export function CaseCard({
  item,
  industryLabel,
  delay = 0,
  className,
  locale = "zh",
}: {
  item: CaseItem;
  industryLabel: string;
  delay?: number;
  className?: string;
  locale?: Locale;
}) {
  const copy = UI_COPY[locale];

  return (
    <Reveal delay={delay} className={cn("h-full", className)}>
      <Link
        href={localizedHref(`/cases/${item.id}`, locale)}
        className="card-surface group flex h-full flex-col overflow-hidden border border-transparent"
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-surface">
          <Image
            src={item.cover}
            alt={item.title}
            fill
            sizes="(min-width: 1024px) 400px, (min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-[1.06]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-night/55 via-night/5 to-transparent opacity-80" />
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-brand backdrop-blur">
              {industryLabel}
            </span>
            <span className="rounded-full bg-night/50 px-3 py-1 text-[11px] font-medium text-white backdrop-blur">
              {item.region}
            </span>
          </div>
          {item.featured ? (
            <span className="absolute top-4 right-4 rounded-full bg-brand-gradient px-3 py-1 text-[11px] font-semibold text-white">
              {copy.cases.featured}
            </span>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col p-6">
          <h3 className="text-[17px] leading-snug font-semibold text-ink transition-colors duration-300 group-hover:text-brand">
            {item.title}
          </h3>
          <p className="mt-3 line-clamp-3 text-[13px] leading-relaxed text-ink-3">
            {item.summary}
          </p>

          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 border-t border-line pt-4">
            {item.stats.slice(0, 2).map((stat) => (
              <div key={stat.label}>
                <p className="text-lg leading-none font-bold text-ink">
                  {stat.value}
                  <span className="text-brand">{stat.unit}</span>
                </p>
                <p className="mt-1 text-[11px] text-ink-4">{stat.label}</p>
              </div>
            ))}
          </div>

          <span className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-medium text-brand opacity-0 transition-all duration-300 group-hover:opacity-100">
            {copy.cases.viewCase}
            <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden="true">
              <path
                d="M2 8h11M9 3.5 13.5 8 9 12.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>
      </Link>
    </Reveal>
  );
}
