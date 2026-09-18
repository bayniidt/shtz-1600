import type { Metadata } from "next";

import { saveSectionAction } from "@/app/(admin)/admin/actions";
import { AdminForm } from "@/components/admin/AdminForm";
import { ArrayField, Field, Panel, StringListField, TextArea } from "@/components/admin/Fields";
import { getSiteData } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "首页内容", robots: { index: false } };

export default function AdminHomePage() {
  const { home } = getSiteData();

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-bold text-ink">首页内容</h1>
        <p className="mt-2 text-[14px] text-ink-3">
          首页共 6 个板块，修改后点击底部「保存」即可生效。
        </p>
      </header>

      <AdminForm action={saveSectionAction} path="home" label="首页内容" className="max-w-4xl">
        <Panel title="① Hero 主视觉">
          <Field label="英文眉标" name="hero.eyebrow" defaultValue={home.hero.eyebrow} />
          <Field label="主标题" name="hero.title" defaultValue={home.hero.title} />
          <Field label="英文标题" name="hero.titleEn" defaultValue={home.hero.titleEn} />
          <TextArea
            label="简介"
            name="hero.description"
            defaultValue={home.hero.description}
            rows={3}
          />
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="主按钮文字" name="hero.primaryCta.label" defaultValue={home.hero.primaryCta.label} />
            <Field label="主按钮链接" name="hero.primaryCta.href" defaultValue={home.hero.primaryCta.href} />
            <Field label="次按钮文字" name="hero.secondaryCta.label" defaultValue={home.hero.secondaryCta.label} />
            <Field label="次按钮链接" name="hero.secondaryCta.href" defaultValue={home.hero.secondaryCta.href} />
          </div>
          <StringListField
            name="hero.marquee"
            label="滚动媒体名称"
            defaultValue={home.hero.marquee}
            placeholder="例如 Facebook"
          />
          <ArrayField
            name="hero.stats"
            label="Hero 数据指标"
            blank={{ value: "", label: "" }}
            defaultValues={home.hero.stats}
            fields={[
              { key: "value", label: "数值" },
              { key: "label", label: "说明" },
            ]}
          />
        </Panel>

        <Panel title="② 媒体资源">
          <Field label="标题" name="media.title" defaultValue={home.media.title} />
          <Field label="副标题" name="media.subtitle" defaultValue={home.media.subtitle} />
          <Field label="按钮文字" name="media.cta.label" defaultValue={home.media.cta.label} />
          <Field label="按钮链接" name="media.cta.href" defaultValue={home.media.cta.href} />
          <ArrayField
            name="media.benefits"
            label="权益列表"
            blank={{ title: "", description: "" }}
            defaultValues={home.media.benefits}
            fields={[
              { key: "title", label: "标题" },
              { key: "description", label: "说明", multiline: true },
            ]}
          />
          <ArrayField
            name="media.partners"
            label="媒体 Logo 矩阵"
            blank={{ name: "", mark: "", category: "Social", accent: "" }}
            defaultValues={home.media.partners}
            fields={[
              { key: "name", label: "媒体名称" },
              { key: "mark", label: "展示文字" },
              { key: "category", label: "分类（Social/Search/Content/Ads）" },
              { key: "accent", label: "品牌色（可空，如 #1877F2）" },
            ]}
          />
        </Panel>

        <Panel title="③ Flow AI 智能广告系统">
          <Field label="英文眉标" name="flow.eyebrow" defaultValue={home.flow.eyebrow} />
          <Field label="标题" name="flow.title" defaultValue={home.flow.title} />
          <Field
            label="副标题（可空，滚动提示语）"
            name="flow.description"
            defaultValue={home.flow.description}
          />
          <Field label="按钮文字" name="flow.cta.label" defaultValue={home.flow.cta.label} />
          <Field label="按钮链接" name="flow.cta.href" defaultValue={home.flow.cta.href} />
          <ArrayField
            name="flow.orbit"
            label="环形核心标签（建议 3 项）"
            blank={{ label: "" }}
            defaultValues={home.flow.orbit}
            fields={[{ key: "label", label: "标签" }]}
          />
          <ArrayField
            name="flow.features"
            label="特性列表（环形轮播，建议 3–6 项）"
            blank={{ title: "", mark: "", description: "", points: "" }}
            defaultValues={home.flow.features}
            fields={[
              { key: "title", label: "标题" },
              { key: "mark", label: "英文标识（可空，如 Flow Creative）" },
              { key: "description", label: "说明", multiline: true },
              { key: "points", label: "要点（用 / 分隔）", multiline: true },
            ]}
          />
        </Panel>

        <Panel title="④ 客户选择">
          <Field label="标题" name="clients.title" defaultValue={home.clients.title} />
          <Field label="副标题" name="clients.subtitle" defaultValue={home.clients.subtitle} />
          <ArrayField
            name="clients.industries"
            label="行业分类"
            blank={{ key: "", name: "", description: "", stat: "" }}
            defaultValues={home.clients.industries}
            fields={[
              { key: "key", label: "标识（ecommerce/game/app）" },
              { key: "name", label: "名称" },
              { key: "description", label: "说明", multiline: true },
              { key: "stat", label: "数据说明" },
            ]}
          />
          <ArrayField
            name="clients.logos"
            label="客户 Logo 墙"
            blank={{ name: "", industry: "game" }}
            defaultValues={home.clients.logos}
            fields={[
              { key: "name", label: "客户名称" },
              { key: "industry", label: "所属行业标识" },
            ]}
          />
        </Panel>

        <Panel title="⑤ 公司实力">
          <Field label="标题" name="strength.title" defaultValue={home.strength.title} />
          <TextArea
            label="简介"
            name="strength.description"
            defaultValue={home.strength.description}
            rows={4}
          />
          <Field label="按钮文字" name="strength.cta.label" defaultValue={home.strength.cta.label} />
          <Field label="按钮链接" name="strength.cta.href" defaultValue={home.strength.cta.href} />
          <ArrayField
            name="strength.nodes"
            label="全球节点"
            hint="x / y 为地图上的百分比坐标（0-100）；总部节点在「总部」填 yes"
            blank={{ city: "", role: "", x: "50", y: "50", major: "" }}
            defaultValues={home.strength.nodes}
            fields={[
              { key: "city", label: "城市" },
              { key: "role", label: "角色" },
              { key: "x", label: "X %" },
              { key: "y", label: "Y %" },
              { key: "major", label: "总部（填 yes）", placeholder: "yes" },
            ]}
          />
          <ArrayField
            name="strength.stats"
            label="数据卡片"
            blank={{ value: "", suffix: "", label: "" }}
            defaultValues={home.strength.stats}
            fields={[
              { key: "value", label: "数值（纯数字可滚动计数）" },
              { key: "suffix", label: "后缀" },
              { key: "label", label: "说明" },
            ]}
          />
        </Panel>

        <Panel title="⑥ 企业荣誉">
          <Field label="标题" name="honors.title" defaultValue={home.honors.title} />
          <Field label="副标题" name="honors.subtitle" defaultValue={home.honors.subtitle} />
          {home.honors.groups.map((group, groupIndex) => (
            <div key={group.key} className="rounded-xl bg-surface/60 p-4">
              <div className="mb-4 grid gap-4 md:grid-cols-2">
                <Field
                  label={`分组 ${groupIndex + 1} 标识`}
                  name={`honors.groups[${groupIndex}][key]`}
                  defaultValue={group.key}
                />
                <Field
                  label={`分组 ${groupIndex + 1} 标题`}
                  name={`honors.groups[${groupIndex}][title]`}
                  defaultValue={group.title}
                />
              </div>
              <ArrayField
                name={`honors.groups[${groupIndex}].items`}
                label={`${group.title} · 条目`}
                blank={{ title: "", issuer: "", year: "" }}
                defaultValues={group.items}
                fields={[
                  { key: "title", label: "荣誉名称" },
                  { key: "issuer", label: "颁发机构" },
                  { key: "year", label: "年份" },
                ]}
              />
            </div>
          ))}
        </Panel>
      </AdminForm>
    </div>
  );
}
