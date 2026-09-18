"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { BrandLogo } from "@/components/ui/brand-logo";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "概览", icon: "▦" },
  { href: "/admin/content/site", label: "站点与导航", icon: "⚙" },
  { href: "/admin/content/home", label: "首页内容", icon: "🏠" },
  { href: "/admin/cases", label: "客户案例", icon: "📁" },
  { href: "/admin/content/about", label: "关于我们", icon: "👥" },
  { href: "/admin/careers", label: "招聘管理", icon: "💼" },
  { href: "/admin/content/careers", label: "招聘内容", icon: "📝" },
];

export function AdminShell({
  children,
  logoText,
  logoSub,
  logout,
}: {
  children: React.ReactNode;
  logoText: string;
  logoSub: string;
  logout: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface lg:grid lg:grid-cols-[260px_1fr]">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[260px] shrink-0 border-r border-line bg-white transition-transform duration-500 ease-[var(--ease-out-soft)] lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col p-5">
          <Link href="/" className="mb-8 block">
            <BrandLogo logoText={logoText} logoSub={logoSub} />
          </Link>

          <nav className="flex flex-1 flex-col gap-1">
            {NAV.map((item) => {
              const active =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href) ||
                    (item.href === "/admin/cases" && pathname.startsWith("/admin/cases"));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[14px] font-medium transition-all duration-300",
                    active
                      ? "bg-brand-soft text-brand"
                      : "text-ink-3 hover:translate-x-0.5 hover:bg-surface hover:text-ink",
                  )}
                >
                  <span className="w-5 text-center text-[13px]">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 flex flex-col gap-3 border-t border-line pt-5">
            {logout}
            <Link
              href="/"
              className="text-[13px] text-ink-4 transition-colors hover:text-brand"
            >
              ← 返回网站前台
            </Link>
          </div>
        </div>
      </aside>

      {open ? (
        <button
          type="button"
          aria-label="关闭菜单"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 cursor-pointer bg-night/40 lg:hidden"
        />
      ) : null}

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-line bg-white/85 px-5 py-3.5 backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="grid size-9 cursor-pointer place-items-center rounded-lg border border-line"
            aria-label="打开菜单"
          >
            ☰
          </button>
          <span className="text-sm font-semibold text-ink">ADFLY 管理后台</span>
        </header>

        <main className="min-w-0 flex-1 p-5 md:p-8">{children}</main>
      </div>
    </div>
  );
}
