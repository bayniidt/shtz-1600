import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CaseForm } from "@/components/admin/CaseForm";
import { getCaseById } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "编辑案例", robots: { index: false } };

export default async function AdminCaseEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = getCaseById(id);
  if (!item) notFound();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link href="/admin/cases" className="text-[13px] text-ink-4 transition-colors hover:text-brand">
            ← 返回案例列表
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-ink">{item.title}</h1>
        </div>
      </header>

      <CaseForm item={item} />
    </div>
  );
}
