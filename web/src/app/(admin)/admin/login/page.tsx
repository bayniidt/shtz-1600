import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/admin/LoginForm";
import { BrandLogo } from "@/components/ui/brand-logo";
import { isAuthenticated } from "@/lib/auth";
import { getSiteData } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "管理后台登录",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  if (await isAuthenticated()) redirect("/admin");
  const { site } = getSiteData();

  return (
    <div className="grid min-h-screen place-items-center bg-surface px-5">
      <div className="w-full max-w-md rounded-card border border-line bg-white p-8 shadow-[var(--shadow-card)]">
        <div className="mb-8 flex flex-col items-center gap-4 text-center">
          <BrandLogo logoText={site.logoText} logoSub={site.logoSub} />
          <div>
            <h1 className="text-xl font-semibold text-ink">管理后台</h1>
            <p className="mt-1 text-[13px] text-ink-4">
              登录后可动态更新网站所有页面数据
            </p>
          </div>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
