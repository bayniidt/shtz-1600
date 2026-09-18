import type { Metadata } from "next";
import Link from "next/link";

import {
  createCityAction,
  createPositionAction,
  deleteCityAction,
  deletePositionAction,
} from "@/app/(admin)/admin/actions";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { getSiteData } from "@/lib/db";
import { cityCounts, isOn, positionCities } from "@/lib/careers";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "招聘管理", robots: { index: false } };

export default function AdminCareersPage() {
  const { careers } = getSiteData();
  const counts = cityCounts(careers);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">招聘管理</h1>
          <p className="mt-2 text-[14px] text-ink-3">
            {careers.cities.length} 个招聘城市 · {careers.positions.length} 个在招职位。前台入口：
            <Link href="/careers" className="ml-1 text-brand underline">
              /careers
            </Link>
            ，页面文案在
            <Link href="/admin/content/careers" className="mx-1 text-brand underline">
              招聘内容
            </Link>
            中维护。
          </p>
        </div>
      </header>

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-ink">招聘城市</h2>
            <p className="mt-1 text-[13px] text-ink-3">
              城市标识即链接地址：/careers/cities/&lt;标识&gt;
            </p>
          </div>
          <form action={createCityAction} className="flex flex-wrap items-center gap-2">
            <input
              name="name"
              placeholder="城市名称，如 南京"
              className="h-10 w-40 rounded-xl border border-line bg-white px-3.5 text-[14px] text-ink outline-none focus:border-brand"
            />
            <input
              name="id"
              placeholder="标识（可空，自动生成）"
              className="h-10 w-44 rounded-xl border border-line bg-white px-3.5 text-[14px] text-ink outline-none focus:border-brand"
            />
            <button
              type="submit"
              className="h-10 cursor-pointer rounded-xl bg-brand-gradient px-5 text-[13px] font-medium text-white shadow-[var(--shadow-brand)] transition-all duration-300 hover:-translate-y-0.5"
            >
              + 新建城市
            </button>
          </form>
        </div>

        <div className="overflow-hidden rounded-card border border-line bg-white">
          <div className="hidden grid-cols-[1.4fr_1fr_1fr_90px_120px] gap-4 border-b border-line px-5 py-3 text-[12px] font-medium text-ink-4 md:grid">
            <span>城市</span>
            <span>英文名 / 代码</span>
            <span>职位数</span>
            <span>索引展示</span>
            <span className="text-right">操作</span>
          </div>
          {careers.cities.map((city) => (
            <div
              key={city.id}
              className="grid gap-3 border-b border-line px-5 py-4 last:border-none md:grid-cols-[1.4fr_1fr_1fr_90px_120px] md:items-center"
            >
              <div className="min-w-0">
                <Link
                  href={`/admin/careers/cities/${city.id}`}
                  className="block truncate text-[14px] font-medium text-ink transition-colors hover:text-brand"
                >
                  {city.name}
                </Link>
                <span className="text-[12px] text-ink-4">/{city.id}</span>
              </div>
              <span className="truncate text-[13px] text-ink-3">
                {city.nameEn || "—"} {city.code ? `· ${city.code}` : ""}
              </span>
              <span className="text-[13px] text-ink-3">{counts[city.id] ?? 0} 个</span>
              <span className="text-[13px]">
                {isOn(city.featured) ? (
                  <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[11px] text-brand">
                    展示
                  </span>
                ) : (
                  <span className="text-ink-4">隐藏</span>
                )}
              </span>
              <div className="flex items-center justify-end gap-3">
                <Link
                  href={`/admin/careers/cities/${city.id}`}
                  className="text-[13px] text-brand transition-opacity hover:opacity-70"
                >
                  编辑
                </Link>
                <form action={deleteCityAction}>
                  <input type="hidden" name="id" value={city.id} />
                  <ConfirmSubmitButton
                    message={`确定删除城市「${city.name}」？该城市下的职位将回退到第一个城市。`}
                    className="cursor-pointer text-[13px] text-red-500 transition-opacity hover:opacity-70"
                  >
                    删除
                  </ConfirmSubmitButton>
                </form>
              </div>
            </div>
          ))}
          {careers.cities.length === 0 ? (
            <p className="px-5 py-10 text-center text-[14px] text-ink-4">
              暂无城市，请先新建一个城市。
            </p>
          ) : null}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-ink">在招职位</h2>
            <p className="mt-1 text-[13px] text-ink-3">
              职位标识即链接地址：/careers/jobs/&lt;标识&gt;
            </p>
          </div>
          <form action={createPositionAction} className="flex flex-wrap items-center gap-2">
            <input
              name="title"
              placeholder="职位名称，如 内容运营"
              className="h-10 w-48 rounded-xl border border-line bg-white px-3.5 text-[14px] text-ink outline-none focus:border-brand"
            />
            <input
              name="id"
              placeholder="标识（可空，自动生成）"
              className="h-10 w-44 rounded-xl border border-line bg-white px-3.5 text-[14px] text-ink outline-none focus:border-brand"
            />
            <button
              type="submit"
              className="h-10 cursor-pointer rounded-xl bg-brand-gradient px-5 text-[13px] font-medium text-white shadow-[var(--shadow-brand)] transition-all duration-300 hover:-translate-y-0.5"
            >
              + 新建职位
            </button>
          </form>
        </div>

        <div className="overflow-hidden rounded-card border border-line bg-white">
          <div className="hidden grid-cols-[2fr_1.2fr_1fr_90px_120px] gap-4 border-b border-line px-5 py-3 text-[12px] font-medium text-ink-4 md:grid">
            <span>职位</span>
            <span>城市</span>
            <span>类型 / 标签</span>
            <span>热招</span>
            <span className="text-right">操作</span>
          </div>
          {careers.positions.map((position) => (
            <div
              key={position.id}
              className="grid gap-3 border-b border-line px-5 py-4 last:border-none md:grid-cols-[2fr_1.2fr_1fr_90px_120px] md:items-center"
            >
              <div className="min-w-0">
                <Link
                  href={`/admin/careers/positions/${position.id}`}
                  className="block truncate text-[14px] font-medium text-ink transition-colors hover:text-brand"
                >
                  {position.title}
                  {isOn(position.urgent) ? (
                    <span className="ml-2 rounded-full bg-accent-brand/10 px-2 py-0.5 text-[11px] text-accent-brand">
                      急聘
                    </span>
                  ) : null}
                </Link>
                <span className="text-[12px] text-ink-4">/{position.id}</span>
              </div>
              <span className="truncate text-[13px] text-ink-3">
                {positionCities(careers, position)
                  .map((city) => city.name)
                  .join(" / ") || "—"}
              </span>
              <span className="truncate text-[13px] text-ink-3">
                {position.type || "—"}
                {position.tags ? ` · ${position.tags}` : ""}
              </span>
              <span className="text-[13px]">
                {isOn(position.hot) ? (
                  <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[11px] text-brand">
                    热招
                  </span>
                ) : (
                  <span className="text-ink-4">—</span>
                )}
              </span>
              <div className="flex items-center justify-end gap-3">
                <Link
                  href={`/admin/careers/positions/${position.id}`}
                  className="text-[13px] text-brand transition-opacity hover:opacity-70"
                >
                  编辑
                </Link>
                <form action={deletePositionAction}>
                  <input type="hidden" name="id" value={position.id} />
                  <ConfirmSubmitButton
                    message={`确定删除职位「${position.title}」？该操作不可撤销。`}
                    className="cursor-pointer text-[13px] text-red-500 transition-opacity hover:opacity-70"
                  >
                    删除
                  </ConfirmSubmitButton>
                </form>
              </div>
            </div>
          ))}
          {careers.positions.length === 0 ? (
            <p className="px-5 py-10 text-center text-[14px] text-ink-4">暂无职位。</p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
