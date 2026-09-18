

1. 参考网站 https://www.meetsocial.com

2. 我的网站 https://www.adflymobile.com/index.html
设计稿：
cbb3670d3d279437a01e1add32ba829b.jpg，需要 clone 的是 服务与产品 客户案例 关于我们

3. 需求：我现在需要根据参考网站重新设计我的网站，保持与参考网站的样式和功能一致，然后需要做一个 admin后台，允许动态更新数据

4. 使用当前项目 clone skill

5. 参考网站的路由列表：
  服务与产品 对应首页：https://www.meetsocial.com
  客户案例 对应 客户案例 https://www.meetsocial.com/cases
  客户案例详情 对应 客户案例详情 https://www.meetsocial.com/cases/1
  关于我们 对应 关于我们 https://www.meetsocial.com/about
  加入我们 对应 加入我们 https://www.meetsocial.com/careers
  招聘城市 对应 招聘城市 https://q6y68vu0j8.jobs.feishu.cn/index
  招聘岗位列表 对应 招聘岗位列表 https://q6y68vu0j8.jobs.feishu.cn/index/position/list?location=CT_45
  招聘岗位详情 对应 招聘岗位详情 https://q6y68vu0j8.jobs.feishu.cn/index/position/7647421452317329673/detail

6. 不是直接 clone，而是根据设计稿和参考网站的动画效果来进行实现

---

## 实现状态（已完成）

按 `docs/DEVELOPMENT_PLAN.md` Phase 0–8 全部完成，`npm run check` 全绿。

- **前台**：`/`（服务与产品）、`/cases`、`/cases/[id]`、`/about`、`/careers`、`/careers/cities/[id]`、`/careers/jobs/[id]`，1:1 对齐设计稿的排版/配色/间距，动画与交互参考 meetsocial（滚动变色导航、入场 reveal、数字滚动、媒体跑马灯、地图节点脉冲、卡片 hover、Flow AI 环形滚轮）。
- **后台**：`/admin` 动态更新全部页面数据（站点与导航 / 首页 6 大板块 / 客户案例 CRUD / 关于我们 / 招聘内容 / 招聘管理），登录密码由 `ADMIN_PASSWORD` 控制，默认 `adfly2024`。
- **数据**：全部内容存放在 `data/site.json`，后台保存后前台立即生效，无需重新构建。
- **招聘流程（已去外链化）**：`/careers`（企业文化 / 福利 / 招聘城市索引 / 热招职位）→ `/careers/cities/<城市标识>`（城市职位列表）→ `/careers/jobs/<职位标识>`（岗位详情，含岗位职责 / 任职要求 / 加分项）。数据从飞书招聘公开页面采集入库（7 城市 / 79 职位），后台「招聘管理」可增删改城市与职位；职位详情保留可选的「招聘系统投递」外链按钮，默认只需邮件投递，全程站内流转。

使用说明见 `docs/ADMIN_GUIDE.md`。

