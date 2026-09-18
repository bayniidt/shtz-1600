import { redirect } from "next/navigation";

import { logoutAction } from "@/app/(admin)/admin/actions";
import { AdminShell } from "@/components/admin/AdminShell";
import { isAuthenticated } from "@/lib/auth";
import { getSiteData } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await isAuthenticated())) redirect("/admin/login");
  const { site } = getSiteData();

  return (
    <AdminShell
      logoText={site.logoText}
      logoSub={site.logoSub}
      logout={
        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full cursor-pointer rounded-xl border border-line px-4 py-2.5 text-[13px] font-medium text-ink-3 transition-colors hover:border-red-200 hover:text-red-500"
          >
            退出登录
          </button>
        </form>
      }
    >
      {children}
    </AdminShell>
  );
}
