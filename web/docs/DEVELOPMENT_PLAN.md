
# ADFLY 网站重构项目开发计划

## ✅ 项目初始化验证（Phase 0 已完成）
- 依赖安装：成功
- 生产构建：**Next.js 16.3.0 (Turbopack)** 编译通过，4个静态页面生成成功
- TypeScript 检查：通过

---

## 📋 需求概览

| 项目 | 说明 |
|------|------|
| 设计参考 | `/cbb3670d3d279437a01e1add32ba829b.jpg`（首页设计稿） |
| 动画/样式参考 | https://www.meetsocial.com（需提取滚动动画、悬浮效果、交互动效） |
| 现有网站 | https://www.adflymobile.com/index.html（需重新设计，内容保留参考） |
| 技术栈 | Next.js 16 + React 19 + TypeScript + shadcn/ui + Tailwind CSS v4 |
| 附加功能 | Admin 后台，支持动态更新所有页面数据 |
| 实现方式 | 不是直接 clone，而是根据设计稿和参考网站的动画效果来进行实现 |

### 路由规划

| 路由路径 | 对应页面 | 来源参考 | 类型 |
|----------|---------|---------|------|
| `/` | 服务与产品（首页） | meetsocial.com 首页 + 设计稿 | 需开发 |
| `/cases` | 客户案例列表 | meetsocial.com/cases | 需开发 |
| `/cases/[id]` | 客户案例详情 | meetsocial.com/cases/1 | 需开发 |
| `/about` | 关于我们 | meetsocial.com/about | 需开发 |
| `/careers` | 加入我们（企业文化 / 福利 / 招聘城市索引 / 热招职位） | meetsocial.com/careers | 需开发 |
| `/careers/cities/[id]` | 招聘城市职位列表 | 飞书招聘 City 列表 | 需开发 |
| `/careers/jobs/[id]` | 招聘职位详情（岗位职责 / 任职要求 / 加分项） | 飞书招聘岗位详情 | 需开发 |
| `/admin` | 管理后台首页 | 自建 | 需开发 |
| `/admin/*` | 各模块数据管理 | 自建 | 需开发 |

### 招聘数据（已采集入库）

原参考站招聘流程为飞书招聘 SPA，现已**去外链化**，数据落地到 `data/site.json` 的 `careers.cities` / `careers.positions`，全程站内流转：

- 招聘城市索引 `/careers#cities` → 城市职位列表 `/careers/cities/<城市标识>` → 职位详情 `/careers/jobs/<职位标识>`
- 已采集 7 个城市（上海 / 深圳 / 广州 / 北京 / 成都 / 合肥 / 西安）共 79 个在招职位，含完整岗位职责 / 任职要求 / 加分项文本（采集脚本流程见 `docs/research/BEHAVIORS.md`）
- 保留一个可选的「招聘系统投递」外链（职位详情页），默认不跳转即可完成投递（邮件投递为主）
- 数据来源映射（仅备注，前台不再使用）：城市 `location=CT_*`、职位 `position/<id>/detail`

### 设计稿首页结构分析（自顶向下）

1. **Navbar** — Logo (ADFLY 翼投智能) + 导航菜单 + 右侧 CTA 按钮
2. **Hero Section** — 主标题「全球智能营销科技服务商」+ 英文副标题 + 简介 + 2个按钮
3. **媒体资源区** — 「覆盖全球50+海外主流媒体资源」+ 左侧6项权益列表 + 右侧媒体Logo矩阵（Smartnews/Facebook/Unity/Kuaishou/Pinterest/Youtube/Google/Naver/X/TikTok/Meta/Instagram）+ CTA
4. **Flow AI 系统区** — 「AI 智能广告系统」+ 左侧环形图（大模型/机器学习/海量数据）+ 右侧4项特性列表 + CTA
5. **客户案例区** — 「10000+客户选择」+ 3个行业卡片（电商/游戏/App）+ 客户Logo墙
6. **公司实力区** — 「让出海，更简单！」+ 简介 + 全球分支节点图 + 4项数据卡片（2017/4000+/10年+/50+）+ CTA
7. **企业荣誉区** — 「企业荣誉 实力见证」+ 权威资质（3个）+ 行业认可（5个奖项）
8. **Footer** — Logo + 商务合作邮箱 + 导航链接 + 社交图标

---

## 🗂️ 详细开发阶段

### Phase 0: 项目初始化与验证 ✅
- [x] 检查现有代码结构
- [x] 安装 npm 依赖
- [x] 验证 `npm run build` 通过
- [x] 验证 TypeScript 检查通过

### Phase 1: 网站侦察与设计令牌提取 ✅

**目标**：获取 meetsocial.com 的动画/样式细节，并从设计稿中提取精确的设计令牌

**任务清单**：

| 子任务 | 产出物 |
|--------|-------|
| 1.1 浏览器打开 meetsocial.com，完整截图（桌面1440px + 移动390px） | `docs/design-references/meetsocial/` 下各页面截图 |
| 1.2 **行为扫描**：滚动触发的导航变化、元素入场动画、悬浮效果、平滑滚动（Lenis?）、IntersectionObserver 使用 | `docs/research/meetsocial/BEHAVIORS.md |
| 1.3 提取设计令牌：颜色（主色/辅色/渐变色）、字体、间距、圆角、阴影、断点 | `docs/research/DESIGN_TOKENS.md` |
| 1.4 逐页面拓扑：首页/cases/cases/[id]/about/careers 的 section 划分与交互模型 | `docs/research/<page>/PAGE_TOPOLOGY.md` |
| 1.5 对照设计稿，提取 ADFLY 的品牌色、字体、精确间距 | 合并入 `DESIGN_TOKENS.md` |
| 1.6 提取 ADFLY 现有网站的真实文案与客户案例数据（adflymobile.com） | `docs/research/adfly-content.md` |

**关键注意点**：
- 必须先**滚动再点击**，判断交互是 scroll-driven 还是 click-driven（避免最昂贵的返工）
- 记录每个动画的触发阈值、前后CSS差值、过渡曲线
- 设计稿中的渐变、微妙的背景效果需要精确提取
- 不是直接 clone，而是提取动画和交互效果的实现方式

### Phase 2: 基础架构搭建 ✅

**目标**：搭建所有共享的基础层，后续页面和后台都依赖于此

**任务清单**：

| 子任务 | 产出文件/目录 |
|--------|-------------|
| 2.1 设计令牌注入 Tailwind v4 主题：ADFLY 品牌色、字体配置、间距尺度、圆角、阴影 | `src/app/globals.css` |
| 2.2 字体配置：中英文字体选型（从 meetsocial 提取或使用 Inter/思源黑体），配置 `next/font` | `src/app/layout.tsx` |
| 2.3 共享类型定义：`CaseItem`、`ServiceItem`、`ClientLogo`、`TeamMember`、`JobPost`、`HonorItem`、`MediaPartner` 等核心数据接口 | `src/types/index.ts` |
| 2.4 共享数据层：初始 mock 数据（对应设计稿内容），后续支持从 CMS/DB 读取 | `src/data/` 目录 |
| 2.5 全局 Navbar + Footer 组件（含滚动时的背景变化、移动端汉堡菜单） | `src/components/layout/Navbar.tsx`、`Footer.tsx` |
| 2.6 Admin 路由组与布局：`(admin)` route group，独立 sidebar 布局 | `src/app/(admin)/layout.tsx` |
| 2.7 滚动动画基础：配置 Lenis 平滑滚动（或 meetsocial 使用的方案）+ 通用 `useInView` hook | `src/hooks/useInView.ts`、`src/components/AnimatedSection.tsx` |
| 2.8 数据存储方案选型与初始化：**Supabase**（推荐，已集成支持） / **Local JSON + Server Actions**（轻量方案） | 配置文件 + 初始化脚本 |

### Phase 3: 前台页面开发 ✅

**建议使用 git worktree 并行开发**：每个页面分配独立 worktree，合并时逐一验证构建

#### 3.1 首页 / 服务与产品（`/`）— 8个 Section

| 子任务 | 组件文件 |
|--------|---------|
| 3.1.1 Hero 区（标题+简介+2CTA） | `src/components/home/HeroSection.tsx` |
| 3.1.2 媒体资源区（6权益列表 + 12个媒体Logo矩阵 + CTA） | `src/components/home/MediaPartnersSection.tsx` |
| 3.1.3 Flow AI 系统区（环形图 + 4特性列表 + CTA） | `src/components/home/FlowAISection.tsx` |
| 3.1.4 客户选择区（3行业分类卡 + Logo墙） | `src/components/home/ClientsSection.tsx` |
| 3.1.5 公司实力区（全球地图节点 + 4数据卡片 + CTA） | `src/components/home/StrengthSection.tsx` |
| 3.1.6 企业荣誉区（3资质 + 5奖项） | `src/components/home/HonorsSection.tsx` |
| 3.1.7 页面组装：导入并布局所有 section | `src/app/page.tsx` |

#### 3.2 客户案例列表（`/cases`）

| 子任务 | 组件文件 |
|--------|---------|
| 3.2.1 Cases Hero Banner | `src/components/cases/CasesHero.tsx` |
| 3.2.2 行业分类 Filter（tab切换） | `src/components/cases/CasesFilter.tsx` |
| 3.2.3 案例卡片 Grid（封面图 + 行业标签 + 标题 + 简介） | `src/components/cases/CaseCard.tsx` + `CaseGrid.tsx` |
| 3.2.4 路由组装 | `src/app/cases/page.tsx` |

#### 3.3 客户案例详情（`/cases/[id]`）

| 子任务 | 组件文件 |
|--------|---------|
| 3.3.1 详情页头部 Banner（大图 + 项目信息） | `src/components/cases/CaseDetailHero.tsx` |
| 3.3.2 项目背景 / 挑战 / 方案 / 效果 分段展示 | `src/components/cases/CaseSection.tsx` |
| 3.3.3 数据统计 KPI 卡片 | `src/components/cases/CaseStats.tsx` |
| 3.3.4 底部 相关案例推荐 | `src/components/cases/RelatedCases.tsx` |
| 3.3.5 动态路由 + generateStaticParams | `src/app/cases/[id]/page.tsx` |

#### 3.4 关于我们（`/about`）

| 子任务 | 组件文件 |
|--------|---------|
| 3.4.1 About Hero（公司使命/愿景） | `src/components/about/AboutHero.tsx` |
| 3.4.2 发展历程 Timeline | `src/components/about/TimelineSection.tsx` |
| 3.4.3 核心团队成员卡片 | `src/components/about/TeamSection.tsx` |
| 3.4.4 全球办公地点（与首页地图呼应） | `src/components/about/OfficesSection.tsx` |
| 3.4.5 公司文化 / 价值观 | `src/components/about/CultureSection.tsx` |
| 3.4.6 路由组装 | `src/app/about/page.tsx` |

#### 3.5 加入我们（`/careers`、`/careers/cities/[id]`、`/careers/jobs/[id]`）

| 子任务 | 组件文件 |
|--------|---------|
| 3.5.1 Careers Hero + 数据概览条 | `src/app/(site)/careers/page.tsx` |
| 3.5.2 招聘城市索引（卡片 → 城市职位列表） | `src/components/careers/CareersSections.tsx` (`CityIndexSection`) |
| 3.5.3 企业文化 / 福利体系 | `src/components/careers/CareersSections.tsx` |
| 3.5.4 热招职位（站内详情链接） | `src/components/careers/CareersSections.tsx` (`JobsSection`) |
| 3.5.5 城市职位列表 + 其他城市切换 | `src/components/careers/CareerPages.tsx` (`CityPositionsSection`) |
| 3.5.6 职位详情（JD 解析 + 投递侧栏 + 相关职位） | `src/components/careers/CareerPages.tsx` (`PositionDetailSection`) |
| 3.5.7 招聘数据工具函数（城市聚合 / JD 解析 / 摘要） | `src/lib/careers.ts` |
| 3.5.8 路由组装（含 `notFound()` 与 `generateMetadata`） | `src/app/(site)/careers/**/page.tsx` |

### Phase 4: Admin 后台开发 ✅

**前提**：需确认数据存储方案，推荐 **Supabase**（模板已集成 `supabase_*` MCP 工具）

| 子任务 | 产出物 |
|--------|-------|
| 4.1 Admin 鉴权方案：Next.js Middleware + 简单密码登录（或 Supabase Auth） | `src/middleware.ts`、`src/app/(admin)/login/page.tsx` |
| 4.2 Admin 侧边栏布局 + 导航 | `src/app/(admin)/layout.tsx` |
| 4.3 首页内容管理（8个 section 的文本/图片/CTA 配置） | `src/app/(admin)/home/edit/page.tsx` |
| 4.4 客户案例 CRUD（列表/新建/编辑/删除，含富文本） | `src/app/(admin)/cases/*` |
| 4.5 关于我们内容管理（Timeline/Team/Offices） | `src/app/(admin)/about/edit/page.tsx` |
| 4.6 加入我们 / 招聘配置 | `src/app/(admin)/careers/edit/page.tsx` |
| 4.7 媒体资源 / Logo / 荣誉 管理 | `src/app/(admin)/assets/page.tsx` |
| 4.8 统一的表单组件 + 图片上传组件 | `src/components/admin/FormField.tsx`、`ImageUploader.tsx` |

### Phase 5: 数据层设计与动态数据对接 ✅

此阶段可与 Phase 3/4 并行（先 mock 数据，后替换为动态）

| 子任务 | 产出物 |
|--------|-------|
| 5.1 数据库 schema 设计（Supabase）：cases、services、team_members、honors、media_partners、home_sections 等表 | `supabase/migrations/001_init.sql` |
| 5.2 Server Actions 或 Route Handlers：各模块的增删改查接口 | `src/app/_actions/*.ts` 或 `src/app/api/*` |
| 5.3 前台页面替换：从静态 mock → 动态读取（Server Components） | 修改 Phase 3 各页面 |
| 5.4 Admin 表单对接：提交 → 写入 DB | 修改 Phase 4 各表单 |
| 5.5 图片上传：Supabase Storage 或本地 public 目录 | 对应上传逻辑 |

**轻量方案备选（如无需复杂 DB）**：所有数据存 `src/data/*.json`，Admin 通过写文件 + `revalidatePath` 刷新。

### Phase 6: 动画效果实现与交互动效 ✅

参考 meetsocial.com 的实现方式（提取动画实现原理而非直接 clone）

| 子任务 | 关注点 |
|--------|-------|
| 6.1 Navbar 滚动变化：透明→白底 + 阴影（精确滚动阈值） | 过渡时长、easing |
| 6.2 Section 入场动画：fade-up + stagger（IntersectionObserver） | 每个 section 的 delay、distance |
| 6.3 悬浮效果：按钮、卡片、Logo、链接的 hover 过渡 | 颜色变化、scale、shadow |
| 6.4 首页环形图的动画 / 数据卡片计数滚动动画 | onView 触发 |
| 6.5 客户案例卡片 hover 效果（封面 zoom、阴影加深） | 过渡时间 |
| 6.6 页面间过渡（可选） | Next.js 16 View Transitions |
| 6.7 平滑滚动（Lenis）集成 | 滚动曲线配置 |

### Phase 7: 响应式适配与跨浏览器测试 ✅

| 子任务 | 验证标准 |
|--------|---------|
| 7.1 桌面端 1440px：与设计稿 1:1 对齐 | 间距、颜色、字号精确 |
| 7.2 平板 768px：网格列数变化、内边距调整 | 无横向滚动 |
| 7.3 移动端 390px：堆叠布局、汉堡菜单、触控目标 ≥44px | 所有内容可读可用 |
| 7.4 断点验证：确认每处 layout shift 的触发宽度 | 与 meetsocial 一致或合理 |
| 7.5 Admin 后台响应式 | 至少平板可用 |

### Phase 8: 视觉 QA、构建测试与部署准备 ✅

| 子任务 | 验证命令 |
|--------|---------|
| 8.1 Lint + TypeScript + Build 三件套 | `npm run check` |
| 8.2 逐页面视觉对比（设计稿 vs 实现 side-by-side） | 截图对比 `docs/design-references/comparison.png` |
| 8.3 所有链接点击验证（导航、CTA、外链） | 无 404、无死链 |
| 8.4 Admin 全流程走通：登录 → 修改数据 → 前台生效 → 回滚 | |
| 8.5 SEO Meta：每个页面的 title / description / OG | 修改 `src/app/layout.tsx` 及各页面 metadata |
| 8.6 部署配置（Vercel 推荐）：环境变量、Supabase 密钥、构建命令 | |

#### 实现记录（Phase 1–8 实际落地情况）

**技术选型偏差**（均属计划中列出的备选方案）：

| 计划项 | 实际实现 | 原因 |
|--------|---------|------|
| 数据存储 Supabase | **本地 JSON 文件存储**（`data/site.json`）+ Server Actions | 零外部依赖、可直接 git 版本化；`src/lib/db.ts` 已封装为单一读写入口，后续替换为 Supabase 只需改这一个文件 |
| Admin 鉴权 Middleware | **Cookie 会话 + Server Action 登录**（`src/lib/auth.ts`） | Next 16 Middleware 运行在 Edge，无法直接校验 Node 加密逻辑；页面级 `isAuthenticated()` 守卫更简单 |
| 富文本编辑器 | **结构化表单 + 多行文本**（段落按行拆分） | 免依赖、数据可校验；段落/要点分别存储为 `body[]` / `points[]` |
| Lenis / framer-motion / GSAP | **自研 `SmoothScroll` + CSS 动画 + IntersectionObserver + 滚动步进器** | 不新增依赖，体积更小（`src/components/providers/SmoothScroll.tsx`、`src/components/home/FlowSection.tsx`） |
| 图片上传 | **填写站内路径**（`/images/adfly/...`）+ 前台预览链接 | 部署到 Vercel 等只读文件系统时写文件不可靠，资源统一走 `public/` + Git |

**最终路由**：`/`、`/cases`、`/cases/[id]`、`/about`、`/careers`、`/careers/cities/[id]`、`/careers/jobs/[id]`、`/admin/login`、`/admin`、`/admin/content/{site,home,about,careers}`、`/admin/careers`、`/admin/careers/cities/[id]`、`/admin/careers/positions/[id]`、`/admin/cases`、`/admin/cases/[id]`。

**验收结果**（`npm run check` 全绿）：

| 验证项 | 方式 | 结果 |
|--------|------|------|
| Lint + TypeScript + Build | `npm run check` | ✅ 0 error / 0 warning |
| 登录鉴权 | POST 登录表单：错误密码回显提示，正确密码 303 → `/admin` 并下发 HttpOnly Cookie | ✅ |
| 后台表单幂等性 | 6 个内容/编辑页「取表单 → 原样提交 → 对比 JSON」（含招聘城市、招聘职位） | ✅ 完全一致（无字段丢失/新增） |
| 数据驱动生效 | 后台改 `home.hero.title` / `site.phone` → 前台 HTML 立即出现新值 | ✅ |
| 案例 CRUD | 新建 → 编辑 → 前台 `/cases/<id>` 渲染 → 删除 → 404 | ✅ |
| 响应式 / 控制台 | `node scripts/audit.mjs <url> "<paths>"` @1440/1024/768/390 | ✅ 20 个前台页面组合 + 8 个后台页面组合：无横向滚动、无 console error |
| Flow AI 环形滚轮 | CDP 探针（滚动采样 × 4 断点）校验「激活节点恒在 12 点方向且内容不倾斜」 | ✅ 7 个滚动位置全部 `angle=0° / composed=0°`，其余节点面板 `opacity=0` |
| 招聘站内流转 | 采集飞书招聘 7 城市 / 79 职位 → `/careers` 城市索引 → 城市职位列表 → 职位详情（均 200），未知标识返 404 | ✅ 无任何外链跳转；`/careers`、`/careers/cities/*`、`/careers/jobs/*` × 4 断点全部 OK |
| 招聘后台 CRUD | 新建城市 → 职位改归属 → 改城市标识（同步 `cityId` + `extraCities`）→ 删除城市（职位回退）→ 删除职位，每步校验 JSON 与前台 HTML | ✅ 全部通过，数据可 bit-identical 回滚 |

**新增脚本**：`scripts/audit.mjs`（响应式 + 控制台巡检）、`scripts/shots.mjs`（CDP 截图）。
后台使用说明见 `docs/ADMIN_GUIDE.md`。

---

## 🧩 推荐执行顺序（带并行机会）

```
Phase 0 已完成
    │
    ▼
Phase 1（侦察+提取）────────────────────── 串行，约 1-2 小时
    │
    ▼
Phase 2（基础架构）────────────────────── 串行，约 2-3 小时
    │
    ├─── 并行分支 A：Phase 3.1 首页开发
    ├─── 并行分支 B：Phase 3.2 + 3.3 Cases 列表+详情
    ├─── 并行分支 C：Phase 3.4 + 3.5 About + Careers
    └─── 并行分支 D：Phase 5（DB Schema + 数据层）
    │
    ▼  四条分支合并（逐一 git worktree merge，每步 npm run check）
    │
Phase 6（动画效果）────────────────────── 在前台页面上叠加
    │
    ▼
Phase 4（Admin 后台） ── 可与 Phase 6 并行
    │
    ▼
Phase 5 对接完成 ── 前台/Admin 都接入动态数据
    │
    ▼
Phase 7（响应式） + Phase 8（QA + 部署）
```

---

## 🔑 关键技术决策点（需要确认）

在正式执行 Phase 2 之前，请确认以下选型：

1. **数据存储方案**：
   - **A. Supabase**（推荐）：有 MCP 工具直接支持，内置 Auth + Storage + Postgres，适合长期维护
   - **B. 本地 JSON 文件 + Server Actions**：无外部依赖，适合仅需简单后台更新的场景

2. **Admin 鉴权方式**：
   - **A. Supabase Auth**（完整但重）
   - **B. 单用户密码 + Cookie Session**（简单，够用）

3. **招聘页面策略**：✅ 已选定 **B. 站内完整流转**（爬取飞书招聘数据落地 `data/site.json`），后台可维护城市 / 职位，详情页保留可选外部投递按钮

4. **客户案例详情数据**：
   - **A. 从现有 adflymobile.com 抓取迁移**
   - **B. 先用 mock，手动在 Admin 中录入**

---

## 📊 工作量估算（粗粒度）

| 阶段 | 预估小时 | 主要产出 |
|------|---------|---------|
| Phase 1 侦察 | 1-2h | 设计令牌、行为文档、截图 |
| Phase 2 基础架构 | 2-3h | 全局样式、类型、共享组件 |
| Phase 3 前台页面 | 8-12h | 5个路由 + ~25个组件 |
| Phase 4 Admin 后台 | 6-8h | 鉴权 + 5个模块 CRUD |
| Phase 5 数据层对接 | 3-5h | Schema + Actions + 对接 |
| Phase 6 动画效果 | 3-4h | 滚动/悬浮/入场动画 |
| Phase 7 + 8 QA & 部署 | 2-3h | 修复、测试、上线 |
| **合计** | **~25-37h** | |

---

## 📎 代码引用导航

| 文件 | 用途 |
|------|------|
| `AGENTS.md` | 项目规范与 clone skill 说明 |
| `.claude/skills/clone-website/SKILL.md` | Clone-Website 技能的完整工作流 |
| `docs/research/INSPECTION_GUIDE.md` | 网站侦察/检查清单 |
| `package.json` | 依赖与脚本（`npm run dev/build/check`） |
| `src/app/layout.tsx` | 根布局（字体、metadata 在此配置） |
| `src/app/globals.css` | Tailwind v4 主题 + 设计令牌注入点 |
| `src/app/page.tsx` | 首页路由（当前为 placeholder） |
| `readme.myself.md` | 原始需求文档 |
| `cbb3670d3d279437a01e1add32ba829b.jpg` | 首页视觉设计稿 |

---

## 设计原则
- **设计稿优先**：所有视觉元素以设计稿为准
- **动画参考 meetsocial**：提取动画效果的实现方式，非直接 clone 内容
- **像素级还原**：间距、颜色、字号精确匹配
- **动态可配置**：所有内容支持 Admin 后台动态更新
