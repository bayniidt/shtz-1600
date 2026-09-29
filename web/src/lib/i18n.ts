export type Locale = "zh" | "en";

export interface UiCopy {
  header: {
    openMenu: string;
    closeMenu: string;
    freeAccount: string;
  };
  footer: {
    getInTouch: string;
    title: string;
    description: string;
    contactUs: string;
    navigation: string;
    business: string;
    customerService: string;
    phone: string;
    rights: string;
  };
  home: {
    mediaResources: string;
    dashboardTitle: string;
    running: string;
    exposure: string;
    clicks: string;
    conversions: string;
    mediaMatrix: string;
    directChannels: string;
    offer: string;
    aiAsset: string;
    mediaChannels: string;
    honorItems: (count: number) => string;
  };
  about: {
    contactUs: string;
    joinUs: string;
    developmentHistory: string;
    developmentDescription: string;
    teamTitle: string;
    globalLayout: string;
    globalDescription: string;
  };
  cases: {
    filterLabel: string;
    empty: string;
    featured: string;
    viewCase: string;
    breadcrumb: string;
    projectReview: string;
    relatedCases: string;
    viewAll: string;
    client: string;
    industry: string;
    region: string;
    year: string;
  };
  careers: {
    viewOpenings: string;
    submitResume: string;
    citiesAndJobs: (cities: number, jobs: number) => string;
    hiringCities: string;
    cityIndex: string;
    featuredJobs: string;
    cultureDescription: string;
    benefitsDescription: string;
    cityJobs: (count: number) => string;
    viewPositions: string;
    totalJobs: (count: number) => string;
    resumeEmail: string;
    jobsDescription: (email: string) => string;
    urgent: string;
    viewDetails: string;
    browseCities: string;
    otherCities: string;
    noOpenings: (city: string) => string;
    keepRecruiting: (email: string) => string;
    backToCityIndex: string;
    responsibilities: string;
    requirements: string;
    bonus: string;
    applyForRole: string;
    sendResumeTo: (email: string) => string;
    emailSubject: string;
    emailApply: string;
    portalApply: string;
    relatedRoles: string;
    publishedAt: (date: string) => string;
  };
}

const ZH: UiCopy = {
  header: {
    openMenu: "打开菜单",
    closeMenu: "关闭菜单",
    freeAccount: "免费开户",
  },
  footer: {
    getInTouch: "GET IN TOUCH",
    title: "全球成功，从这里开始",
    description: "欢迎咨询任何跨境出海问题的解决方案。",
    contactUs: "联系我们",
    navigation: "网站导航",
    business: "商务合作",
    customerService: "客户咨询",
    phone: "电话",
    rights: "All Rights Reserved.",
  },
  home: {
    mediaResources: "合作媒体资源",
    dashboardTitle: "投放效果实时看板",
    running: "运行中",
    exposure: "曝光",
    clicks: "点击",
    conversions: "转化",
    mediaMatrix: "媒体资源矩阵",
    directChannels: "直连渠道",
    offer: "官方一级代理 · 0 元开户 · 最快当天过审",
    aiAsset: "素材自动生成",
    mediaChannels: "媒体渠道直连",
    honorItems: (count) => `${count} 项`,
  },
  about: {
    contactUs: "联系我们",
    joinUs: "加入我们",
    developmentHistory: "发展历程",
    developmentDescription: "从 2017 年至今，持续深耕出海效果营销与智能广告技术。",
    teamTitle: "我们的精英团队",
    globalLayout: "全球布局",
    globalDescription:
      "以上海为总部，辐射广州、北京、成都与日本，为出海客户提供在地化服务。",
  },
  cases: {
    filterLabel: "行业筛选",
    empty: "该分类下暂无案例。",
    featured: "精选",
    viewCase: "查看案例",
    breadcrumb: "客户案例",
    projectReview: "项目复盘",
    relatedCases: "相关案例",
    viewAll: "查看全部案例 →",
    client: "客户",
    industry: "行业",
    region: "地区",
    year: "年份",
  },
  careers: {
    viewOpenings: "查看在招岗位",
    submitResume: "投递简历",
    citiesAndJobs: (cities, jobs) => `${cities} 个招聘城市 · ${jobs} 个在招职位`,
    hiringCities: "招聘城市",
    cityIndex: "招聘城市索引 →",
    featuredJobs: "热招职位 →",
    cultureDescription: "ADFLY 坚信，优秀的企业文化可以使我们看得更远、走得更稳。",
    benefitsDescription: "开放多元的团队氛围、完善多样的内部培训，让所有员工快乐成长。",
    cityJobs: (count) => `${count} 个在招职位`,
    viewPositions: "查看职位 →",
    totalJobs: (count) => `共 ${count} 个在招职位`,
    resumeEmail: "简历投递",
    jobsDescription: (email) => `简历投递：${email}，或进入职位详情查看完整岗位说明。`,
    urgent: "急聘",
    viewDetails: "查看详情 →",
    browseCities: "浏览全部招聘城市",
    otherCities: "其他城市：",
    noOpenings: (city) => `${city}暂无在招职位`,
    keepRecruiting: (email) =>
      `我们仍在持续招聘，欢迎投递简历至 ${email}，或查看其他城市的机会。`,
    backToCityIndex: "返回城市索引",
    responsibilities: "岗位职责",
    requirements: "任职要求",
    bonus: "加分项",
    applyForRole: "投递这个职位",
    sendResumeTo: (email) => `发送简历至 ${email}，邮件标题请注明：`,
    emailSubject: "应聘",
    emailApply: "邮件投递简历",
    portalApply: "招聘系统投递",
    relatedRoles: "其他相关职位",
    publishedAt: (date) => `发布于 ${date}`,
  },
};

const EN: UiCopy = {
  header: {
    openMenu: "Open menu",
    closeMenu: "Close menu",
    freeAccount: "Open an Account",
  },
  footer: {
    getInTouch: "GET IN TOUCH",
    title: "Global success starts here",
    description: "Talk to us about your cross-border growth challenges.",
    contactUs: "Contact us",
    navigation: "Navigation",
    business: "Business",
    customerService: "Client Support",
    phone: "Phone",
    rights: "All Rights Reserved.",
  },
  home: {
    mediaResources: "Media Partners",
    dashboardTitle: "Live Campaign Dashboard",
    running: "Live",
    exposure: "Impressions",
    clicks: "Clicks",
    conversions: "Conversions",
    mediaMatrix: "Media Network",
    directChannels: "direct channels",
    offer: "Official tier-one agency · No setup fee · Same-day approval",
    aiAsset: "AI creative generation",
    mediaChannels: "direct media channels",
    honorItems: (count) => `${count} items`,
  },
  about: {
    contactUs: "Contact us",
    joinUs: "Join us",
    developmentHistory: "Our Journey",
    developmentDescription:
      "Since 2017, we have focused on performance marketing and intelligent advertising technology for global growth.",
    teamTitle: "Our Leadership Team",
    globalLayout: "Global Presence",
    globalDescription:
      "Headquartered in Shanghai with teams across Guangzhou, Beijing, Chengdu and Japan, delivering localized support worldwide.",
  },
  cases: {
    filterLabel: "Filter by industry",
    empty: "No cases are available in this category.",
    featured: "Featured",
    viewCase: "View case",
    breadcrumb: "Customer Cases",
    projectReview: "Project Review",
    relatedCases: "Related Cases",
    viewAll: "View all cases →",
    client: "Client",
    industry: "Industry",
    region: "Region",
    year: "Year",
  },
  careers: {
    viewOpenings: "View open roles",
    submitResume: "Send your resume",
    citiesAndJobs: (cities, jobs) => `${cities} hiring cities · ${jobs} open roles`,
    hiringCities: "Hiring cities",
    cityIndex: "City index →",
    featuredJobs: "Featured roles →",
    cultureDescription:
      "We believe a strong culture helps our people see farther and grow with confidence.",
    benefitsDescription:
      "An open, diverse team and structured learning programs help every employee grow.",
    cityJobs: (count) => `${count} open roles`,
    viewPositions: "View roles →",
    totalJobs: (count) => `${count} open roles`,
    resumeEmail: "Send your resume to",
    jobsDescription: (email) =>
      `Send your resume to ${email}, or open a role to view the full description.`,
    urgent: "Urgent",
    viewDetails: "View details →",
    browseCities: "Browse all hiring cities",
    otherCities: "Other cities:",
    noOpenings: (city) => `No open roles in ${city} right now`,
    keepRecruiting: (email) =>
      `We are still hiring. Send your resume to ${email} or explore opportunities in another city.`,
    backToCityIndex: "Back to city index",
    responsibilities: "Responsibilities",
    requirements: "Requirements",
    bonus: "Preferred Qualifications",
    applyForRole: "Apply for this role",
    sendResumeTo: (email) => `Send your resume to ${email} with this subject:`,
    emailSubject: "Application",
    emailApply: "Apply by Email",
    portalApply: "Apply through Portal",
    relatedRoles: "Related Roles",
    publishedAt: (date) => `Published ${date}`,
  },
};

export const UI_COPY: Record<Locale, UiCopy> = {
  zh: ZH,
  en: EN,
};

export function localizedHref(href: string, locale: Locale): string {
  if (locale === "zh" || !href.startsWith("/") || href.startsWith("//")) return href;
  if (href === "/") return "/en";
  if (href.startsWith("/en/")) return href;
  return `/en${href}`;
}

export function alternateLocaleHref(pathname: string, locale: Locale): string {
  if (locale === "zh") return pathname === "/" ? "/en" : `/en${pathname}`;
  return pathname === "/en" ? "/" : pathname.replace(/^\/en(?=\/|$)/, "") || "/";
}
