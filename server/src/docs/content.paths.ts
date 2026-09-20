import { commonErrors, envelope, errorResponse, jsonRequest } from "@/docs/helpers";

/**
 * Stage 2 已实现接口的 OpenAPI 定义。
 *
 * 说明：这些内容模块的字段结构由前端表单 + Zod 校验约束，
 * 文档中给出「关键字段 + additionalProperties」的概要 schema，
 * 完整字段清单见 `src/validations/*.validation.ts`。
 */

const objectSchema = (
  description: string,
  properties: Record<string, unknown> = {},
): Record<string, unknown> => ({
  type: "object",
  description,
  additionalProperties: true,
  properties,
});

const stringArray = (description: string) => ({
  type: "array",
  description,
  items: { type: "string" },
});

const linkObject = (description: string) =>
  objectSchema(description, {
    label: { type: "string", example: "免费开户" },
    href: { type: "string", example: "/cases" },
    external: { type: "boolean" },
  });

const SITE_EXAMPLE = {
  name: "上海翼投智能科技有限公司",
  nameEn: "Shanghai ADFLY Intelligent Technology Co., Ltd.",
  logoText: "ADFLY",
  logoSub: "飞书汇",
  nav: [{ label: "客户案例", href: "/cases", external: false }],
  contactEmail: "master@adflymobile.com",
  businessEmail: "market@adflymobile.com",
  phone: "+86 21 5436 8877",
  address: "上海市徐汇区宜山路425号光启城710室",
  icp: "沪ICP备18047852号-1",
  seo: { title: "ADFLY", description: "全球智能营销科技服务商", keywords: "ADFLY,营销" },
  footerLinks: [{ label: "隐私政策", href: "/privacy", external: false }],
};

const HOME_SECTION_EXAMPLES: Record<string, Record<string, unknown>> = {
  hero: {
    eyebrow: "ADFLY",
    title: "全球智能营销科技服务商",
    titleEn: "Global Intelligent Marketing Partner",
    description: "以数据、创意与 AI 驱动增长。",
    primaryCta: { label: "联系我们", href: "/contact", external: false },
    secondaryCta: { label: "查看案例", href: "/cases", external: false },
    marquee: ["Facebook", "Google"],
    stats: [{ value: "2017", label: "成立年份" }],
  },
  media: {
    title: "全球媒体资源",
    subtitle: "覆盖主流增长渠道",
    benefits: [{ title: "专业服务", description: "一站式投放支持" }],
    partners: [{ name: "Facebook", mark: "Facebook", category: "Social", accent: "#1877F2" }],
    cta: { label: "免费开户", href: "/contact", external: false },
  },
  flow: {
    eyebrow: "Flow AI",
    title: "让创意持续产生增长",
    description: "从洞察到素材的智能工作流。",
    orbit: [{ label: "大模型" }],
    features: [{ title: "智能创意", description: "快速生成素材", mark: "Flow Creative", points: "洞察/生成" }],
    cta: { label: "了解 Flow AI", href: "/flow", external: false },
  },
  clients: {
    title: "适配不同增长阶段",
    subtitle: "为行业客户提供可验证的增长方案",
    industries: [{ key: "game", name: "游戏", description: "游戏出海", stat: "320% ROI" }],
    logos: [{ name: "4399游戏", industry: "game" }],
  },
  strength: {
    title: "全球化团队与服务网络",
    description: "连接本地市场与全球媒体。",
    nodes: [{ city: "总部上海", role: "全球总部", x: "82", y: "42", major: "yes" }],
    stats: [{ value: "20+", suffix: "", label: "服务市场" }],
    cta: { label: "认识我们", href: "/about", external: false },
  },
  honors: {
    title: "专业能力获得认可",
    subtitle: "持续建设长期信任",
    groups: [{ key: "qualification", title: "权威资质", items: [{ title: "Google Partner", issuer: "Google", year: "2024" }] }],
  },
};

const HOME_EXAMPLE = {
  ...HOME_SECTION_EXAMPLES,
};

const ABOUT_EXAMPLE = {
  heroEyebrow: "About ADFLY",
  heroTitle: "连接品牌与全球增长",
  heroDescription: "我们为客户提供智能营销服务。",
  stats: [{ value: "2017", label: "成立年份" }],
  visionTitle: "我们的愿景",
  visionText: "让增长更简单。",
  values: [{ title: "客户成功", description: "以客户结果为导向" }],
  timeline: [{ year: "2017", title: "公司成立", description: "开始服务全球客户" }],
  team: [{ name: "ADFLY Team", role: "Growth" }],
  teamIntro: "一支跨市场团队。",
  offices: [{ city: "上海", address: "徐汇区" }],
};

const CAREERS_CONTENT_EXAMPLE = {
  heroTitle: "与优秀的人一起做有影响力的事",
  heroSubtitle: "加入 ADFLY",
  heroDescription: "在全球化团队中持续成长。",
  citiesEyebrow: "Locations",
  citiesTitle: "寻找适合你的城市",
  citiesDescription: "我们在多个城市设有团队。",
  cultureTitle: "我们的文化",
  culture: [{ title: "开放协作", description: "分享知识，共同成长" }],
  benefitsTitle: "福利待遇",
  benefits: [{ group: "基础福利", items: "五险一金/带薪年假" }],
  jobsEyebrow: "Open Roles",
  jobsTitle: "加入我们",
  portalUrl: "https://jobs.example.com",
  applyEmail: "hr@example.com",
};

export const contentSchemas: Record<string, Record<string, unknown>> = {
  SiteConfig: objectSchema("站点与导航配置（单文档）", {
    name: { type: "string", example: "上海翼投智能科技有限公司" },
    nameEn: { type: "string", example: "Shanghai ADFLY Intelligent Technology Co., Ltd." },
    logoText: { type: "string", example: "ADFLY" },
    logoSub: { type: "string", example: "飞书汇" },
    nav: { type: "array", items: linkObject("导航项") },
    contactEmail: { type: "string", example: "master@adflymobile.com" },
    businessEmail: { type: "string", example: "market@adflymobile.com" },
    phone: { type: "string", example: "+86 21 5436 8877" },
    address: { type: "string", example: "上海市徐汇区宜山路425号光启城710室" },
    icp: { type: "string", example: "沪ICP备18047852号-1" },
    seo: objectSchema("SEO 信息", {
      title: { type: "string" },
      description: { type: "string" },
      keywords: { type: "string" },
    }),
    footerLinks: { type: "array", items: linkObject("页脚链接") },
    updatedAt: { type: "string", format: "date-time" },
  }),
  HomeHeroSection: objectSchema("首页 Hero 区", {
    eyebrow: { type: "string" },
    title: { type: "string", example: "全球智能营销科技服务商" },
    titleEn: { type: "string" },
    description: { type: "string" },
    primaryCta: linkObject("主按钮"),
    secondaryCta: linkObject("次按钮"),
    marquee: stringArray("滚动媒体名"),
    stats: {
      type: "array",
      description: "指标卡（最多 12 项）",
      items: objectSchema("指标", {
        value: { type: "string", example: "2017" },
        label: { type: "string", example: "成立年份" },
      }),
    },
  }),
  HomeMediaSection: objectSchema("首页媒体资源区", {
    title: { type: "string" },
    subtitle: { type: "string" },
    benefits: {
      type: "array",
      description: "权益（最多 12 项）",
      items: objectSchema("权益", {
        title: { type: "string" },
        description: { type: "string" },
      }),
    },
    partners: {
      type: "array",
      description: "媒体伙伴（最多 60 项）",
      items: objectSchema("媒体伙伴", {
        name: { type: "string", example: "Facebook" },
        mark: { type: "string", example: "Facebook" },
        category: { type: "string", enum: ["Social", "Search", "Content", "Ads"] },
        accent: { type: "string", example: "#1877F2" },
      }),
    },
    cta: linkObject("按钮"),
  }),
  HomeFlowSection: objectSchema("首页 Flow AI 区", {
    eyebrow: { type: "string" },
    title: { type: "string" },
    description: { type: "string" },
    orbit: {
      type: "array",
      description: "环形标签（最多 20 项）",
      items: objectSchema("环形标签", { label: { type: "string", example: "大模型" } }),
    },
    features: {
      type: "array",
      description: "能力（最多 12 项）",
      items: objectSchema("能力", {
        title: { type: "string" },
        description: { type: "string" },
        mark: { type: "string", example: "Flow Creative" },
        points: { type: "string", description: "要点，`/` 分隔" },
      }),
    },
    cta: linkObject("按钮"),
  }),
  HomeClientsSection: objectSchema("首页客户选择区", {
    title: { type: "string" },
    subtitle: { type: "string" },
    industries: {
      type: "array",
      description: "行业卡（最多 20 项）",
      items: objectSchema("行业", {
        key: { type: "string", example: "ecommerce" },
        name: { type: "string", example: "电商" },
        description: { type: "string" },
        stat: { type: "string" },
      }),
    },
    logos: {
      type: "array",
      description: "客户 Logo 墙（最多 200 项）",
      items: objectSchema("客户", {
        name: { type: "string", example: "4399游戏" },
        industry: { type: "string", example: "game" },
      }),
    },
  }),
  HomeStrengthSection: objectSchema("首页公司实力区", {
    title: { type: "string" },
    description: { type: "string" },
    nodes: {
      type: "array",
      description: "地图节点（最多 50 项）",
      items: objectSchema("节点", {
        city: { type: "string", example: "总部上海" },
        role: { type: "string", example: "全球总部" },
        x: { oneOf: [{ type: "number" }, { type: "string" }], example: "82" },
        y: { oneOf: [{ type: "number" }, { type: "string" }], example: "42" },
        major: { oneOf: [{ type: "boolean" }, { type: "string" }], example: "yes" },
      }),
    },
    stats: {
      type: "array",
      items: objectSchema("指标", {
        value: { type: "string" },
        suffix: { type: "string" },
        label: { type: "string" },
      }),
    },
    cta: linkObject("按钮"),
  }),
  HomeHonorsSection: objectSchema("首页企业荣誉区", {
    title: { type: "string" },
    subtitle: { type: "string" },
    groups: {
      type: "array",
      description: "荣誉分组（最多 10 组，每组最多 20 条）",
      items: objectSchema("分组", {
        key: { type: "string", example: "qualification" },
        title: { type: "string", example: "权威资质" },
        items: {
          type: "array",
          items: objectSchema("荣誉", {
            title: { type: "string" },
            issuer: { type: "string" },
            year: { type: "string" },
          }),
        },
      }),
    },
  }),
  HomeContent: objectSchema("首页 6 大板块内容（单文档）", {
    hero: { $ref: "#/components/schemas/HomeHeroSection" },
    media: { $ref: "#/components/schemas/HomeMediaSection" },
    flow: { $ref: "#/components/schemas/HomeFlowSection" },
    clients: { $ref: "#/components/schemas/HomeClientsSection" },
    strength: { $ref: "#/components/schemas/HomeStrengthSection" },
    honors: { $ref: "#/components/schemas/HomeHonorsSection" },
    updatedAt: { type: "string", format: "date-time" },
  }),
  AboutContent: objectSchema("关于我们内容（单文档）", {
    heroEyebrow: { type: "string" },
    heroTitle: { type: "string" },
    heroDescription: { type: "string" },
    stats: { type: "array", items: objectSchema("指标") },
    visionTitle: { type: "string" },
    visionText: { type: "string" },
    values: { type: "array", items: objectSchema("价值观") },
    timeline: { type: "array", items: objectSchema("里程碑") },
    team: { type: "array", items: objectSchema("团队成员") },
    teamIntro: { type: "string" },
    offices: { type: "array", items: objectSchema("办公点") },
    updatedAt: { type: "string", format: "date-time" },
  }),
  CareersContent: objectSchema("招聘页面文案（单文档，不含城市与职位）", {
    heroTitle: { type: "string" },
    heroSubtitle: { type: "string" },
    heroDescription: { type: "string" },
    citiesEyebrow: { type: "string" },
    citiesTitle: { type: "string" },
    citiesDescription: { type: "string" },
    cultureTitle: { type: "string" },
    culture: { type: "array", items: objectSchema("企业文化") },
    benefitsTitle: { type: "string" },
    benefits: {
      type: "array",
      items: objectSchema("福利分组", {
        group: { type: "string", example: "基础福利" },
        items: { type: "string", description: "`/` 分隔的福利条目" },
      }),
    },
    jobsEyebrow: { type: "string" },
    jobsTitle: { type: "string" },
    portalUrl: {
      oneOf: [
        { type: "string", enum: [""] },
        { type: "string", format: "uri", pattern: "^https?://" },
      ],
      description: "招聘系统地址；可为空，仅允许绝对 http:// 或 https:// 地址",
      example: "https://jobs.example.com",
    },
    applyEmail: { type: "string" },
    updatedAt: { type: "string", format: "date-time" },
  }),
};

interface SingletonSpec {
  path: string;
  tag: string;
  schemaRef: string;
  name: string;
  getSummary: string;
  putSummary: string;
  notFoundMessage: string;
  example: Record<string, unknown>;
}

/** Get / Put 型单文档模块。 */
function singletonPaths(spec: SingletonSpec): Record<string, Record<string, unknown>> {
  const schema = { $ref: spec.schemaRef };
  return {
    [spec.path]: {
      get: {
        tags: [spec.tag],
        summary: spec.getSummary,
        description: `读取「${spec.name}」单文档内容。${spec.notFoundMessage}时返回 404 / code=4040。`,
        responses: {
          200: { description: `${spec.name}内容`, ...envelope(schema, { code: 0, message: "ok", data: spec.example }) },
          ...commonErrors({ notFound: true }),
        },
      },
      put: {
        tags: [spec.tag],
        summary: spec.putSummary,
        description: `整体覆盖「${spec.name}」。请求体需包含全部字段（详见 Zod 校验规则），未知字段返回 4000。`,
        security: [{ bearerAuth: [] }],
        requestBody: jsonRequest(spec.schemaRef, spec.example),
        responses: {
          200: { description: "保存后的完整内容", ...envelope(schema, { code: 0, message: `${spec.name}已保存`, data: spec.example }) },
          ...commonErrors({ protected: true }),
        },
      },
    },
  };
}

const HOME_SECTIONS: { key: string; name: string; schemaRef: string; example?: unknown }[] = [
  {
    key: "hero",
    name: "Hero 区",
    schemaRef: "#/components/schemas/HomeHeroSection",
    example: { title: "全球智能营销科技服务商", marquee: ["Facebook", "Google"] },
  },
  {
    key: "media",
    name: "媒体资源区",
    schemaRef: "#/components/schemas/HomeMediaSection",
    example: HOME_SECTION_EXAMPLES.media,
  },
  {
    key: "flow",
    name: "Flow AI 区",
    schemaRef: "#/components/schemas/HomeFlowSection",
    example: HOME_SECTION_EXAMPLES.flow,
  },
  {
    key: "clients",
    name: "客户选择区",
    schemaRef: "#/components/schemas/HomeClientsSection",
    example: HOME_SECTION_EXAMPLES.clients,
  },
  {
    key: "strength",
    name: "公司实力区",
    schemaRef: "#/components/schemas/HomeStrengthSection",
    example: HOME_SECTION_EXAMPLES.strength,
  },
  {
    key: "honors",
    name: "企业荣誉区",
    schemaRef: "#/components/schemas/HomeHonorsSection",
    example: HOME_SECTION_EXAMPLES.honors,
  },
];

/** Stage 2 已实现接口的 path 条目。 */
export function contentPaths(): Record<string, Record<string, unknown>> {
  const homeSchema = { $ref: "#/components/schemas/HomeContent" };
  const paths: Record<string, Record<string, unknown>> = {
    ...singletonPaths({
      path: "/site",
      tag: "Site",
      schemaRef: "#/components/schemas/SiteConfig",
      name: "站点与导航",
      getSummary: "读取站点配置",
      putSummary: "更新站点配置",
      notFoundMessage: "站点配置尚未初始化",
      example: SITE_EXAMPLE,
    }),
    "/home": {
      get: {
        tags: ["Home"],
        summary: "读取首页 6 大板块",
        description: "一次性返回 hero / media / flow / clients / strength / honors。",
        responses: {
          200: { description: "首页内容", ...envelope(homeSchema, { code: 0, message: "ok", data: HOME_EXAMPLE }) },
          ...commonErrors({ notFound: true }),
        },
      },
    },
    ...singletonPaths({
      path: "/about",
      tag: "About",
      schemaRef: "#/components/schemas/AboutContent",
      name: "关于我们",
      getSummary: "读取关于我们",
      putSummary: "更新关于我们",
      notFoundMessage: "关于我们内容尚未初始化",
      example: ABOUT_EXAMPLE,
    }),
    ...singletonPaths({
      path: "/careers/content",
      tag: "Careers",
      schemaRef: "#/components/schemas/CareersContent",
      name: "招聘页面文案",
      getSummary: "读取招聘页面文案",
      putSummary: "更新招聘页面文案",
      notFoundMessage: "招聘页面文案尚未初始化",
      example: CAREERS_CONTENT_EXAMPLE,
    }),
  };

  for (const section of HOME_SECTIONS) {
    paths[`/home/${section.key}`] = {
      put: {
        tags: ["Home"],
        summary: `更新${section.name}`,
        description: `局部更新首页「${section.name}」，返回更新后的完整首页内容。`,
        security: [{ bearerAuth: [] }],
        requestBody: jsonRequest(section.schemaRef, section.example),
        responses: {
          200: {
            description: "更新后的首页完整内容",
            ...envelope(homeSchema, { code: 0, message: "首页内容已保存", data: HOME_EXAMPLE }),
          },
          ...commonErrors({ protected: true }),
        },
      },
    };
  }

  return paths;
}

export { errorResponse };
