import type { Metadata } from "next";
import Link from "next/link";

import { getSiteDataFromAPI } from "@/lib/db";
import type { IndustryKey } from "@/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "管理后台",
  robots: { index: false, follow: false },
};

const INDUSTRY_COLORS = ["#1e96d4", "#ed5736", "#f59e0b", "#7c3aed"];

function IndustryChart({ data }: { data: { label: string; value: number }[] }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let cursor = 0;
  const segments = data.map((item, index) => {
    const start = cursor;
    cursor += total ? (item.value / total) * 100 : 0;
    return `${INDUSTRY_COLORS[index % INDUSTRY_COLORS.length]} ${start}% ${cursor}%`;
  });

  return (
    <div className="flex flex-wrap items-center gap-8">
      <div
        aria-label="案例行业分布饼图"
        className="h-44 w-44 shrink-0 rounded-full border-8 border-white shadow-[var(--shadow-card)]"
        style={{ background: total ? `conic-gradient(${segments.join(", ")})` : "var(--color-surface)" }}
      />
      <div className="flex min-w-48 flex-1 flex-col gap-3">
        {data.map((item, index) => (
          <div key={item.label} className="flex items-center justify-between gap-4 text-[13px]">
            <span className="flex items-center gap-2 text-ink-3">
              <span
                aria-hidden="true"
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: INDUSTRY_COLORS[index % INDUSTRY_COLORS.length] }}
              />
              {item.label}
            </span>
            <span className="font-semibold text-ink">{item.value}</span>
          </div>
        ))}
        {!data.length ? <p className="text-[13px] text-ink-4">暂无案例数据</p> : null}
      </div>
    </div>
  );
}

export default async function AdminOverviewPage() {
  const data = await getSiteDataFromAPI();
  const industryLabels = new Map(data.cases.page.filters.map((filter) => [filter.key, filter.label]));
  const industryData = Object.entries(
    data.cases.items.reduce<Record<string, number>>((counts, item) => {
      counts[item.industry] = (counts[item.industry] ?? 0) + 1;
      return counts;
    }, {}),
  ).map(([key, value]) => ({ label: industryLabels.get(key as IndustryKey) ?? key, value }));

  const cards = [
    { label: "客户案例", value: data.cases.items.length, href: "/admin/cases" },
    { label: "媒体资源", value: data.home.media.partners.length, href: "/admin/content/home" },
    { label: "合作客户", value: data.home.clients.logos.length, href: "/admin/content/home" },
    { label: "招聘城市", value: data.careers.cities.length, href: "/admin/careers" },
    { label: "招聘岗位", value: data.careers.positions.length, href: "/admin/careers" },
  ];

  const links = [
    {
      href: "/admin/content/home",
      title: "首页内容管理",
      description: "Hero、媒体资源、Flow AI、客户选择、公司实力、企业荣誉 6 大板块",
    },
    {
      href: "/admin/cases",
      title: "客户案例管理",
      description: "新增 / 编辑 / 删除案例，维护指标数据与项目复盘段落",
    },
    {
      href: "/admin/content/about",
      title: "关于我们管理",
      description: "公司介绍、愿景、发展历程、核心团队与全球办公室",
    },
    {
      href: "/admin/careers",
      title: "招聘管理",
      description: `招聘城市（${data.careers.cities.length}）与职位（${data.careers.positions.length}）的增删改查，含岗位职责 / 任职要求`,
    },
    {
      href: "/admin/content/careers",
      title: "招聘内容管理",
      description: "加入我们页面的 Hero、企业文化、福利体系、招聘城市与热招板块文案",
    },
    {
      href: "/admin/content/site",
      title: "站点与导航管理",
      description: "品牌名称、导航菜单、联系方式、页脚链接与 SEO",
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-2xl font-bold text-ink">概览</h1>
        <p className="mt-2 text-[14px] text-ink-3">
          所有内容保存后立即生效，前台页面为动态渲染，无需重新构建。
        </p>
      </header>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-card border border-line bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-card)]"
          >
            <p className="text-[13px] text-ink-4">{card.label}</p>
            <p className="mt-2 text-3xl font-bold text-ink">{card.value}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group flex items-start justify-between gap-4 rounded-card border border-line bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand/30 hover:shadow-[var(--shadow-card)]"
          >
            <div>
              <p className="text-[15px] font-semibold text-ink group-hover:text-brand">
                {link.title}
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-4">{link.description}</p>
            </div>
            <span className="text-ink-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-brand">
              →
            </span>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-card border border-line bg-white p-6">
          <h2 className="text-base font-semibold text-ink">案例行业分布</h2>
          <p className="mt-2 text-[13px] text-ink-4">数据来自 Cases 接口的实时列表。</p>
          <div className="mt-6">
            <IndustryChart data={industryData} />
          </div>
        </section>

        <section className="rounded-card border border-line bg-white p-6">
          <h2 className="text-base font-semibold text-ink">公司发展时间线</h2>
          <p className="mt-2 text-[13px] text-ink-4">数据来自 About 接口的 timeline。</p>
          <div className="mt-6 flex flex-col gap-4">
            {data.about.timeline.map((item) => (
              <div key={`${item.period}-${item.title}`} className="flex gap-4 border-l-2 border-brand/30 pl-4">
                <span className="w-16 shrink-0 text-[13px] font-semibold text-brand">{item.period}</span>
                <div>
                  <p className="text-[14px] font-semibold text-ink">{item.title}</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-ink-3">{item.description}</p>
                </div>
              </div>
            ))}
            {!data.about.timeline.length ? <p className="text-[13px] text-ink-4">暂无时间线数据</p> : null}
          </div>
        </section>
      </div>

      <section className="rounded-card border border-line bg-white p-6">
        <h2 className="text-base font-semibold text-ink">数据存储</h2>
        <p className="mt-2 text-[13px] leading-relaxed text-ink-4">
          页面优先读取 Admin REST API；后端不可用时自动降级到项目根目录的{" "}
          <code className="rounded bg-surface px-1.5 py-0.5">data/site.json</code> 快照。
          可通过 <code className="rounded bg-surface px-1.5 py-0.5">pnpm run export</code> 从 MongoDB 导出最新快照。
        </p>
      </section>
    </div>
  );
}
