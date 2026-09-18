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
| `npm run test:coverage` | 覆盖率报告（目标 ≥80%） |
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
| 5001 | 501 | 功能开发中（Stage 3/4 路由骨架占位） |

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
| GET | `/api/v1/health` | ❌ | 健康检查 |
| GET | `/api/docs` | ❌ | Swagger UI（含全部 path） |
| GET | `/api/docs/error-codes` | ❌ | 错误码表 |

> 内容接口细节：
> - 单例文档以 `key = "default"` 唯一，`toJSON` 剥离 `_id/__v/key/createdAt`（保留 `updatedAt`），因此 GET 结果可直接回传 PUT。
> - 校验中间件会剥离 `_id/__v/key/createdAt/updatedAt` 后再解析，客户端无法伪造服务端管理字段。
> - Zod 全部 **strict**：未知字段 → 4000「不支持的字段：X」，缺失必填 → 4000「该字段必填」。
> - `featured` / `hot` / `urgent` / `major` 为三态标记，按原值存取（`true` / `"yes"` 均可）。

## 路由骨架（Stage 3/4）

下列模块的路由已注册但业务逻辑尚未实现：统一返回 `501 / code=5001`，写操作一律经过 `protect`（未登录 401）。

| 模块 | 路径前缀 | 接口数 | 计划实现 |
|------|----------|--------|----------|
| 客户案例 | `/cases` | 8 | Stage 3 |
| 招聘城市 | `/careers/cities` | 5 | Stage 4 |
| 招聘职位 | `/careers/positions` | 5 | Stage 4 |

共 **18** 个骨架接口，均已在 Swagger 文档中登记（含 501 / 401 响应说明）。
骨架清单的唯一来源是 `src/docs/swagger.ts` 的 `placeholderEndpoints()`，
Stage 3/4 实现业务时同步替换为真实接口。

## 测试

```bash
npm test                # 168 个用例
npm run test:coverage   # 覆盖率门禁：statements/lines ≥80%、branches ≥70%、functions ≥80%
npm run seed            # 从 ../web/data/site.json 初始化内容（--force / --content-only）
```

| 测试文件 | 用例数 | 覆盖内容 |
|----------|--------|----------|
| `tests/auth.test.ts` | 16 | 登录 / 当前用户 / 退出 / 限流 / 过期 Token |
| `tests/theme.test.ts` | 8 | 读取 / 更新 / 重置主题 |
| `tests/site.test.ts` | 16 | 站点配置读取 / 更新 / 鉴权 / strict 校验 / 异常分支 |
| `tests/home.test.ts` | 20 | 首页 6 板块读取与分区更新 / 非法 section / 嵌套数组校验 |
| `tests/about.test.ts` | 11 | 关于我们读取 / 更新 / 校验 |
| `tests/careers.test.ts` | 12 | 招聘文案读取 / 更新 / 城市与职位占位接口 501 |
| `tests/seed.test.ts` | 19 | 内容拆分写入 / 幂等 / force / 缺文件 / 启动自愈 |
| `tests/models.test.ts` | 10 | 8 个模型的默认值 / 索引 / toJSON 剥离规则 |
| `tests/skeleton.test.ts` | — | Stage 3/4 骨架接口的存在性、鉴权、501 语义；Swagger 覆盖 |
| `tests/infra.test.ts` | — | ApiError / 响应封装 / 错误中间件 / 校验中间件 / 鉴权中间件 / JWT / 模型 / 环境变量解析 |

当前覆盖率：statements **98.26%** · branches **77.84%** · functions **93.81%** · lines **98.93%**。

测试使用独立库 `adfly_admin_test`，每个用例前清空集合并重建管理员，不会污染开发数据。
