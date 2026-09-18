/**
 * 内容模块的数据类型（与后端 Mongoose Schema / Zod 校验保持一致）。
 *
 * 后端返回的 JSON 会剔除 `_id` / `__v` / `key` / `createdAt`，仅保留
 * 业务字段与 `updatedAt`。
 */

export interface LinkItem {
  label: string;
  href: string;
  external?: boolean;
}

/** 真假标记：历史数据是 "yes" / ""，后台表单写入 boolean，两者都要兼容。 */
export type FlagValue = boolean | "yes" | "no" | "";

export interface StatItem {
  value: string;
  label: string;
  unit?: string;
  suffix?: string;
}

export interface TitleDescriptionItem {
  title: string;
  description: string;
}

export interface SeoInfo {
  title: string;
  description: string;
  keywords: string;
}

/** GET /site · PUT /site */
export interface SiteConfig {
  name: string;
  nameEn: string;
  logoText: string;
  logoSub: string;
  nav: LinkItem[];
  contactEmail: string;
  businessEmail: string;
  phone: string;
  address: string;
  icp: string;
  seo: SeoInfo;
  footerLinks: LinkItem[];
  updatedAt?: string;
}

export type MediaCategory = "Social" | "Search" | "Content" | "Ads";

export const MEDIA_CATEGORIES: { label: string; value: MediaCategory }[] = [
  { label: "社交（Social）", value: "Social" },
  { label: "搜索（Search）", value: "Search" },
  { label: "内容（Content）", value: "Content" },
  { label: "广告（Ads）", value: "Ads" },
];

export interface MediaPartner {
  name: string;
  mark: string;
  category: MediaCategory;
  accent?: string;
}

export interface HeroSection {
  eyebrow: string;
  title: string;
  titleEn: string;
  description: string;
  primaryCta: LinkItem;
  secondaryCta: LinkItem;
  marquee: string[];
  stats: { value: string; label: string }[];
}

export interface MediaSection {
  title: string;
  subtitle: string;
  benefits: TitleDescriptionItem[];
  partners: MediaPartner[];
  cta: LinkItem;
}

export interface FlowFeature {
  title: string;
  description: string;
  mark?: string;
  /** `/` 分隔的要点 */
  points?: string;
}

export interface FlowSection {
  eyebrow: string;
  title: string;
  description: string;
  orbit: { label: string }[];
  features: FlowFeature[];
  cta: LinkItem;
}

export interface ClientIndustry {
  key: string;
  name: string;
  description: string;
  stat: string;
}

export interface ClientSection {
  title: string;
  subtitle: string;
  industries: ClientIndustry[];
  logos: { name: string; industry: string }[];
}

export interface StrengthNode {
  city: string;
  role: string;
  x: number | string;
  y: number | string;
  major?: FlagValue;
}

export interface StrengthSection {
  title: string;
  description: string;
  nodes: StrengthNode[];
  stats: StatItem[];
  cta: LinkItem;
}

export interface HonorGroup {
  key: string;
  title: string;
  items: { title: string; issuer: string; year: string }[];
}

export interface HonorsSection {
  title: string;
  subtitle: string;
  groups: HonorGroup[];
}

export interface HomeContent {
  hero: HeroSection;
  media: MediaSection;
  flow: FlowSection;
  clients: ClientSection;
  strength: StrengthSection;
  honors: HonorsSection;
  updatedAt?: string;
}

/** GET /home + PUT /home/:section */
export type HomeSectionKey = "hero" | "media" | "flow" | "clients" | "strength" | "honors";

export const HOME_SECTIONS: { key: HomeSectionKey; label: string; description: string }[] = [
  { key: "hero", label: "Hero 区", description: "首屏主标题、按钮与数据指标" },
  { key: "media", label: "媒体资源区", description: "媒体伙伴墙与权益说明" },
  { key: "flow", label: "Flow AI 区", description: "自研系统能力与环形标签" },
  { key: "clients", label: "客户选择区", description: "行业分类与客户 Logo 墙" },
  { key: "strength", label: "公司实力区", description: "全球化节点地图与数据" },
  { key: "honors", label: "企业荣誉区", description: "资质与行业认可" },
];

/** GET /about · PUT /about */
export interface AboutContent {
  heroEyebrow: string;
  heroTitle: string;
  heroDescription: string;
  stats: StatItem[];
  visionTitle: string;
  visionText: string;
  values: TitleDescriptionItem[];
  timeline: { period: string; title: string; description: string }[];
  team: { name: string; role: string; bio: string; avatar?: string }[];
  teamIntro: string;
  offices: { city: string; label: string; address: string }[];
  updatedAt?: string;
}

/** GET /careers/content · PUT /careers/content */
export interface CareersContent {
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  citiesEyebrow: string;
  citiesTitle: string;
  citiesDescription: string;
  cultureTitle: string;
  culture: TitleDescriptionItem[];
  benefitsTitle: string;
  benefits: { group: string; items: string }[];
  jobsEyebrow: string;
  jobsTitle: string;
  portalUrl: string;
  applyEmail: string;
  updatedAt?: string;
}

/** 单文档模块（用于统一的加载 / 保存逻辑） */
export type SingletonContent = SiteConfig | HomeContent | AboutContent | CareersContent;
