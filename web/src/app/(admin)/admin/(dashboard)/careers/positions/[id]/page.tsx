import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { savePositionAction } from "@/app/(admin)/admin/actions";
import { AdminForm } from "@/components/admin/AdminForm";
import { Checkbox, Field, Panel, Select, TextArea } from "@/components/admin/Fields";
import { getSiteData } from "@/lib/db";
import { isOn, positionCities, splitList } from "@/lib/careers";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "编辑招聘职位", robots: { index: false } };

export default async function AdminPositionEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { careers } = getSiteData();
  const position = careers.positions.find((item) => item.id === id);
  if (!position) notFound();

  const cities = positionCities(careers, position);
  const extras = splitList(position.extraCities).filter((cityId) => cityId !== position.cityId);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <Link
          href="/admin/careers"
          className="text-[13px] text-ink-4 transition-colors hover:text-brand"
        >
          ← 返回招聘管理
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-ink">{position.title}</h1>
        <p className="mt-2 text-[13px] text-ink-3">
          前台地址：
          <Link href={`/careers/jobs/${position.id}`} className="text-brand underline">
            /careers/jobs/{position.id}
          </Link>
          {cities.length > 0 ? ` · ${cities.map((city) => city.name).join(" / ")}` : ""}
        </p>
      </header>

      <AdminForm
        action={savePositionAction}
        path="careers.positions"
        label={`职位 ${position.title}`}
      >
        <input type="hidden" name="__originalId" value={position.id} />

        <Panel title="基本信息">
          <Field label="职位名称" name="title" defaultValue={position.title} />
          <div className="grid gap-5 md:grid-cols-3">
            <Select
              label="主要城市"
              name="cityId"
              defaultValue={position.cityId}
              options={careers.cities.map((city) => ({ value: city.id, label: city.name }))}
            />
            <Field
              label="其他城市（可空）"
              name="extraCities"
              defaultValue={extras.join("/")}
              placeholder="shenzhen/chengdu"
              hint="多个城市用 / 分隔，需与城市标识一致。"
            />
            <Field label="职位类型（可空）" name="type" defaultValue={position.type} placeholder="全职" />
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            <Field
              label="所属部门（可空）"
              name="department"
              defaultValue={position.department}
              placeholder="内容营销部"
            />
            <Field
              label="标签（可空）"
              name="tags"
              defaultValue={position.tags}
              placeholder="海外/内容/营销"
              hint="多个标签用 / 分隔。"
            />
            <Field
              label="发布时间（可空）"
              name="publishedAt"
              defaultValue={position.publishedAt}
              placeholder="2026-09-16"
            />
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <Field
              label="职位标识（链接地址）"
              name="id"
              defaultValue={position.id}
              hint="建议使用字母、数字与连字符；修改后前台地址同步变化。"
            />
            <Field
              label="外部投递链接（可空）"
              name="applyUrl"
              defaultValue={position.applyUrl}
              placeholder="https://"
            />
          </div>
          <div className="flex flex-wrap gap-8">
            <Checkbox label="急聘标记" name="urgent" defaultChecked={isOn(position.urgent)} />
            <Checkbox
              label="在「热招职位」板块展示"
              name="hot"
              defaultChecked={isOn(position.hot)}
            />
          </div>
        </Panel>

        <Panel title="职位描述">
          <TextArea
            label="职位简介（可空，列表摘要）"
            name="summary"
            defaultValue={position.summary}
            rows={2}
            hint="留空时列表自动截取岗位职责的第一行。"
          />
          <TextArea
            label="岗位职责"
            name="description"
            defaultValue={position.description}
            rows={12}
            hint="每行一条，支持 1、 2、 或 - 前缀，前台自动渲染为条目。"
          />
          <TextArea
            label="任职要求（可空）"
            name="requirement"
            defaultValue={position.requirement}
            rows={10}
            hint="每行一条。"
          />
          <TextArea
            label="加分项（可空）"
            name="bonus"
            defaultValue={position.bonus}
            rows={6}
            hint="每行一条。"
          />
        </Panel>
      </AdminForm>
    </div>
  );
}
