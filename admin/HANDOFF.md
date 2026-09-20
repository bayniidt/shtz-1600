# ADFLY 项目交接说明（HANDOFF）

> 给「下一个接手的人 / 下一个对话窗口（AI）」看的工程约定与现状快照。
> **开工前请先读**：本文件 → `ADMIN_DEVELOPMENT_PLAN.md`（阶段目标与完成情况）→ `admin/README.md` + `server/README.md`（目录与命令）。
> 最后更新：Stage 6 完成时。

---

## 0. 一句话现状

Stage 0 / 1 / 2 / 3 / 4 / 5 / 6 全部实现完成，常规测试 / 覆盖率 / 类型检查 / 构建 / 文档验收通过：
- 后端：认证 + 主题 + **内容模块（site / home 6 板块 / about / careers content，13 个真实接口）** + **Cases 8 个真实接口** + **Careers 城市 / 职位 10 个真实接口**。
- 后台前端：登录 / 守卫 / 布局 / 主题设置 / 4 个内容编辑页 + **Cases 列表页与新建/编辑页** + **Careers 总览、城市编辑、职位编辑**。
- Stage 6：OpenAPI 文档完整化、后台蓝图动态同步、边界测试与覆盖率门禁收口。
- **下一步 = Stage 7：服务器部署准备**。

---

## 1. 目录与端口

```
/Users/cc/Repository/1600/
├── web/      Next.js 16 前台         → :3000   （API 优先，JSON 快照兜底）
├── admin/    React 18 + antd 5 后台  → :5173/admin/   （preview :5174）
├── server/   Express 4 + Mongo 7    → :4000/api/v1
└── admin/ADMIN_DEVELOPMENT_PLAN.md   阶段计划（唯一进度真相来源）
```

- 数据库：本地 brew MongoDB；开发库 `adfly_admin`，测试库 `adfly_admin_test`。
- 默认账号 `admin / admin`（`.env` 可覆盖）。
- 后台路由前缀 `/admin`（`vite base = /admin/`），后端前缀 `/api/v1`。

## 2. 本地启动

```bash
brew services start mongodb/brew/mongodb-community

cd server && npm install && cp .env.example .env && npm run seed && npm run dev   # :4000
cd ../admin && npm install && cp .env.example .env && npm run dev                # :5173/admin/
cd ../web && npm run dev                                                          # :3000（前台，可选）
```

> **重启后端**：如果之前用 `npx tsx src/server.ts`（无 watch）启动，改完代码必须
> `lsof -ti :4000 | xargs kill -9` 再起；推荐直接用 `npm run dev`（`tsx watch`）。
> 服务启动时会自动调用 `seedContentIfMissing()`；缺 `web/data/site.json` 只警告不阻塞。

## 3. 验收命令（每完成一个阶段都要全绿）

| 范围 | 命令 | 门禁 / 当前值（Stage 6） |
|------|------|--------------------------|
| 后端测试 | `cd server && npx jest --runInBand --forceExit` | **197/197** 用例通过 |
| 后端覆盖率 | `cd server && npm run test:coverage` | **98.49% / 80.47% / 95.86% / 99.07%**（statements / branches / functions / lines），四项 ≥80% |
| 前端测试 | `cd admin && npx vitest run` | **198/198** 用例通过 |
| 前端覆盖率 | `cd admin && npm run test:coverage` | **97.18% / 86.72% / 89.39% / 97.18%**（statements / branches / functions / lines），四项 ≥80% |
| 类型检查 | `cd admin && npx tsc --noEmit` | 必须干净 |
| 构建 | `cd admin && npm run build` | 主 chunk 约 2.05 MB / gzip 约 655 kB（Vite 体积提示） |
| 真实浏览器冒烟 | `cd admin && npm run build && npm run preview` + `npm run test:smoke` | 15 个路由（需后端 :4000 + preview :5174） |
| 前台类型检查 / 构建 | `cd web && pnpm run typecheck && pnpm run build` | 通过；页面使用 API 优先 + JSON 兜底 |
| 前台快照导出 | `cd web && pnpm run export` | 从后端 API 导出 `data/site.json` |

阶段收尾清单（一个都别漏）：
1. 后端/前端常规测试与覆盖率门禁全绿；
2. `tsc --noEmit` 干净、`npm run build` 通过、`npm run test:smoke` 通过（dev 与 preview 各跑一次）；
3. 冒烟脚本 `admin/scripts/smoke.mjs` 的期望文案同步更新；
4. 文档：`ADMIN_DEVELOPMENT_PLAN.md` 该阶段打 ✅ + 写「完成情况」小结；`server/README.md`（接口表 / 骨架表 / 测试表 / 覆盖率）、`admin/README.md`（目录树 / 测试表 / 交付说明）、根 `README.md`（进度 + 验收表）。

---

## 4. 后端约定（`server/`）

### 4.1 响应与错误

```jsonc
{ "code": 0, "message": "ok", "data": ... }              // 成功
{ "code": 4000, "message": "参数校验失败", "errors": [{ "path": "name", "message": "该字段必填" }] }  // 失败
```

| code | HTTP | 含义 |
|------|------|------|
| 0 | 200 | 成功 |
| 4000 | 400 | 参数校验失败 |
| 4010 | 401 | 未登录 / Token 失效 / 已过期 |
| 4030 | 403 | 无权限 |
| 4040 | 404 | 资源不存在 |
| 4090 | 409 | 业务主键（id）冲突 |
| 4290 | 429 | 请求过于频繁 |
| 5000 | 500 | 服务器内部错误 |
| **5001** | **501** | **功能开发中（保留错误码兼容）** |

- 统一用 `ApiError.badRequest/unauthorized/notFound/conflict(...)` + `catchAsync()` + `sendOk()`；异步 controller 不要自己 try/catch。
- 尚未实现的模块才使用 `notImplemented("说明")`（唯一来源：`src/utils/notImplemented.ts`）；Stage 4 Careers 已不再使用占位接口。
- 错误码定义在 `src/utils/ApiError.ts` 的 `ErrorCode`。

### 4.2 中间件与校验（重要）

- `protect`：写操作一律挂（未登录 401）。`validate({ body, params, query })`：把 Zod 结果写回 `req`。
- **Zod 一律 `.strict()`**：未知字段 → 4000「不支持的字段：X」；缺失必填 → 4000「该字段必填」。
- `validate.ts` 会**剥离** `_id / __v / key / createdAt / updatedAt`（`MANAGED_KEYS`）后再 parse：
  目的是让 `GET → PUT` 回环可用，同时防止客户端伪造服务端管理字段。**新接口沿用这个行为，别再单独处理。**
- Zod 报错文案统一在 `validate.ts` 里翻译成中文，不要在 schema 里写 `message`（除少数业务特定文案）。
- 可复用校验片段在 `src/validations/common.validation.ts`：`text()`、`requiredText()`、`optionalEmail`、`linkSchema`、`flagSchema`、`textList()`、`statSchema`、`titledItemSchema`、`slugSchema`。

### 4.3 模型与数据

- 每个 `model()` 都显式传第 3 个参数做**蛇形集合名**（如 `case_items`、`careers_positions`），别用默认复数。
- 单例文档（site / home / about / careersContent / casesPage）：`key = "default"` + `key` 唯一索引；
  `toJSON` 剥离 `_id/__v/key/createdAt`，**保留 `updatedAt`**。实体（CaseItem / CareersCity / CareersPosition）剥离 `_id/__v`，保留业务主键 `id`。
- 实体唯一索引建在业务字段 `id` 上；主键冲突 → 4090。
- 三态标记 `featured / hot / urgent / major` 用 Mongoose `Mixed` **原样存取**（`true` / `"yes"` 都保留），统一用导出的 `isTruthyFlag()` 归一化判断，不要改成 Boolean。
- 单例读写用 `src/services/singleton.service.ts` 的 `readSingleton()` / `updateSingleton()`。
- 类型集中在 `src/types/site-data.ts`（`SiteDataInput` 等，与 `web/data/site.json` 对齐）。

### 4.4 Seed 脚本

`src/services/seed.service.ts` 导出：`ensureDefaultAdmin`、`seedContentFromSiteData`、`readSiteDataFile`、`seedAll`、`seedContentIfMissing`。
`scripts/seed.ts` 支持 `--force`（清库重建）/ `--content-only`。数据源 `config.siteDataFile`（默认 `../web/data/site.json`）。
Stage 2 实测：site 1 / home 1 / casesPage 1 / caseItems 8 / about 1 / careersContent 1 / cities 7 / positions 79，重复执行幂等。

### 4.5 Swagger

- `src/docs/helpers.ts`：`errorResponse`、`envelope`、`jsonRequest`、`commonErrors`。
- `src/docs/content.paths.ts`：`contentSchemas`、`contentPaths()`、`singletonPaths()`。
- `src/docs/swagger.ts`：`placeholderEndpoints()` 是**占位接口清单的唯一来源**，当前返回空数组；Careers 文档在 `src/docs/careers.paths.ts`。
- `GET /api/docs`：Swagger UI；`GET /api/docs/openapi.json`：原始 OpenAPI 3.0 JSON；`GET /api/docs/error-codes`：统一 envelope 的错误码表。
- 每个 operation 都必须有至少一个 2xx 响应示例；写接口必须有 JSON 请求示例；错误响应示例必须有 `code` / `message`，4000 还应展示 `errors`。
- `admin/src/config/endpoints.ts` 的 `loadModuleBlueprints()` 从 `/api/docs/openapi.json` 同步接口清单；请求失败时回退静态蓝图。
- 覆盖率排除 `src/server.ts` 与 `src/docs/**`。

### 4.6 后端测试写法

- 位置 `server/tests/*.test.ts`；`tests/setup.ts` + `tests/helpers/db.ts` 提供：
  `setupTestDB()` / `resetTestDB()` / `teardownTestDB()`、`seedFixtureContent()`、`loginAsAdmin(app)`、`bearer(token)`。
- 夹具在 `tests/fixtures/site-data.ts`（`SITE_DATA_FIXTURE`）。新增内容模块时**扩展夹具**，别在用例里手写大对象。
- 每个接口至少覆盖：正常 / 未登录 401 / 校验失败 4000（含未知字段）/ 找不到 404 / 冲突 4090（有业务主键时）/ 边界（空数组、可选字段缺省）。
- 命名风格：用例标题带 `T1`、`T2`… 编号（如 `tests/site.test.ts` 的 T1–T15），便于对着文档追溯。

---

## 5. 前端约定（`admin/`）

### 5.1 结构与路由

- 路由与菜单在 `src/App.tsx` + `src/config/menu.tsx`（`MENU_ITEMS` / `ROUTE_TITLES` / `DEFAULT_OPEN_KEYS`），`AppRoutes` 单独导出便于测试。
- 后端接口蓝图在 `src/config/endpoints.ts`（`MODULE_BLUEPRINTS`，含 `stage` / `implemented?` / `endpoints`），供 `ModuleScaffold` 骨架页展示；
  **实现某模块后把 `implemented` 置 `true`**，并把 `App.tsx` 里对应路由从 `ModuleScaffold` 换成真实页面。
- 主题：`src/store/theme.ts` + `src/config/theme.ts`，由后端 `GET /settings/theme` 驱动；令牌 `--color-brand: #1e96d4`、accent `#ed5736`；**全局 `motion: false`，禁止动画**。

### 5.2 内容模块的通用件（Stage 2 遗产，Stage 3/4 请优先复用）

| 文件 | 用途 |
|------|------|
| `src/types/field-spec.ts` | `FieldSpec` 联合类型：text / textarea / number / select / switch / image / stringList / link / groupList / object；`emptyValueOf` / `emptyItemOf` |
| `src/components/ContentForm.tsx` | 由 `FieldSpec[]` 递归渲染的声明式表单；导出 `renderField`；`formName` 用于给字段 id 加前缀（**一页多表单必须传**，否则 id 冲突） |
| `src/components/ContentEditor.tsx` | 页面壳：加载骨架 / 保存 / 还原（二次确认）/ 未保存提示 / 失败重试；`testId` + `${testId}-card` |
| `src/components/StringListInput.tsx` | 字符串数组编辑器 |
| `src/hooks/useContentResource.ts` | `{ load, save, mapResult? }` → `{ data, loading, saving, error, save, reload }` |
| `src/hooks/useUnsavedChanges.ts` | dirty 登记 + `beforeunload` 拦截；导出 `UNSAVED_CONFIRM_TITLE/CONTENT` |
| `src/store/dirty.ts` | **多 id** 脏数据登记（`markDirty(id,label)` / `clearDirty(id)`），Home 6 个 Tab 同时挂载也不会互相覆盖 |
| `src/config/content-fields.ts` | 4 个内容页的字段描述集中地：`SITE_FIELDS`、`HOME_*_FIELDS`、`ABOUT_FIELDS`、`CAREERS_CONTENT_FIELDS` |
| `src/types/content.ts` | 内容模块类型 + `HOME_SECTIONS` |

约定：
- 列表类页面（Stage 3 的案例列表、Stage 4 的城市/职位列表）用 **ProTable**；标签用 `ArrayEditor` 或 `StringListInput`。
- 需要 dirty 保护的页面：`useUnsavedChanges(dirty, label, id?)`，`ContentEditor` 里已自动处理（传 `dirtyId`）。
- 保存成功 `message.success("已保存")`；失败 `message.error(错误文案)`（错误文案来自响应 `message`，中文由后端给）。
- 服务层：`src/services/content.ts` 已有内容接口；`src/services/cases.ts` 已接入 Cases；`src/services/careers.ts` 已接入城市 / 职位 10 个 REST 接口（`request` 统一处理 token 注入与 401 跳转）。

### 5.3 前端测试写法（血泪教训，务必遵守）

- **交互一律用 `fireEvent`**（`fireEvent.click` / `fireEvent.change(input, { target: { value } })`）。
  `userEvent` 在 `--coverage` 插桩下**慢 10 倍以上**（单次 click 从 0.6s 变 7s），Stage 2 因此踩过大量超时坑。仅在下拉框等确实需要时才用 `userEvent`。
- 渲染统一走 `renderWithProviders(ui, { route })`（自带 antd ConfigProvider + zh_CN + AntdApp + MemoryRouter）；`src/test/utils.tsx` re-export 了 testing-library。
- 覆盖率插桩 + 并发下测试很慢，配置已调到：`testTimeout: 30000`、`poolOptions.threads.maxThreads: 4`、`configure({ asyncUtilTimeout: 5000 })`（`src/test/setup.ts`）。
  **超大表单用例（About / Site 列表项 / Home 切 Tab）单独加超时**，如 `it("...", async () => {...}, 60000);`。
- 断言注意：
  - antd `Modal.confirm` 的标题文本会出现在 `.ant-modal-confirm-title` 和 body 里两次 → 用 `findByRole("dialog")` 再断言 `toHaveTextContent`，别用 `getByText`。
  - `Modal` 里的按钮点击后可能立刻卸载 → 用 `fireEvent.click`，`userEvent` 会卡住。
  - 表格/表单里同名 label 很常见（如「标题」「名称」）→ `getAllByLabelText(...)[n]` 或 `within(panel)` 限定范围。
  - `stringList` 不是表单控件 → 用 `getByDisplayValue("Facebook")` 断言。
- 测试 id 约定：`page-container` / `page-title` / `content-form` / `content-editor` / `content-editor-card` / `content-save` / `content-reset` / `content-dirty-tip` / `content-retry` / `string-list` / `group-list-<name>`；组件 `testId` 传外层，卡片是 `${testId}-card`。
- 测试数据放 `src/test/fixtures/content.ts`（已包含 Cases 列表页与案例夹具）。
- 覆盖率排除 `src/test/**`、`src/main.tsx`、`*.d.ts`。

### 5.4 冒烟测试（真实浏览器）

`admin/scripts/smoke.mjs`：用 Node 全局 `WebSocket` + 原生 CDP 驱动 headless Chrome，逐个路由检查「非空白 / 无 console error / 无失败请求」。
- 期望文案在脚本里的 `ROUTES` 数组；**新页面要加进去**。
- 纯资源类 404（前台站点的 `/images/**`）已按 URL 后缀 + `Log.url` 过滤，属预期噪音。
- 可用 `BASE_URL=http://localhost:5173 npm run test:smoke` 对 dev server 跑。

---

## 6. 常见坑速查

| 现象 | 原因 / 处理 |
|------|-------------|
| 改了后端代码没生效 | 后端不是 watch 模式 → `lsof -ti :4000 \| xargs kill -9` 后重启（推荐 `npm run dev`） |
| `GET` 的结果直接 `PUT` 回去报 4000 | 别把 `_id/__v/...` 当业务字段；`validate` 已剥离，若仍报错说明 schema 少了字段（strict） |
| 前端页面 id / htmlFor 串了 | 一页多个 `ContentForm` 必须各自传不同 `formName` |
| 测试偶发超时 | 覆盖率 + 并发导致；用 `fireEvent`、放宽该用例超时，别怀疑业务代码 |
| `Found multiple elements` | 同名 label/文案；用 `getAllBy*` 或 `within()` |
| 冒烟报 image 404 | 前台图片资源不在后台域下，已在脚本过滤；不要为了它去改业务 |
| `npm test` 与 `test:coverage` 结果不同 | 覆盖率插桩更慢，先看覆盖率是否只是超时 |

---

## 7. 各阶段剩余工作（详见 `ADMIN_DEVELOPMENT_PLAN.md`）

- **Stage 3 已完成**：Cases 列表页文案 + 7 个案例 CRUD/操作接口，Zod 覆盖 `stats[]` 与 `blocks[]` 嵌套；前端案例列表（ProTable + 筛选 + 置顶 + 删除确认）+ 新建/编辑页（`ArrayEditor`）+ 前台预览。
- **Stage 4 已完成**：改城市 `id` 联动更新职位的 `cityId`/`extraCities`、删除城市回退、`cityId` 合法性校验、列表聚合 `positionsCount`；前端城市卡片 Grid + 职位 ProTable。
- **Stage 5 已完成**：`web/src/lib/db.ts` API 优先读取 site/home/about/cases/careers，任一 API 不可用时回退 `data/site.json`；公共页面保持 `force-dynamic`；新增 `web/scripts/export.mjs` 与 `pnpm run export`；Dashboard 统计卡片、行业分布饼图、公司时间线改为实时 API 数据。
- **Stage 6 已完成**：Swagger 请求 / 响应示例补齐；新增 OpenAPI JSON、文档完整性测试、动态接口蓝图同步；后端覆盖率四项达到门禁（branches 80.47%），并补齐 Careers 边界测试。
- **Stage 7**：部署配置。

---

## 8. 新对话窗口开场白模板

```
继续 stage6。先读 admin/HANDOFF.md、admin/ADMIN_DEVELOPMENT_PLAN.md 的 Stage 6 章节、
admin/README.md、server/README.md，然后开始实现接口文档完整化与测试覆盖率收尾，完成后按 HANDOFF 第 3 节的收尾清单验收并更新文档。
```

换其他阶段把「stage6 / 接口文档与覆盖率收尾」替换即可（stage3 / stage4 / stage5 / stage7）。
