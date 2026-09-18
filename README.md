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

## 数据流（目标态）

```
admin (React)  ──HTTP/JWT──▶  server (Express + MongoDB)
                                   │
web (Next.js)  ◀──REST API─────────┘
```

当前进度：**Stage 4 完成**（Stage 0/1 骨架 + 认证/主题；Stage 2 内容模块；Stage 3 Cases 客户案例 CRUD；
Stage 4 Careers 城市 / 职位 CRUD：后端 10 个真实接口、城市 id 联动、删除回退、职位城市校验与前端招聘管理页面）。
后续阶段（前台改读 API、覆盖率与部署收尾）见 `admin/ADMIN_DEVELOPMENT_PLAN.md`。

## 验收情况（当前）

| 项目 | 结果 |
|------|------|
| 后端 `cd server && npx jest --runInBand --forceExit` | **194/194** 用例通过 |
| 前端 `cd admin && npx vitest run` | **196/196** 用例通过 |
| 覆盖率命令 | 后端/前端覆盖率插桩下仍有既有偶发失败，待 Stage 6 收敛 |
| 前端构建 `npm run build` | 通过（主 chunk 约 2.05 MB，gzip 约 655 kB；Vite 有体积提示） |
| 真实浏览器冒烟 `npm run test:smoke` | 15 个路由全部通过（preview 5174，后端 4000） |
