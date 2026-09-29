import { Reveal } from "@/components/motion/Reveal";
import { CtaButton } from "@/components/ui/cta-button";
import { SectionHeading } from "@/components/ui/section-heading";
import { UI_COPY, type Locale } from "@/lib/i18n";
import type { MediaSectionContent } from "@/types";

export function MediaSection({
  content,
  locale = "zh",
}: {
  content: MediaSectionContent;
  locale?: Locale;
}) {
  const copy = UI_COPY[locale];

  return (
    <section className="section-y relative">
      <div className="container-x">
        <SectionHeading title={content.title} description={content.subtitle} />

        <div className="mt-12 grid gap-6 lg:mt-16 lg:grid-cols-[0.92fr_1.08fr] lg:gap-8">
          <Reveal className="flex flex-col gap-3">
            {content.benefits.map((benefit, i) => (
              <div
                key={benefit.title}
                className="card-surface group flex items-start gap-4 border border-transparent p-4 md:p-5"
                style={{ transitionDelay: `${i * 30}ms` }}
              >
                <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand transition-colors duration-300 group-hover:bg-brand group-hover:text-white">
                  <Check />
                </span>
                <div>
                  <p className="text-[15px] font-semibold text-ink">{benefit.title}</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-ink-4">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </Reveal>

          <Reveal delay={120} className="relative">
            <div className="card-surface relative h-full overflow-hidden border border-line/60 p-5 md:p-7">
              <div
                aria-hidden
                className="pointer-events-none absolute -top-20 -right-16 size-72 rounded-full opacity-60 blur-3xl"
                style={{
                  background:
                    "radial-gradient(circle, rgba(235,52,7,.22) 0%, rgba(255,255,255,0) 70%)",
                }}
              />
              <div className="relative flex items-center justify-between">
                <p className="text-sm font-semibold text-ink">{copy.home.mediaMatrix}</p>
                <p className="text-xs text-ink-4">
                  {locale === "en"
                    ? `${content.partners.length} ${copy.home.directChannels}`
                    : `共 ${content.partners.length} 个${copy.home.directChannels}`}
                </p>
              </div>

              <div className="relative mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {content.partners.map((partner) => (
                  <div
                    key={partner.name}
                    className="group flex h-20 flex-col items-center justify-center gap-1 rounded-2xl border border-line/70 bg-surface/60 transition-all duration-400 ease-[var(--ease-out-soft)] hover:-translate-y-1 hover:border-brand/30 hover:bg-white hover:shadow-[var(--shadow-card)]"
                  >
                    <span
                      className="text-[15px] font-semibold text-ink-3 grayscale transition-all duration-300 group-hover:grayscale-0"
                      style={partner.accent ? { color: undefined } : undefined}
                    >
                      <span className="group-hover:hidden">{partner.mark}</span>
                      <span
                        className="hidden group-hover:inline"
                        style={partner.accent ? { color: partner.accent } : undefined}
                      >
                        {partner.mark}
                      </span>
                    </span>
                    <span className="text-[10px] tracking-[0.12em] text-ink-4 uppercase">
                      {partner.category}
                    </span>
                  </div>
                ))}
              </div>

              <div className="relative mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-night-gradient px-5 py-4">
                <p className="text-sm text-white/70">
                  {copy.home.offer}
                </p>
                <CtaButton href={content.cta.href} size="md" variant="light">
                  {content.cta.label}
                  <Arrow />
                </CtaButton>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Check() {
  return (
    <svg viewBox="0 0 16 16" className="size-4" aria-hidden="true">
      <path
        d="m3 8.4 3.2 3.1L13 4.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Arrow() {
  return (
    <svg viewBox="0 0 16 16" className="size-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">
      <path d="M2 8h11M9 3.5 13.5 8 9 12.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
