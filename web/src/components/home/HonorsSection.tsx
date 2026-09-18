import { Reveal } from "@/components/motion/Reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { cn } from "@/lib/utils";
import type { HonorsSectionContent } from "@/types";

export function HonorsSection({ content }: { content: HonorsSectionContent }) {
  return (
    <section className="section-y relative overflow-hidden bg-surface">
      <div aria-hidden className="grain-grid absolute inset-0 opacity-50" />
      <div className="container-x relative">
        <SectionHeading title={content.title} description={content.subtitle} />

        <div className="mt-12 flex flex-col gap-12 lg:mt-16">
          {content.groups.map((group) => (
            <div key={group.key}>
              <Reveal className="mb-6 flex items-center gap-4">
                <h3 className="text-lg font-semibold text-ink">{group.title}</h3>
                <span className="h-px flex-1 bg-line" />
                <span className="text-xs text-ink-4">{group.items.length} 项</span>
              </Reveal>

              <div
                className={cn(
                  "grid gap-4",
                  group.items.length >= 4 ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-3",
                )}
              >
                {group.items.map((item, i) => (
                  <Reveal
                    key={item.title}
                    delay={i * 70}
                    className="card-surface group relative overflow-hidden border border-transparent p-6"
                  >
                    <div
                      aria-hidden
                      className="absolute -top-10 -right-8 size-24 rounded-full bg-brand-soft opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    />
                    <div className="relative">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1 text-[11px] font-medium text-brand">
                        {item.year}
                      </span>
                      <p className="mt-5 text-[16px] leading-snug font-semibold text-ink">
                        {item.title}
                      </p>
                      <p className="mt-2 text-[12px] text-ink-4">{item.issuer}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
