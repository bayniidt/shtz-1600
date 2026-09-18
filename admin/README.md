# ADFLY Admin Frontend

ADFLY 管理后台前端：**React 18 + Ant Design 5 + Ant Design Pro Components + TypeScript + Vite 5 + Tailwind CSS v4 + Axios + React Router v6**。

后台地址：`/admin`（开发环境 `http://localhost:5173/admin/`）。

> 接手开发 / 新开对话窗口前，请先读 [`HANDOFF.md`](./HANDOFF.md)（工程约定、验收命令、常见坑）。

## 快速开始

```bash
npm install
cp .env.example .env
npm run dev     # → http://localhost:5173/admin/
```

> 默认后端地址通过 Vite 代理指向 `http://localhost:4000`，无需额外配置。
> 直接连远程后端时，设置 `VITE_API_BASE_URL=http://<host>/api/v1`。

默认账号：`admin / admin`（生产环境务必修改）。

## 脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 开发服务（含 `/api` 代理） |
| `npm run build` | 类型检查 + 生产构建到 `dist/` |
| `npm run preview` | 预览构建产物（`http://localhost:5174/admin/`，含 `/api` 代理） |
| `npm run typecheck` | 仅类型检查 |
| `npm test` | Vitest + Testing Library（jsdom） |
| `npm run test:coverage` | 覆盖率门禁：statements/lines ≥80%、branches ≥70%、functions ≥80% |
| `npm run test:smoke` | 真实 Chrome（CDP）冒烟：逐个路由检查空白页 / console 错误 / 失败请求 |

> 冒烟测试前置：后端 `:4000` 已启动，且前端构建产物已在 `:5174` 预览（`npm run build && npm run preview`）。
> 可通过 `BASE_URL` / `API_URL` / `CHROME_PATH` 环境变量覆盖默认值。

## 目录结构

```
src/
├── App.tsx                路由 + ConfigProvider（antd 主题）；导出 AppRoutes 便于测试
├── main.tsx               入口
├── layouts/BasicLayout    顶栏 + 侧边栏 + 内容区
├── components/
│   ├── RequireAuth        路由守卫
│   ├── PageContainer      统一页面容器（标题 / 副标题 / 操作区）
│   ├── ArrayEditor        通用数组编辑器（增 / 删 / 排序）
│   ├── ImagePicker        图片选择器（路径粘贴 + 预览）
│   ├── ContentForm        声明式内容表单（由 FieldSpec 描述驱动渲染）
│   ├── ContentEditor      内容编辑页壳（加载 / 保存 / 还原 / 未保存提示 / 重试）
│   ├── StringListInput    字符串数组编辑器
│   └── ModuleScaffold     其他未实现模块的接口骨架页
├── pages/
│   ├── Login/             登录页
│   ├── Dashboard/         概览
│   ├── Content/           站点与导航 / 首页内容 / 关于我们 / 招聘内容
│   ├── cases/             客户案例列表 / 新建 / 编辑
│   ├── careers/           招聘总览 / 城市编辑 / 职位编辑
│   ├── ThemeSettings/     主题设置（颜色 / 布局 / 排版）
│   └── NotFound.tsx
├── config/
│   ├── menu.tsx           菜单与标题
│   ├── endpoints.ts       各模块接口蓝图（骨架页展示用）
│   ├── content-fields.ts  内容页字段描述（FieldSpec[]）
│   └── theme.ts           主题类型 / 默认值 / 深合并 / CSS 变量
├── hooks/
│   ├── useContentResource 内容资源加载 / 保存 / 重试状态机
│   └── useUnsavedChanges  dirty 登记 + beforeunload 拦截
├── services/              request(Axios) / auth / settings / content / cases
├── store/                 zustand：auth、theme、dirty（多 id 未保存登记）
├── styles/index.css       Tailwind + 品牌变量 + 禁用动画
├── test/                  测试工具（setup.ts 环境补丁、utils.tsx 统一渲染、fixtures）
├── types/                 content / cases（内容模块与案例类型）、field-spec（表单字段描述）
└── utils/                 token、feedback
scripts/smoke.mjs          Chrome CDP 冒烟测试
```

## 测试

```bash
npm test                # 196 个用例（jsdom）
npm run test:coverage   # 覆盖率门禁（阈值：statements/lines 80%、branches 70%、functions 80%）
npm run build && npm run preview && npm run test:smoke   # 真实浏览器渲染校验
```

| 测试文件 | 覆盖内容 |
|----------|----------|
| `App.test.tsx` | 全部菜单路由渲染（无白屏）、Cases 列表页、404、未登录跳转、登录成功/失败流程、启动初始化 |
| `layouts/BasicLayout.test.tsx` | 菜单跳转、未保存修改时的二次确认（留在本页 / 放弃离开） |
| `components/ArrayEditor.test.tsx` | 增删排序、min/max 限制、禁用态、patch 更新 |
| `components/ImagePicker.test.tsx` | 路径输入、预览、非法地址提示、清空、禁用 |
| `components/StringListInput.test.tsx` | 新增 / 编辑 / 删除第 N 项 |
| `components/ContentForm.test.tsx` | 全字段类型渲染与回填、必填校验、对象数组增删移动、嵌套对象数组、disabled |
| `components/ContentEditor.test.tsx` | 保存 / 还原（二次确认）/ 错误重试 / 未保存提示 |
| `components/PageContainer / ModuleScaffold` | 容器渲染、接口清单与阶段展示 |
| `hooks/useContentResource / useUnsavedChanges` | 加载状态机、重试、dirty 登记与 `beforeunload` 拦截 |
| `pages/Content/*` | 四个内容页的加载回填 / 保存载荷 / 局部保存 / 错误分支 / dirty 行为 |
| `pages/cases/*` | 案例列表加载 / 置顶 / 删除确认，以及新建 / 编辑 / 嵌套 stats 与 blocks / 预览 / 加载失败 |
| `services/*.test.ts` | Axios 拦截器（Token 注入 / 401 清理 / 错误归一化）、auth / settings / content 接口 |
| `store/*.test.ts` | 登录态、主题状态机、dirty 多 id 登记 |
| `config/theme / utils/token / utils/feedback` | 主题合并与 CSS 变量、会话存储、消息反馈 |

> 内容表单字段多、antd 组件层级深，`--coverage` 插桩下用例耗时较长（约 2~3 分钟），已把 `testTimeout` 调至 30s、并发限制为 4 个 worker。

## Stage 4 交付（招聘城市 / 职位 CRUD）

- 招聘总览：城市卡片 Grid（职位数、重点标记、删除回退）+ 职位 ProTable（城市、热招/急招、关键词筛选）。
- 城市编辑：城市基本信息、重点开关、关联职位只读表格；编辑时明确提示修改 id 会联动职位。
- 职位编辑：主归属城市单选、附加城市多选、职位属性和职责/要求/加分项多行文本。
- 服务层：src/services/careers.ts 覆盖城市与职位 10 个 REST 接口。
- 测试：城市 / 职位服务、总览、城市编辑、职位编辑均有用例，覆盖回退参数、多选回写和加载失败基础路径。

## Stage 3 交付（客户案例 CRUD）

- Cases 列表页：ProTable 分页、行业/置顶筛选、关键词搜索、置顶切换、删除确认、新建入口。
- Cases 编辑页：基本信息、封面路径、奖项/标签、`stats[]` 指标数组、`blocks[]` 内容板块及段落/要点数组；编辑时业务主键只读。
- 前台预览：编辑页和列表页均可在新窗口打开 `/cases/:id`。
- 服务层：`src/services/cases.ts` 覆盖列表页文案、列表、详情、创建、更新、删除、置顶接口。
- 测试：服务层 9 条、列表页 4 条、编辑页 4 条；Stage 4 追加招聘模块服务与页面用例。

## Stage 2 交付（内容模块）

- 4 个内容页面接真实接口：**站点与导航**（`GET/PUT /site`）、**首页内容**（`GET /home` + 按 6 个板块分别 `PUT /home/{section}`）、
  **关于我们**（`GET/PUT /about`）、**招聘内容**（`GET/PUT /careers/content`）
- 声明式表单体系：`config/content-fields.ts` 里用 `FieldSpec[]` 描述字段 → `ContentForm` 递归渲染（文本 / 多行 / 数字 / 下拉 / 开关 / 图片 /
  字符串数组 / 链接 / 嵌套对象 / 对象数组），新增字段只需改描述，无需写表单代码
- 保存与保护：保存/还原按钮 +「有未保存的修改」提示；切换菜单时弹二次确认，浏览器关闭/刷新由 `beforeunload` 兜底
- 失败可恢复：加载失败展示错误 + 重试；保存失败保留用户输入并展示后端错误文案
- 首页 6 个板块为独立 Tab，各自独立保存与独立 dirty 登记（互不覆盖）
- 冒烟脚本对齐真实页面内容（站点→公司名称、首页→Hero 区、关于→首屏简介、招聘→首屏标题）

## Stage 1 交付（通用骨架）

- 后端模块接口全部注册（未实现模块保留 501 占位 + 写入鉴权 + Swagger 条目；Stage 4 城市 / 职位已切换为真实接口）
- 前端菜单 / 路由骨架：每个菜单路由都有真实页面（模块骨架页展示接口清单与实现阶段），**不存在空白页**
- 通用组件 `ArrayEditor` / `ImagePicker` / `PageContainer` 就绪，直接供 Stage 2~4 复用
- 主题管理闭环：`/settings/theme` 可在线改色 → 即时生效 → 可恢复默认
- 双重测试体系：Vitest + Chrome CDP 真实渲染冒烟（Stage 4 覆盖招聘总览、城市与职位新建/编辑页）

## 主题色控制

后台主题由**后端接口驱动**，可在不重新构建前端的前提下调整：

1. 前端启动时调用 `GET /api/v1/settings/theme`，失败则回退到内置默认值（与前台 `web/src/app/globals.css` 的 ADFLY 品牌色一致）。
2. 主题写入 antd `ConfigProvider` token，同时同步到 CSS 变量 `--adfly-brand*`，Tailwind 类名（`text-brand` 等）与自定义样式均可使用。
3. 调整方式：`PUT /api/v1/settings/theme`，也可以直接在后台 **系统设置 → 主题设置** 页面修改（保存后无需刷新即生效）。例：

```bash
curl -X PUT http://localhost:4000/api/v1/settings/theme \
  -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
  -d '{"brand":{"colorPrimary":"#0066ff"}}'
```

4. 恢复默认：`POST /api/v1/settings/theme/reset`。

## 约定

- **无动画**：`ConfigProvider` 设置 `motion: false`，全局 CSS 将 `animation/transition` 置 0。
- **鉴权**：Token 存 `localStorage`（`adfly_admin_token`），Axios 拦截器自动附带 `Authorization: Bearer`；`401` 自动清理会话并跳回登录页。
- **样式**：Tailwind v4 仅引入 `theme` + `utilities`（跳过 preflight），避免覆盖 antd 基础样式。
- 后台全部页面 `noindex, nofollow`，不进搜索引擎。
