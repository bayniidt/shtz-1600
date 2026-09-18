# DESIGN TOKENS — ADFLY 站点重构

来源：`cbb3670d3d279437a01e1add32ba829b.jpg`（首页设计稿，像素采样）+
`docs/research/meetsocial/*`（动画/结构参考）+ `https://www.adflymobile.com`（原始内容与品牌资产）。

## 1. 颜色

设计稿采样（1280px 宽）主要色值：

| Token | 值 | 用途 | 来源 |
|-------|-----|------|------|
| `--brand` | `#1E96D4` | 主色（按钮、强调、图标） | 设计稿中 CTA/图形区域最高频饱和色 |
| `--brand-strong` | `#0F7CBC` | 主色 hover / 深色渐变端 | 采样推演 |
| `--brand-soft` | `#E8F5FC` | 主色浅底（标签、卡片高亮） | 采样推演 |
| `--brand-glow` | `#5CB8E8` | 渐变亮端 | 采样 `#2296D3`→`#5CB8E8` |
| `--accent` | `#ED5736` | 品牌橙（ADFLY logo / 数据强调） | adflymobile common.css（12 处） |
| `--ink` | `#1A1A1A` | 标题 | adfly css + 设计稿 |
| `--ink-2` | `#333333` | 正文（设计稿文字主色采样 `#333`） | 设计稿采样 |
| `--ink-3` | `#6E6E6E` | 次级正文 | adfly css |
| `--ink-4` | `#989898` | 弱化说明 / 版权 | 设计稿 footer 采样 |
| `--surface` | `#F2F2F2` | 页面底色（设计稿最高频色） | 设计稿采样 |
| `--surface-2` | `#FFFFFF` | 卡片底色 | 设计稿采样 |
| `--surface-3` | `#D9D9D9` | 占位/图形底 | 设计稿采样 |
| `--line` | `#E4E4E4` | 分割线/描边 | 推演 |

渐变：
- 主按钮：`linear-gradient(135deg, #1E96D4 0%, #5CB8E8 100%)`
- Hero 光晕：`radial-gradient(circle at 70% 30%, rgba(30,150,212,.35), transparent 60%)`
- 深色区（Footer / 数据区）：`linear-gradient(180deg, #0B1B2B 0%, #071320 100%)`

## 2. 字体

meetsocial 实际字体栈：`Montserrat, "Noto Sans SC", sans-serif, "PingFang SC", ...`

| 用途 | 字体 | 字重 |
|------|------|------|
| 英文标题 / 数字 | Montserrat | 500 / 600 / 700 |
| 中文正文与标题 | Noto Sans SC | 300 / 400 / 500 / 700 |

尺寸（设计稿 1280px 宽下测得，页面实现按 1440px 容器等比放大）：

| 用途 | 设计稿 | 实现（clamp） |
|------|--------|----------------|
| Hero 主标题 | 48px / 700 | `clamp(2rem, 4.2vw, 3.5rem)` |
| Section 标题 | 48px / 700 | `clamp(1.75rem, 3vw, 3rem)` |
| 卡片标题 | 27–33px / 600 | 24–28px |
| 正文 | 27px → 实际渲染 14–16px | 15–16px |
| 说明 | 21–22px | 14px |

> 设计稿是 2x 导出的 1280px 画板，视觉字号 = OCR 尺寸 ÷ 2。

## 3. 间距与圆角

- 容器：`max-width: 1280px`，左右 `padding: 24px`（移动）/ `40px`（≥1024px）
- Section 纵向间距：桌面 `120px`，平板 `88px`，移动 `64px`
- 卡片内边距：24 / 32 / 40
- 圆角：`--radius-card: 20px`、`--radius-pill: 999px`、`--radius-chip: 999px`、按钮 `12px`
- 阴影：
  - 卡片：`0 8px 30px rgba(16, 42, 67, .06)`
  - 悬浮：`0 18px 50px rgba(16, 42, 67, .14)`
  - 主按钮：`0 10px 30px rgba(30, 150, 212, .28)`

## 4. 断点

与 meetsocial 一致（移动优先）：

| 名称 | 宽度 |
|------|------|
| sm | 640px |
| md | 768px |
| lg | 1024px |
| xl | 1280px |
| 2xl | 1536px |

## 5. 动效令牌（对齐 meetsocial 实测值）

| Token | 值 | 用途 |
|-------|-----|------|
| `--ease-brand` | `cubic-bezier(0.46, 0, 0.02, 1)` | Navbar 显隐/滚动变化（0.5s） |
| `--ease-reveal` | `cubic-bezier(0.76, 0, 0.24, 1)` | 入场动画（1.2s transform / 1s opacity） |
| `--ease-out-soft` | `cubic-bezier(0.22, 1, 0.36, 1)` | hover / 位移 |
| 入场位移 | `translateY(48px)` → 0 | 标题/卡片 |
| stagger | `90ms` | 列表逐项 |
| 计数动画 | 1.6s | 数据卡片 |
