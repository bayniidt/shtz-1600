# ADFLY 管理后台使用说明

> ⚠️ **本文档描述的是旧版内置后台**：`web/` 项目内的 `/admin`（Next.js Server Actions + `data/site.json`）。
> 新的独立后台（`admin/` + `server/`，默认账号 `admin / admin`，地址 `http://localhost:5173/admin/`）
> 正在按 `ADMIN_DEVELOPMENT_PLAN.md` 逐步替换它：**Stage 2 已完成内容模块**（站点与导航 / 首页内容 / 关于我们 / 招聘内容）。
> 两者维护的是同一套内容字段，因此下文的字段表仍可作为填写参考；差异在于新后台把内容存放在 MongoDB，
> 并具备「未保存修改二次确认」「按板块局部保存」等能力。待 Stage 5 前台改读 REST API 后，旧后台将下线。

后台地址：`/admin`（未登录会自动跳转到 `/admin/login`）。

## 1. 登录

- 默认密码：`adfly2024`
- 生产环境请在部署平台设置环境变量覆盖：

  ```bash
  ADMIN_PASSWORD=你的强密码
  ```

  本地可复制 `.env.example` 为 `.env.local` 后修改。

- 登录后写入 `adfly_admin_session`（HttpOnly / SameSite=Lax）Cookie，有效期 12 小时。
- 侧边栏底部「退出登录」会清除会话。

## 2. 功能模块

| 菜单位置 | 路由 | 可维护内容 |
|---------|------|-----------|
| 概览 | `/admin` | 数据统计卡片 + 各模块入口 |
| 站点与导航 | `/admin/content/site` | 品牌中英文名、Logo 文案、联系方式、ICP 备案、SEO 三件套、顶部导航、页脚链接 |
| 首页内容 | `/admin/content/home` | Hero（含英文标题、双 CTA、滚动媒体名、指标）、媒体资源（权益 + 12 个媒体 Logo）、Flow AI 滚轮（眉标 / 标题 / 副标题 / 按钮 + 环形核心标签 + 特性：标题 / 英文标识 / 说明 / 要点）、客户选择（行业分类 + 客户墙）、公司实力（地图节点 + 数据卡）、企业荣誉（分组 + 奖项） |
| 客户案例 | `/admin/cases` | 案例列表：新建 / 编辑 / 删除 / 首页置顶 |
| 客户案例详情编辑 | `/admin/cases/[id]` | 基础信息、核心数据指标（可增删）、项目内容板块（段落 + 要点，可增删） |
| 关于我们 | `/admin/content/about` | 首屏、数据指标、愿景与价值观、发展历程、核心团队、全球办公室 |
| 招聘管理 | `/admin/careers` | 招聘城市列表 + 在招职位列表：新建 / 编辑 / 删除，列表直接显示每个城市的职位数与热招标记 |
| 招聘城市编辑 | `/admin/careers/cities/[id]` | 城市名称 / 英文名 / 标识（链接地址）/ 招聘系统代码 / 简介 / 是否在索引展示，并列出该城市在招职位 |
| 招聘职位编辑 | `/admin/careers/positions/[id]` | 职位名称、主要城市 + 其他城市、类型、部门、标签、发布时间、标识（链接地址）、外部投递链接、急聘 / 热招开关、职位简介、岗位职责 / 任职要求 / 加分项 |
| 招聘内容 | `/admin/content/careers` | 首屏、招聘城市板块文案、企业文化、福利体系、热招职位板块文案、投递邮箱与外部招聘系统首页 |

## 3. 操作约定

- **保存**：每个页面底部有吸底操作条，点击「保存」后顶部提示「XX 已保存」。保存即时生效，前台为动态渲染（`force-dynamic`），无需重新构建。
- **列表项**：卡片/条目类内容（如媒体 Logo、客户案例指标、案例板块）支持「+ 添加」「删除」，序号自动重排。
- **多行文本**：
  - 「正文段落」「要点列表」每行一条，保存后分别渲染为独立段落/列表项。
  - 福利项用 `/` 分隔，例如 `五险一金 / 年终奖金 / 带薪假期`。
  - 标签、所获奖项用英文逗号或换行分隔。
- **布尔开关**：如「总部」「急聘」，填 `yes` 表示开启，留空表示关闭。
- **Flow AI 滚轮**：该板块会随滚动把每个特性依次转到 12 点方向。特性数量决定圆心夹角（建议 3–6 项）；每项的「英文标识」（如 `Flow Creative`）与「要点」只在该项处于激活位置时展示，「要点」用 `/` 分隔。不改动内容时无需处理该板块，滚动到对应位置会自动依次切换。
- **图片**：填写站内路径（如 `/images/adfly/banner01.png`）。新增图片请放到 `public/images/adfly/` 后引用；案例编辑页右上角提供「前台预览 ↗」。
- **案例 ID**：决定 `/cases/<id>` 链接，创建后不可修改；删除案例会同时下线对应详情页。
- **招聘城市 / 职位标识**：分别决定 `/careers/cities/<id>` 与 `/careers/jobs/<id>` 链接。标识建议使用小写字母、数字与连字符；中文名称留空时会自动生成 `city-N` / `position-N`。**修改城市标识会同步更新所有引用该城市的职位**（含「其他城市」字段）。
- **删除城市**：该城市下的职位会自动回退到列表中的第一个城市，不会被删除；若误删，重新新建城市并在职位编辑页改回即可。
- **多城市职位**：「主要城市」用于面包屑与默认归属，「其他城市」用 `/` 分隔（填城市标识，如 `shenzhen/chengdu`），该职位会同时出现在这些城市的职位列表中。
- **招聘职位正文**：`岗位职责` / `任职要求` / `加分项` 均为「每行一条」，支持 `1、`、`- `、`• ` 等前缀，前台会解析成有序条目；「职位简介」留空时列表页自动截取第一行。
- **外部投递**：职位详情的「招聘系统投递」优先使用该职位的「外部投递链接」，未填则回退到「招聘内容」中的外部招聘系统首页；留空两处则不显示该按钮（仅保留邮件投递）。
- **前台招聘路径**：`/careers`（城市索引 + 热招职位）→ `/careers/cities/<城市标识>`（该城市职位列表）→ `/careers/jobs/<职位标识>`（职位详情），全站在站内完成，不再跳转外部招聘站。

## 4. 数据存储与版本管理

- 全部内容存放在 [`data/site.json`](../data/site.json)，结构见 [`src/types/index.ts`](../src/types/index.ts)（`SiteData`）。
- 读写入口集中在 [`src/lib/db.ts`](../src/lib/db.ts)：`getSiteData` / `saveSiteData` / `getCaseById`。`getSiteData` 会按文件 mtime 自动重读，多进程/多实例部署也能拿到最新内容。
- 表单提交走 Server Actions（[`src/app/(admin)/admin/actions.ts`](../src/app/(admin)/admin/actions.ts)），写盘后调用 `revalidatePath("/", "layout")` 刷新缓存。
- 需要迁移到 Supabase / 数据库时，只需把 `src/lib/db.ts` 的读写实现替换为对应的查询，后台与前台组件无需改动。

## 5. 二次开发

- 表单基础组件：[`src/components/admin/Fields.tsx`](../src/components/admin/Fields.tsx)
  - `Panel` 分组卡片、`Field` 单行、`TextArea` 多行、`Select` 下拉、`Checkbox` 开关
  - `StringListField` 字符串数组（`a[0]`、`a[1]` …）
  - `ArrayField` 对象数组（`a[0][title]` …），表单字段名即 JSON 路径
- 表单容器：[`src/components/admin/AdminForm.tsx`](../src/components/admin/AdminForm.tsx)，传入 `action`（Server Action）、`path`（写回的 JSON 根路径）、`label`。
- 括号式字段名会被 [`src/lib/form.ts`](../src/lib/form.ts) 还原成嵌套对象/数组后合并写入 `data/site.json`；未在表单中出现的字段不会被删除。
- 新增一个内容页面：新建 `src/app/(admin)/admin/(dashboard)/content/<slug>/page.tsx`，用 `AdminForm` + 字段组件拼装即可，无需额外 API。

## 6. 部署注意

- 内容保存在 `data/site.json`，属于**进程可写文件**。在自托管服务器 / Docker / 有持久磁盘的环境可直接使用。
- 部署到 Vercel 等**只读文件系统**时，后台写入不会持久化。两种处理方式：
  1. 把 `src/lib/db.ts` 的读写函数换成 Supabase / Postgres / KV 实现（推荐，前台与后台代码不需改动）；
  2. 仅在本地用后台维护内容，提交 `data/site.json` 后部署（内容即代码）。
- 无论哪种方式，都务必设置 `ADMIN_PASSWORD` 环境变量，不要使用默认密码。
- 后台全部页面均已标记 `robots: noindex`，且 `/admin/*` 需要会话才能访问，不会被搜索引擎收录。

## 7. 巡检脚本

```bash
# 响应式 + 控制台报错巡检（需要本地 Chrome）
node scripts/audit.mjs http://localhost:3000 "/, /cases, /about, /careers"
# 带登录态巡检后台
node scripts/audit.mjs http://localhost:3000 "/admin, /admin/content/home" \
  --cookie="adfly_admin_session=<登录后的 Cookie 值>"
# 截图（全页 / 指定视口）
node scripts/shots.mjs /tmp/shots 1440 900 http://localhost:3000/ --full
```
