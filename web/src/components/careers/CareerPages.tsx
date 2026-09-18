import Link from "next/link";

import { Reveal } from "@/components/motion/Reveal";
import { CtaButton } from "@/components/ui/cta-button";
import {
  cityCounts,
  cityPositions,
  isOn,
  otherCityPositions,
  parseJdLines,
  positionCities,
  positionSummary,
  splitList,
} from "@/lib/careers";
import type { CareersCity, CareersContent, CareersPosition } from "@/types";

function CityChips({
  content,
  exclude,
}: {
  content: CareersContent;
  exclude?: string;
}) {
  const cities = content.cities.filter((city) => city.id !== exclude);
  if (cities.length === 0) return null;

  return (
    <div className="mt-8 flex flex-wrap items-center gap-2">
      <span className="text-[13px] text-ink-4">其他城市：</span>
      {cities.map((city) => (
        <Link
          key={city.id}
          href={`/careers/cities/${city.id}`}
          className="rounded-full border border-line bg-white px-3.5 py-1.5 text-[13px] font-medium text-ink-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/30 hover:text-brand"
        >
          {city.name}
        </Link>
      ))}
    </div>
  );
}

/** 招聘城市 → 岗位列表 */
export function CityPositionsSection({
  content,
  city,
}: {
  content: CareersContent;
  city: CareersCity;
}) {
  const jobs = cityPositions(content, city.id);
  const counts = cityCounts(content);

  return (
    <section className="section-y">
      <div className="container-x">
        <Reveal className="flex flex-wrap items-center gap-2 text-[13px] text-ink-4">
          <Link href="/careers" className="transition-colors hover:text-brand">
            加入我们
          </Link>
          <span>/</span>
          <Link href="/careers#cities" className="transition-colors hover:text-brand">
            招聘城市
          </Link>
          <span>/</span>
          <span className="text-ink-3">{city.name}</span>
        </Reveal>

        <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="text-[clamp(1.8rem,4vw,3rem)] leading-tight font-bold text-ink">
              {city.name}
              <span className="ml-3 align-middle text-[0.45em] font-semibold tracking-[0.14em] text-ink-4 uppercase">
                {city.nameEn}
              </span>
            </h1>
            {city.summary ? (
              <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-ink-3">
                {city.summary}
              </p>
            ) : null}
          </div>
          <p className="text-[13px] text-ink-4">
            共 <span className="font-semibold text-brand">{counts[city.id] ?? 0}</span> 个在招职位
          </p>
        </div>

        {jobs.length > 0 ? (
          <div className="mt-10 overflow-hidden rounded-card border border-line bg-white">
            {jobs.map((job, i) => {
              const cities = positionCities(content, job).map((item) => item.name);
              const tags = splitList(job.tags);
              return (
                <Reveal key={job.id} delay={i * 30}>
                  <Link
                    href={`/careers/jobs/${job.id}`}
                    className="group flex flex-wrap items-start justify-between gap-4 border-b border-line px-6 py-5 transition-colors duration-300 last:border-0 hover:bg-surface/70"
                  >
                    <div className="flex items-start gap-3">
                      <span className="mt-1 h-8 w-1 shrink-0 rounded-full bg-line transition-colors duration-300 group-hover:bg-brand" />
                      <div>
                        <p className="flex flex-wrap items-center gap-2 text-[15px] font-medium text-ink">
                          {job.title}
                          {isOn(job.urgent) ? (
                            <span className="rounded-full bg-accent-brand/10 px-2 py-0.5 text-[11px] font-semibold text-accent-brand">
                              急聘
                            </span>
                          ) : null}
                          {tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full border border-line px-2 py-0.5 text-[11px] font-medium text-ink-4"
                            >
                              {tag}
                            </span>
                          ))}
                        </p>
                        <p className="mt-1 text-[12px] text-ink-4">
                          {cities.join(" / ")}
                          {job.type ? ` · ${job.type}` : ""}
                          {job.publishedAt ? ` · 发布于 ${job.publishedAt}` : ""}
                        </p>
                        <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-ink-3">
                          {positionSummary(job)}
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-4 transition-all duration-300 group-hover:translate-x-1 group-hover:text-brand">
                      查看详情 →
                    </span>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        ) : (
          <div className="mt-10 rounded-card border border-dashed border-line bg-white px-6 py-16 text-center">
            <p className="text-[15px] font-medium text-ink">{city.name}暂无在招职位</p>
            <p className="mt-2 text-[13px] text-ink-4">
              我们仍在持续招聘，欢迎投递简历至 {content.applyEmail}，或查看其他城市的机会。
            </p>
          </div>
        )}

        <CityChips content={content} exclude={city.id} />

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <CtaButton href="/careers#cities" variant="outline" size="lg">
            返回城市索引
          </CtaButton>
          <CtaButton href={`mailto:${content.applyEmail}`} size="lg">
            投递简历
          </CtaButton>
        </div>
      </div>
    </section>
  );
}

function JdSection({ title, text }: { title: string; text?: string }) {
  const lines = parseJdLines(text);
  if (lines.length === 0) return null;

  return (
    <section>
      <h2 className="text-[15px] font-semibold tracking-[0.08em] text-ink">{title}</h2>
      <ul className="mt-5 flex flex-col gap-3 border-l-2 border-line pl-6">
        {lines.map((line, i) =>
          line.kind === "item" ? (
            <li
              key={`${i}-${line.text.slice(0, 16)}`}
              className="flex items-start gap-3 text-[15px] leading-relaxed text-ink-2"
            >
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand" />
              {line.text}
            </li>
          ) : line.kind === "sub" ? (
            <li
              key={`${i}-${line.text.slice(0, 16)}`}
              className="text-[15px] font-semibold text-ink"
            >
              {line.text}
            </li>
          ) : (
            <li
              key={`${i}-${line.text.slice(0, 16)}`}
              className="text-[15px] leading-relaxed text-ink-3"
            >
              {line.text}
            </li>
          ),
        )}
      </ul>
    </section>
  );
}

/** 岗位详情 */
export function PositionDetailSection({
  content,
  position,
}: {
  content: CareersContent;
  position: CareersPosition;
}) {
  const cities = positionCities(content, position);
  const related = otherCityPositions(content, position, 4);
  const tags = splitList(position.tags);
  const mailSubject = `应聘 ${cities.map((city) => city.name).join("/")}-${position.title}`;

  return (
    <section className="section-y">
      <div className="container-x">
        <Reveal className="flex flex-wrap items-center gap-2 text-[13px] text-ink-4">
          <Link href="/careers" className="transition-colors hover:text-brand">
            加入我们
          </Link>
          <span>/</span>
          <Link href="/careers#cities" className="transition-colors hover:text-brand">
            招聘城市
          </Link>
          {cities[0] ? (
            <>
              <span>/</span>
              <Link
                href={`/careers/cities/${cities[0].id}`}
                className="transition-colors hover:text-brand"
              >
                {cities[0].name}
              </Link>
            </>
          ) : null}
        </Reveal>

        <Reveal delay={60}>
          <h1 className="mt-6 max-w-4xl text-[clamp(1.7rem,3.6vw,2.75rem)] leading-[1.18] font-bold text-ink">
            {position.title}
          </h1>
        </Reveal>

        <Reveal delay={100} className="mt-6 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1 text-[12px] font-semibold text-brand">
            {cities.map((city) => city.name).join(" / ")}
          </span>
          {position.type ? (
            <span className="rounded-full border border-line bg-white px-3 py-1 text-[12px] font-medium text-ink-3">
              {position.type}
            </span>
          ) : null}
          {position.department ? (
            <span className="rounded-full border border-line bg-white px-3 py-1 text-[12px] font-medium text-ink-3">
              {position.department}
            </span>
          ) : null}
          {isOn(position.urgent) ? (
            <span className="rounded-full bg-accent-brand/10 px-3 py-1 text-[12px] font-semibold text-accent-brand">
              急聘
            </span>
          ) : null}
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-line bg-white px-3 py-1 text-[12px] font-medium text-ink-4"
            >
              {tag}
            </span>
          ))}
          {position.publishedAt ? (
            <span className="text-[12px] text-ink-4">发布于 {position.publishedAt}</span>
          ) : null}
        </Reveal>

        {position.summary ? (
          <Reveal delay={140}>
            <p className="mt-6 max-w-3xl text-[15px] leading-relaxed text-ink-3">
              {position.summary}
            </p>
          </Reveal>
        ) : null}

        <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_300px] lg:gap-16">
          <Reveal className="flex flex-col gap-12">
            <JdSection title="岗位职责" text={position.description} />
            <JdSection title="任职要求" text={position.requirement} />
            <JdSection title="加分项" text={position.bonus} />
          </Reveal>

          <Reveal delay={80} className="lg:sticky lg:top-28 lg:self-start">
            <div className="card-surface border border-transparent p-6">
              <p className="text-[11px] tracking-[0.18em] text-brand uppercase">APPLY NOW</p>
              <h2 className="mt-3 text-lg font-semibold text-ink">投递这个职位</h2>
              <p className="mt-3 text-[13px] leading-relaxed text-ink-3">
                发送简历至 {content.applyEmail}，邮件标题请注明：
                <span className="text-ink-2">{mailSubject}</span>
              </p>
              <div className="mt-6 flex flex-col gap-3">
                <CtaButton
                  href={`mailto:${content.applyEmail}?subject=${encodeURIComponent(mailSubject)}`}
                  size="lg"
                >
                  邮件投递简历
                </CtaButton>
                {position.applyUrl || content.portalUrl ? (
                  <CtaButton
                    href={position.applyUrl || content.portalUrl}
                    variant="outline"
                    size="lg"
                    external
                  >
                    招聘系统投递
                  </CtaButton>
                ) : null}
              </div>
            </div>
          </Reveal>
        </div>

        {related.length > 0 ? (
          <div className="mt-16 border-t border-line pt-10">
            <h2 className="text-xl font-bold text-ink">其他相关职位</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {related.map((item) => (
                <Link
                  key={item.id}
                  href={`/careers/jobs/${item.id}`}
                  className="group flex items-center justify-between gap-4 rounded-card border border-line bg-white px-5 py-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/30"
                >
                  <div>
                    <p className="text-[14px] font-medium text-ink group-hover:text-brand">
                      {item.title}
                    </p>
                    <p className="mt-0.5 text-[12px] text-ink-4">
                      {positionCities(content, item)
                        .map((city) => city.name)
                        .join(" / ")}
                      {item.type ? ` · ${item.type}` : ""}
                    </p>
                  </div>
                  <span className="text-[13px] text-ink-4 transition-all duration-300 group-hover:translate-x-1 group-hover:text-brand">
                    →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-12">
          <CtaButton href="/careers#cities" variant="ghost" size="lg">
            ← 返回招聘城市
          </CtaButton>
        </div>
      </div>
    </section>
  );
}
