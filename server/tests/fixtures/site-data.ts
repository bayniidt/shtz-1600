/**
 * Stage 2 测试夹具：一份「最小但完整」的 SiteData。
 *
 * 与 `web/data/site.json` 保持同样的结构，但体量小、可读，
 * 用于接口测试（每个字段都满足 Zod 校验）。
 * 真实 site.json 的数据一致性由 `tests/seed.test.ts` 单独验证。
 */
import type { SiteDataInput } from "@/types/site-data";

export const SITE_FIXTURE = {
  name: "测试科技有限公司",
  nameEn: "Test Tech Co., Ltd.",
  logoText: "ADFLY",
  logoSub: "飞书汇",
  nav: [
    { label: "首页", href: "/" },
    { label: "案例", href: "/cases" },
  ],
  contactEmail: "master@example.com",
  businessEmail: "market@example.com",
  phone: "+86 21 0000 0000",
  address: "上海市徐汇区测试路 1 号",
  icp: "沪ICP备00000000号-1",
  seo: {
    title: "测试站点标题",
    description: "测试站点描述",
    keywords: "出海营销,测试",
  },
  footerLinks: [{ label: "隐私政策", href: "/privacy" }],
};

export const HOME_HERO_FIXTURE = {
  eyebrow: "GLOBAL MARTECH",
  title: "全球智能营销科技服务商",
  titleEn: "GLOBAL MARTECH PROVIDER",
  description: "首页 Hero 简介",
  primaryCta: { label: "免费开户", href: "/cases" },
  secondaryCta: { label: "预约咨询", href: "#contact" },
  marquee: ["Facebook", "Google", "TikTok"],
  stats: [
    { value: "2017", label: "成立年份" },
    { value: "50+", label: "海外媒体资源" },
  ],
};

export const HOME_MEDIA_FIXTURE = {
  title: "覆盖全球 50+ 海外主流媒体资源",
  subtitle: "官方一级代理",
  benefits: [{ title: "官方认证代理资质", description: "平台官方授权，开户即享绿色通道。" }],
  partners: [
    { name: "Facebook", mark: "Facebook", category: "Social", accent: "#1877F2" },
    { name: "SmartNews", mark: "Smartnews", category: "Content" },
  ],
  cta: { label: "立即开户", href: "#contact" },
};

export const HOME_FLOW_FIXTURE = {
  eyebrow: "FLOW AI SYSTEM",
  title: "自研 Flow Ai 智能广告系统",
  description: "滚动查看四大能力",
  orbit: [{ label: "大模型" }, { label: "机器学习" }],
  features: [
    {
      title: "一键生成广告素材",
      mark: "Flow Creative",
      description: "自动生成高转化创意素材。",
      points: "链接解析 / 卖点提炼 / 批量产出",
    },
    { title: "智能投放", description: "自动优化出价与受众。" },
  ],
  cta: { label: "马上体验", href: "#contact" },
};

export const HOME_CLIENTS_FIXTURE = {
  title: "10000+ 客户选择",
  subtitle: "覆盖多个行业",
  industries: [
    { key: "ecommerce", name: "电商", description: "全链路增长。", stat: "单日增量突破 10000 人次" },
    { key: "game", name: "游戏", description: "长线买量。", stat: "ROI 提升 320%" },
  ],
  logos: [
    { name: "4399游戏", industry: "game" },
    { name: "心动", industry: "game" },
  ],
};

export const HOME_STRENGTH_FIXTURE = {
  title: "让出海，更简单！",
  description: "公司实力简介",
  nodes: [
    { city: "总部上海", role: "全球总部", x: "82", y: "42", major: "yes" },
    { city: "东京", role: "日本子公司", x: 88, y: 26 },
  ],
  stats: [{ value: "2017", suffix: "", label: "成立年份" }],
  cta: { label: "联系我们", href: "#contact" },
};

export const HOME_HONORS_FIXTURE = {
  title: "企业荣誉 实力见证",
  subtitle: "权威资质与行业认可",
  groups: [
    {
      key: "qualification",
      title: "权威资质",
      items: [{ title: "国家高新技术企业", issuer: "科技部", year: "2021" }],
    },
    {
      key: "industry",
      title: "行业认可",
      items: [
        { title: "Top100 数字营销公司", issuer: "中国数字营销大会", year: "2024" },
        { title: "年度出海服务商", issuer: "行业年会", year: "2023" },
      ],
    },
  ],
};

export const HOME_FIXTURE = {
  hero: HOME_HERO_FIXTURE,
  media: HOME_MEDIA_FIXTURE,
  flow: HOME_FLOW_FIXTURE,
  clients: HOME_CLIENTS_FIXTURE,
  strength: HOME_STRENGTH_FIXTURE,
  honors: HOME_HONORS_FIXTURE,
};

export const ABOUT_FIXTURE = {
  heroEyebrow: "ABOUT ADFLY",
  heroTitle: "全球成功，从这里开始",
  heroDescription: "公司简介",
  stats: [{ value: "2017", unit: "年", label: "成立年份" }],
  visionTitle: "用数智有效联结中国企业和全球消费者",
  visionText: "愿景正文",
  values: [
    { title: "使命", description: "帮助客户走向全球。" },
    { title: "价值观", description: "客户为先。" },
  ],
  timeline: [{ period: "2017", title: "ADFLY 正式成立", description: "组建出海团队。" }],
  team: [
    { name: "张三", role: "CEO", bio: "连续创业者。", avatar: "/images/team-1.png" },
    { name: "李四", role: "CDO", bio: "负责数字化。" },
  ],
  teamIntro: "核心成员来自知名互联网企业。",
  offices: [{ city: "上海", label: "总部", address: "上海市徐汇区测试路 1 号" }],
};

export const CAREERS_FIXTURE = {
  heroTitle: "加入 ADFLY",
  heroSubtitle: "我们的世界就是你的画布",
  heroDescription: "与全球化的出海营销人一起工作。",
  citiesEyebrow: "OPEN POSITIONS",
  citiesTitle: "招聘城市",
  citiesDescription: "选择城市查看在招职位。",
  cultureTitle: "企业文化",
  culture: [
    { title: "客户为先", description: "想客户所想。" },
    { title: "长期主义", description: "做难而正确的事。" },
  ],
  benefitsTitle: "加入我们",
  benefits: [
    { group: "基础福利", items: "五险一金 / 年终奖金 / 年度体检" },
    { group: "成长支持", items: "体系化培训 / 海外轮岗" },
  ],
  jobsEyebrow: "FEATURED ROLES",
  jobsTitle: "热招职位",
  portalUrl: "https://jobs.example.com",
  applyEmail: "hr@example.com",
};

export const CASES_PAGE_FIXTURE = {
  title: "海外营销成功案例",
  subtitle: "以数据与创意驱动的增长实践",
  filters: [
    { key: "all", label: "全部" },
    { key: "game", label: "游戏" },
  ],
};

export const CASE_ITEMS_FIXTURE = [
  {
    id: "case-001",
    title: "游戏出海长线买量",
    client: "测试游戏",
    industry: "game",
    region: "日本",
    summary: "以素材工业化产能实现稳定 ROI。",
    cover: "/images/case-001.png",
    awards: ["年度飞跃增长奖"],
    tags: ["日本", "游戏"],
    year: "2024",
    featured: true,
    stats: [{ value: "320", unit: "%", label: "ROI 提升" }],
    blocks: [
      { key: "background", title: "项目背景", body: ["经典 IP 出海日本。"], points: ["长线买量"] },
    ],
  },
  {
    id: "case-002",
    title: "电商独立站增长",
    client: "测试电商",
    industry: "ecommerce",
    region: "欧美",
    summary: "打通选品到复购全链路。",
    cover: "/images/case-002.png",
    awards: [],
    tags: ["欧美", "电商"],
    year: "2023",
    featured: false,
    stats: [],
    blocks: [],
  },
];

export const CITIES_FIXTURE = [
  { id: "shanghai", name: "上海", nameEn: "Shanghai", code: "CT_125", summary: "集团总部", featured: "yes" },
  { id: "shenzhen", name: "深圳", nameEn: "Shenzhen", code: "CT_128", summary: "华南中心", featured: "" },
];

export const POSITIONS_FIXTURE = [
  {
    id: "position-001",
    title: "广告优化师",
    cityId: "shanghai",
    extraCities: "shenzhen",
    type: "全职",
    department: "投放中心",
    tags: "Facebook/Google",
    urgent: "yes",
    hot: "yes",
    publishedAt: "2026-01-01",
    summary: "负责广告投放优化。",
    description: "1. 制定投放策略\n2. 优化素材",
    requirement: "3 年以上经验",
    bonus: "熟悉 TikTok",
    applyUrl: "",
  },
  {
    id: "position-002",
    title: "前端工程师",
    cityId: "shenzhen",
    extraCities: "",
    type: "全职",
    department: "技术中心",
    tags: "React",
    urgent: "",
    hot: "",
    publishedAt: "2026-02-01",
    summary: "负责后台系统开发。",
    description: "1. 开发管理后台",
    requirement: "熟悉 React",
    bonus: "",
    applyUrl: "",
  },
];

/** 与 web/data/site.json 结构一致的完整夹具。 */
export const SITE_DATA_FIXTURE: SiteDataInput = {
  site: SITE_FIXTURE,
  home: HOME_FIXTURE,
  cases: { page: CASES_PAGE_FIXTURE, items: CASE_ITEMS_FIXTURE },
  about: ABOUT_FIXTURE,
  careers: { ...CAREERS_FIXTURE, cities: CITIES_FIXTURE, positions: POSITIONS_FIXTURE },
};
