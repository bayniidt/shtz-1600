
# ADFLY Admin 管理后台开发计划

> 接手开发（或新开对话窗口）前，先读 [`HANDOFF.md`](./HANDOFF.md)：工程约定、验收命令、常见坑、各阶段剩余工作。

## 📋 需求摘要

| 项目 | 说明 |
|------|------|
| 前端技术栈 | React 18 + Ant Design Pro v6 + TypeScript + Vite 5 + Tailwind CSS v4 + Axios + React Router v6 |
| 后端技术栈 | Node.js + Express 4 + MongoDB 7 + Mongoose 8 + JWT + bcrypt |
| 部署方式 | 前后端分离，分别部署到自有服务器 |
| 默认账号 | 用户名 `admin` / 密码 `admin`（生产必须修改） |
| 后台访问路径 | `/admin`（前端 Vite 路由 base；或通过 Nginx 反向代理） |
| 风格要求 | 与前台 ADFLY 品牌色一致（蓝色主调），字体间距统一，**不使用动画效果** |
| 模块范围 | 站点与导航 / 首页 6 大板块 / 客户案例 CRUD / 关于我们 / 加入我们 / 招聘城市 / 招聘岗位列表 / 招聘岗位详情 |
| 测试要求 | 每个接口都有测试用例（正常 / 异常 / 边界），推荐 Jest + Supertest |
| 接口文档 | 每个接口都有文档（参数 / 返回值 / 错误码），推荐 Swagger UI + OpenAPI 3.0 |

---

## 🏗️ 项目目录结构

> 在当前项目根目录下新增两个子目录：`admin-frontend` 和 `admin-server`。现有 Next.js 前台（`src/app/*`、`data/site.json`）保持不变；后台接口上线后可修改 `src/lib/db.ts` 的实现，从「读 JSON」改为「读后端 REST API」，实现平滑迁移。

```
ai-website-cloner-template/
├── src/                          ← 现有 Next.js 前台（不改动，后续接后端 API）
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── types/
├── data/
│   └── site.json                 ← 现有 JSON 数据（作为 MongoDB 初始化数据源）
│
├── admin-frontend/               ← 【新建】Ant Design Pro 前端
│   ├── public/
│   ├── src/
│   │   ├── layouts/              ← BasicLayout（顶部导航 + 侧边栏 + 内容区）
│   │   ├── pages/
│   │   │   ├── Login/            ← /admin/login
│   │   │   ├── Dashboard/        ← /admin（概览）
│   │   │   ├── content/          ← 内容管理组
│   │   │   │   ├── Site/         ← 站点与导航
│   │   │   │   ├── Home/         ← 首页 6 大板块（6 个 Tab）
│   │   │   │   ├── About/        ← 关于我们
│   │   │   │   └── Careers/      ← 加入我们内容
│   │   │   ├── cases/            ← 客户案例 CRUD
│   │   │   │   ├── List/
│   │   │   │   └── Editor/       ← 新建/编辑（复用同一组件）
│   │   │   └── careers/          ← 招聘管理
│   │   │       ├── Overview/     ← 城市+职位总览
│   │   │       ├── CityEditor/
│   │   │       └── PositionEditor/
│   │   ├── components/           ← 表单/表格通用组件
│   │   │   ├── ProFormFields/    ← 自定义 ProForm 字段
│   │   │   ├── ArrayEditor/      ← 对象数组编辑器（媒体 Logo、奖项、案例板块…）
│   │   │   └── ImagePicker/      ← 图片上传/选择器
│   │   ├── services/             ← Axios 封装 + 各模块 API 函数
│   │   │   ├── request.ts        ← Axios 实例（拦截器、Token、401 跳转）
│   │   │   ├── auth.ts
│   │   │   ├── site.ts
│   │   │   ├── home.ts
│   │   │   ├── cases.ts
│   │   │   ├── about.ts
│   │   │   └── careers.ts
│   │   ├── models/               ← 全局状态（useModel or Zustand）
│   │   │   ├── login.ts
│   │   │   └── global.ts
│   │   ├── access.ts             ← Ant Design Pro 权限
│   │   ├── app.tsx               ← 初始化、路由守卫
│   │   ├── config/               ← 路由配置、主题配置（Token 与前台对齐）
│   │   │   ├── routes.ts
│   │   │   └── theme.ts
│   │   └── utils/
│   │       ├── constants.ts      ← 行业枚举、城市级联等
│   │       └── helpers.ts        ← slugify、表单转换等
│   ├── tests/                    ← 前端组件/页面 E2E（可选 Playwright）
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tailwind.config.ts        ← Tailwind v4（主色与前台 globals.css 一致）
│   ├── package.json
│   └── .env.example              ← VITE_API_BASE_URL=http://localhost:4000/api
│
└── admin-server/                 ← 【新建】Express + MongoDB 后端
    ├── src/
    │   ├── app.ts                ← Express 实例挂载
    │   ├── server.ts             ← http.createServer + 启动
    │   ├── config/
    │   │   ├── index.ts          ← env 读取：PORT/MONGO_URI/JWT_SECRET/ADMIN_PASSWORD…
    │   │   └── db.ts             ← Mongoose 连接
    │   ├── middlewares/
    │   │   ├── auth.ts           ← JWT 校验中间件（protect）
    │   │   ├── error.ts          ← 全局错误处理（统一错误结构）
    │   │   └── validate.ts       ← Zod 校验中间件
    │   ├── models/               ← Mongoose Schema（对应下方集合设计）
    │   │   ├── User.model.ts
    │   │   ├── SiteConfig.model.ts
    │   │   ├── HomeContent.model.ts
    │   │   ├── CaseItem.model.ts
    │   │   ├── CasesPageContent.model.ts
    │   │   ├── AboutContent.model.ts
    │   │   ├── CareersCity.model.ts
    │   │   ├── CareersPosition.model.ts
    │   │   └── CareersContent.model.ts
    │   ├── controllers/
    │   │   ├── auth.controller.ts
    │   │   ├── site.controller.ts
    │   │   ├── home.controller.ts
    │   │   ├── cases.controller.ts
    │   │   ├── about.controller.ts
    │   │   └── careers.controller.ts
    │   ├── routes/
    │   │   ├── auth.routes.ts
    │   │   ├── site.routes.ts
    │   │   ├── home.routes.ts
    │   │   ├── cases.routes.ts
    │   │   ├── about.routes.ts
    │   │   └── careers.routes.ts
    │   ├── services/
    │   │   ├── seed.service.ts   ← 从 data/site.json 初始化 MongoDB
    │   │   └── export.service.ts ← 反向导出 JSON 供前台文件模式使用（可选）
    │   ├── utils/
    │   │   ├── ApiError.ts       ← 自定义错误类
    │   │   ├── catchAsync.ts     ← async 路由捕获错误
    │   │   └── pick.ts           ← 辅助挑选字段
    │   ├── validations/          ← Zod schemas 每个接口的参数校验
    │   │   ├── auth.validation.ts
    │   │   ├── site.validation.ts
    │   │   ├── home.validation.ts
    │   │   ├── cases.validation.ts
    │   │   ├── about.validation.ts
    │   │   └── careers.validation.ts
    │   └── docs/
    │       ├── swagger.ts        ← Swagger UI 挂载
    │       └── openapi.json      ← OpenAPI 3.0 文档（自动/手写）
    │
    ├── tests/                    ← Jest + Supertest（每个接口 3 类用例）
    │   ├── auth.test.ts
    │   ├── site.test.ts
    │   ├── home.test.ts
    │   ├── cases.test.ts
    │   ├── about.test.ts
    │   └── careers.test.ts
    │
    ├── scripts/
    │   ├── seed.mjs              ← 首次初始化：把 data/site.json 写入 MongoDB
    │   └── export.mjs            ← 反向导出到 data/site.json（用于过渡阶段）
    │
    ├── jest.config.js
    ├── tsconfig.json
    ├── package.json
    └── .env.example              ← PORT=4000, MONGO_URI=..., JWT_SECRET=...
```

---

## 🗄️ MongoDB 数据模型与集合设计

与现有 `SiteData` 类型完全对齐（见 `src/types/index.ts`），按模块拆分为 8 个集合，便于单独更新与版本化。每个集合保留 `updatedAt` 字段方便缓存失效。

### 1. `users` 集合 — 后台用户

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `_id` | ObjectId | ✅ | 主键 |
| `username` | String(unique) | ✅ | 登录用户名，默认 `admin` |
| `passwordHash` | String | ✅ | bcrypt 加密后的密码 |
| `role` | String | ✅ | 默认 `admin`，预留 `editor` 扩展 |
| `lastLoginAt` | Date | ❌ | 最近一次登录 |
| `createdAt` / `updatedAt` | Date | ✅ | 自动 timestamps |

### 2. `site_configs` 集合 — 站点与导航

文档结构与 `SiteConfig` 接口完全一致（单文档，始终读第一条）：
```
{ name, nameEn, logoText, logoSub, nav: NavItem[], contactEmail, businessEmail, phone, address, icp, seo:{title,description,keywords}, footerLinks: NavItem[] }
```

### 3. `home_contents` 集合 — 首页 6 大板块

单文档，字段与 `HomeContent` 完全对应：
- `hero` → `HeroContent`（眉标/标题/英文/简介/双 CTA/滚动 marquee/指标）
- `media` → `MediaSectionContent`（标题/副标题/6 条权益 benefits/12 个 partners/CTA）
- `flow` → `FlowSectionContent`（眉标/标题/副标题/orbit 环形标签/features 数组/CTA）
- `clients` → `ClientsSectionContent`（标题/副标题/industries 行业卡/logos 客户墙）
- `strength` → `StrengthSectionContent`（标题/简介/地图节点 nodes/4 张 stats/CTA）
- `honors` → `HonorsSectionContent`（标题/副标题/分组 groups + 每条荣誉）

### 4. `cases_page_contents` 集合 — 客户案例列表页文案

单文档，对应 `CasesPageContent`：`{ title, subtitle, filters:[{key:"all"|"ecommerce"|"game"|"app"|"brand", label}] }`

### 5. `case_items` 集合 — 客户案例详情（CRUD 主集合）

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | String(unique) | URL slug，**创建后不可修改**（业务主键，区别于 _id） |
| `title` | String | 案例标题 |
| `client` | String | 客户名称 |
| `industry` | Enum | `ecommerce / game / app / brand` |
| `region` | String | 投放区域 |
| `summary` | String | 简介 |
| `cover` | String | 封面图路径 |
| `awards` | String[] | 所获奖项 |
| `tags` | String[] | 标签 |
| `year` | String | 年份 |
| `featured` | Boolean | 首页置顶 |
| `stats` | Array<{value,unit,label}> | 核心 KPI 指标（动态数组） |
| `blocks` | Array<{key,title,body:string[],points?:string[]}> | 内容板块（项目背景/挑战/方案/效果…） |
| `createdAt` / `updatedAt` | Date | timestamps |
| 索引 | `{id:1}` unique，`{industry:1}`，`{featured:1, updatedAt:-1}` | |

### 6. `about_contents` 集合 — 关于我们

单文档，对应 `AboutContent`：
`{heroEyebrow, heroTitle, heroDescription, stats:[{value,unit,label}], visionTitle, visionText, values:[{title,description}], timeline:[{period,title,description}], team:[{name,role,bio,avatar}], teamIntro, offices:[{city,label,address}] }`

### 7. `careers_cities` 集合 — 招聘城市

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | String(unique) | 城市标识 slug（URL 用），可修改，修改时联动 positions |
| `name` / `nameEn` | String | 中英文名 |
| `code` | String | 外部招聘系统城市代码（文档用） |
| `summary` | String | 城市简介 |
| `featured` | Boolean | 是否在首页索引展示 |
| 索引 | `{id:1}` unique |

### 8. `careers_positions` 集合 — 招聘岗位

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | String(unique) | 岗位标识 slug |
| `title` | String | 岗位名 |
| `cityId` | String → FK `careers_cities.id` | 主要城市 |
| `extraCities` | String | 其他城市标识，`/` 分隔（例 `shenzhen/chengdu`） |
| `type` | String | 全职/实习/校招… |
| `department` | String | 部门 |
| `tags` | String | 标签，逗号或换行分隔 |
| `urgent` / `hot` | Boolean | 急聘/热招标记 |
| `publishedAt` | String | 发布日期（ISO 字符串） |
| `summary` | String | 简介（留空自动截取 description 首行） |
| `description` | String | 岗位职责（每行一条） |
| `requirement` | String | 任职要求（每行一条） |
| `bonus` | String | 加分项（每行一条） |
| `applyUrl` | String | 外部投递链接（可选） |
| 索引 | `{id:1}` unique，`{cityId:1}`，`{hot:1, publishedAt:-1}` |

### 9. `careers_contents` 集合 — 加入我们页面文案

单文档，对应 `CareersContent`：
`{heroTitle, heroSubtitle, heroDescription, citiesEyebrow, citiesTitle, citiesDescription, cultureTitle, culture:[{title,description}], benefitsTitle, benefits:[{group,items}], jobsEyebrow, jobsTitle, portalUrl, applyEmail}`
（注：`cities` / `positions` 不再内嵌，直接读上面两个集合）

---

## 🔌 后端 API 接口总览

> 基础 URL：`/api/v1`；所有**写接口**需带 `Authorization: Bearer <token>`；响应统一 `{ code: 0, message: "ok", data: ... }`；错误用 `{ code: <非0>, message: "...", errors?: [...] }`。
>
> 标准错误码：`4000 参数校验失败`、`4010 未登录 / Token 失效`、`4030 无权限`、`4040 资源不存在`、`4090 ID 冲突`、`5000 服务器错误`。

### 一、认证模块 Auth（共 3 个接口）

| Method | Path | 功能 | 保护 |
|--------|------|------|------|
| POST | `/auth/login` | 账号密码登录 → 返回 JWT + 用户信息 | ❌ |
| POST | `/auth/logout` | 退出（可选，Token 黑名单/直接前端删） | ✅ |
| GET | `/auth/me` | 获取当前登录用户信息 | ✅ |

**`POST /auth/login` 测试用例清单（每个接口都按此 3 类写）：**

| 编号 | 类型 | 用例 | 预期 |
|------|------|------|------|
| A1 | ✅ 正常 | `{username:"admin",password:"admin"}` | 200，返回 `accessToken`、`user{username,role}` |
| A2 | ❌ 异常 | 用户名不存在 | 401，`code=4010`，msg=`用户名或密码错误` |
| A3 | ❌ 异常 | 密码错误 | 401，同上，不区分原因（防枚举） |
| A4 | ❌ 异常 | 缺少 `username` 字段 | 400，`code=4000`，Zod error `username is required` |
| A5 | ❌ 异常 | 缺少 `password` 字段 | 400，同上 |
| A6 | ⚠️ 边界 | `password` 长度 100 字符超长 | 400，不 crash |
| A7 | ⚠️ 边界 | 连续 10 次错误登录 | 第 11 次返回 429 提示（可选：登录限流） |
| A8 | ✅ 正常 | 用返回的 Token 调 `/auth/me` | 200，正确读到当前用户 |
| A9 | ❌ 异常 | 用伪造的 Token 调 `/auth/me` | 401，`code=4010` |
| A10 | ❌ 异常 | Token 过期（构造过期的 JWT） | 401，msg=`Token 已过期` |

### 二、站点与导航 Site（单文档，Get / Put）

| Method | Path | 功能 |
|--------|------|------|
| GET | `/site` | 获取站点配置（品牌、联系方式、SEO、导航、页脚） |
| PUT | `/site` | 整体更新站点配置 |

测试用例（模板，后面模块都按此结构）：
- ✅ 正常：读取、写入完整字段 → 成功且持久化
- ❌ 异常：未登录 PUT → 401；必填字段留空 → 400；邮箱格式错误 → 400
- ⚠️ 边界：`nav` 数组 0 项；`footerLinks` 超 50 项；SEO 关键字 1000 字符

### 三、首页内容 Home

| Method | Path | 功能 |
|--------|------|------|
| GET | `/home` | 一次性获取 6 大板块完整内容 |
| PUT | `/home/hero` | 更新 Hero 区 |
| PUT | `/home/media` | 更新媒体资源区（benefits + partners 数组） |
| PUT | `/home/flow` | 更新 Flow AI 区（orbit + features 数组） |
| PUT | `/home/clients` | 更新客户选择区（industries + logos） |
| PUT | `/home/strength` | 更新公司实力区（nodes + stats） |
| PUT | `/home/honors` | 更新企业荣誉区（groups + items） |

**每个板块接口 3 类用例**：
- ✅ 正常：合法字段更新 → 数据与 GET 返回一致
- ❌ 异常：partners 数组项缺 `name` / features 数组项缺 `title` → 4000；benefits 长度超上限 → 4000
- ⚠️ 边界：marquee 空数组；honors 中 groups 嵌套 items 超过 20；office 节点 x/y 为字符串百分比

### 四、客户案例 Cases（完整 CRUD + 列表页文案）

| Method | Path | 功能 |
|--------|------|------|
| GET | `/cases/page` | 读取案例列表页文案（title / subtitle / filters） |
| PUT | `/cases/page` | 更新案例列表页文案 |
| GET | `/cases` | 案例列表（支持 `industry?` / `featured?` / `keyword?` + `page` + `pageSize` 分页） |
| GET | `/cases/:id` | 按业务 `id` 读取单个案例详情 |
| POST | `/cases` | 新建案例（请求体带 `id`，若重复返回 409） |
| PUT | `/cases/:id` | 按业务 `id` 编辑（不能改 `id` 本身） |
| DELETE | `/cases/:id` | 删除案例 |
| POST | `/cases/:id/featured` | 切换置顶（请求体 `{featured:true|false}`），方便列表页按钮操作 |

**接口测试用例（Cases 最多最复杂，重点覆盖）**：

| 编号 | 类型 | 用例 |
|------|------|------|
| C1 | ✅ 正常 | 创建案例 `id:"case-001"` + 完整字段 → 201；再 GET → 一致 |
| C2 | ❌ 异常 | 创建时 `id` 重复（已存在 case-001）→ 409，`code=4090` |
| C3 | ❌ 异常 | 创建时 `industry` 传非法值（如 `music`）→ 400，Zod 枚举报错 |
| C4 | ❌ 异常 | PUT 修改 `id` 字段 → 400，`id 不可修改` |
| C5 | ❌ 异常 | DELETE 不存在的 `id` → 404 |
| C6 | ✅ 正常 | 列表分页 `page=2&pageSize=10` → 总数正确，items 按更新时间倒序 |
| C7 | ✅ 正常 | `industry=game` 过滤 → 只返回游戏行业 |
| C8 | ✅ 正常 | `keyword="美妆"` 搜索 title/client/summary 模糊匹配 |
| C9 | ⚠️ 边界 | `stats` 数组 0 项、`blocks` 数组 100 项 → 均能正常保存 |
| C10 | ⚠️ 边界 | `cover` URL 超过 2000 字符 → 400，长度校验 |
| C11 | ❌ 异常 | 未登录 POST/PUT/DELETE → 4010 |
| C12 | ✅ 正常 | 切换 `featured=true` → 首页置顶列表顺序变化 |

### 五、关于我们 About

| Method | Path | 功能 |
|--------|------|------|
| GET | `/about` | 读取关于我们全部内容 |
| PUT | `/about` | 整体更新关于我们 |

用例同 site：数组空/超量、枚举缺失、团队成员 avatar 留空等。

### 六、招聘管理 Careers（3 个子模块）

#### 6.1 页面文案

| Method | Path | 功能 |
|--------|------|------|
| GET | `/careers/content` | 读加入我们首屏/文化/福利等文案 |
| PUT | `/careers/content` | 更新文案 |

#### 6.2 招聘城市 CRUD

| Method | Path | 功能 |
|--------|------|------|
| GET | `/careers/cities` | 城市列表（返回时附带 `positionsCount`：该城市在招职位数） |
| POST | `/careers/cities` | 新建城市 → 自动生成或校验 `id` 唯一 |
| GET | `/careers/cities/:id` | 单个城市详情 + 该城市职位列表 |
| PUT | `/careers/cities/:id` | 编辑城市（允许改 `id`，改时**联动更新 positions** 的 cityId 和 extraCities） |
| DELETE | `/careers/cities/:id` | 删除城市（该城市职位回退到剩余第一个城市，**不删职位**） |

**联动行为测试**（Careers 最关键的业务逻辑，必须覆盖）：

| 编号 | 类型 | 用例 |
|------|------|------|
| R1 | ✅ 正常 | 创建上海 `id:"shanghai"`，职位 A cityId=shanghai；把上海 id 改成 `sh` → 职位 A 的 cityId 自动变 `sh` |
| R2 | ✅ 正常 | 职位 B extraCities = `"shanghai/chengdu"`，改上海 id→ B 的 extraCities 变成 `sh/chengdu` |
| R3 | ❌ 异常 | 新建城市 id 与已有重复 → 409 |
| R4 | ✅ 正常 | DELETE sh，该城市下 3 个职位 → cityId 自动变成 cities[0].id（深圳） |
| R5 | ⚠️ 边界 | DELETE 后没有任何城市剩余 → 职位 cityId 置空字符串，不抛异常 |
| R6 | ✅ 正常 | 城市列表 positionsCount 聚合正确（3 个职位主归属 + 2 个 extra 归属=显示 5？）→ 确认统计口径写清 |

#### 6.3 招聘岗位 CRUD

| Method | Path | 功能 |
|--------|------|------|
| GET | `/careers/positions` | 职位列表（支持 `cityId?` / `hot?` / `urgent?` / `keyword?` + 分页） |
| POST | `/careers/positions` | 新建职位 → 自动生成或校验 `id` 唯一；cityId 必须是合法城市 |
| GET | `/careers/positions/:id` | 详情 |
| PUT | `/careers/positions/:id` | 编辑 |
| DELETE | `/careers/positions/:id` | 删除 |

**用例重点**：

| 编号 | 类型 | 用例 |
|------|------|------|
| P1 | ✅ 正常 | 创建职位 cityId=`shanghai`、extraCities=`chengdu/beijing` → 两个城市列表都能看到它 |
| P2 | ❌ 异常 | cityId 传不存在值 → 400，`请选择有效的招聘城市` |
| P3 | ⚠️ 边界 | extraCities 含非法城市 id（如 `mars`）→ 自动过滤无效值并去重，主 cityId 仍必须合法 |
| P4 | ✅ 正常 | `hot=true` 筛选 → 仅返回热招；`keyword="产品"` 搜 title/department/tags |
| P5 | ⚠️ 边界 | description 超 10000 字符；publishedAt 格式非 ISO → 400 |
| P6 | ✅ 正常 | applyUrl 留空 + 全局 careers.content.portalUrl 也空 → 前台不显示「招聘系统投递」按钮（前端校验也可；后端可选校验字段一致性） |

### 七、接口文档规范（Swagger）

每个模块在 `admin-server/src/docs/` 下维护 OpenAPI 3.0 YAML/JSON，Swagger UI 挂载于 `/api/docs`。

**接口文档条目必填字段**：
- summary / description
- 请求头（Authorization Bearer 标注 "Required"）
- requestBody schema（含示例）
- 200 / 201 响应 schema（含 `data` 结构与示例）
- 400 / 401 / 404 / 409 / 500 响应（含 `code` + `message` 说明）
- 错误码表单独一页（`/api/docs#tag/错误码`）

---

## 🖥️ 前端管理后台页面与路由设计

### 路由表（Ant Design Pro config/routes.ts）

```ts
export default [
  { path: '/admin/login', component: './Login', layout: false },
  {
    path: '/admin',
    component: '../layouts/BasicLayout',
    redirect: '/admin/dashboard',
    routes: [
      { path: '/admin/dashboard', name: '概览', icon: 'Dashboard', component: './Dashboard' },
      {
        path: '/admin/content',
        name: '内容管理',
        icon: 'FileText',
        routes: [
          { path: '/admin/content/site',    name: '站点与导航', component: './content/Site' },
          { path: '/admin/content/home',    name: '首页内容',   component: './content/Home' },
          { path: '/admin/content/about',   name: '关于我们',   component: './content/About' },
          { path: '/admin/content/careers', name: '招聘内容',   component: './content/Careers' },
        ],
      },
      {
        path: '/admin/cases',
        name: '客户案例',
        icon: 'FolderOpen',
        routes: [
          { path: '/admin/cases',               name: '案例列表', component: './cases/List' },
          { path: '/admin/cases/new',           name: '新建案例', component: './cases/Editor', hideInMenu: true },
          { path: '/admin/cases/:id/edit',      name: '编辑案例', component: './cases/Editor', hideInMenu: true },
        ],
      },
      {
        path: '/admin/careers',
        name: '招聘管理',
        icon: 'Team',
        routes: [
          { path: '/admin/careers',                  name: '招聘总览', component: './careers/Overview' },
          { path: '/admin/careers/cities/new',       name: '新建城市', component: './careers/CityEditor', hideInMenu: true },
          { path: '/admin/careers/cities/:id/edit',  name: '编辑城市', component: './careers/CityEditor', hideInMenu: true },
          { path: '/admin/careers/positions/new',    name: '新建职位', component: './careers/PositionEditor', hideInMenu: true },
          { path: '/admin/careers/positions/:id/edit',name:'编辑职位', component: './careers/PositionEditor', hideInMenu: true },
        ],
      },
      { path: '/admin/*', component: './404', layout: false, hideInMenu: true },
    ],
  },
];
```

### 主题对齐（admin-frontend/src/config/theme.ts）

Ant Design Pro v5 主题 token 需与前台 `globals.css` 中的 ADFLY 主色（需从设计稿取色，参考蓝色 #0066FF 系列）严格一致：

```ts
export default {
  token: {
    colorPrimary: '#0066FF',      // ← 替换成精确取色值
    borderRadius: 6,
    colorInfo: '#0066FF',
    colorSuccess: '#10b981',
    colorWarning: '#f59e0b',
    colorError: '#ef4444',
    fontFamily: '"PingFang SC", "HarmonyOS Sans", "Inter", sans-serif',
    fontSize: 14,
    // 不使用 motion
    motion: false,
  },
  components: {
    Layout: {
      headerBg: '#ffffff',
      siderBg: '#fafafa',
      bodyBg: '#f5f7fa',
      headerHeight: 64,
    },
    Menu: {
      itemSelectedBg: '#e6f0ff',
      itemSelectedColor: '#0066FF',
      itemHoverBg: '#f0f5ff',
    },
    Button: {
      controlHeight: 40,
    },
  },
};
```

### 各页面要点

#### 1. `/admin/dashboard` 概览
- 顶部 4 张统计卡：案例总数 / 城市总数 / 在招职位数 / 热招职位数
- 中部：案例行业分布饼图（ECharts/Ant Design Charts）、最近更新内容时间线
- 底部：5 个模块**快捷入口卡片**（点进去跳到对应编辑页）

#### 2. `/admin/content/site` 站点与导航
- 分组：品牌信息 / 联系方式 / SEO 三件套 / 顶部导航列表（可拖排序 ArrayEditor）/ 页脚链接（可拖排序）

#### 3. `/admin/content/home` 首页内容（6 个 Tab）
- Tab 顺序：Hero / 媒体资源 / Flow AI / 客户选择 / 公司实力 / 企业荣誉
- 媒体资源：左侧 benefits 数组（2 字段：title+description），右侧 partners 数组（name+mark+category+可选 accent），均可增删改
- Flow AI：orbit 标签增删 + features 数组（title/mark/description/points），建议 features 3~6 项校验提示
- 企业荣誉：`groups` 二级嵌套（每个 group 下 items 增删）

#### 4. `/admin/cases` 客户案例
- **列表页**：ProTable，列操作「置顶/编辑/预览/删除」，顶部筛选：行业 + 是否置顶 + 关键字搜索
- **Editor 页（新建/编辑复用）**：
  - 基本信息卡片：id（新建可填，编辑只读）、标题、客户、行业（Select）、区域、年份、封面、标签（Tags）、奖项（Tags）、置顶开关
  - 核心指标 section：动态数组 stats（value/unit/label），可 + / -
  - 内容板块 section：动态数组 blocks（key/title/body 多行/ points 多行），每个 block 可删除、可上下移动
  - 底部吸底操作栏：`保存` / `取消` / `前台预览 ↗`（开新窗口到 `/cases/<id>`）

#### 5. `/admin/careers` 招聘总览
- 上方：招聘城市卡片 Grid（城市名、英文名、在招数、编辑/删除、「+ 新建城市」）
- 下方：在招职位 ProTable（列：职位名、主要城市、其他城市、类型、部门、热招/急聘、发布时间、操作）
- 顶部操作：`+ 新建职位`

#### 6. `/admin/careers/cities/:id/edit` 城市编辑
- 表单：id（警告「修改会同步更新所有职位引用」）、中英文名、code、简介、首页展示开关（Switch）
- 下方：该城市在招职位列表（只读表格，点标题跳职位编辑）

#### 7. `/admin/careers/positions/:id/edit` 职位编辑
- 基本信息：id（新建可改，编辑只读）、标题、主要城市（Select，城市动态下拉）、其他城市（多选 Select）、类型、部门、标签（Tags）、发布日期（DatePicker）、急聘/热招 Switch、外部投递链接
- 正文区：职位简介（TextArea） / 岗位职责 / 任职要求 / 加分项（均为 4~8 行的 TextArea，提示「每行一条」）

---

## 🧪 测试命令约定

```json
// admin-server/package.json
"scripts": {
  "dev": "tsx watch src/server.ts",
  "build": "tsc -p tsconfig.json",
  "start": "NODE_ENV=production node dist/server.js",
  "test": "jest --forceExit --detectOpenHandles",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage",
  "seed": "node scripts/seed.mjs",
  "docs:dev": "node scripts/serve-docs.mjs"
}
```

**要求**：
- 后端接口测试覆盖率目标 ≥ **80%**（statements / branches）
- 每个接口至少 1 个正常用例 + 2 个异常用例 + 1 个边界用例
- 测试前自动 `seed` 一份干净测试数据，测试库使用独立 `MONGO_URI_TEST`（与开发库分离）

---

## 📅 开发阶段与执行顺序

共分 **8 个阶段**，总预估 **35~45 小时**。

### Stage 0：环境脚手架（~4h）✅ 基础设施先行

| 产出物 | 要点 |
|--------|------|
| `admin-server/package.json` + 目录初始化 | Express、Mongoose、Zod、Jest、Supertest、Swagger UI、bcrypt、jsonwebtoken |
| `admin-frontend/package.json` + 目录初始化 | Ant Design Pro（Vite 模板）、Tailwind v4、Axios、dayjs、@ant-design/charts |
| `docker-compose.yml`（可选根目录新增服务） | MongoDB 7 + MongoExpress，方便本地开发 |
| 两端 `.env.example` | MONGO_URI、JWT_SECRET、VITE_API_BASE_URL 等 |
| **第一个接口并跑通**：`POST /api/v1/auth/login` + `GET /me` | 含首个测试文件 `auth.test.ts`（10 个用例全绿） + Swagger 首版文档 |
| 前端登录页 + 路由守卫 | 成功后 token 存 localStorage、401 自动跳登录 |

**里程碑**：登录页 → 输入 admin/admin → 跳 Dashboard；`npm test` 全绿（≥10 用例）。

### Stage 1：通用骨架与布局（~4h）✅ 已完成

- 后端：全局错误中间件 + Zod 校验中间件 + ApiError 类 + `catchAsync`；统一响应格式
- 后端：所有路由骨架先占位（返回 501 Not Implemented 或空数据）；Swagger 全量 path 条目建好
- 前端：BasicLayout（顶栏：用户头像/退出；左侧：按 routes 渲染菜单；内容区：Ant Pro PageContainer）
- 前端：主题 token 对齐前台；**关闭所有动画**（motion=false、组件 transition 移除）
- 通用组件：`ArrayEditor<T>`（增/删/排序）、`ImagePicker`（先支持路径粘贴，后续可扩展上传）
- **里程碑**：每个路由都能打开且不出白屏；菜单展开/折叠正常。

> **Stage 1 完成情况**
> - 后端：`ApiError` / 错误码 / Zod 校验 / 统一响应 / 错误中间件已就绪；
>   `placeholderEndpoints()` 统一登记 **31** 个模块接口，写操作全部经 `protect`，未登录 401、已登录 501（code=5001），Swagger 全量 path 同步生成。
> - 前端：`BasicLayout` + `PageContainer` + `ModuleScaffold`（每个菜单路由都有实际内容）；
>   `ArrayEditor<T>`、`ImagePicker` 已完成并被测试覆盖；`motion:false` 全局关动画。
> - 额外交付：主题管理闭环（`/settings/theme` 在线改色 → 即时生效 → 恢复默认）。
> - 验收：后端 Jest **91** 用例全绿（覆盖率 97.5% / 75.2% / 93.4% / 98.2%）；
>   前端 Vitest **84** 用例全绿（99.5% / 91.8% / 89.0% / 99.5%）；
>   Chrome CDP 冒烟：**9 个路由**均无白屏 / 无 console 错误 / 无失败请求（构建产物与 dev server 各跑一遍）。

### Stage 2：数据模型 + Seed 脚本 + 内容模块（站点/首页/About/招聘文案）（~10h）✅ 已完成

- 全部 9 个 Mongoose 模型建好 + 索引
- `scripts/seed.mjs`：读取现有 `data/site.json` → 分拆写入 MongoDB（首次部署用）
- 后端 4 大内容模块：site + home（6 分接口）+ about + careers/content → 每个接口 Zod schema + controller + 完整测试 + Swagger
- 前端对应 4 个页面：Site、Home（Tab）、About、CareersContent 编辑页
- 通用保存逻辑：顶部 `message.success("已保存")`；失败 `message.error(msg)`；离开前 dirty-check 提示
- **里程碑**：`npm test` 通过率 100%；通过后台修改 site.name → 刷新 Next.js 前台（改造 `src/lib/db.ts` 从 API 读）能立刻看到新文案。

> **Stage 2 完成情况**
> - 后端模型：`SiteConfig` / `HomeContent` / `CasesPageContent` / `CaseItem` / `AboutContent` / `CareersCity` / `CareersPosition` / `CareersContent`
>   （集合名显式蛇形：`site_configs`、`home_contents`、`cases_page_contents`、`case_items`、`about_contents`、`careers_cities`、`careers_positions`、`careers_contents`）。
> - Seed：`npm run seed`（`--force` / `--content-only`），并在服务启动时自动补齐缺失内容（缺文件只警告不阻塞启动）；
>   实测写入 site 1 / home 1 / casesPage 1 / caseItems 8 / about 1 / careersContent 1 / cities 7 / positions 79，重复执行幂等。
> - 后端接口（13 个真实接口）：`GET/PUT /site`、`GET /home` + `PUT /home/{hero,media,flow,clients,strength,honors}`、`GET/PUT /about`、`GET/PUT /careers/content`；
>   全部走 Zod **strict** 校验（未知字段 4000、缺失必填 4000——中文错误文案），`validate` 中间件剥离 `_id/__v/key/createdAt/updatedAt` 以支持 GET→PUT 回环。
> - 三态标记字段（`featured/hot/urgent/major`）用 Mongoose `Mixed` 原样存取（`true` / `"yes"` 均保留），由 `isTruthyFlag()` 归一化。
> - Swagger：新增 `docs/helpers.ts` + `docs/content.paths.ts`，内容接口与 schema 全量登记，占位接口缩减为 Stage 3/4 的 18 个（后续已随模块实现清零）。
> - 前端：`ContentForm`（声明式 `FieldSpec` 驱动，支持文本/数字/开关/下拉/图片/字符串数组/链接/嵌套对象/对象数组）、
>   `ContentEditor`（加载骨架屏 + 保存/还原 + 未保存提示 + 失败重试）、`useContentResource`、`StringListInput`；
>   Site / Home（6 个 Tab 分区保存）/ About / CareersContent 四个页面接真实接口；dirty-check 由 `store/dirty` + 菜单二次确认 + `beforeunload` 兜底。
> - 验收：后端 Jest **168** 用例全绿（覆盖率 98.26% / 77.84% / 93.81% / 98.93%）；
>   前端 Vitest **169** 用例全绿（99.25% / 91.96% / 92.85% / 99.25%）；
>   `tsc --noEmit` 干净、`vite build` 通过、Chrome CDP 冒烟 **9 个路由**通过（dev 5173 + preview 5174 各跑一遍）。
> - 遗留（Stage 5 处理）：前台站点资源（`/images/**`）不在后台域名下，管理端图片预览会 404，已在冒烟脚本中按资源类过滤。

### Stage 3：Cases 客户案例 CRUD（~8h）✅ 已完成

- 后端：Cases 模块 8 个接口 + 完整 Zod（重点是 blocks 嵌套 + stats 数组）+ 分页搜索过滤 + 全部用例（至少 12 条）
- 前端：案例列表（ProTable + 筛选 + 分页 + 置顶按钮 + 删除 Popconfirm）
- 前端：Editor 页（新建/编辑），重点是 `ArrayEditor` 的 stats 和 blocks 嵌套好用
- 「前台预览」按钮：打开 `/cases/:id` 新窗口
- **里程碑**：从空白新建一个案例 → 保存 → 列表有它 → 前台详情页正常渲染；编辑改标题 → 前后台同步更新。

> **Stage 3 完成情况**
> - 后端已实现 `GET/PUT /cases/page`、`GET/POST /cases`、`GET/PUT/DELETE /cases/{id}`、`POST /cases/{id}/featured`；列表支持分页、行业/置顶筛选、关键词搜索，业务主键冲突返回 4090。
> - Zod strict 校验覆盖案例基础字段、`stats[]`、`blocks[]`、列表查询和列表页筛选文案；GET → PUT 回环会剥离服务端托管字段。
> - 前端已接入 Cases 列表页、详情编辑页、新建页、置顶、删除确认和前台预览；`CaseEditor.test.tsx` 覆盖新建、编辑、嵌套数组、预览和加载失败。
> - `placeholderEndpoints()` 已移除 Cases；Stage 4 完成后城市 / 职位也已切换为真实 path/schema，当前占位接口为 0。
> - 常规验收：Stage 3 基线为后端 Jest **197/197**、前端 Vitest **186/186**、类型检查、构建和 Chrome CDP **11 个路由**冒烟均通过；覆盖率插桩下的既有偶发失败留给 Stage 6 收敛。

### Stage 4：Careers 招聘管理 CRUD（~8h）✅ 已完成

- 后端：城市 CRUD（**重点覆盖改 id 联动 positions** + 删除回退逻辑测试）
- 后端：职位 CRUD（**重点覆盖 cityId 合法性校验 + extraCities 过滤**）
- 后端：list 接口聚合 `positionsCount`
- 前端：Overview（城市卡片 Grid + 职位 ProTable）、CityEditor（联动警告）、PositionEditor（城市多选 Select）
- **里程碑**：修改上海 id → 所有职位和列表正确变更；删除城市 → 职位正确回退到新归属。

> **Stage 4 完成情况**
> - 后端已实现城市 / 职位 10 个 REST 接口；城市列表返回主归属或附加城市的 `positionsCount`，城市 id 修改会联动 `cityId` / `extraCities`。
> - 删除城市支持显式或自动回退城市；无其他城市时不删除职位，仅清空其主 `cityId`。职位写入校验主城市存在，并对 `extraCities` 做合法 id 过滤与去重。
> - 前端已接入招聘总览、城市新建 / 编辑、职位新建 / 编辑，编辑城市展示联动警告和关联职位只读表格。
> - 测试覆盖列表聚合、id 联动、删除回退、最后城市边界、职位 CRUD、城市合法性和附加城市过滤；Swagger 与占位清单已同步收口。
> - Stage 4 验收：后端 Jest **194/194**、前端 Vitest **196/196**、类型检查、构建均通过；Chrome CDP 冒烟在 dev 5173 与 preview 5174 各 **15 个路由**通过。

### Stage 5：数据联通前台 + 过渡工具（~3h）

- 改造 `src/lib/db.ts`：新增 `getSiteDataFromAPI()`，优先读后端 API，失败降级读本地 JSON
- `scripts/export.mjs`：把 MongoDB 内容再导回 `data/site.json`（方便只读文件系统部署或冷备份）
- Dashboard 页统计卡片 + 饼图 + 时间线真实调用接口（不是假数据）
- **里程碑**：后台改任何字段 → 前台 `force-dynamic` 渲染即时生效；离线模式（后端停了）前台仍可用 JSON 数据（降级）。

### Stage 6：接口文档完整化 + 测试覆盖率冲刺（~4h）

- 每个接口的 Swagger：请求示例 + 响应示例补全；错误码表
- Postman Collection 导出（可选）
- 补全遗漏边界用例，确保覆盖率 ≥ 80%
- README：`admin-server/README.md` + `admin-frontend/README.md`，写清启动、测试、种子、部署步骤

### Stage 7：服务器部署准备（~4h，可与运维协作）

- 后端 `Dockerfile` + 前端 Dockerfile（多阶段构建，Nginx 托管静态资源并 `/api` 反代到后端）
- Nginx 配置示例：
  - `/` → 现有 Next.js（原前台）
  - `/admin` → 前端构建产物（Vite build）
  - `/api` → Express 后端
- 生产环境变量清单：`ADMIN_PASSWORD_HASH`（bcrypt 存）、`JWT_SECRET`、`MONGO_URI`、白名单等
- 首次上线流程：`docker compose up` → `npm run seed` → 登录 admin/admin 立即改密码

---

## ⚠️ 关键风险与注意事项

| 风险 | 缓解 |
|------|------|
| 城市 `id` 改名导致职位 URL 404 | 后端修改同步写入；保留「旧 id → 新 id」redirect 映射表（可选加一个 redirects 集合） |
| 前台和后台同时编辑（并发写入） | MongoDB 单文档写入是原子的；更新操作读取 `updatedAt` 乐观锁（可选） |
| 上传图片（需求中提及素材管理） | 本期先支持「粘贴图片文件路径」；下一期扩展 `/api/upload` 接口对接本地磁盘 / OSS |
| admin/admin 默认密码泄露 | 后端 `seed` 脚本里打印醒目警告；首次登录强制改密（可加 `mustChangePassword` 字段） |
| 从 JSON 迁移到 MongoDB 数据不一致 | `seed.mjs` 末尾做一次全量读回对比，diff 输出日志便于排查 |

---

## 🔗 与现有项目的关键文件引用

| 文件 | 作用 |
|------|------|
| [readme.myself-admin.md](file:///Users/cc/Repository/ai-website-cloner-template/readme.myself-admin.md) | 用户原始 Admin 需求（本计划的依据） |
| [src/types/index.ts](file:///Users/cc/Repository/ai-website-cloner-template/src/types/index.ts) | 所有 `SiteData` 类型定义（MongoDB 字段严格对齐此文件） |
| [src/app/(admin)/admin/actions.ts](file:///Users/cc/Repository/ai-website-cloner-template/src/app/(admin)/admin/actions.ts) | 现有 Server Actions 业务逻辑（实现细节参考，城市/职位联动逻辑可复用） |
| [src/lib/db.ts](file:///Users/cc/Repository/ai-website-cloner-template/src/lib/db.ts) | 现有 JSON 读写层（Stage 5 改造此文件增加 API 模式） |
| [src/lib/auth.ts](file:///Users/cc/Repository/ai-website-cloner-template/src/lib/auth.ts) | 现有密码校验（密码 hash 方式参考） |
| [src/app/globals.css](file:///Users/cc/Repository/ai-website-cloner-template/src/app/globals.css) | 前台设计令牌（后台 theme.ts 必须与此处主色一致） |
| [docs/ADMIN_GUIDE.md](file:///Users/cc/Repository/ai-website-cloner-template/docs/ADMIN_GUIDE.md) | 现有简易后台使用说明（字段约定如 `/` 分隔、`yes` 开关 → 新 Admin 表单解析层保留同样约定） |
| [docs/DEVELOPMENT_PLAN.md](file:///Users/cc/Repository/ai-website-cloner-template/docs/DEVELOPMENT_PLAN.md) | 整体项目开发计划（上一级） |
