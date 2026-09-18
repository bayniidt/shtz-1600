import { Form } from "antd";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import ContentForm from "@/components/ContentForm";
import type { FieldSpec } from "@/types/field-spec";
import { fireEvent, renderWithProviders, screen, waitFor, within } from "@/test/utils";

/** 与 ContentEditor 相同的用法：保存按钮在 Form 之外，通过 form.submit() 触发校验。 */
function Harness({
  fields,
  initialValue,
  onFinish = vi.fn(),
  onValuesChange,
  disabled,
  extra,
}: {
  fields: FieldSpec[];
  initialValue: Record<string, unknown>;
  onFinish?: (values: Record<string, unknown>) => void;
  onValuesChange?: () => void;
  disabled?: boolean;
  extra?: ReactNode;
}) {
  const [form] = Form.useForm<Record<string, unknown>>();
  return (
    <>
      <ContentForm
        form={form}
        fields={fields}
        initialValue={initialValue}
        disabled={disabled}
        onFinish={onFinish}
        onValuesChange={onValuesChange}
      />
      {extra}
      <button type="button" onClick={() => void form.submit()}>
        提交
      </button>
    </>
  );
}

const FIELDS: FieldSpec[] = [
  { kind: "text", name: "title", label: "标题" },
  { kind: "textarea", name: "description", label: "描述", required: false },
  { kind: "number", name: "order", label: "排序" },
  { kind: "select", name: "category", label: "分类", options: [{ label: "社交", value: "Social" }] },
  { kind: "switch", name: "featured", label: "首页推荐" },
  { kind: "image", name: "avatar", label: "头像", span: 12 },
  { kind: "stringList", name: "tags", label: "标签", addText: "添加标签" },
  { kind: "link", name: "primaryCta", label: "主按钮" },
  {
    kind: "object",
    name: "seo",
    label: "SEO 信息",
    fields: [{ kind: "text", name: "seoTitle", label: "SEO 标题" }],
  },
  {
    kind: "groupList",
    name: "members",
    label: "团队成员",
    addText: "添加成员",
    itemTitle: "成员",
    min: 1,
    max: 2,
    fields: [
      { kind: "text", name: "name", label: "姓名", span: 12 },
      { kind: "text", name: "role", label: "职位", span: 12, required: false },
    ],
  },
];

const INITIAL = {
  title: "全球智能营销科技服务商",
  description: "描述",
  order: 1,
  category: "Social",
  featured: false,
  avatar: "",
  tags: ["出海"],
  primaryCta: { label: "免费开户", href: "/cases" },
  seo: { seoTitle: "ADFLY" },
  members: [{ name: "莫夏芸", role: "CEO" }],
};

describe("ContentForm（字段描述驱动渲染）", () => {
  it("F1 渲染全部字段类型并回填 initialValue", () => {
    renderWithProviders(<Harness fields={FIELDS} initialValue={INITIAL} />);

    expect(screen.getByLabelText("标题")).toHaveValue("全球智能营销科技服务商");
    expect(screen.getByLabelText("描述")).toHaveValue("描述");
    expect(screen.getByLabelText("排序")).toHaveValue("1");
    expect(screen.getByLabelText("分类")).toBeInTheDocument();
    expect(screen.getByRole("switch")).not.toBeChecked();
    expect(screen.getByDisplayValue("出海")).toBeInTheDocument();
    expect(screen.getByLabelText("主按钮-文案")).toHaveValue("免费开户");
    expect(screen.getByLabelText("主按钮-链接")).toHaveValue("/cases");
    expect(screen.getByLabelText("SEO 标题")).toHaveValue("ADFLY");
    expect(screen.getByLabelText("姓名")).toHaveValue("莫夏芸");
    expect(screen.getByLabelText("职位")).toHaveValue("CEO");
  });

  it("F2 提交时输出完整表单值（含嵌套对象与数组）", async () => {
    const onFinish = vi.fn();
    renderWithProviders(<Harness fields={FIELDS} initialValue={INITIAL} onFinish={onFinish} />);

    fireEvent.click(screen.getByRole("button", { name: "提交" }));
    await waitFor(() => expect(onFinish).toHaveBeenCalledTimes(1));

    expect(onFinish.mock.calls[0][0]).toEqual(INITIAL);
  });

  it("F3 必填校验：清空标题后提交不触发 onFinish 并提示中文错误", async () => {
    const onFinish = vi.fn();
    renderWithProviders(<Harness fields={FIELDS} initialValue={INITIAL} onFinish={onFinish} />);

    fireEvent.change(screen.getByLabelText("标题"), { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: "提交" }));

    expect(await screen.findByText("标题不能为空")).toBeInTheDocument();
    expect(onFinish).not.toHaveBeenCalled();
  });

  it("F4 onValuesChange 在任意字段改动时触发", async () => {
    const onValuesChange = vi.fn();
    renderWithProviders(
      <Harness fields={FIELDS} initialValue={INITIAL} onValuesChange={onValuesChange} />,
    );

    fireEvent.change(screen.getByLabelText("标题"), { target: { value: "！" } });
    expect(onValuesChange).toHaveBeenCalled();
  });

  it("F5 对象数组：添加 / 删除 / 上下移动 / min 限制", async () => {
    renderWithProviders(<Harness fields={FIELDS} initialValue={INITIAL} />);

    // min=1 时删除按钮禁用
    expect(screen.getByLabelText("删除第 1 条")).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: /添加成员/ }));
    expect(screen.getAllByLabelText("姓名")).toHaveLength(2);

    // 达到 max=2 后添加入口禁用并提示上限
    expect(screen.getByRole("button", { name: /已达上限 2 条/ })).toBeDisabled();

    fireEvent.click(screen.getByLabelText("上移第 2 条"));
    expect(screen.getAllByLabelText("姓名")).toHaveLength(2);

    fireEvent.click(screen.getByLabelText("删除第 2 条"));
    await waitFor(() => expect(screen.getAllByLabelText("姓名")).toHaveLength(1));
  });

  it("F6 数组新增条目使用字段默认值（select 首项 / 数组空值）", async () => {
    const onFinish = vi.fn();
    const fields: FieldSpec[] = [
      {
        kind: "groupList",
        name: "partners",
        label: "媒体",
        addText: "添加媒体",
        fields: [
          { kind: "text", name: "name", label: "名称", span: 12, required: false },
          {
            kind: "select",
            name: "category",
            label: "分类",
            span: 12,
            options: [{ label: "社交", value: "Social" }],
          },
          { kind: "stringList", name: "tags", label: "标签" },
        ],
      },
    ];
    renderWithProviders(
      <Harness fields={fields} initialValue={{ partners: [] }} onFinish={onFinish} />,
    );

    fireEvent.click(screen.getByRole("button", { name: /添加媒体/ }));
    fireEvent.click(screen.getByRole("button", { name: "提交" }));

    await waitFor(() => expect(onFinish).toHaveBeenCalled());
    expect(onFinish.mock.calls[0][0]).toEqual({
      partners: [{ name: "", category: "Social", tags: [] }],
    });
  });

  it("F7 disabled 时整个表单只读", () => {
    renderWithProviders(<Harness fields={FIELDS} initialValue={INITIAL} disabled />);
    expect(screen.getByLabelText("标题")).toBeDisabled();
    expect(screen.getByRole("switch")).toBeDisabled();
  });

  it("F8 label 提供 hint 时展示说明文案", () => {
    const fields: FieldSpec[] = [
      { kind: "text", name: "contactEmail", label: "对外联系邮箱", hint: "留空则前台不展示" },
    ];
    renderWithProviders(<Harness fields={fields} initialValue={{ contactEmail: "" }} />);
    expect(screen.getByText("留空则前台不展示")).toBeInTheDocument();
  });

  it("F9 字符串数组字段可新增条目", async () => {
    const onFinish = vi.fn();
    renderWithProviders(<Harness fields={FIELDS} initialValue={INITIAL} onFinish={onFinish} />);

    fireEvent.click(screen.getByRole("button", { name: /添加标签/ }));
    fireEvent.click(screen.getByRole("button", { name: "提交" }));

    await waitFor(() => expect(onFinish).toHaveBeenCalled());
    expect(onFinish.mock.calls[0][0].tags).toEqual(["出海", ""]);
  });

  it("F10 嵌套对象数组（荣誉分组 → 条目）渲染与提交正确", async () => {
    const fields: FieldSpec[] = [
      {
        kind: "groupList",
        name: "groups",
        label: "荣誉分组",
        addText: "添加分组",
        fields: [
          { kind: "text", name: "key", label: "分组标识", span: 8 },
          { kind: "text", name: "title", label: "分组名称", span: 16 },
          {
            kind: "groupList",
            name: "items",
            label: "荣誉条目",
            addText: "添加荣誉",
            fields: [{ kind: "text", name: "title", label: "荣誉名称", required: false }],
          },
        ],
      },
    ];
    const onFinish = vi.fn();
    renderWithProviders(
      <Harness
        fields={fields}
        initialValue={{
          groups: [{ key: "qualification", title: "权威资质", items: [{ title: "国家高新技术企业" }] }],
        }}
        onFinish={onFinish}
      />,
    );

    expect(screen.getByDisplayValue("qualification")).toBeInTheDocument();
    expect(screen.getByDisplayValue("国家高新技术企业")).toBeInTheDocument();

    const group = screen.getByTestId("group-list-groups");
    fireEvent.click(within(group).getByRole("button", { name: /添加荣誉/ }));
    fireEvent.click(screen.getByRole("button", { name: "提交" }));

    await waitFor(() => expect(onFinish).toHaveBeenCalled());
    expect(onFinish.mock.calls[0][0].groups[0].items).toEqual([
      { title: "国家高新技术企业" },
      { title: "" },
    ]);
  });

  it("F11 表单未填写必填的嵌套对象字段时阻止提交", async () => {
    const onFinish = vi.fn();
    const fields: FieldSpec[] = [
      {
        kind: "groupList",
        name: "members",
        label: "成员",
        addText: "添加成员",
        fields: [{ kind: "text", name: "name", label: "姓名" }],
      },
    ];
    renderWithProviders(<Harness fields={fields} initialValue={{ members: [] }} onFinish={onFinish} />);

    fireEvent.click(screen.getByRole("button", { name: /添加成员/ }));
    fireEvent.click(screen.getByRole("button", { name: "提交" }));

    expect(await screen.findByText("姓名不能为空")).toBeInTheDocument();
    expect(onFinish).not.toHaveBeenCalled();
  });
});
