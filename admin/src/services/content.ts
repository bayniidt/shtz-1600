import type {
  AboutContent,
  CareersContent,
  HomeContent,
  HomeSectionKey,
  SiteConfig,
} from "@/types/content";
import { apiGet, apiPut } from "@/services/request";

/* ------------------------------- 站点与导航 ------------------------------- */

export function fetchSite(): Promise<SiteConfig> {
  return apiGet<SiteConfig>("/site");
}

export function saveSite(payload: SiteConfig): Promise<SiteConfig> {
  return apiPut<SiteConfig>("/site", payload);
}

/* --------------------------------- 首页 --------------------------------- */

export function fetchHome(): Promise<HomeContent> {
  return apiGet<HomeContent>("/home");
}

/** 局部保存某个板块，返回更新后的首页全量内容。 */
export function saveHomeSection<T extends HomeSectionKey>(
  section: T,
  payload: HomeContent[T],
): Promise<HomeContent> {
  return apiPut<HomeContent>(`/home/${section}`, payload);
}

/* -------------------------------- 关于我们 -------------------------------- */

export function fetchAbout(): Promise<AboutContent> {
  return apiGet<AboutContent>("/about");
}

export function saveAbout(payload: AboutContent): Promise<AboutContent> {
  return apiPut<AboutContent>("/about", payload);
}

/* ------------------------------- 招聘文案 -------------------------------- */

export function fetchCareersContent(): Promise<CareersContent> {
  return apiGet<CareersContent>("/careers/content");
}

export function saveCareersContent(payload: CareersContent): Promise<CareersContent> {
  return apiPut<CareersContent>("/careers/content", payload);
}

/** 内容模块的资源描述（供 useContentResource 使用）。 */
export const contentResources = {
  site: { load: fetchSite, save: saveSite },
  home: { load: fetchHome, save: (payload: HomeContent) => saveHomeSection("hero", payload.hero) },
  about: { load: fetchAbout, save: saveAbout },
  careersContent: { load: fetchCareersContent, save: saveCareersContent },
};
