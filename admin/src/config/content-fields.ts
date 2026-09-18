import { MEDIA_CATEGORIES } from "@/types/content";
import type { FieldSpec } from "@/types/field-spec";

/* ------------------------------ 站点与导航 ------------------------------ */

/** SEO 是嵌套对象，单独用 object 字段描述。 */
export const SITE_SEO_FIELDS: FieldSpec[] = [
  { kind: "text", name: "title", label: "SEO 标题" },
  { kind: "textarea", name: "description", label: "SEO 描述", rows: 2 },
  { kind: "textarea", name: "keywords", label: "SEO 关键词（英文逗号分隔）", rows: 2 },
];

export const SITE_FIELDS: FieldSpec[] = [
  { kind: "text", name: "name", label: "公司名称", span: 12 },
  { kind: "text", name: "nameEn", label: "英文名称", span: 12 },
  { kind: "text", name: "logoText", label: "Logo 主标识", span: 8 },
  { kind: "text", name: "logoSub", label: "Logo 副标识", span: 8 },
  { kind: "text", name: "icp", label: "ICP 备案号", span: 8, required: false },
  { kind: "text", name: "contactEmail", label: "对外联系邮箱", span: 8, required: false, hint: "留空则前台不展示" },
  { kind: "text", name: "businessEmail", label: "商务合作邮箱", span: 8, required: false },
  { kind: "text", name: "phone", label: "联系电话", span: 8, required: false },
  { kind: "textarea", name: "address", label: "公司地址", rows: 2 },
  {
    kind: "groupList",
    name: "nav",
    label: "顶部导航",
    addText: "添加导航项",
    itemTitle: "导航",
    max: 20,
    fields: [
      { kind: "text", name: "label", label: "文案", span: 8 },
      { kind: "text", name: "href", label: "链接", span: 16 },
    ],
  },
  {
    kind: "groupList",
    name: "footerLinks",
    label: "页脚链接",
    addText: "添加页脚链接",
    itemTitle: "页脚链接",
    max: 50,
    fields: [
      { kind: "text", name: "label", label: "文案", span: 8 },
      { kind: "text", name: "href", label: "链接", span: 16 },
    ],
  },
  {
    kind: "object",
    name: "seo",
    label: "SEO 信息",
    fields: SITE_SEO_FIELDS,
  },
];

/* --------------------------------- 首页 --------------------------------- */

export const HOME_HERO_FIELDS: FieldSpec[] = [
  { kind: "text", name: "eyebrow", label: "眉标（英文短语）", span: 12, required: false },
  { kind: "text", name: "titleEn", label: "英文标题", span: 12, required: false },
  { kind: "text", name: "title", label: "主标题" },
  { kind: "textarea", name: "description", label: "首屏简介", rows: 3, required: false },
  { kind: "link", name: "primaryCta", label: "主按钮", span: 12 },
  { kind: "link", name: "secondaryCta", label: "次按钮", span: 12 },
  {
    kind: "stringList",
    name: "marquee",
    label: "滚动媒体名",
    addText: "添加媒体",
    placeholder: "Facebook",
  },
  {
    kind: "groupList",
    name: "stats",
    label: "数据指标",
    addText: "添加指标",
    itemTitle: "指标",
    max: 12,
    fields: [
      { kind: "text", name: "value", label: "数值", span: 8 },
      { kind: "text", name: "label", label: "说明", span: 16 },
    ],
  },
];

export const HOME_MEDIA_FIELDS: FieldSpec[] = [
  { kind: "text", name: "title", label: "标题" },
  { kind: "text", name: "subtitle", label: "副标题", required: false },
  {
    kind: "groupList",
    name: "benefits",
    label: "权益说明",
    addText: "添加权益",
    itemTitle: "权益",
    max: 12,
    fields: [
      { kind: "text", name: "title", label: "标题", span: 8 },
      { kind: "textarea", name: "description", label: "描述", rows: 2, span: 16, required: false },
    ],
  },
  {
    kind: "groupList",
    name: "partners",
    label: "媒体伙伴",
    addText: "添加媒体",
    itemTitle: "媒体",
    max: 60,
    fields: [
      { kind: "text", name: "name", label: "名称", span: 8 },
      { kind: "text", name: "mark", label: "字标", span: 8, required: false },
      { kind: "select", name: "category", label: "分类", span: 8, options: MEDIA_CATEGORIES },
      { kind: "text", name: "accent", label: "主色（可选）", span: 8, required: false, placeholder: "#1877F2" },
    ],
  },
  { kind: "link", name: "cta", label: "底部按钮" },
];

export const HOME_FLOW_FIELDS: FieldSpec[] = [
  { kind: "text", name: "eyebrow", label: "眉标", span: 12, required: false },
  { kind: "text", name: "title", label: "标题", span: 12 },
  { kind: "textarea", name: "description", label: "说明", rows: 2, required: false },
  {
    kind: "groupList",
    name: "orbit",
    label: "环形标签",
    addText: "添加标签",
    itemTitle: "标签",
    max: 20,
    fields: [{ kind: "text", name: "label", label: "标签文案" }],
  },
  {
    kind: "groupList",
    name: "features",
    label: "能力卡片",
    addText: "添加能力",
    itemTitle: "能力",
    max: 12,
    fields: [
      { kind: "text", name: "title", label: "能力标题", span: 8 },
      { kind: "text", name: "mark", label: "英文标识", span: 8, required: false },
      { kind: "text", name: "points", label: "要点（/ 分隔）", span: 8, required: false },
      { kind: "textarea", name: "description", label: "能力说明", rows: 2, required: false },
    ],
  },
  { kind: "link", name: "cta", label: "底部按钮" },
];

export const HOME_CLIENTS_FIELDS: FieldSpec[] = [
  { kind: "text", name: "title", label: "标题" },
  { kind: "text", name: "subtitle", label: "副标题", required: false },
  {
    kind: "groupList",
    name: "industries",
    label: "行业分类",
    addText: "添加行业",
    itemTitle: "行业",
    max: 20,
    fields: [
      { kind: "text", name: "key", label: "标识", span: 8 },
      { kind: "text", name: "name", label: "名称", span: 8 },
      { kind: "text", name: "stat", label: "数据说明", span: 8, required: false },
      { kind: "textarea", name: "description", label: "行业描述", rows: 2, required: false },
    ],
  },
  {
    kind: "groupList",
    name: "logos",
    label: "客户 Logo 墙",
    addText: "添加客户",
    itemTitle: "客户",
    max: 200,
    fields: [
      { kind: "text", name: "name", label: "客户名称", span: 12 },
      { kind: "text", name: "industry", label: "所属行业标识", span: 12 },
    ],
  },
];

export const HOME_STRENGTH_FIELDS: FieldSpec[] = [
  { kind: "text", name: "title", label: "标题" },
  { kind: "textarea", name: "description", label: "简介", rows: 2, required: false },
  {
    kind: "groupList",
    name: "nodes",
    label: "全球化节点",
    addText: "添加节点",
    itemTitle: "节点",
    max: 50,
    fields: [
      { kind: "text", name: "city", label: "城市", span: 8 },
      { kind: "text", name: "role", label: "角色", span: 8, required: false },
      { kind: "text", name: "x", label: "地图 X 坐标", span: 4, required: false },
      { kind: "text", name: "y", label: "地图 Y 坐标", span: 4, required: false },
    ],
  },
  {
    kind: "groupList",
    name: "stats",
    label: "数据指标",
    addText: "添加指标",
    itemTitle: "指标",
    max: 12,
    fields: [
      { kind: "text", name: "value", label: "数值", span: 8 },
      { kind: "text", name: "suffix", label: "后缀", span: 4, required: false },
      { kind: "text", name: "label", label: "说明", span: 12 },
    ],
  },
  { kind: "link", name: "cta", label: "底部按钮" },
];

export const HOME_HONORS_FIELDS: FieldSpec[] = [
  { kind: "text", name: "title", label: "标题" },
  { kind: "text", name: "subtitle", label: "副标题", required: false },
  {
    kind: "groupList",
    name: "groups",
    label: "荣誉分组",
    addText: "添加分组",
    itemTitle: "分组",
    max: 10,
    fields: [
      { kind: "text", name: "key", label: "分组标识", span: 8 },
      { kind: "text", name: "title", label: "分组名称", span: 16 },
      {
        kind: "groupList",
        name: "items",
        label: "荣誉条目",
        addText: "添加荣誉",
        itemTitle: "荣誉",
        max: 20,
        fields: [
          { kind: "text", name: "title", label: "荣誉名称", span: 12 },
          { kind: "text", name: "issuer", label: "颁发机构", span: 8, required: false },
          { kind: "text", name: "year", label: "年份", span: 4, required: false },
        ],
      },
    ],
  },
];

/* -------------------------------- 关于我们 ------------------------------- */

export const ABOUT_FIELDS: FieldSpec[] = [
  { kind: "text", name: "heroEyebrow", label: "眉标", span: 12, required: false },
  { kind: "text", name: "heroTitle", label: "主标题", span: 12 },
  { kind: "textarea", name: "heroDescription", label: "首屏简介", rows: 3, required: false },
  {
    kind: "groupList",
    name: "stats",
    label: "数据指标",
    addText: "添加指标",
    itemTitle: "指标",
    max: 12,
    fields: [
      { kind: "text", name: "value", label: "数值", span: 8 },
      { kind: "text", name: "unit", label: "单位", span: 4, required: false },
      { kind: "text", name: "label", label: "说明", span: 12 },
    ],
  },
  { kind: "text", name: "visionTitle", label: "愿景标题" },
  { kind: "textarea", name: "visionText", label: "愿景正文", rows: 4, required: false },
  {
    kind: "groupList",
    name: "values",
    label: "使命与价值观",
    addText: "添加一条",
    itemTitle: "价值观",
    max: 12,
    fields: [
      { kind: "text", name: "title", label: "标题", span: 8 },
      { kind: "textarea", name: "description", label: "描述", rows: 2, span: 16, required: false },
    ],
  },
  {
    kind: "groupList",
    name: "timeline",
    label: "发展历程",
    addText: "添加里程碑",
    itemTitle: "里程碑",
    max: 30,
    fields: [
      { kind: "text", name: "period", label: "时间", span: 6, required: false },
      { kind: "text", name: "title", label: "标题", span: 18 },
      { kind: "textarea", name: "description", label: "描述", rows: 2, required: false },
    ],
  },
  { kind: "textarea", name: "teamIntro", label: "团队介绍", rows: 3, required: false },
  {
    kind: "groupList",
    name: "team",
    label: "核心团队",
    addText: "添加成员",
    itemTitle: "成员",
    max: 30,
    fields: [
      { kind: "text", name: "name", label: "姓名", span: 6 },
      { kind: "text", name: "role", label: "职位", span: 6, required: false },
      { kind: "textarea", name: "bio", label: "简介", rows: 2, required: false },
      { kind: "image", name: "avatar", label: "头像", span: 12 },
    ],
  },
  {
    kind: "groupList",
    name: "offices",
    label: "办公地点",
    addText: "添加办公点",
    itemTitle: "办公点",
    max: 30,
    fields: [
      { kind: "text", name: "city", label: "城市", span: 8 },
      { kind: "text", name: "label", label: "标签", span: 4, required: false },
      { kind: "text", name: "address", label: "地址", span: 12, required: false },
    ],
  },
];

/* ------------------------------ 招聘页面文案 ----------------------------- */

export const CAREERS_CONTENT_FIELDS: FieldSpec[] = [
  { kind: "text", name: "heroTitle", label: "首屏标题", span: 12 },
  { kind: "text", name: "heroSubtitle", label: "首屏副标题", span: 12, required: false },
  { kind: "textarea", name: "heroDescription", label: "首屏简介", rows: 3, required: false },
  { kind: "text", name: "citiesEyebrow", label: "城市区眉标", span: 8, required: false },
  { kind: "text", name: "citiesTitle", label: "城市区标题", span: 8 },
  { kind: "textarea", name: "citiesDescription", label: "城市区说明", rows: 2, required: false },
  { kind: "text", name: "cultureTitle", label: "企业文化标题", span: 12 },
  {
    kind: "groupList",
    name: "culture",
    label: "企业文化",
    addText: "添加一条",
    itemTitle: "文化",
    max: 12,
    fields: [
      { kind: "text", name: "title", label: "标题", span: 8 },
      { kind: "textarea", name: "description", label: "描述", rows: 2, span: 16, required: false },
    ],
  },
  { kind: "text", name: "benefitsTitle", label: "福利标题", span: 12 },
  {
    kind: "groupList",
    name: "benefits",
    label: "福利分组",
    addText: "添加分组",
    itemTitle: "分组",
    max: 12,
    fields: [
      { kind: "text", name: "group", label: "分组名称", span: 8 },
      { kind: "textarea", name: "items", label: "条目（/ 分隔）", rows: 2, span: 16, required: false },
    ],
  },
  { kind: "text", name: "jobsEyebrow", label: "职位区眉标", span: 8, required: false },
  { kind: "text", name: "jobsTitle", label: "职位区标题", span: 8 },
  { kind: "text", name: "portalUrl", label: "招聘系统地址", span: 12, required: false },
  { kind: "text", name: "applyEmail", label: "简历投递邮箱", span: 12, required: false },
];

/** 首页 6 个板块 → 字段描述 */
export const HOME_SECTION_FIELDS = {
  hero: HOME_HERO_FIELDS,
  media: HOME_MEDIA_FIELDS,
  flow: HOME_FLOW_FIELDS,
  clients: HOME_CLIENTS_FIELDS,
  strength: HOME_STRENGTH_FIELDS,
  honors: HOME_HONORS_FIELDS,
} as const;
