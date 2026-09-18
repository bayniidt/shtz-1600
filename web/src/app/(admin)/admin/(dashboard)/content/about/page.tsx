import type { Metadata } from "next";

import { saveSectionAction } from "@/app/(admin)/admin/actions";
import { AdminForm } from "@/components/admin/AdminForm";
import { ArrayField, Field, Panel, TextArea } from "@/components/admin/Fields";
import { getSiteData } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "关于我们", robots: { index: false } };

export default function AdminAboutPage() {
  const { about } = getSiteData();

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-bold text-ink">关于我们</h1>
        <p className="mt-2 text-[14px] text-ink-3">
          公司介绍、愿景、发展历程、核心团队与全球办公室。
        </p>
      </header>

      <AdminForm action={saveSectionAction} path="about" label="关于我们" className="max-w-4xl">
        <Panel title="首屏">
          <Field label="眉标" name="heroEyebrow" defaultValue={about.heroEyebrow} />
          <Field label="标题" name="heroTitle" defaultValue={about.heroTitle} />
          <TextArea
            label="简介"
            name="heroDescription"
            defaultValue={about.heroDescription}
            rows={4}
          />
          <ArrayField
            name="stats"
            label="数据指标"
            blank={{ value: "", unit: "", label: "" }}
            defaultValues={about.stats}
            fields={[
              { key: "value", label: "数值" },
              { key: "unit", label: "单位" },
              { key: "label", label: "说明" },
            ]}
          />
        </Panel>

        <Panel title="愿景与价值观">
          <Field label="愿景标题" name="visionTitle" defaultValue={about.visionTitle} />
          <TextArea label="愿景正文" name="visionText" defaultValue={about.visionText} rows={4} />
          <ArrayField
            name="values"
            label="使命 / 愿景 / 原则"
            blank={{ title: "", description: "" }}
            defaultValues={about.values}
            fields={[
              { key: "title", label: "标签" },
              { key: "description", label: "内容", multiline: true },
            ]}
          />
        </Panel>

        <Panel title="发展历程">
          <ArrayField
            name="timeline"
            label="时间线"
            blank={{ period: "", title: "", description: "" }}
            defaultValues={about.timeline}
            fields={[
              { key: "period", label: "时间" },
              { key: "title", label: "标题" },
              { key: "description", label: "描述", multiline: true },
            ]}
          />
        </Panel>

        <Panel title="核心团队">
          <TextArea label="团队介绍" name="teamIntro" defaultValue={about.teamIntro} rows={4} />
          <ArrayField
            name="team"
            label="团队成员"
            hint="头像使用站内路径，例如 /images/adfly/team_2.png"
            blank={{ name: "", role: "", bio: "", avatar: "" }}
            defaultValues={about.team}
            fields={[
              { key: "name", label: "姓名" },
              { key: "role", label: "职位" },
              { key: "avatar", label: "头像路径" },
              { key: "bio", label: "简介", multiline: true },
            ]}
          />
        </Panel>

        <Panel title="全球办公室">
          <ArrayField
            name="offices"
            label="办公室"
            blank={{ city: "", label: "", address: "" }}
            defaultValues={about.offices}
            fields={[
              { key: "city", label: "城市" },
              { key: "label", label: "名称" },
              { key: "address", label: "地址", multiline: true },
            ]}
          />
        </Panel>
      </AdminForm>
    </div>
  );
}
