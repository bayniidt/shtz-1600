import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { saveCityAction } from "@/app/(admin)/admin/actions";
import { AdminForm } from "@/components/admin/AdminForm";
import { Checkbox, Field, Panel, TextArea } from "@/components/admin/Fields";
import { getSiteData } from "@/lib/db";
import { cityPositions, isOn } from "@/lib/careers";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "编辑招聘城市", robots: { index: false } };

export default async function AdminCityEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { careers } = getSiteData();
  const city = careers.cities.find((item) => item.id === id);
  if (!city) notFound();

  const positions = cityPositions(careers, city.id);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <Link
          href="/admin/careers"
          className="text-[13px] text-ink-4 transition-colors hover:text-brand"
        >
          ← 返回招聘管理
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-ink">{city.name}</h1>
        <p className="mt-2 text-[13px] text-ink-3">
          前台地址：
          <Link href={`/careers/cities/${city.id}`} className="text-brand underline">
            /careers/cities/{city.id}
          </Link>
        </p>
      </header>

      <AdminForm action={saveCityAction} path="careers.cities" label={`城市 ${city.name}`}>
        <input type="hidden" name="__originalId" value={city.id} />

        <Panel title="城市信息">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="城市名称" name="name" defaultValue={city.name} placeholder="上海" />
            <Field
              label="英文名（可空）"
              name="nameEn"
              defaultValue={city.nameEn}
              placeholder="Shanghai"
            />
            <Field
              label="城市标识（链接地址）"
              name="id"
              defaultValue={city.id}
              hint="仅建议使用小写字母、数字与连字符；修改后会同步更新该城市下的所有职位。"
            />
            <Field
              label="招聘系统城市代码（可空）"
              name="code"
              defaultValue={city.code}
              placeholder="CT_125"
              hint="仅作备注，便于与外部招聘系统对照。"
            />
          </div>
          <TextArea
            label="城市简介（可空）"
            name="summary"
            defaultValue={city.summary}
            rows={3}
            placeholder="上海 —— 全球化营销中心，负责品牌策略与创意内容。"
          />
          <Checkbox
            label="在「招聘城市」索引中展示"
            name="featured"
            defaultChecked={isOn(city.featured)}
          />
        </Panel>

        <Panel title="该城市在招职位">
          {positions.length === 0 ? (
            <p className="text-[13px] text-ink-4">暂无职位，可在招聘管理中新建或调整职位城市。</p>
          ) : (
            <ul className="flex flex-col divide-y divide-[var(--color-line)]">
              {positions.map((position) => (
                <li key={position.id} className="flex items-center justify-between gap-4 py-2.5">
                  <Link
                    href={`/admin/careers/positions/${position.id}`}
                    className="text-[13px] text-ink transition-colors hover:text-brand"
                  >
                    {position.title}
                  </Link>
                  <span className="text-[12px] text-ink-4">{position.id}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </AdminForm>
    </div>
  );
}
