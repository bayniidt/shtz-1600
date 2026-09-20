# ADFLY 项目（1600）

三个相互独立的目录，各自管理不同内容：

| 目录 | 角色 | 技术栈 | 默认端口 |
|------|------|--------|---------|
| `web/` | **前台网站** | Next.js 16 + React 19 + Tailwind v4 | 3000 |
| `admin/` | **管理后台前端** | React 18 + Ant Design 5 + Pro Components + Vite 5 + Tailwind v4 | 5173（路径 `/admin/`） |
| `server/` | **后端服务** | Express 4 + MongoDB 7 + Mongoose 8 + TypeScript + JWT | 4000（`/api/v1`） |

> `admin/ADMIN_DEVELOPMENT_PLAN.md`、`admin/ADMIN_GUIDE.md` 为设计与使用文档；
> `admin/HANDOFF.md` 为工程约定与交接说明（**接手/新对话窗口请先读它**）。

## 本地启动

```bash
# MongoDB（一次性安装后常驻）
brew services start mongodb/brew/mongodb-community

# 后端
cd server && npm install && cp .env.example .env && npm run seed && npm run dev
# → http://localhost:4000/api/v1  文档 http://localhost:4000/api/docs

# 后台前端
cd ../admin && npm install && cp .env.example .env && npm run dev
# → http://localhost:5173/admin/   账号 admin / admin

# 前台
cd ../web && npm install && npm run dev
# → http://localhost:3000
```

## 生产部署（Stage 7）

项目提供前台、后台、API、MongoDB 的 Docker Compose 部署配置：

```bash
cp deploy/.env.production.example .env
# 编辑 .env，至少填写 JWT_SECRET、ADMIN_PASSWORD_HASH、CORS_ORIGIN
docker compose up -d --build
```

生成管理员 bcrypt hash：

```bash
cd server
node -e 'require("bcryptjs").hash(process.argv[1], 10).then(console.log)' 'replace-with-your-password'
```

入口 Nginx 默认监听 `HTTP_PORT`（默认 80）：`/` 代理 Next.js，`/admin/` 提供 Vite 后台，`/api/` 代理 Express API。详见 [`docker-compose.yml`](./docker-compose.yml)、[`deploy/nginx.conf`](./deploy/nginx.conf) 和 [`deploy/.env.production.example`](./deploy/.env.production.example)。

## 数据流（目标态）

```
admin (React)  ──HTTP/JWT──▶  server (Express + MongoDB)
                                   │
web (Next.js)  ◀──REST API─────────┘
```

当前进度：**Stage 7 完成**（Stage 0/1 骨架 + 认证/主题；Stage 2 内容模块；Stage 3 Cases 客户案例 CRUD；
Stage 4 Careers 城市 / 职位 CRUD；Stage 5 前台 API-first 读取、JSON 兜底与 Mongo 内容快照导出；Stage 6 OpenAPI 文档完整化与覆盖率门禁收口；Stage 7 Docker / Nginx 部署准备）。

## 验收情况（当前）

| 项目 | 结果 |
|------|------|
| 后端 `cd server && npx jest --runInBand --forceExit` | **198/198** 用例通过 |
| 前端 `cd admin && npx vitest run` | **198/198** 用例通过 |
| 前台 `cd web && pnpm run typecheck && pnpm run build` | 通过（API 优先 / JSON 兜底） |
| 前台 `cd web && pnpm run export` | 通过（8 cases / 7 cities / 79 positions） |
| 覆盖率命令 | 后端 **98.49% / 80.78% / 95.86% / 99.07%**；前端覆盖率门禁四项均 ≥80% |
| Stage 7 部署配置 | Dockerfile、Compose、Nginx 路由与生产环境变量模板已就绪 |
| 前端构建 `npm run build` | 通过（主 chunk 约 2.05 MB，gzip 约 655 kB；Vite 有体积提示） |
| 真实浏览器冒烟 `npm run test:smoke` | 15 个路由全部通过（preview 5174，后端 4000） |
