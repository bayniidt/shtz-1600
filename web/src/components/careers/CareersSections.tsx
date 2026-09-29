import Link from "next/link";

import { Reveal } from "@/components/motion/Reveal";
import { CtaButton } from "@/components/ui/cta-button";
import { SectionHeading } from "@/components/ui/section-heading";
import { cityCounts, hotPositions, isOn, positionCities, totalPositions } from "@/lib/careers";
import { UI_COPY, localizedHref, type Locale } from "@/lib/i18n";
import type { CareersContent } from "@/types";

export function CultureSection({
  content,
  locale = "zh",
}: {
  content: CareersContent;
  locale?: Locale;
}) {
  const copy = UI_COPY[locale];

  return (
    <section className="section-y bg-white">
      <div className="container-x">
        <SectionHeading
          eyebrow="CORPORATE CULTURE"
          title={content.cultureTitle}
          description={copy.careers.cultureDescription}
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {content.culture.map((item, i) => (
            <Reveal
              key={item.title}
              delay={i * 70}
              className="card-surface group relative overflow-hidden border border-transparent p-6"
            >
              <span className="absolute -top-8 -right-6 text-[80px] leading-none font-bold text-surface-3/40 transition-colors duration-500 group-hover:text-brand-soft">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="relative text-lg font-semibold text-ink">{item.title}</h3>
              <p className="relative mt-3 text-[14px] leading-relaxed text-ink-3">
                {item.description}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function BenefitsSection({
  content,
  locale = "zh",
}: {
  content: CareersContent;
  locale?: Locale;
}) {
  const copy = UI_COPY[locale];

  return (
    <section className="section-y relative overflow-hidden">
      <div aria-hidden className="grain-grid absolute inset-0 opacity-50" />
      <div className="container-x relative">
        <SectionHeading
          eyebrow="BENEFITS"
          title={content.benefitsTitle}
          description={copy.careers.benefitsDescription}
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {content.benefits.map((group, i) => (
            <Reveal
              key={group.group}
              delay={i * 80}
              className="card-surface border border-transparent p-6"
            >
              <p className="text-[12px] font-semibold tracking-[0.16em] text-brand uppercase">
                {group.group}
              </p>
              <ul className="mt-5 space-y-3">
                {group.items
                  .split("/")
                  .map((item) => item.trim())
                  .filter(Boolean)
                  .map((item) => (
                    <li key={item} className="flex items-center gap-2.5 text-[14px] text-ink-2">
                      <span className="size-1.5 rounded-full bg-brand" />
                      {item}
                    </li>
                  ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/** 招聘城市索引 — every card leads to that city's position list. */
export function CityIndexSection({
  content,
  locale = "zh",
}: {
  content: CareersContent;
  locale?: Locale;
}) {
  const copy = UI_COPY[locale];
  const counts = cityCounts(content);
  const featured = content.cities.filter((city) => isOn(city.featured));
  const cities = featured.length > 0 ? featured : content.cities;

  if (cities.length === 0) return null;

  return (
    <section id="cities" className="section-y scroll-mt-24 bg-white">
      <div className="container-x">
        <SectionHeading
          eyebrow={content.citiesEyebrow}
          title={content.citiesTitle}
          description={content.citiesDescription}
        />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cities.map((city, i) => (
            <Reveal key={city.id} delay={i * 60}>
              <Link
                href={localizedHref(`/careers/cities/${city.id}`, locale)}
                className="card-surface group flex h-full flex-col justify-between border border-transparent p-6 transition-all duration-500 hover:-translate-y-1.5 hover:border-brand/30"
              >
                <div>
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="text-xl font-semibold text-ink transition-colors duration-300 group-hover:text-brand">
                      {locale === "en" ? city.nameEn ?? city.name : city.name}
                    </h3>
                    {locale === "zh" && city.nameEn ? (
                      <span className="text-[11px] tracking-[0.14em] text-ink-4 uppercase">
                        {city.nameEn}
                      </span>
                    ) : null}
                  </div>
                  {city.summary ? (
                    <p className="mt-3 text-[14px] leading-relaxed text-ink-3">{city.summary}</p>
                  ) : null}
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-line pt-5">
                  <span className="text-[13px] font-semibold text-brand">
                    {copy.careers.cityJobs(counts[city.id] ?? 0)}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-4 transition-all duration-300 group-hover:translate-x-1 group-hover:text-brand">
                    {copy.careers.viewPositions}
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        <p className="mt-10 text-center text-[13px] text-ink-4">
          {copy.careers.totalJobs(totalPositions(content))} · {copy.careers.resumeEmail}：
          <a
            href={`mailto:${content.applyEmail}`}
            className="ml-1 text-brand transition-transform duration-300 hover:translate-x-0.5"
          >
            {content.applyEmail}
          </a>
        </p>
      </div>
    </section>
  );
}

/** 热招职位 — links to the in-site position detail page. */
export function JobsSection({
  content,
  locale = "zh",
}: {
  content: CareersContent;
  locale?: Locale;
}) {
  const copy = UI_COPY[locale];
  const jobs = hotPositions(content, 8);

  return (
    <section id="jobs" className="section-y scroll-mt-24">
      <div className="container-x">
        <SectionHeading
          eyebrow={content.jobsEyebrow}
          title={content.jobsTitle}
          description={copy.careers.jobsDescription(content.applyEmail)}
        />

        <div className="mx-auto mt-12 max-w-4xl overflow-hidden rounded-card border border-line bg-white">
          {jobs.map((job, i) => {
            const cities = positionCities(content, job).map((city) => city.name);
            return (
              <Reveal key={job.id} delay={i * 40}>
                <Link
                  href={localizedHref(`/careers/jobs/${job.id}`, locale)}
                  className="group flex flex-wrap items-center justify-between gap-3 border-b border-line px-6 py-5 transition-colors duration-300 last:border-0 hover:bg-surface/70"
                >
                  <div className="flex items-center gap-3">
                    <span className="h-8 w-1 rounded-full bg-line transition-colors duration-300 group-hover:bg-brand" />
                    <div>
                      <p className="text-[15px] font-medium text-ink">
                        {job.title}
                        {isOn(job.urgent) ? (
                          <span className="ml-2 rounded-full bg-accent-brand/10 px-2 py-0.5 text-[11px] font-semibold text-accent-brand">
                            {copy.careers.urgent}
                          </span>
                        ) : null}
                      </p>
                      <p className="mt-0.5 text-[12px] text-ink-4">
                        {cities.join(" / ")}
                        {job.type ? ` · ${job.type}` : ""}
                        {job.department ? ` · ${job.department}` : ""}
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-4 transition-all duration-300 group-hover:translate-x-1 group-hover:text-brand">
                    {copy.careers.viewDetails}
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <CtaButton href="#cities" size="lg">
            {copy.careers.browseCities}
          </CtaButton>
          <CtaButton href={`mailto:${content.applyEmail}`} variant="outline" size="lg">
            {copy.careers.submitResume}
          </CtaButton>
        </div>
      </div>
    </section>
  );
}
