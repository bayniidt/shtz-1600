"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSession, destroySession, verifyPassword } from "@/lib/auth";
import { getSiteData, saveSiteData } from "@/lib/db";
import { assignPath, parseFormData } from "@/lib/form";
import type { ActionState } from "@/lib/action-state";
import type { CareersCity, CareersPosition, CaseBlock, CaseItem, CaseStat, SiteData } from "@/types";

function revalidateAll() {
  revalidatePath("/", "layout");
}

/* ------------------------------- Auth ---------------------------------- */

export async function loginAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const password = String(formData.get("password") ?? "");
  if (!verifyPassword(password)) {
    return { status: "error", message: "密码不正确，请重试。" };
  }
  await createSession();
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/admin/login");
}

/* --------------------------- Generic section ---------------------------- */

export async function saveSectionAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const target = String(formData.get("__path") ?? "");
  const label = String(formData.get("__label") ?? target);
  if (!target) return { status: "error", message: "缺少保存目标路径。" };

  const parsed = parseFormData(formData);
  const data = structuredClone(getSiteData()) as unknown as Record<string, unknown>;

  // `__checkbox` fields arrive only when checked; normalise booleans.
  for (const key of formData.keys()) {
    if (key.startsWith("__bool__")) {
      const path = key.replace("__bool__", "");
      assignPath(parsed, path, formData.get(key) === "on");
    }
  }

  assignPath(data, target, parsed);
  saveSiteData(data as unknown as SiteData);
  revalidateAll();

  return { status: "success", message: `${label} 已保存` };
}

/* ------------------------------- Cases ---------------------------------- */

const INDUSTRY_KEYS = ["ecommerce", "game", "app", "brand"] as const;

function toIndustry(value: string): CaseItem["industry"] {
  return (INDUSTRY_KEYS as readonly string[]).includes(value)
    ? (value as CaseItem["industry"])
    : "ecommerce";
}

function num(formData: FormData, key: string): number {
  return Number(formData.get(key) ?? 0);
}

export async function saveCaseAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const data = getSiteData();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { status: "error", message: "案例 ID 不能为空。" };

  const statCount = num(formData, "__statCount");
  const stats: CaseStat[] = [];
  for (let i = 0; i < statCount; i += 1) {
    const value = String(formData.get(`stat_${i}_value`) ?? "");
    const label = String(formData.get(`stat_${i}_label`) ?? "");
    if (!value && !label) continue;
    stats.push({ value, unit: String(formData.get(`stat_${i}_unit`) ?? ""), label });
  }

  const blockCount = num(formData, "__blockCount");
  const blocks: CaseBlock[] = [];
  for (let i = 0; i < blockCount; i += 1) {
    const title = String(formData.get(`block_${i}_title`) ?? "");
    if (!title) continue;
    blocks.push({
      key: String(formData.get(`block_${i}_key`) ?? `block-${i}`),
      title,
      body: String(formData.get(`block_${i}_body`) ?? "")
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
      points: String(formData.get(`block_${i}_points`) ?? "")
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
    });
  }

  const split = (key: string) =>
    String(formData.get(key) ?? "")
      .split(/[,，\n]/)
      .map((item) => item.trim())
      .filter(Boolean);

  const next: CaseItem = {
    id,
    title: String(formData.get("title") ?? ""),
    client: String(formData.get("client") ?? ""),
    industry: toIndustry(String(formData.get("industry") ?? "")),
    region: String(formData.get("region") ?? ""),
    summary: String(formData.get("summary") ?? ""),
    cover: String(formData.get("cover") ?? ""),
    awards: split("awards"),
    tags: split("tags"),
    year: String(formData.get("year") ?? ""),
    featured: formData.get("featured") === "on",
    stats,
    blocks,
  };

  const index = data.cases.items.findIndex((item) => item.id === id);
  if (index >= 0) {
    data.cases.items[index] = next;
  } else {
    data.cases.items.unshift(next);
  }
  saveSiteData(data);
  revalidateAll();
  redirect(`/admin/cases/${id}`);
}

export async function deleteCaseAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const data = getSiteData();
  data.cases.items = data.cases.items.filter((item) => item.id !== id);
  saveSiteData(data);
  revalidateAll();
  redirect("/admin/cases");
}

export async function createCaseAction(): Promise<void> {
  const data = getSiteData();
  let n = data.cases.items.length + 1;
  let id = `new-case-${n}`;
  while (data.cases.items.some((item) => item.id === id)) {
    n += 1;
    id = `new-case-${n}`;
  }
  data.cases.items.unshift({
    id,
    title: "新案例标题",
    client: "客户名称",
    industry: "ecommerce",
    region: "全球",
    summary: "请在此填写案例简介。",
    cover: "/images/adfly/banner01.png",
    awards: [],
    tags: [],
    year: String(new Date().getFullYear()),
    featured: false,
    stats: [{ value: "0", unit: "%", label: "核心指标" }],
    blocks: [{ key: "background", title: "项目背景", body: ["请填写项目背景。"] }],
  });
  saveSiteData(data);
  revalidateAll();
  redirect(`/admin/cases/${id}`);
}

/* ------------------------------ Careers --------------------------------- */

function slugify(value: string, fallback: string): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || fallback;
}

function uniqueId(existing: string[], base: string): string {
  let id = base;
  let n = 2;
  while (existing.includes(id)) {
    id = `${base}-${n}`;
    n += 1;
  }
  return id;
}

export async function saveCityAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const data = getSiteData();
  const original = String(formData.get("__originalId") ?? "").trim();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { status: "error", message: "城市标识不能为空。" };
  if (id !== original && data.careers.cities.some((city) => city.id === id)) {
    return { status: "error", message: `城市标识 ${id} 已存在。` };
  }
  if (id !== original && !data.careers.cities.some((city) => city.id === original)) {
    return { status: "error", message: "找不到要保存的城市。" };
  }

  const next: CareersCity = {
    id,
    name: String(formData.get("name") ?? "").trim() || id,
    nameEn: String(formData.get("nameEn") ?? "").trim(),
    code: String(formData.get("code") ?? "").trim(),
    summary: String(formData.get("summary") ?? "").trim(),
    featured: formData.get("featured") === "on" ? "yes" : "",
  };

  if (id !== original) {
    // Renaming a city rewrites every position that references it.
    for (const position of data.careers.positions) {
      if (position.cityId === original) position.cityId = id;
      const extras = (position.extraCities ?? "")
        .split("/")
        .map((item) => item.trim())
        .filter(Boolean)
        .map((item) => (item === original ? id : item));
      position.extraCities = extras.join("/");
    }
  }

  const index = data.careers.cities.findIndex((city) => city.id === original);
  // Object.assign keeps the stored key order (and any extra keys) stable.
  if (index >= 0) Object.assign(data.careers.cities[index], next);
  else data.careers.cities.push(next);

  saveSiteData(data);
  revalidateAll();

  if (id !== original) redirect(`/admin/careers/cities/${id}`);
  return { status: "success", message: `城市 ${next.name} 已保存` };
}

export async function createCityAction(formData: FormData): Promise<void> {
  const data = getSiteData();
  const name = String(formData.get("name") ?? "").trim() || "新城市";
  const fallback = `city-${data.careers.cities.length + 1}`;
  const id = uniqueId(
    data.careers.cities.map((city) => city.id),
    slugify(String(formData.get("id") ?? "").trim() || name, fallback),
  );
  data.careers.cities.push({ id, name, nameEn: "", code: "", summary: "", featured: "yes" });
  saveSiteData(data);
  revalidateAll();
  redirect(`/admin/careers/cities/${id}`);
}

export async function deleteCityAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const data = getSiteData();
  data.careers.cities = data.careers.cities.filter((city) => city.id !== id);
  // Positions pointing at the removed city fall back to the first city.
  const fallback = data.careers.cities[0]?.id ?? "";
  for (const position of data.careers.positions) {
    if (position.cityId === id) position.cityId = fallback;
    const extras = (position.extraCities ?? "")
      .split("/")
      .map((item) => item.trim())
      .filter((item) => item && item !== id);
    position.extraCities = extras.join("/");
  }
  saveSiteData(data);
  revalidateAll();
  redirect("/admin/careers");
}

export async function savePositionAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const data = getSiteData();
  const original = String(formData.get("__originalId") ?? "").trim();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { status: "error", message: "职位标识不能为空。" };
  if (id !== original && data.careers.positions.some((item) => item.id === id)) {
    return { status: "error", message: `职位标识 ${id} 已存在。` };
  }

  const cityIds = data.careers.cities.map((city) => city.id);
  const primary = String(formData.get("cityId") ?? "").trim();
  if (!cityIds.includes(primary)) {
    return { status: "error", message: "请选择有效的招聘城市。" };
  }

  const extraCities = String(formData.get("extraCities") ?? "")
    .split(/[/,，、\n]/)
    .map((item) => item.trim())
    .filter((item) => item && item !== primary && cityIds.includes(item));

  const next: CareersPosition = {
    id,
    title: String(formData.get("title") ?? "").trim(),
    cityId: primary,
    extraCities: extraCities.join("/"),
    type: String(formData.get("type") ?? "").trim(),
    department: String(formData.get("department") ?? "").trim(),
    tags: String(formData.get("tags") ?? "").trim(),
    urgent: formData.get("urgent") === "on" ? "yes" : "",
    hot: formData.get("hot") === "on" ? "yes" : "",
    publishedAt: String(formData.get("publishedAt") ?? "").trim(),
    summary: String(formData.get("summary") ?? "").trim(),
    description: String(formData.get("description") ?? "").replace(/\r\n/g, "\n").trim(),
    requirement: String(formData.get("requirement") ?? "").replace(/\r\n/g, "\n").trim(),
    bonus: String(formData.get("bonus") ?? "").replace(/\r\n/g, "\n").trim(),
    applyUrl: String(formData.get("applyUrl") ?? "").trim(),
  };

  const index = data.careers.positions.findIndex((item) => item.id === original);
  if (index >= 0) Object.assign(data.careers.positions[index], next);
  else data.careers.positions.unshift(next);

  saveSiteData(data);
  revalidateAll();

  if (id !== original) redirect(`/admin/careers/positions/${id}`);
  return { status: "success", message: `职位 ${next.title || id} 已保存` };
}

export async function createPositionAction(formData: FormData): Promise<void> {
  const data = getSiteData();
  const title = String(formData.get("title") ?? "").trim() || "新职位";
  const fallback = `position-${data.careers.positions.length + 1}`;
  const id = uniqueId(
    data.careers.positions.map((item) => item.id),
    slugify(String(formData.get("id") ?? "").trim() || title, fallback),
  );
  data.careers.positions.unshift({
    id,
    title,
    cityId: data.careers.cities[0]?.id ?? "",
    extraCities: "",
    type: "全职",
    department: "",
    tags: "",
    urgent: "",
    hot: "",
    publishedAt: "",
    summary: "",
    description: "请填写岗位职责，每行一条。",
    requirement: "请填写任职要求，每行一条。",
    bonus: "",
    applyUrl: "",
  });
  saveSiteData(data);
  revalidateAll();
  redirect(`/admin/careers/positions/${id}`);
}

export async function deletePositionAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const data = getSiteData();
  data.careers.positions = data.careers.positions.filter((item) => item.id !== id);
  saveSiteData(data);
  revalidateAll();
  redirect("/admin/careers");
}
