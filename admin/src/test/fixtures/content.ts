/**
 * 内容模块测试数据（与 web/data/site.json 结构一致的精简版本）。
 */
import type { AboutContent, CareersContent, HomeContent, SiteConfig } from "@/types/content";
import type { CaseItem, CasesPageContent } from "@/types/cases";

export const SITE_FIXTURE: SiteConfig = {
  name: "上海翼投智能科技有限公司",
  nameEn: "Shanghai ADFLY Intelligent Technology Co., Ltd.",
  logoText: "ADFLY",
  logoSub: "飞书汇",
  nav: [{ label: "服务与产品", href: "/" }],
  contactEmail: "master@adflymobile.com",
  businessEmail: "market@adflymobile.com",
  phone: "+86 21 5436 8877",
  address: "上海市徐汇区宜山路425号光启城710室",
  icp: "沪ICP备18047852号-1",
  seo: { title: "ADFLY 飞书汇", description: "全球化营销", keywords: "出海营销" },
  footerLinks: [{ label: "服务与产品", href: "/" }],
  updatedAt: "2024-05-01T00:00:00.000Z",
};

export const HOME_FIXTURE: HomeContent = {
  hero: {
    eyebrow: "GLOBAL AI-POWERED MARTECH SOLUTIONS",
    title: "全球智能营销科技服务商",
    titleEn: "GLOBAL AI-POWERED MARTECH SOLUTIONS",
    description: "Facebook、Google、TikTok 等 50+ 资源",
    primaryCta: { label: "免费开户", href: "/cases" },
    secondaryCta: { label: "预约咨询", href: "#contact" },
    marquee: ["Facebook"],
    stats: [{ value: "2017", label: "成立年份" }],
  },
  media: {
    title: "覆盖全球 50+ 海外主流媒体资源",
    subtitle: "TikTok、Google 官方一级代理",
    benefits: [{ title: "官方认证代理资质", description: "Meta、Google 等" }],
    partners: [{ name: "SmartNews", mark: "Smartnews", category: "Content" }],
    cta: { label: "立即开户", href: "#contact" },
  },
  flow: {
    eyebrow: "FLOW AI SYSTEM",
    title: "自研 Flow Ai 智能广告系统",
    description: "滚动查看四大能力",
    orbit: [{ label: "大模型" }],
    features: [
      { title: "一键生成广告素材", mark: "Flow Creative", description: "智能解析", points: "解析 / 提炼" },
    ],
    cta: { label: "马上体验", href: "#contact" },
  },
  clients: {
    title: "10000+ 客户选择",
    subtitle: "覆盖游戏、APP、电商",
    industries: [{ key: "ecommerce", name: "电商", description: "全链路增长", stat: "单日增量突破 10000 人次" }],
    logos: [{ name: "4399游戏", industry: "game" }],
  },
  strength: {
    title: "让出海，更简单！",
    description: "专注于效果类营销解决方案",
    nodes: [{ city: "总部上海", role: "全球总部", x: "82", y: "42", major: "yes" }],
    stats: [{ value: "2017", suffix: "", label: "成立年份" }],
    cta: { label: "联系我们", href: "#contact" },
  },
  honors: {
    title: "企业荣誉 实力见证",
    subtitle: "权威资质与行业认可",
    groups: [
      {
        key: "qualification",
        title: "权威资质",
        items: [{ title: "国家高新技术企业", issuer: "国家级", year: "2021" }],
      },
    ],
  },
  updatedAt: "2024-05-01T00:00:00.000Z",
};

export const ABOUT_FIXTURE: AboutContent = {
  heroEyebrow: "ABOUT ADFLY",
  heroTitle: "全球成功，从这里开始",
  heroDescription: "上海翼投智能科技有限公司成立于 2017 年",
  stats: [{ value: "2017", unit: "年", label: "公司成立" }],
  visionTitle: "用数智有效联结 中国企业和全球消费者",
  visionText: "我们拥有 ADFLYMIND 数字化广告系统",
  values: [{ title: "使命", description: "帮助客户走向全球" }],
  timeline: [{ period: "2017", title: "ADFLY 正式成立", description: "组建出海效果营销团队" }],
  team: [{ name: "莫夏芸", role: "董事长 / CEO", bio: "连续创业者", avatar: "/images/adfly/new_team_1.png" }],
  teamIntro: "核心成员来自于猎豹、网易、恺英",
  offices: [{ city: "上海", label: "总部", address: "上海市徐汇区宜山路425号" }],
  updatedAt: "2024-05-01T00:00:00.000Z",
};

export const CASES_PAGE_FIXTURE: CasesPageContent = {
  title: "海外营销成功案例",
  subtitle: "以数据与创意驱动的增长实践",
  filters: [
    { key: "all", label: "全部" },
    { key: "game", label: "游戏" },
    { key: "ecommerce", label: "电商" },
  ],
  updatedAt: "2024-05-01T00:00:00.000Z",
};

export const CASE_ITEM_FIXTURE: CaseItem = {
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
  createdAt: "2024-05-01T00:00:00.000Z",
  updatedAt: "2024-05-01T00:00:00.000Z",
};

export const CASE_ITEMS_FIXTURE: CaseItem[] = [
  CASE_ITEM_FIXTURE,
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
    createdAt: "2024-04-01T00:00:00.000Z",
    updatedAt: "2024-04-01T00:00:00.000Z",
  },
];

export const CAREERS_CONTENT_FIXTURE: CareersContent = {
  heroTitle: "加入 ADFLY",
  heroSubtitle: "与全球营销专家一起成长",
  heroDescription: "我们是一支专注出海的团队",
  citiesEyebrow: "OUR OFFICES",
  citiesTitle: "全球化办公地点",
  citiesDescription: "覆盖上海、深圳、北京等地",
  cultureTitle: "我们的文化",
  culture: [{ title: "客户为先", description: "从客户角度出发" }],
  benefitsTitle: "福利待遇",
  benefits: [{ group: "基础福利", items: "五险一金 / 年终奖金" }],
  jobsEyebrow: "OPEN POSITIONS",
  jobsTitle: "热招职位",
  portalUrl: "https://adflymobile.com/jobs",
  applyEmail: "hr@adflymobile.com",
  updatedAt: "2024-05-01T00:00:00.000Z",
};
