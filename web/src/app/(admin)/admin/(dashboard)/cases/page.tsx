import type { Metadata } from "next";
import Link from "next/link";

import { createCaseAction, deleteCaseAction } from "@/app/(admin)/admin/actions";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { getSiteData } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "客户案例", robots: { index: false } };

export default function AdminCasesPage() {
  const { cases } = getSiteData();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">客户案例</h1>
          <p className="mt-2 text-[14px] text-ink-3">共 {cases.items.length} 个案例。</p>
        </div>
        <form action={createCaseAction}>
          <button
            type="submit"
            className="h-11 cursor-pointer rounded-xl bg-brand-gradient px-6 text-sm font-medium text-white shadow-[var(--shadow-brand)] transition-all duration-300 hover:-translate-y-0.5"
          >
            + 新建案例
          </button>
        </form>
      </header>

      <div className="overflow-hidden rounded-card border border-line bg-white">
        <div className="hidden grid-cols-[2fr_1fr_1fr_70px_120px] gap-4 border-b border-line px-5 py-3 text-[12px] font-medium text-ink-4 md:grid">
          <span>案例</span>
          <span>客户</span>
          <span>行业 / 年份</span>
          <span>首页</span>
          <span className="text-right">操作</span>
        </div>

        {cases.items.map((item) => (
          <div
            key={item.id}
            className="grid gap-3 border-b border-line px-5 py-4 last:border-none md:grid-cols-[2fr_1fr_1fr_70px_120px] md:items-center"
          >
            <div className="min-w-0">
              <Link
                href={`/admin/cases/${item.id}`}
                className="block truncate text-[14px] font-medium text-ink transition-colors hover:text-brand"
              >
                {item.title}
              </Link>
              <span className="text-[12px] text-ink-4">/{item.id}</span>
            </div>
            <span className="truncate text-[13px] text-ink-3">{item.client}</span>
            <span className="text-[13px] text-ink-3">
              {item.industry} · {item.year}
            </span>
            <span className="text-[13px]">
              {item.featured ? (
                <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[11px] text-brand">
                  已置顶
                </span>
              ) : (
                <span className="text-ink-4">—</span>
              )}
            </span>
            <div className="flex items-center justify-end gap-3">
              <Link
                href={`/admin/cases/${item.id}`}
                className="text-[13px] text-brand transition-opacity hover:opacity-70"
              >
                编辑
              </Link>
              <form action={deleteCaseAction}>
                <input type="hidden" name="id" value={item.id} />
                <ConfirmSubmitButton
                  message={`确定删除案例「${item.title}」？该操作不可撤销。`}
                  className="cursor-pointer text-[13px] text-red-500 transition-opacity hover:opacity-70"
                >
                  删除
                </ConfirmSubmitButton>
              </form>
            </div>
          </div>
        ))}

        {cases.items.length === 0 ? (
          <p className="px-5 py-12 text-center text-[14px] text-ink-4">暂无案例，点击右上角新建。</p>
        ) : null}
      </div>
    </div>
  );
}
