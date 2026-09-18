import type { Metadata } from "next";

import { saveSectionAction } from "@/app/(admin)/admin/actions";
import { AdminForm } from "@/components/admin/AdminForm";
import { ArrayField, Field, Panel, TextArea } from "@/components/admin/Fields";
import { getSiteData } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "加入我们", robots: { index: false } };

export default function AdminCareersPage() {
  const { careers } = getSiteData();

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-bold text-ink">加入我们</h1>
        <p className="mt-2 text-[14px] text-ink-3">
          企业文化、福利体系与招聘板块文案；城市与职位请前往「招聘管理」。
        </p>
      </header>

      <AdminForm action={saveSectionAction} path="careers" label="加入我们" className="max-w-4xl">
        <Panel title="首屏">
          <Field label="主标题" name="heroTitle" defaultValue={careers.heroTitle} />
          <Field label="副标题" name="heroSubtitle" defaultValue={careers.heroSubtitle} />
          <TextArea
            label="简介"
            name="heroDescription"
            defaultValue={careers.heroDescription}
            rows={3}
          />
        </Panel>

        <Panel title="企业文化">
          <Field label="板块标题" name="cultureTitle" defaultValue={careers.cultureTitle} />
          <ArrayField
            name="culture"
            label="文化条目"
            blank={{ title: "", description: "" }}
            defaultValues={careers.culture}
            fields={[
              { key: "title", label: "标题" },
              { key: "description", label: "说明", multiline: true },
            ]}
          />
        </Panel>

        <Panel title="福利体系">
          <Field label="板块标题" name="benefitsTitle" defaultValue={careers.benefitsTitle} />
          <ArrayField
            name="benefits"
            label="福利分组"
            hint="同一分组的多项福利用 / 分隔，例如：五险一金 / 年终奖金"
            blank={{ group: "", items: "" }}
            defaultValues={careers.benefits}
            fields={[
              { key: "group", label: "分组名称" },
              { key: "items", label: "福利项（用 / 分隔）", multiline: true },
            ]}
          />
        </Panel>

        <Panel title="招聘城市板块">
          <Field
            label="英文眉标"
            name="citiesEyebrow"
            defaultValue={careers.citiesEyebrow}
          />
          <Field label="板块标题" name="citiesTitle" defaultValue={careers.citiesTitle} />
          <TextArea
            label="板块说明"
            name="citiesDescription"
            defaultValue={careers.citiesDescription}
            rows={3}
          />
          <p className="text-[13px] leading-relaxed text-ink-4">
            城市与职位在
            <a href="/admin/careers" className="mx-1 text-brand underline">
              招聘管理
            </a>
            中维护（{careers.cities.length} 个城市 · {careers.positions.length} 个职位）。
          </p>
        </Panel>

        <Panel title="热招职位板块">
          <Field label="英文眉标" name="jobsEyebrow" defaultValue={careers.jobsEyebrow} />
          <Field label="板块标题" name="jobsTitle" defaultValue={careers.jobsTitle} />
          <p className="text-[13px] leading-relaxed text-ink-4">
            列表自动展示「热招」标记的职位（最多 8 个），可在
            <a href="/admin/careers" className="mx-1 text-brand underline">
              招聘管理
            </a>
            中调整。
          </p>
        </Panel>

        <Panel title="投递方式">
          <Field label="简历投递邮箱" name="applyEmail" defaultValue={careers.applyEmail} />
          <Field
            label="外部招聘系统首页（可空）"
            name="portalUrl"
            defaultValue={careers.portalUrl}
            placeholder="https://"
          />
        </Panel>
      </AdminForm>
    </div>
  );
}
