import type { Metadata } from "next";

import { saveSectionAction } from "@/app/(admin)/admin/actions";
import { AdminForm } from "@/components/admin/AdminForm";
import { ArrayField, Field, Panel, TextArea } from "@/components/admin/Fields";
import { getSiteData } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "站点与导航", robots: { index: false } };

export default function AdminSitePage() {
  const { site } = getSiteData();

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-bold text-ink">站点与导航</h1>
        <p className="mt-2 text-[14px] text-ink-3">
          品牌信息、导航菜单、联系方式与页脚链接。
        </p>
      </header>

      <AdminForm
        action={saveSectionAction}
        path="site"
        label="站点与导航"
        className="max-w-4xl"
      >
        <Panel title="品牌信息">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="公司名称（中文）" name="name" defaultValue={site.name} />
            <Field label="公司名称（英文）" name="nameEn" defaultValue={site.nameEn} />
            <Field label="Logo 主文字" name="logoText" defaultValue={site.logoText} />
            <Field label="Logo 副标题" name="logoSub" defaultValue={site.logoSub} />
          </div>
        </Panel>

        <Panel title="联系方式">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="商务合作邮箱" name="businessEmail" defaultValue={site.businessEmail} />
            <Field label="客户咨询邮箱" name="contactEmail" defaultValue={site.contactEmail} />
            <Field label="联系电话" name="phone" defaultValue={site.phone} />
            <Field label="ICP 备案号" name="icp" defaultValue={site.icp} />
            <Field label="总部地址" name="address" defaultValue={site.address} className="md:col-span-2" />
          </div>
        </Panel>

        <Panel title="SEO">
          <Field label="站点标题" name="seo.title" defaultValue={site.seo.title} />
          <TextArea
            label="站点描述"
            name="seo.description"
            defaultValue={site.seo.description}
            rows={3}
          />
          <TextArea
            label="关键词（英文逗号分隔）"
            name="seo.keywords"
            defaultValue={site.seo.keywords}
            rows={2}
          />
        </Panel>

        <Panel title="顶部导航">
          <ArrayField
            name="nav"
            label="导航项"
            hint="href 支持站内路径（/cases）与锚点（#contact）"
            blank={{ label: "", href: "" }}
            defaultValues={site.nav}
            fields={[
              { key: "label", label: "名称" },
              { key: "href", label: "链接" },
            ]}
          />
        </Panel>

        <Panel title="页脚链接">
          <ArrayField
            name="footerLinks"
            label="页脚链接"
            blank={{ label: "", href: "" }}
            defaultValues={site.footerLinks}
            fields={[
              { key: "label", label: "名称" },
              { key: "href", label: "链接" },
            ]}
          />
        </Panel>
      </AdminForm>
    </div>
  );
}
