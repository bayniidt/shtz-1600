import Image from "next/image";

import { Reveal } from "@/components/motion/Reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { UI_COPY, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { AboutContent } from "@/types";

export function AboutStats({ stats }: { stats: AboutContent["stats"] }) {
  return (
    <section className="container-x">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Reveal
            key={stat.label}
            delay={i * 80}
            className="card-surface border border-transparent px-5 py-7 text-center"
          >
            <p className="text-[clamp(1.6rem,3vw,2.4rem)] leading-none font-bold text-ink">
              {stat.value}
              <span className="ml-0.5 text-[0.55em] font-semibold text-brand">{stat.unit}</span>
            </p>
            <p className="mt-3 text-[13px] text-ink-4">{stat.label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function VisionSection({ content }: { content: AboutContent }) {
  return (
    <section className="section-y bg-white">
      <div className="container-x">
        <SectionHeading
          eyebrow="OUR VISION"
          title={content.visionTitle}
          description={content.visionText}
        />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {content.values.map((value, i) => (
            <Reveal
              key={value.title}
              delay={i * 90}
              className="card-surface group relative overflow-hidden border border-transparent p-7"
            >
              <span className="absolute top-0 left-0 h-1 w-full origin-left scale-x-0 bg-brand-gradient transition-transform duration-500 ease-[var(--ease-out-soft)] group-hover:scale-x-100" />
              <span className="text-[11px] font-semibold tracking-[0.2em] text-brand uppercase">
                {value.title}
              </span>
              <p className="mt-5 text-[17px] leading-relaxed font-medium text-ink">
                {value.description}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TimelineSection({
  items,
  locale = "zh",
}: {
  items: AboutContent["timeline"];
  locale?: Locale;
}) {
  const copy = UI_COPY[locale];

  return (
    <section className="section-y relative overflow-hidden">
      <div aria-hidden className="grain-grid absolute inset-0 opacity-50" />
      <div className="container-x relative">
        <SectionHeading
          eyebrow="DEVELOPMENT HISTORY"
          title={copy.about.developmentHistory}
          description={copy.about.developmentDescription}
        />

        <div className="relative mt-14">
          <div
            aria-hidden
            className="absolute top-0 bottom-0 left-[15px] w-px bg-line md:left-1/2 md:-translate-x-1/2"
          />
          <div className="flex flex-col gap-10">
            {items.map((item, i) => {
              const right = i % 2 === 1;
              return (
                <Reveal
                  key={item.period}
                  delay={i * 60}
                  className={cn(
                    "relative pl-12 md:w-1/2 md:pl-0",
                    right ? "md:ml-auto md:pl-14" : "md:pr-14 md:text-right",
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-2 left-0 grid size-8 place-items-center rounded-full border-2 border-white bg-brand-gradient shadow-[var(--shadow-brand)] md:top-3",
                      right ? "md:-left-4" : "md:-right-4 md:left-auto",
                    )}
                  >
                    <span className="size-2 rounded-full bg-white" />
                  </span>
                  <p className="text-2xl font-bold text-brand">{item.period}</p>
                  <h3 className="mt-2 text-[17px] font-semibold text-ink">{item.title}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-ink-3">
                    {item.description}
                  </p>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export function TeamSection({
  content,
  locale = "zh",
}: {
  content: AboutContent;
  locale?: Locale;
}) {
  const copy = UI_COPY[locale];

  return (
    <section className="section-y bg-white">
      <div className="container-x">
        <SectionHeading
          eyebrow="OUR TEAM"
          title={copy.about.teamTitle}
          description={content.teamIntro}
        />

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {content.team.map((member, i) => (
            <Reveal
              key={member.name}
              delay={i * 90}
              className="card-surface group overflow-hidden border border-transparent"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-surface">
                {member.avatar ? (
                  <Image
                    src={member.avatar}
                    alt={member.name}
                    fill
                    sizes="(min-width: 1024px) 400px, 100vw"
                    className="object-cover object-top transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-[1.05]"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-night/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-5 text-white">
                  <p className="text-lg font-semibold">{member.name}</p>
                  <p className="text-[12px] text-white/75">{member.role}</p>
                </div>
              </div>
              <p className="p-6 text-[13px] leading-relaxed text-ink-3">{member.bio}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function OfficesSection({
  offices,
  locale = "zh",
}: {
  offices: AboutContent["offices"];
  locale?: Locale;
}) {
  const copy = UI_COPY[locale];

  return (
    <section className="section-y relative overflow-hidden bg-night-gradient text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -left-20 size-[520px] rounded-full opacity-50 blur-3xl"
        style={{
          background: "radial-gradient(circle, rgba(235,52,7,.42) 0%, rgba(7,3,1,0) 70%)",
        }}
      />
      <div className="container-x relative">
        <SectionHeading
          eyebrow="GLOBAL LAYOUT"
          title={copy.about.globalLayout}
          description={copy.about.globalDescription}
          tone="light"
        />

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {offices.map((office, i) => (
            <Reveal
              key={office.city}
              delay={i * 70}
              className="group rounded-card border border-white/10 bg-white/5 p-6 backdrop-blur transition-all duration-400 ease-[var(--ease-out-soft)] hover:-translate-y-1.5 hover:border-brand/40 hover:bg-white/10"
            >
              <div className="flex items-center justify-between">
                <p className="text-xl font-semibold">{office.city}</p>
                <span className="rounded-full border border-white/15 px-3 py-1 text-[11px] text-white/70">
                  {office.label}
                </span>
              </div>
              <p className="mt-4 text-[13px] leading-relaxed text-white/60">{office.address}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
