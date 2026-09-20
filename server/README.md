# ADFLY Admin Server

ADFLY 管理后台后端服务：**Express 4 + MongoDB 7 + Mongoose 8 + TypeScript + JWT**。

## 快速开始

```bash
# 1. 本地 MongoDB（已通过 brew 安装）
brew services start mongodb/brew/mongodb-community

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env

# 4. 初始化默认管理员（admin / admin）
npm run seed

# 5. 启动开发服务
npm run dev
# → API  http://localhost:4000/api/v1
# → 文档 http://localhost:4000/api/docs
```

## 脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | tsx watch 热重载 |
| `npm run build` | 编译到 `dist/` |
| `npm start` | 生产模式启动 |
| `npm test` | Jest + Supertest（独立测试库 `MONGO_URI_TEST`） |
| `npm run test:coverage` | 覆盖率报告与门禁（statements/lines/branches/functions 均 ≥80%） |
| `npm run seed` | 初始化默认管理员 |
| `npm run typecheck` | TypeScript 类型检查 |

## 目录结构

```
src/
├── app.ts                 Express 实例（中间件 / 路由 / 错误处理）
├── server.ts              启动入口（连库 → seed → listen）
├── config/                env 读取、Mongoose 连接、主题默认值
├── middlewares/           auth(JWT) / error / validate(Zod) / rateLimit
├── models/                Mongoose Schema
├── controllers/           业务逻辑
├── routes/                路由挂载
├── services/              seed 等
├── utils/                 ApiError / catchAsync / respond / jwt
├── validations/           Zod 校验 schema
└── docs/                  OpenAPI 3.0 文档（Swagger UI）
tests/                     Jest + Supertest，每个模块一个文件
scripts/                   seed.ts
```

## 响应约定

成功：`{ "code": 0, "message": "ok", "data": ... }`
失败：`{ "code": 4010, "message": "...", "errors": [{ "path": "username", "message": "..." }] }`

| code | HTTP | 含义 |
|------|------|------|
| 0 | 200 | 成功 |
| 4000 | 400 | 参数校验失败 |
| 4010 | 401 | 未登录 / Token 失效 / Token 已过期 |
| 4030 | 403 | 无权限 |
| 4040 | 404 | 资源不存在 |
| 4090 | 409 | 业务主键（id）冲突 |
| 4290 | 429 | 请求过于频繁 |
| 5000 | 500 | 服务器内部错误 |
| 5001 | 501 | 功能开发中（保留错误码兼容） |

## 已实现接口

| Method | Path | 保护 | 说明 |
|--------|------|------|------|
| POST | `/api/v1/auth/login` | ❌ | 登录，返回 JWT（失败 15 分钟内 10 次 → 4290） |
| GET | `/api/v1/auth/me` | ✅ | 当前登录用户 |
| POST | `/api/v1/auth/logout` | ✅ | 退出（Token 加入内存黑名单） |
| GET | `/api/v1/settings/theme` | ❌ | 读取后台主题配置 |
| PUT | `/api/v1/settings/theme` | ✅ | 局部更新主题 |
| POST | `/api/v1/settings/theme/reset` | ✅ | 恢复默认主题 |
| GET | `/api/v1/site` | ❌ | 站点配置（名称 / Logo / 导航 / 联系方式 / SEO / 页脚链接） |
| PUT | `/api/v1/site` | ✅ | 整文档更新站点配置（Zod strict） |
| GET | `/api/v1/home` | ❌ | 首页 6 个板块全量内容 |
| PUT | `/api/v1/home/{section}` | ✅ | 按板块更新（`hero` / `media` / `flow` / `clients` / `strength` / `honors`） |
| GET | `/api/v1/about` | ❌ | 关于我们内容 |
| PUT | `/api/v1/about` | ✅ | 整文档更新关于我们 |
| GET | `/api/v1/careers/content` | ❌ | 招聘页面文案（不含城市 / 职位） |
| PUT | `/api/v1/careers/content` | ✅ | 整文档更新招聘文案 |
| GET | `/api/v1/cases/page` | ❌ | 案例列表页文案 |
| PUT | `/api/v1/cases/page` | ✅ | 更新案例列表页文案 |
| GET | `/api/v1/cases` | ❌ | 案例分页列表（行业 / 置顶 / 关键词筛选） |
| POST | `/api/v1/cases` | ✅ | 新建案例 |
| GET | `/api/v1/cases/{id}` | ❌ | 案例详情 |
| PUT | `/api/v1/cases/{id}` | ✅ | 编辑案例（业务 id 不可修改） |
| DELETE | `/api/v1/cases/{id}` | ✅ | 删除案例 |
| POST | `/api/v1/cases/{id}/featured` | ✅ | 切换案例首页置顶 |
| GET | `/api/v1/careers/cities` | ❌ | 城市分页列表（含 `positionsCount`） |
| POST | `/api/v1/careers/cities` | ✅ | 新建城市 |
| GET | `/api/v1/careers/cities/{id}` | ❌ | 城市详情 + 关联职位 |
| PUT | `/api/v1/careers/cities/{id}` | ✅ | 编辑城市，改 id 联动职位 |
| DELETE | `/api/v1/careers/cities/{id}` | ✅ | 删除城市，职位回退到其他城市或清空主城市 |
| GET | `/api/v1/careers/positions` | ❌ | 职位分页列表（城市 / 热招 / 急招 / 关键词筛选） |
| POST | `/api/v1/careers/positions` | ✅ | 新建职位，校验主城市并过滤无效附加城市 |
| GET | `/api/v1/careers/positions/{id}` | ❌ | 职位详情 |
| PUT | `/api/v1/careers/positions/{id}` | ✅ | 编辑职位 |
| DELETE | `/api/v1/careers/positions/{id}` | ✅ | 删除职位 |
| GET | `/api/v1/health` | ❌ | 健康检查 |
| GET | `/api/docs` | ❌ | Swagger UI（含全部 path） |
| GET | `/api/docs/openapi.json` | ❌ | 原始 OpenAPI 3.0 JSON（可供前端蓝图 / 工具导入） |
| GET | `/api/docs/error-codes` | ❌ | 错误码表 |

> 内容接口细节：
> - 单例文档以 `key = "default"` 唯一，`toJSON` 剥离 `_id/__v/key/createdAt`（保留 `updatedAt`），因此 GET 结果可直接回传 PUT。
> - 校验中间件会剥离 `_id/__v/key/createdAt/updatedAt` 后再解析，客户端无法伪造服务端管理字段。
> - Zod 全部 **strict**：未知字段 → 4000「不支持的字段：X」，缺失必填 → 4000「该字段必填」。
> - `featured` / `hot` / `urgent` / `major` 为三态标记，按原值存取（`true` / `"yes"` 均可）。
> - 招聘 `portalUrl` / `applyUrl` 只接受空值或绝对 `http://` / `https://` 地址，避免脚本协议进入前台链接。

## Stage 4 Careers CRUD

城市和职位接口已实现并在 Swagger 中登记。城市列表会统计主归属或附加城市职位数；修改城市
`id` 会同步更新职位的 `cityId` 与 `extraCities`。删除城市时可通过请求体指定 `fallbackCityId`，
省略时自动选择其他城市；如果已无其他城市，职位保留但主 `cityId` 清空。

职位创建 / 更新要求 `cityId` 是已存在城市，`extraCities` 中不存在或重复的城市 id 会被过滤并去重。

## 测试

```bash
npm test                # 常规 Jest 用例
npm run test:coverage   # 覆盖率门禁：statements/lines/branches/functions 均 ≥80%
npm run seed            # 从 ../web/data/site.json 初始化内容（--force / --content-only）
```

| 测试文件 | 用例数 | 覆盖内容 |
|----------|--------|----------|
| `tests/auth.test.ts` | 16 | 登录 / 当前用户 / 退出 / 限流 / 过期 Token |
| `tests/theme.test.ts` | 8 | 读取 / 更新 / 重置主题 |
| `tests/site.test.ts` | 16 | 站点配置读取 / 更新 / 鉴权 / strict 校验 / 异常分支 |
| `tests/home.test.ts` | 20 | 首页 6 板块读取与分区更新 / 非法 section / 嵌套数组校验 |
| `tests/about.test.ts` | 11 | 关于我们读取 / 更新 / 校验 |
| `tests/careers.test.ts` | 21 | 招聘文案、城市 / 职位 CRUD、id 联动、回退、筛选与校验、外部 URL 协议校验、边界错误 |
| `tests/cases.test.ts` | 37 | 案例列表页文案、案例 CRUD、分页筛选搜索、嵌套 stats/blocks、置顶与鉴权 |
| `tests/seed.test.ts` | 20 | 内容拆分写入 / 幂等 / force / 缺文件 / 启动自愈 / bcrypt 管理员 hash |
| `tests/models.test.ts` | 10 | 8 个模型的默认值 / 索引 / toJSON 剥离规则 |
| `tests/skeleton.test.ts` | 5 | 已无 Stage 4 占位接口；静态路由优先级、OpenAPI JSON 与文档示例完整性 |
| `tests/infra.test.ts` | — | ApiError / 响应封装 / 错误中间件 / 校验中间件 / 鉴权中间件 / JWT / 模型 / 环境变量解析 |

Stage 4 常规测试已覆盖城市 id 联动、删除回退、最后城市边界、职位城市合法性与 `extraCities` 过滤；Stage 5 增加招聘外部 URL 协议校验；Stage 6 补充城市 / 职位筛选、冲突、找不到与非法回退边界；Stage 7 增加生产管理员 hash 配置验证。当前常规 Jest **198/198** 全部通过；覆盖率为 **98.49% statements / 80.78% branches / 95.86% functions / 99.07% lines**。

## OpenAPI 文档约定

- 成功响应统一使用 `{ code, message, data }`，每个 2xx 响应都带 `application/json.example`。
- 每个写接口的 JSON 请求体都带示例；错误响应至少带 `code`、`message`，4000 额外展示 `errors` 字段。
- URL 字段 `portalUrl` / `applyUrl` 的 schema 标注为 URI，并注明仅接受空值或绝对 `http://` / `https://` 地址。

测试使用独立库 `adfly_admin_test`，每个用例前清空集合并重建管理员，不会污染开发数据。

## 生产容器部署

`server/Dockerfile` 使用多阶段构建：builder 编译 TypeScript，runner 仅安装生产依赖并以 `node` 用户运行；启动时仍会自动执行默认管理员与内容补种。生产环境优先设置 `ADMIN_PASSWORD_HASH`，不要把管理员明文密码写入环境变量。

从项目根目录启动完整栈：

```bash
cp deploy/.env.production.example .env
# 填写 JWT_SECRET、ADMIN_PASSWORD_HASH、CORS_ORIGIN
docker compose up -d --build
```

容器内 API 使用 `mongodb://mongo:27017/adfly_admin`，站点快照路径为 `/app/web/data/site.json`；如接入外部 MongoDB，可覆盖 `MONGO_URI`。
