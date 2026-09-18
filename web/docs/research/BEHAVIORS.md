# BEHAVIORS — meetsocial.com 动效与交互（提取结论）

数据来源：`docs/research/meetsocial/*/behaviors.json`、`sections.json`、`page.html`。

## 全局

| 项 | 实测 | 实现策略 |
|----|------|---------|
| 平滑滚动 | `<html class="lenis">`，无原生 `scroll-behavior: smooth` | 自研 `useSmoothScroll`（lerp 阻尼），`prefers-reduced-motion` 时禁用 |
| 入场动画 | `IntersectionObserver` 存在；元素带 `transform 1.2s cubic-bezier(.76,0,.24,1)` / `opacity 1s` | `useInView` + `<Reveal>` 组件，`once: true`，`stagger` |
| View Transitions | 存在 | Next.js 16 `<ViewTransition>`（渐进增强，可关闭） |
| 滚动驱动 | `scrollTimeline: true`（`row_case` 为 `position: sticky`，高度 900 的整屏 sticky 段） | 案例区使用 sticky 分页 + 滚动进度指示 |
| 背景 | `#F2F2F2` 页面底色，`#FFF` 卡片 | 同设计稿 |

## Navbar（关键，滚动驱动）

实测（`.nav`）：

```
position: fixed; top: 18.75px; z-index: 99; height: 60px;
transition: 0.5s cubic-bezier(0.46, 0, 0.02, 1);
```

行为：
1. 初始：透明底，文字深色（首页 hero 为浅色背景，因此仍为深色文字）。
2. 滚动 > 40px：加白色/毛玻璃底 + 阴影 + 收缩高度（60 → 56px）。
3. 滚动 > 一屏：出现「返回顶部」按钮（fade）。
4. 移动端：汉堡按钮 → 全屏抽屉（`transform 1.017s ease-in-out, opacity 1.017s ease-in-out`）。
5. hover：导航项下划线从左展开（0.35s `--ease-out-soft`），下拉菜单 fade + `translateY(8px)`。

## 通用 hover

| 元素 | 效果 |
|------|------|
| 主按钮 | 亮度 +6%、`translateY(-2px)`、阴影加强，0.3s |
| 卡片 | `translateY(-6px)` + 阴影加深 + 边框变主色，0.4s |
| 案例封面 | `scale(1.06)`，0.7s `--ease-out-soft` |
| 媒体 Logo | 灰度 → 彩色，`opacity .55 → 1`，0.35s |
| 链接 | 主色 + 箭头右移 4px |

## 分页

- 案例列表：`Prev | 1 2 3 4 5 | Next`，点击后网格 fade（200ms）+ 滚动回顶部。
- 案例详情：`row_case` sticky，标题逐段滚动。

## 环形节点滚轮（`.ind_r4`，首页「产品能力」区）

参考站点用 GSAP ScrollTrigger 驱动一个「滚轮步进器」，DOM 与算法已完整提取：

```
.ind_r4        { height:350vh; background:#eff6ff }   ← 轨道
  .row_case    { position:sticky; top:0; overflow:hidden }  ← 100vh 舞台
    .ind_r4_case { width:91.15vw; left:50%; margin-left:-45.57vw }  ← 轮盘
      .ind_r4_box   { transition:transform .5s cubic-bezier(.46,0,.02,1) }  ← 转子
        doted.png   → 虚线圆环（随转子转动）
        .ind_r4_block { height:50%; width:1px; transform-origin:50% 100%;
                        bottom:50%; left:50% }   ← 辐条（长度 = 半径）
          .ind_r4_txt { width:72.9vw; top:0; left:50%; margin-left:-36.46vw }
        .ind_r4_icon_case > div  ← 节点之间的菱形装饰
```

JS（原站 minified 逻辑，逐行还原）：

```js
var c = $('.ind_r4_block'), f = c.length, h = 360 / f;
var d = [];
c.each(i => { var t = 360 - i * h; $(this).css({ transform: `rotate(${t}deg)` }); d.push(t); });
// 菱形：360 - i * (360 / 菱形数) + h / 2

function activate(e) {                       // e = 当前激活序号 0..f-1
  c.removeClass('on').eq(e).addClass('on');  // 只有激活项可见可点
  $('.bg_img img').removeClass('on').eq(e).addClass('on');
  $('.ind_r4_box').css({ transform: `rotate(-${d[e]}deg)` });   // = -360 + e*60
}

gsap.to(section, { '--go': 0, scrollTrigger: { trigger: section, start: 'top top',
  end: '+=' + section.outerHeight() + ' bottom', scrub: true,
  onUpdate: self => { var r = Math.round((f - 1) * self.progress); if (r !== last) activate(r); } } });
```

要点：

| 细节 | 说明 |
|------|------|
| 步进量 | 每 `1/(节点数-1)` 进度切换一次，共 4–6 个状态 |
| 转子旋转 | `-360 + e*step`，配合节点自身 `360 - i*step`，两者叠加后 **激活节点恒为 0°（12 点方向）且内容始终水平** |
| 非激活节点 | 露出序号圆点与图标，随转子一起倾斜（叠加角度 = `(e-i)*step`），内容 `opacity:0; pointer-events:none` |
| 激活内容 | `show_con` 从 `translateY(1.5625vw)/opacity 0` 过渡到 `0/1`，0.5s 同一条 `--ease-brand` 曲线 |
| 背景 | 6 张地球图按激活项交叉淡入淡出（`.bg_img img.on`） |
| 装饰 | 虚线圆环、中心水印、节点间菱形、底部 `01/06` 进度与箭头翻页按钮 |
| 移动端 | 轮盘放大到 200vw 并整体下沉，字号按 rem 缩小；轮盘之外的导航按钮才出现 |

本项目实现：`src/components/home/FlowSection.tsx`（React state 步进 + CSS transition，
无 GSAP；轨迹高度 `100vh + 节点数 × 60vh`），样式在 `src/app/globals.css` 的 `.flow-*` 块。

## 招聘数据采集（飞书招聘 SPA）

参考站的「招聘城市 / 岗位列表 / 岗位详情」是飞书招聘的前端渲染 SPA
（`https://q6y68vu0j8.jobs.feishu.cn/index`）。采集结论（用于把招聘流程去外链化）：

| 端点 | 认证 | 结果 |
|------|------|------|
| `GET /api/v1/config/job/filters/6` | 无需签名 | ✅ 可获取城市列表（`CT_125` 上海 38 / `CT_128` 深圳 24 / `CT_45` 广州 7 / `CT_11` 北京 7 / `CT_22` 成都 3 / `CT_55` 合肥 2 / `CT_155` 西安 1，含城市名与职位数） |
| `GET /api/v1/search/job/posts` | 需 `_signature` | ❌ 签名覆盖全部查询参数（含 `limit`），curl 直连返回反爬 HTML；用 CDP `Fetch.continueRequest` 改写 `limit` 同样被签名拦截 |

因此改为**渲染后读 DOM**：用 CDP 打开城市职位列表页，逐页点击分页控件收集
`/index/position/<id>/detail` 链接与卡片文本，再进入每个详情页抓取 `岗位职责 / 任职要求 / 加分项` 分段文本。

采集结果（已写入 `data/site.json` 的 `careers.cities` / `careers.positions`）：

- 7 个城市、79 个唯一职位（列表共 82 条，3 条为多城市重复发布，已合并为 `extraCities`）
- 每条职位含 `title / cityId / extraCities / type / publishedAt / summary / description / requirement / bonus / applyUrl`
- 城市与职位均可在 `/admin/careers` 维护；前台 `/careers/cities/<id>`、`/careers/jobs/<id>` 全部站内渲染

## 实现映射

| meetsocial 机制 | 本项目实现 |
|-----------------|-----------|
| Lenis | `src/components/providers/SmoothScroll.tsx` |
| IntersectionObserver 入场 | `src/hooks/useInView.ts` + `src/components/motion/Reveal.tsx` |
| 计数动画 | `src/hooks/useCountUp.ts` |
| Navbar 滚动变化 | `src/components/layout/SiteHeader.tsx` |
| `.ind_r4` 环形节点滚轮 | `src/components/home/FlowSection.tsx` |
| sticky 案例段 | 首页 `ClientsSection` / 案例页 |

