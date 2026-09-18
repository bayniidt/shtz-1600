/**
 * Shared domain types for the ADFLY site.
 *
 * All page content is driven by a single JSON document (`data/site.json`)
 * so the admin panel can update any part of the site at runtime.
 */

export interface NavItem {
  label: string;
  href: string;
  external?: boolean;
}

export interface CtaLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface SiteConfig {
  name: string;
  nameEn: string;
  /** Brand mark text, e.g. "ADFLY" */
  logoText: string;
  logoSub: string;
  nav: NavItem[];
  contactEmail: string;
  businessEmail: string;
  phone: string;
  address: string;
  icp: string;
  seo: {
    title: string;
    description: string;
    keywords: string;
  };
  footerLinks: NavItem[];
}

/* ------------------------------- Home ---------------------------------- */

export interface HeroContent {
  eyebrow: string;
  title: string;
  titleEn: string;
  description: string;
  primaryCta: CtaLink;
  secondaryCta: CtaLink;
  marquee: string[];
  stats: { value: string; label: string }[];
}

export interface MediaPartner {
  name: string;
  /** Short text/wordmark rendered in the logo wall */
  mark: string;
  category: "Social" | "Search" | "Content" | "Ads";
  accent?: string;
}

export interface MediaSectionContent {
  title: string;
  subtitle: string;
  benefits: { title: string; description: string }[];
  partners: MediaPartner[];
  cta: CtaLink;
}

export interface FlowFeature {
  title: string;
  description: string;
  /** Short product mark shown on the wheel node, e.g. "Flow Creative". */
  mark?: string;
  /** Highlights, slash separated (same convention as careers benefits). */
  points?: string;
}

export interface FlowSectionContent {
  eyebrow: string;
  title: string;
  /** Optional hint line under the heading. */
  description?: string;
  orbit: { label: string }[];
  features: FlowFeature[];
  cta: CtaLink;
}

export interface ClientIndustry {
  key: string;
  name: string;
  description: string;
  stat: string;
}

export interface ClientLogo {
  name: string;
  industry: string;
}

export interface ClientsSectionContent {
  title: string;
  subtitle: string;
  industries: ClientIndustry[];
  logos: ClientLogo[];
}

export interface OfficeNode {
  city: string;
  role: string;
  x: number | string;
  y: number | string;
  major?: boolean | string;
}

export interface StrengthSectionContent {
  title: string;
  description: string;
  nodes: OfficeNode[];
  stats: { value: string; suffix: string; label: string }[];
  cta: CtaLink;
}

export interface HonorItem {
  title: string;
  issuer: string;
  year: string;
}

export interface HonorsSectionContent {
  title: string;
  subtitle: string;
  groups: { key: string; title: string; items: HonorItem[] }[];
}

export interface HomeContent {
  hero: HeroContent;
  media: MediaSectionContent;
  flow: FlowSectionContent;
  clients: ClientsSectionContent;
  strength: StrengthSectionContent;
  honors: HonorsSectionContent;
}

/* ------------------------------- Cases --------------------------------- */

export type IndustryKey = "ecommerce" | "game" | "app" | "brand";

export interface CaseStat {
  value: string;
  unit?: string;
  label: string;
}

export interface CaseBlock {
  key: string;
  title: string;
  body: string[];
  points?: string[];
}

export interface CaseItem {
  id: string;
  title: string;
  client: string;
  industry: IndustryKey;
  region: string;
  summary: string;
  cover: string;
  awards: string[];
  tags: string[];
  year: string;
  featured: boolean;
  stats: CaseStat[];
  blocks: CaseBlock[];
}

export interface CasesPageContent {
  title: string;
  subtitle: string;
  filters: { key: IndustryKey | "all"; label: string }[];
}

/* ------------------------------- About --------------------------------- */

export interface TimelineItem {
  period: string;
  title: string;
  description: string;
}

export interface TeamMember {
  name: string;
  role: string;
  bio: string;
  avatar?: string;
}

export interface Office {
  city: string;
  label: string;
  address: string;
}

export interface AboutContent {
  heroEyebrow: string;
  heroTitle: string;
  heroDescription: string;
  stats: { value: string; unit: string; label: string }[];
  visionTitle: string;
  visionText: string;
  values: { title: string; description: string }[];
  timeline: TimelineItem[];
  team: TeamMember[];
  teamIntro: string;
  offices: Office[];
}

/* ------------------------------ Careers -------------------------------- */

export interface CareersCity {
  /** URL slug, e.g. "shanghai" — used by /careers/cities/[id]. */
  id: string;
  name: string;
  nameEn?: string;
  /** External ATS city code (documentation only), e.g. "CT_125". */
  code?: string;
  summary?: string;
  /** `"yes"` keeps the city in the highlighted index grid. */
  featured?: boolean | string;
}

export interface CareersPosition {
  /** URL slug, e.g. the ATS position id — used by /careers/jobs/[id]. */
  id: string;
  title: string;
  /** Primary city id. */
  cityId: string;
  /** Additional city ids, slash separated (e.g. "shenzhen/chengdu"). */
  extraCities?: string;
  /** 全职 / 实习 / 校招 … */
  type?: string;
  department?: string;
  /** Free tags, slash separated. */
  tags?: string;
  urgent?: boolean | string;
  /** `"yes"` shows the position in 热招职位 on /careers. */
  hot?: boolean | string;
  publishedAt?: string;
  summary?: string;
  /** 岗位职责 — one item per line. */
  description: string;
  /** 任职要求 — one item per line. */
  requirement?: string;
  /** 加分项 — one item per line. */
  bonus?: string;
  /** External apply link (optional). */
  applyUrl?: string;
}

export interface CareersContent {
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  citiesEyebrow: string;
  citiesTitle: string;
  citiesDescription: string;
  cultureTitle: string;
  culture: { title: string; description: string }[];
  benefitsTitle: string;
  benefits: { group: string; items: string }[];
  jobsEyebrow: string;
  jobsTitle: string;
  cities: CareersCity[];
  positions: CareersPosition[];
  /** External ATS portal (optional secondary CTA). */
  portalUrl: string;
  applyEmail: string;
}

/* ------------------------------- Root ---------------------------------- */

export interface SiteData {
  site: SiteConfig;
  home: HomeContent;
  cases: { page: CasesPageContent; items: CaseItem[] };
  about: AboutContent;
  careers: CareersContent;
}
