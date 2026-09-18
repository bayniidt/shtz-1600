/**
 * 后台各模块的接口蓝图。
 *
 * `implemented: true` 表示该模块已在后台提供可视化编辑页（Stage 2 已完成 4 个内容模块）；
 * 其余模块仍由 ModuleScaffold 展示「接口已注册、业务待实现」的清单。
 * Stage 6 会改为直接读取 `/api/docs/openapi.json`，此处随之退役。
 */
export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

export interface EndpointDoc {
  method: HttpMethod;
  path: string;
  label: string;
  /** 是否需要登录（Authorization: Bearer） */
  auth: boolean;
}

export interface ModuleBlueprint {
  key: string;
  title: string;
  /** 计划实现的阶段 */
  stage: string;
  /** 是否已有可视化编辑页（Stage 2 起为 true） */
  implemented?: boolean;
  description: string;
  endpoints: EndpointDoc[];
}

export const MODULE_BLUEPRINTS: Record<string, ModuleBlueprint> = {
  site: {
    key: "site",
    title: "站点与导航",
    stage: "Stage 2",
    implemented: true,
    description: "站点名称、Logo、备案信息、顶部/底部导航与页脚配置（单文档）。",
    endpoints: [
      { method: "GET", path: "/site", label: "读取站点配置", auth: false },
      { method: "PUT", path: "/site", label: "更新站点配置", auth: true },
    ],
  },
  home: {
    key: "home",
    title: "首页内容",
    stage: "Stage 2",
    implemented: true,
    description: "首页 Hero、媒体资源、Flow AI、客户选择、公司实力、企业荣誉 6 大板块。",
    endpoints: [
      { method: "GET", path: "/home", label: "读取首页 6 大板块", auth: false },
      { method: "PUT", path: "/home/hero", label: "更新 Hero 区", auth: true },
      { method: "PUT", path: "/home/media", label: "更新媒体资源区", auth: true },
      { method: "PUT", path: "/home/flow", label: "更新 Flow AI 区", auth: true },
      { method: "PUT", path: "/home/clients", label: "更新客户选择区", auth: true },
      { method: "PUT", path: "/home/strength", label: "更新公司实力区", auth: true },
      { method: "PUT", path: "/home/honors", label: "更新企业荣誉区", auth: true },
    ],
  },
  about: {
    key: "about",
    title: "关于我们",
    stage: "Stage 2",
    implemented: true,
    description: "公司简介、发展历程、资质奖项、联系方式等单文档内容。",
    endpoints: [
      { method: "GET", path: "/about", label: "读取关于我们", auth: false },
      { method: "PUT", path: "/about", label: "更新关于我们", auth: true },
    ],
  },
  careersContent: {
    key: "careersContent",
    title: "招聘内容",
    stage: "Stage 2",
    implemented: true,
    description: "招聘页面文案：页面标题、副标题、福利待遇、投递方式等。",
    endpoints: [
      { method: "GET", path: "/careers/content", label: "读取招聘页面文案", auth: false },
      { method: "PUT", path: "/careers/content", label: "更新招聘页面文案", auth: true },
    ],
  },
  cases: {
    key: "cases",
    title: "客户案例",
    stage: "Stage 3",
    implemented: true,
    description: "案例列表页文案 + 案例增删改查、标签筛选、首页置顶切换。",
    endpoints: [
      { method: "GET", path: "/cases/page", label: "读取案例列表页文案", auth: false },
      { method: "PUT", path: "/cases/page", label: "更新案例列表页文案", auth: true },
      { method: "GET", path: "/cases", label: "案例列表（分页/筛选/搜索）", auth: false },
      { method: "POST", path: "/cases", label: "新建案例", auth: true },
      { method: "GET", path: "/cases/{id}", label: "案例详情", auth: false },
      { method: "PUT", path: "/cases/{id}", label: "编辑案例", auth: true },
      { method: "DELETE", path: "/cases/{id}", label: "删除案例", auth: true },
      { method: "POST", path: "/cases/{id}/featured", label: "切换首页置顶", auth: true },
    ],
  },
  careersCities: {
    key: "careersCities",
    title: "招聘城市",
    stage: "Stage 4",
    description: "招聘城市维护；修改城市 id 时联动更新职位的归属与附加城市。",
    endpoints: [
      { method: "GET", path: "/careers/cities", label: "城市列表（含职位数）", auth: false },
      { method: "POST", path: "/careers/cities", label: "新建城市", auth: true },
      { method: "GET", path: "/careers/cities/{id}", label: "城市详情 + 该城市职位", auth: false },
      { method: "PUT", path: "/careers/cities/{id}", label: "编辑城市（改 id 联动职位）", auth: true },
      { method: "DELETE", path: "/careers/cities/{id}", label: "删除城市（职位回退）", auth: true },
    ],
  },
  careersPositions: {
    key: "careersPositions",
    title: "招聘职位",
    stage: "Stage 4",
    description: "职位维护：所属城市、附加城市、职责/要求/福利等列表型字段。",
    endpoints: [
      { method: "GET", path: "/careers/positions", label: "职位列表（筛选/分页）", auth: false },
      { method: "POST", path: "/careers/positions", label: "新建职位", auth: true },
      { method: "GET", path: "/careers/positions/{id}", label: "职位详情", auth: false },
      { method: "PUT", path: "/careers/positions/{id}", label: "编辑职位", auth: true },
      { method: "DELETE", path: "/careers/positions/{id}", label: "删除职位", auth: true },
    ],
  },
};

export type ModuleKey = keyof typeof MODULE_BLUEPRINTS;

export const METHOD_COLORS: Record<HttpMethod, string> = {
  GET: "blue",
  POST: "green",
  PUT: "orange",
  DELETE: "red",
};
