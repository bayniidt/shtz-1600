"use client";

import { useMemo, useState } from "react";

import { CaseCard } from "@/components/cases/CaseCard";
import { UI_COPY, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { CaseItem, CasesPageContent, IndustryKey } from "@/types";

const PAGE_SIZE = 6;

export function CasesExplorer({
  items,
  page,
  locale = "zh",
}: {
  items: CaseItem[];
  page: CasesPageContent;
  locale?: Locale;
}) {
  const copy = UI_COPY[locale];
  const [filter, setFilter] = useState<IndustryKey | "all">("all");
  const [current, setCurrent] = useState(1);

  const filtered = useMemo(
    () => (filter === "all" ? items : items.filter((item) => item.industry === filter)),
    [items, filter],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(current, totalPages);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const onFilter = (key: IndustryKey | "all") => {
    setFilter(key);
    setCurrent(1);
  };

  const labelOf = (key: string) => page.filters.find((f) => f.key === key)?.label ?? key;

  return (
    <div>
      <div
        className="flex flex-wrap items-center justify-center gap-2"
        role="tablist"
        aria-label={copy.cases.filterLabel}
      >
        {page.filters.map((item) => {
          const isActive = item.key === filter;
          return (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onFilter(item.key)}
              className={cn(
                "h-10 cursor-pointer rounded-full px-5 text-[14px] font-medium transition-all duration-300 ease-[var(--ease-out-soft)]",
                isActive
                  ? "bg-brand-gradient text-white shadow-[var(--shadow-brand)]"
                  : "border border-line bg-white text-ink-3 hover:-translate-y-0.5 hover:border-brand/30 hover:text-brand",
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {visible.map((item, i) => (
          <CaseCard
            key={item.id}
            item={item}
            industryLabel={labelOf(item.industry)}
            delay={i * 60}
            locale={locale}
          />
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="py-20 text-center text-sm text-ink-4">{copy.cases.empty}</p>
      ) : null}

      {totalPages > 1 ? (
        <div className="mt-12 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setCurrent(Math.max(1, safePage - 1))}
            disabled={safePage === 1}
            className="h-10 cursor-pointer rounded-full border border-line bg-white px-5 text-sm text-ink-3 transition-colors hover:border-brand/30 hover:text-brand disabled:cursor-not-allowed disabled:opacity-40"
          >
            Prev
          </button>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrent(i + 1)}
              className={cn(
                "size-10 cursor-pointer rounded-full text-sm font-medium transition-all duration-300",
                i + 1 === safePage
                  ? "bg-brand-gradient text-white shadow-[var(--shadow-brand)]"
                  : "border border-line bg-white text-ink-3 hover:border-brand/30 hover:text-brand",
              )}
            >
              {i + 1}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setCurrent(Math.min(totalPages, safePage + 1))}
            disabled={safePage === totalPages}
            className="h-10 cursor-pointer rounded-full border border-line bg-white px-5 text-sm text-ink-3 transition-colors hover:border-brand/30 hover:text-brand disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
}
