# 「前程指北」设计与前端交接说明（给 Qoder CN）

> 交接日期：2026-10-31
> 项目根目录：`C:\Users\34264\Documents\Qoder\2026-10-30\26444776`
> 线上地址：https://sanchalu-w5xdi6xev4t.qoder.website
> 源码仓库：https://github.com/zcf2230/qiancheng-zhibei
> 本文既是交接报告，也是你第一轮的工作任务书。请先完整读完，再动手。

**30 秒版**：这是一个为 2026 Qoder 高校创造力大赛 StudyHack 赛道做的静态网站，外壳是原生 JS，三个业务模块用固定视口 iframe 嵌入。视觉方向「编辑部工作台」已经被用户认可，但移动端、跨 iframe 的动效连续性、模块内部页面、字体与动效架构还有明显欠账。你的任务不是推倒重来，而是在不破坏功能、数据、叙事和 iframe 架构的前提下，参考 GSAP Skills、React Bits、Taste Skill，把设计从「已经像样」推进到「评委一眼记住、用起来顺手」。大改版必须先出方案，用户确认后再写代码。

---

## 1. 项目是什么

「前程指北」给在考研、考公、实习之间做选择的大学生，把三条路的信息放进同一个站点：

- **路径决策**：10 道题、10 个维度打分，给出主推荐、维度理由、备选与近期节点；结果可用 `?a=` 链接分享，可生成三轨规划报告并打印/导出 PDF。
- **统一时间线**：36 条关键节点（考研 8 / 考公 22 / 实习 6），官方公告与推算分标，当前窗口高亮并显示剩余天数。
- **全局搜索**：17,819 条索引（211 所院校 / 16,544 个岗位 / 1,064 家机构），简称表 + 子序列匹配，结果直达模块并定位。
- **考研择校**：211 所院校的复试线、学费学制、初试科目、拟招与就业；冲稳保分档、对比、CSV/报告导出。
- **考公岗位**：国考、浙江选调、浙江省考、山东省考、上海市考共 16,543 个岗位的竞争比、进面分与报考档案分析。
- **实习网申**：1,064 家机构的网申批次、倒计时、时间轴、投递进度看板与官网链接巡检。
- **三轨档案**：填一次届别/专业/预估分/地域/数学，三个模块自动预填。

补充事实：

- 比赛：2026 Qoder 高校创造力大赛，StudyHack 学习科研赛道。
- 截止：2026-11-30 18:00（今天 2026-10-31，约 4 周）。
- 站点已经公开、已经发布参赛帖（天池 post 1091505），不是草稿状态。
- 站点是纯静态资源，无框架、无构建步骤、无账号体系；收藏与进度存本机 localStorage。
- 三个模块的原始业务逻辑基本未改，只在上面叠加了统一皮肤层 `hub/shared/hub-module.css`。

---

## 2. 用户已经明确否决过的方向（不要再犯）

用户是设计敏感型，会亲自在浏览器里验收；不要用「已经改过了」糊弄，也不要用换色冒充改版。

1. **第一版太简洁、像普通工具站** → 被要求做成有编辑感、有记忆点的站点。
2. **v2 把模块侧栏/报头强行改成深色** → 被否决。原话大意：实习模块最上面的栏黑色太重，深浅色模式失去了意义。结论：**浅色纸感为主，深色自适应，绝不强制深色模块头**。
3. **v4 只换颜色、换卡片圆角** → 被否决。原话：「这跟没改之前有什么区别」。结论：**必须有结构级变化**（版式、导轨、编号、报头、网格、吸顶带），不能只做表面装饰。
4. **圆形光标** → 被嫌不好看。后来做了 4 个方案（指北针 / 彗尾 / 柔光透镜 / 原生 + 柔光），用户最终选「光点彗尾」。不要擅自换回普通圆点。
5. **用户说「动效拉满」**，但实际验收标准是「有记忆点且不干扰阅读」。不要理解成满屏粒子、每个元素都飞入。

已被认可的视觉 DNA（保留）：

- 暖纸底 `#F7F4EC` + 深墨 `#14201E` + 青绿 `#176B75` + 铜金 `#A9762F / #D9B36C`。
- 衬线大标题 + 无衬线正文；编号、细线、网格底纹、刊头/报头、吸顶玻璃带。
- 模块内浅色导轨 + 编号 + 分组标题 + 数据速览带；深色模式整页翻墨，而不是局部黑块。
- 克制光效：漂浮光点、指针光晕、刊头扫光、开放项呼吸光、彗尾光标。
- 首页深墨 hero + 暖纸正文的「封面/内页」关系。

---

## 3. 不可违反的硬约束

### C1 叙事口径（比赛红线）

任何页面、README、参赛帖、截图说明、提交材料里，**不得**出现「把三个已有产品聚合在一起」「旧版本」「独立站」「前作」「三个工具合并」这类表述。统一口径：这是为 2026 Qoder 高校创造力大赛 StudyHack 赛道而作的一站式信息助手。不要虚构开发过程、数据或用户量。

站内现有文案已经按这个口径写过（`hub/shell.js` 的 about、`README.md`、`contest/tianchi-post.md`），改版时不要回退。

### C2 零后端、零注册

不要加登录、注册、付费、订阅、云端同步。收藏/进度只存 localStorage；`functions/` 与 `db/` 是赛后预留，当前后端配额为 0，不要依赖。三轨档案通过 `hub_profile_v1` 在各模块间共享，这是现有跨路径能力，不要破坏。

### C3 无框架、无构建、纯静态

不要引入 React、Vue、Vite、Tailwind 构建链。GSAP 可以以本地 vendor 文件方式引入，但不要依赖运行时 CDN。最终必须能直接把 `hub/` 目录作为静态站点部署到 Qoder Sites。

### C4 iframe 固定视口架构是承重墙

外壳 hash 路由 + 三个固定视口 iframe（`hub/shell.js:713` 的 `mountFrame`）。模块内部自己滚动，外壳不自动同步高度。

- 不要再加「iframe 自动高度 / postMessage 同步高度」逻辑。之前加过，导致首页高度被算成 3,067,064px、实习模块持续颤抖、fixed 弹窗跑到视口外点不到。
- 模块里的详情/对比/编辑弹窗依赖固定视口，改动布局后必须逐个点开验证。
- 移动端可以改成「全屏模块模式」，但仍然不要做自动高度。

### C5 数据真实性

官方优先、拿不准留空、第三方标注。不要为了让图表好看而补数、改数、造趋势。任何数字改动都要有来源和日期。首页/模块里的统计口径来自 `hub/shared/hub-stats.js` 与构建期数据，不要在 JS 里手写一套新数字。

### C6 实习模块在聚合站必须公开

`hub/modules/intern/index.html:191` 加载的是 `js/data.plain.js`，登录门是隐藏的（`:169`）。不要恢复口令门，不要把账号密码写进任何文件、注释、README 或提交信息。独立版的加密逻辑不属于本站范围。

### C7 不新建站点、不改公开 URL

线上站点沿用现有 Qoder Sites 项目与 descriptor（`.三岔路 · 考研考公实习一站式信息助手.qoder.site`），actionId 为 `b2d3e4f5-6a7b-4c8d-9e0f-1a2b3c4d5e6f`。公开 URL 已经写进参赛帖，不能换。descriptor 里的「三岔路」是历史内部名，不是公开品牌；不要因为改名而重建站点或换 slug。

### C8 不擅自改参赛帖、不擅自上传图片

天池帖已经发布并可能处于审核状态。视觉改版后如需更新帖子里的截图或文案，先告诉用户，由用户决定；不要自行登录发帖、上传图片或改文案。绝对不要上传其他参赛者的参考截图。

### C9 不泄露凭据

不要在任何文件、日志、提交、截图里出现账号密码、Cookie、token。需要登录态时让用户自己操作。

### C10 仓库卫生

不要提交 Edge/Chrome 临时配置目录、`.cdp`、`.edge*`、截图临时文件、`node_modules`。提交前看 `git status`；大文件（如 `search-index.js` 937KB）是现有构建产物，可以保留，但不要重复生成多份。

---

## 4. 已完成的部分（截至 2026-10-31）

### 4.1 信息架构与功能

8 条路由：`home / path / timeline / search / about / kaoyan / gongkao / intern`（`hub/shell.js:4`）。

跨路径能力：

- 路径决策（`renderPath`，`shell.js:439`）：10 题、10 维、进度条、深色结果卡、conic 分数环、维度理由、备选、近期节点、分享链接、打印报告。
- 统一时间线（`renderTimeline`，`shell.js:351`）：chips 筛选、进度线、按开始时间排序（空值后排）、当前窗口高亮、剩余天数。
- 全局搜索（`renderSearch`，`shell.js:630`）：`SEARCH_ALIAS` 简称表 + `rankOf` 子序列匹配 + `markHit` 高亮；点击结果带 `?focus=id` 进入模块，三个模块都实现了 focus 定位（考研 `app.js:459`、考公 `app.js:1395`、实习 `app.js:1325`）。
- 三轨档案：`hub_profile_v1` 写入后，三个模块读取预填。
- 首页行动清单、数据新鲜度、三轨叙事、三步使用说明。

模块：

- 考研：`hub/modules/kaoyan/renderer/`（`app.js` 978 行，`index.html` 234 行，`styles.css`）。
- 考公：`hub/modules/gongkao/`（`app.js` 1,487 行，`index.html` 458 行，`style.css`，本地 `xlsx.full.min.js`）。
- 实习：`hub/modules/intern/`（`app.js` 1,334 行，`index.html` 208 行，`css/style.css`，`data.plain.js` 621KB）。

### 4.2 视觉系统

外壳（`hub/shell.css`，552 行）：

- Token：`shell.css:4`，深墨/暖纸/青绿/铜金/沙色，`--radius` 18、`--radius-lg` 26、`--maxw` 1180，衬线栈 `"Noto Serif SC", "Songti SC", "STSong", "SimSun"`。
- 噪点颗粒（`:49`）、路由幕布（`:82`）、浮岛导航（`:92`）、首页 hero/极光/光点/罗盘/分字标题/跑马灯（`:159`）、Bento 统计与指针聚光/倾斜（`:233`）、行动清单与铜金紧急脉冲（`:253`）、300vh sticky 三轨叙事（`:275`）、三步/编辑式数据卡（`:301`）。
- 路径、时间线、搜索、关于各自有独立版式（`:342`、`:378`、`:404`、`:418`）。
- 打印报告（`:442`）、响应式（`:457`）、截图静态模式（`:483`）、铜金辅色与光点光波（`:494`）、四方案光标（`:516`）。

模块皮肤（`hub/shared/hub-module.css`，435 行）：

- v3 明暗自适应 token（`:5`、`:43`），只覆盖视觉，不强制颜色。
- 浅色侧栏 + 青绿渐变洗（`:106`）、主题分段控件（`:159`）、报头（`:188`）、标签层级（`:270`）、开放项呼吸光（`:301`）。
- v5 编辑部工作台：报头、数据速览带、分段 tabs、侧栏导轨与 active 竖线、表格/标题层级（`:317` 起）。
- v6 网格底纹、侧栏编号、院校/公司大编号、DATA BRIEF、吸顶玻璃筛选与统计条（`:366` 起）。
- v7 光效：漂浮星点 `body::after`、报头扫光、指针光晕（`:403` 起；光晕脚本注入在三个模块 `index.html` 末尾，例如考研 `:219`）。

### 4.3 动效清单（全部手写）

| 效果 | 位置 | 说明 |
|---|---|---|
| 极光 blob | `shell.css:159` 附近 `.hero-aurora` | 3 个缓慢漂移的径向渐变 |
| 漂浮光点 | `shell.js:132` `lights()` + `shell.css:506` | 首页 16 个、story 9 个 |
| 分字标题 | `shell.js:275` | 仅在非 reduced-motion、非 shot 模式拆分 |
| 跑马灯 | `shell.js:144` + `shell.css:216` | 当前窗口/统计/截止信息 |
| 数字滚动 | `shell.js:112` `countUp()` | 1.2s ease-out；1600ms 强制落终值，防截图截到中间态 |
| Bento 聚光/倾斜 | `shell.js:94` `initTilt()` | pointermove 计算 --mx/--my + rotate |
| 磁吸 CTA | `shell.js:308` `initMagnet()` | 位移 0.18/0.24 |
| 滚动叙事 | `shell.js:286` `initStory()` | 300vh sticky，按滚动进度切 3 个 panel |
| 路由幕布 | `shell.js:747` `navigate()` | 200ms 幕布 + render + 60ms 收起 |
| 彗尾光标 | `shell.js:30` `initCursor()` | 4 模式，默认 comet，7 个 lerp 尾点 |
| 呼吸光/扫光/星点 | `hub-module.css:301/403/421` | 模块内低频光效 |

### 4.4 光标

- 4 个模式：`needle`（指北针）、`comet`（光点彗尾）、`lens`（柔光透镜）、`minimal`（原生 + 柔光）。
- 通过 `?cursor=comet` 切换并写入 `hub_cursor_v1`；默认 `comet`。
- `minimal` 不加 `custom-cursor`（保留原生光标）；其他模式隐藏原生光标。
- 触屏与 reduced-motion 直接不启用。
- 相关 CSS：`shell.css:516` 起；彗尾尺寸/透明度在 `:543` 起。

### 4.5 响应式、降级、截图

- 断点：外壳 980 / 620（`shell.css:457`）；考研 900 / 420（`styles.css:216/411`）；实习 640（`style.css:420`）；**考公没有 media query**（见问题清单）。
- `prefers-reduced-motion` 在 `shell.css:477` 与 `hub-module.css:308/432` 有降级。
- 触屏加 `body.touch`，隐藏自定义光标。
- `?shot=1` 加 `html.no-anim`：停动画、显示 reveal、story 改静态、隐藏光标/颗粒/幕布（`shell.css:483`）。这是截图流水线的关键，必须保留。
- iframe 高度：桌面 `clamp(560px, calc(100svh - 180px), 920px)`（`shell.css:340`），980 以下 `calc(100svh - 140px)`（`:467`）。

### 4.6 发布与仓库

- 线上已公开：https://sanchalu-w5xdi6xev4t.qoder.website
- descriptor：`.三岔路 · 考研考公实习一站式信息助手.qoder.site`，actionId `b2d3e4f5-6a7b-4c8d-9e0f-1a2b3c4d5e6f`，projectId `01a18a3d-0e2b-7dc0-82a4-37decbe00d6f`，siteId `01a18a3d-0e2e-76a0-a185-2d1547adf4bd`。
- GitHub：`zcf2230/qiancheng-zhibei`，public，main。最近提交包含视觉改版与光标定稿，以 `git log` 为准。
- 天池帖：post 1091505，已发布；正文与 8 张新版截图已准备，图片/文案可能随视觉改版更新，需用户确认。
- 截图资产：`contest/shots-v2/`（8 张新版界面）、`contest/redesign/`（v2–v6 过程稿）、`contest/shots/`（旧版）。

---

## 5. 代码地图（先读这些）

### 5.1 外壳

| 文件 | 行数 | 职责 |
|---|---:|---|
| `hub/index.html` | 58 | 幕布、光标、颗粒、浮岛导航、`#module-root`、页脚、脚本顺序 |
| `hub/shell.js` | 766 | 全部外壳逻辑：路由、首页、路径、时间线、搜索、关于、模块 iframe、动效 |
| `hub/shell.css` | 552 | 外壳全部样式与动效 |
| `hub/shared/tokens.css` | 13 | **遗留/未使用**：只定义 `--hub-*`，全仓库没有别处引用。不要在这上面继续加 token |

`shell.js` 关键函数：

- `initCursor()` `:30`、`initHeader()` `:77`、`bindReveal()` `:89`、`initTilt()` `:94`、`countUp()` `:112`
- `lights()` `:132`、`marqueeItems()` `:144`、`actionItems()` `:162`
- `renderHome()` `:195`、`initStory()` `:286`、`initMagnet()` `:308`
- `renderTimeline()` `:351`、`renderPath()` `:439`
- `renderSearch()` `:630`、`renderAbout()` `:675`
- `moduleBar()` `:702`、`mountFrame()` `:713`、`render()` `:726`、`navigate()` `:747`
- 初始化 `:756`

### 5.2 模块

- 模块 HTML 都先加载自己的样式，再加载 `../../shared/hub-module.css`。皮肤层大量使用 `!important` 覆盖旧样式；**不要继续加 !important 军备竞赛**，优先改 token、增加更精确的选择器，或在模块自己的 CSS 里给结构 class。
- 三个模块的主题互不相通：
  - 考研：`kaoyan-theme`，默认 `auto`（跟随系统）。
  - 考公：`gk_theme`，默认 `light`。
  - 实习：`itr_theme`，默认 `light`。
  - 外壳：没有主题开关，始终浅色。
- 模块内保留了自己的主题切换控件；这是功能，不要删。
- 考公启动有骨架屏 `#bootSplash`（`gongkao/index.html:19`），考研/实习没有统一骨架屏。
- 实习登录门 markup 仍在但 hidden，数据走 `data.plain.js`；不要恢复登录。

### 5.3 数据

| 文件 | 体量 | 说明 |
|---|---:|---|
| `hub/shared/timeline-data.js` | 9.5KB / 36 条 | `window.HUB_TIMELINE`，考研 8 / 考公 22 / 实习 6 |
| `hub/shared/search-index.js` | 937KB / 17,819 条 | `window.HUB_SEARCH`，k=211 / g=16,544 / i=1,064 |
| `hub/shared/hub-stats.js` | 0.3KB | 首页统计：实习开放 254、滚动 786、7 天内截止 9、总 1,064；国考过审 3,025,502（2026-10-24）；2027 简章 47/211 |
| `hub/modules/kaoyan/data/*.json` | 分批 | 院校数据 |
| `hub/modules/gongkao/data/*.json` | 分批 | 岗位数据 |
| `hub/modules/intern/js/data.plain.js` | 621KB | 聚合站公开实习数据 |

### 5.4 工具与发布

- 本地开发：`node tools/serve-hub.js`，端口 8123，带 `/functions/v1/app/api` 的 mock（收藏/用户）。
- 发布：Qoder Sites。上一轮成功链路：
  1. `prepare_site(actionId, projectRoot, displayName, slug="sanchalu", spa=false, webDirectory="hub")`
  2. 拿 `verificationOperationId` 查 `get_operation`
  3. 若 pending，用同一 actionId 重试 `prepare_site`
  4. `publish_site`
  5. `get_publish_status` 直到 `publication_completed`
  若工具 schema 已变化，以实际参数为准；核心是**沿用 actionId、部署目录 hub、SPA 关闭**。
- `functions/` + `db/schema.sql`：预留的云端收藏，当前未启用。

---

## 6. 现状问题清单（设计债，按优先级）

这是你接手后最应该先看的诊断，不是让你一次全改，而是帮你排优先级。

| 优先级 | 问题 | 证据 | 影响 |
|---|---|---|---|
| P0 | 移动端没有导航 | `shell.css:458` 在 ≤980px 直接 `display:none` 掉 `.hub-nav`，没有汉堡/抽屉替代 | 手机上只剩品牌和「开始决策」，时间线/搜索/三个模块入口只能靠页脚 |
| P0 | 考公模块没有移动端断点 | `gongkao/style.css` 全文件没有 media query；`.shell` 固定 `height:100vh` + 206px 侧栏；iframe 高度只有「视口 − 140px」（最低 560px） | 手机上侧栏挤占内容，表格/筛选不可用 |
| P0 | 光标进入 iframe 就失效 | 彗尾只在顶层 `window` 监听 `pointermove`（`shell.js:54`），iframe 内指针事件不会冒泡到外壳，也没有 postMessage 桥接 | 核心三个模块里，最 signature 的光标会停在 iframe 边界；用户实际使用时间最长的页面反而没有光标 |
| P0 | 深浅色割裂 | 外壳没有主题；考研默认 auto、考公/实习默认 light，各自 localStorage；没有 iframe → 外壳的主题桥接 | 用户在模块里切深色，外壳仍是亮纸；切换模块时明暗跳变；整体「一个产品」的感觉被破坏 |
| P1 | 搜索索引 937KB 全站加载 | `hub/index.html:54` 在首屏就加载 `search-index.js`，不管当前路由 | 首屏多下载近 1MB；移动端流量与解析成本高 |
| P1 | 模块内部只换了皮 | `hub-module.css` 主要覆盖报头/侧栏/列表/统计/筛选；详情弹窗、对比表、编辑表单、导入导出、空态、错误态仍接近原工具 | 首页和模块第一屏很新，点进详情/对比后又回到旧产品质感，落差明显 |
| P1 | 衬线字体没有真正加载 | `--font-serif` 首选 "Noto Serif SC"，但没有 @font-face / 外链；Windows 实际回退到 SimSun | 编辑感依赖的衬线标题在多数评委的 Windows 上会显得旧、细、不统一 |
| P1 | 动效是手写散装，且有一次泄漏 | `initStory()` 每次 `renderHome()` 都 `window.addEventListener('scroll', update)`（`shell.js:304`），从不 remove；`navigate()` 的 setTimeout 也可能重叠 | 反复进出首页会叠加监听；没有统一的缓动/时长/清理机制；后续加 GSAP 容易互相打架 |
| P1 | iframe 加载态不统一 | 考公有 `#bootSplash`；考研/实习没有统一骨架；iframe 白屏/闪一下 | 切模块时视觉断裂，显得慢 |
| P2 | 可访问性欠账 | 没有 skip link；没有全局 `:focus-visible`（只有两个输入框有 `:focus`）；搜索/筛选结果没有 aria-live；自定义光标隐藏原生光标；muted 文字对比度偏低 | 键盘用户、低视力用户、评审中的可访问性检查会扣分 |
| P2 | 移动端 iframe 嵌套滚动 | 外壳保留 header + module-bar，iframe 内部再滚动；`min-height:560px` 在 390×844 上占比过大 | 手势冲突、地址栏收起时高度跳变、底部内容难触达 |
| P2 | 300vh 叙事可能过长 | `shell.css:275`；3 个 panel 需要滚动约 3 屏 | 笔记本上容易「怎么还没完」；应评估是否 2 个 panel 或缩短 |
| P3 | Token 漂移 | `tokens.css` 的 `--hub-*` 完全未使用；`shell.css` 与 `hub-module.css` 各有一套纸/墨/青绿；圆角/阴影/字阶不统一 | 后续改版容易出现「同一颜色三个值」 |
| P3 | 模块色 meta 是遗留值 | `MODULE_META` 里考公 `#5f7a2e`、实习 `#2b6cb0`（`shell.js:10`），但皮肤实际用青绿 | 如果新组件直接读 meta 色，会和现有皮肤冲突 |
| P3 | SEO/分享信息弱 | hash 路由，单一 title/description；没有每页 title、OG 图 | 分享到微信/小红书/论坛时预览不理想 |

补充：`hub/shared/tokens.css` 是死文件；`hub/shell.css` 才是外壳真实 token。不要被文件名误导。

---

## 7. 三个参考仓库怎么用

先说明：这三个仓库的内容会更新，下面给的是「怎么用」而不是 API 文档。动手前请读它们当前的 README / SKILL.md，并在方案里注明你实际引用了哪一条规则/哪个组件。

### 7.1 greensock/gsap-skills（官方 GSAP AI 技能）

**它是什么**：GreenSock 官方维护的 Agent Skills 仓库，教 coding agent 正确使用 GSAP，覆盖 timeline 编排、ScrollTrigger、插件注册、框架集成、性能与常见错误。它不是组件库，是一套「写动画代码的规范 + 模式」。

**怎么装/怎么读**：

- 按 Qoder CN 的技能加载规则，把仓库里的 skill 目录放到用户级或项目级 skills 目录（通常是 `~/.qoder/skills/` 或项目 `.qoder/skills/`，以 Qoder 实际规则为准）。
- 如果无法自动加载，就直接读仓库里的 `SKILL.md` / `README.md`，不要凭记忆写 GSAP。
- 不要把整个仓库提交进本项目；第三方代码/文档不要进 `hub/`。

**在本项目里值得用的地方**：

1. **Hero 入场编排**：把现在散在 CSS 的 aurora / 光点 / 分字标题 / CTA 串成一条 0.8–1.2s 的 timeline，而不是各自 delay。
2. **路由转场**：幕布 + 内容 stagger；用 GSAP timeline 替代 `setTimeout(200)`，但要保留「快速连点 hash 不重叠」的保护。
3. **Story 滚动**：用 ScrollTrigger 替代手写 `getBoundingClientRect` 进度（`shell.js:293`），并正确 `kill()`；这是修掉监听泄漏的机会。
4. **数字滚动**：`countUp` 用 gsap.to + snap，保留 `?shot=1` 直接落终值。
5. **列表/筛选结果 stagger**：只对首屏可见项，避免长列表全量动画。
6. **弹窗/抽屉**：模块内的 modal 不要用 GSAP 直接接管（避免和模块原逻辑打架），优先用 CSS transition；外壳自己的弹窗可以上。
7. **主题切换**：颜色变量过渡可以用 GSAP，但不要造成大面积 repaint；优先 CSS transition。

**集成约束**：

- 本地 vendor：`hub/vendor/gsap.min.js` + `hub/vendor/ScrollTrigger.min.js`（版本号写进注释/README），`defer` 加载；不要运行时依赖 CDN。
- 只在外壳使用；不要往 iframe 里注入 GSAP，也不要跨 iframe 做动画。
- 注册插件一次；每个路由渲染用 `gsap.context()` 包住，`render()` 时 `ctx.revert()`，避免旧 tween 操作已卸载的 DOM。
- `gsap.matchMedia()` 处理 `prefers-reduced-motion` 和移动端；reduced-motion 下一律直接终态。
- 不要引入 Lenis 等平滑滚动库；外壳与 iframe 的滚动边界很敏感，滚动劫持会直接毁掉模块体验。
- 动画只动 `transform` / `opacity` / `filter`，不要动 `height/top/left`；长列表不要逐项 `will-change`。

**不要做**：为了炫技加 3 秒开场、滚动劫持、每个 section 都 pin、满屏 parallax。

### 7.2 DavidHDev/react-bits（React 动效组件参考）

**它是什么**：React Bits 是一个 React 动画组件集合，分 Text Animations、Animations、Components、Backgrounds 等；组件以可复制源码 + 演示为主，常见有 Split Text、Blur Text、Shiny Text、Count Up、Spotlight Card、Tilted Card、Magnet、Click Spark、Image Trail、Scroll Velocity、Aurora、Particles 等。

**关键限制**：它是 React 代码，而本项目是原生 JS、无构建。**不要为了用它引入 React 或打包器**。把它当「交互语汇库」：看它解决什么问题、节奏怎么调，然后用原生 CSS/rAF/GSAP 重写。直接复制源码前先核对仓库 LICENSE；如需署名，按许可证处理。

**已经有的（不要重复造）**：

- 分字标题（`shell.js:275`）
- 磁吸 CTA（`shell.js:308`）
- Bento 聚光/倾斜（`shell.js:94`）
- 极光（`.hero-aurora`）
- 跑马灯（`.hero-marquee`）
- 数字滚动（`countUp`）
- 彗尾光标（已定稿，不要再换）

**建议新增/升级的 3–5 个，按性价比排序**：

1. **院校/公司/岗位卡的 pointer spotlight + 轻微 tilt**：现在只有首页 Bento 有；模块列表卡没有。只对 hover 卡生效，触屏禁用，长列表用事件委托。
2. **搜索结果分组 stagger + 高亮**：搜索已有 `markHit`，缺入场节奏；用 80–120ms stagger，只对前 12 条。
3. **路径结果卡的分数环绘制 + 维度条增长**：结果页是转化关键，值得一个「结论揭晓」的 600ms 编排。
4. **时间线的 scroll-linked 进度线**：当前窗口/今天的标记可以有一个「点亮」动作，但不要每个节点都动。
5. **模块报头的一次性文字揭示**：进入模块时 300ms，离开即结束；不要循环。

**不要做**：Image Trail（太重）、全屏 Particles（抢阅读）、Click Spark（廉价感）、把每个卡片都做成 3D 翻转。

### 7.3 Leonxlnx/taste-skill（反模板化设计技能）

**它是什么**：一个给 coding agent 的「品味」技能，目标是让 agent 不要生成平均的 landing page，而是按字体、间距、颜色、版式、动效的规则做有意图的设计；仓库里通常有 SKILL.md、locks/bans、检查清单。具体规则以当前版本为准。

**怎么用**：

1. **开工前**：让它读 SKILL.md，然后对现有 8 条路由做一次「taste audit」：每条路由截 1440 与 390 两张图，逐条列出「模板感/无意图」的地方，必须带截图证据。
2. **方案阶段**：用它的规则约束新方案，但不许它把现有的编辑感 DNA 洗成通用 SaaS。它的作用是「去 slop」，不是「换风格」。
3. **验收阶段**：按它的清单复查：字阶是否有明确层级、间距是否有节奏、颜色是否有纪律、每个页面是否有不同的版式原型、动效是否都有目的、是否出现无意义的 pill/渐变/玻璃卡堆叠。

**重点检查的「AI 味」**：

- 每个 section 都是「小标题 + 大标题 + 三张圆角卡」。
- 到处都是渐变 blob、玻璃拟态、悬浮阴影。
- 字体只有一套 sans，标题靠加粗和放大。
- 间距全靠 16/24 两个值，没有 editorial 的留白节奏。
- 动效只是 hover 放大/上浮，没有状态叙事。

### 7.4 推荐使用顺序

1. **Taste audit**（读 taste-skill，审现有站点，出问题清单）。
2. **动效脚本**（读 gsap-skills，列出「哪些动效值得上 GSAP、哪些保持 CSS」）。
3. **组件 shortlist**（读 react-bits，选 3–5 个模式，写明原生重写方案）。
4. **三套方向方案**（见第 9 节 Phase 0），给用户选。
5. **确认后实施**，每阶段截图验收。

参考仓库获取（放在项目之外，不要提交进站点）：

```bash
git clone https://github.com/greensock/gsap-skills
git clone https://github.com/DavidHDev/react-bits
git clone https://github.com/Leonxlnx/taste-skill
```

- gsap-skills / taste-skill：把包含 `SKILL.md` 的目录按 Qoder CN 的技能加载规则放好；不能自动加载时直接读文件。
- react-bits：不是 skill，是组件源码 + 演示；按需读对应组件，不要整仓引入。
- 网络受限时先处理代理；不要把 clone 下来的仓库放进 `hub/`，也不要提交。

---

## 8. 下一版的设计目标（方向边界，不是定稿）

### 8.1 必须保留

- 暖纸/深墨/青绿/铜金的色彩关系；衬线标题；编辑部式的细线、编号、网格、报头。
- 浅色为主、深色自适应的模块皮肤；绝不强制深色模块头。
- 彗尾光标（默认 comet；4 模式与 `?cursor=` 保留）。
- 克制的光效；动效服务于阅读，而不是演示。
- 三个模块的业务逻辑与数据。

### 8.2 三条提升主线

1. **触感（Craft）**：字体真正落地、字阶统一、间距有节奏、所有可交互元素有明确的 hover/focus/active/loading/empty/error 状态；弹窗、抽屉、筛选、导入导出都按同一套语言重做视觉。
2. **节奏（Motion）**：每个页面最多 1 个 signature moment；微交互 120–200ms，入场 300–600ms，叙事滚动 1–2 个；不要 ambient noise。用 GSAP 建立一套可复用的时长/缓动 token。
3. **可信度（Proof）**：数据可视化要像「编辑部图表」而不是「后台 dashboard」；来源、日期、口径、空缺都要可见；不要为了好看造趋势。

### 8.3 页面级建议（可调整，但要在方案里逐页说明）

- **首页**：保留深墨 hero，但把「5 秒内看懂」做得更狠：一句话价值 + 三个真实入口 + 一条数据证明。Story 可缩到 2–3 panel；行动清单要像「本周该干什么」而不是普通列表。
- **路径决策**：把问卷做成编辑式问答（大题号、单题聚焦、进度），结果页是「结论揭晓」：主推荐 + 分数环 + 三条维度理由 + 近期节点 + 报告预览。不要在结果页堆太多卡片。
- **统一时间线**：从「列表 + 筛选」升级为「泳道 + 今天标记 + 当前窗口」；官方/推算的区分要成为视觉结构，而不是小标签。
- **全局搜索**：command palette 的方向是对的；补键盘导航、分组、空态、最近搜索；结果点击后的模块定位要有「到达」反馈。
- **关于**：保持编辑式长文与信件感；架构图可以更有信息量，不要做成三个圆角盒子。
- **模块内部**：这是最大的一块。先统一「列表 / 详情 / 对比 / 筛选 / 表单 / 空态 / 骨架」七类页面原型，再逐模块替换；优先考研（数据最结构化）→ 实习（卡片最规整）→ 考公（表格最复杂、风险最高）。

### 8.4 动效分级（建议写进代码注释/token）

- L0：reduced-motion / `?shot=1`，全部直接终态。
- L1：微交互（hover、focus、按钮、chip）120–200ms。
- L2：入场（卡片、分组、弹窗）300–600ms。
- L3：叙事（滚动驱动的 story、时间线进度）每页最多 1–2 处。
- L4：全站 signature（彗尾光标、hero 光点、报头扫光）已经存在，不要无限增加。

### 8.5 移动端目标

- ≤980px 提供真正的导航（底部 tab bar / 抽屉 / 全屏菜单，三选一，方案里给理由）。
- 模块路由在手机上改成「全屏模块模式」：隐藏页脚/大标题，保留一个紧凑返回条，iframe 高度用 `100dvh - 返回条`，内部滚动；不要自动高度。
- 表格在手机上转卡片或横向滚动容器，筛选改用 bottom sheet；点击目标 ≥44px。
- 在 390×844、360×800 两种尺寸实测，不用只看 DevTools 模拟。

---

## 9. 建议路线图（4 周，可按实际压缩）

### Phase 0：审计与方案（0.5–1 天，不写生产代码）

交付：

- 8 条路由 × 1440/390 × 浅色/深色 的基线截图（用 `?shot=1`）。
- 一份 taste audit：问题、证据、影响、优先级。
- 一份动效清单：哪些保留 CSS、哪些上 GSAP、哪些删除。
- **三套方向方案**（不是三套配色）：每套写明参考、页面结构变化、动效签名、风险、工作量；给出你的推荐。
- 等用户确认后再进入 Phase 1。

### Phase 1：基础加固（2–3 天，高价值低风险）

- 移动端导航 + 模块全屏模式。
- 主题桥：外壳增加浅/深/随系统；通过 postMessage 与三个模块同步（模块仍保留自己的开关，但外壳切换要广播；模块切换要回传）。
  - 实现提示：不要只改 `data-theme`。三个模块的主题 key 分别是 `kaoyan-theme` / `gk_theme` / `itr_theme`，要同时写入对应 key、更新模块自己的切换控件状态，最好在模块 `app.js` 暴露一个 `window.HubTheme = { get, set }` 接口供桥接脚本调用；否则会出现「页面变深了但开关还停在浅色」。
- 光标桥：iframe 内 pointermove 通过 postMessage 回传坐标，或进入 iframe 时切换为原生光标 + 边缘淡出；二选一，必须实测三个模块。
- 搜索索引懒加载：只在 `/search` 路由加载；首页统计不需要全量索引。
  - 实现提示：`renderSearch` 目前是同步函数；改成「进入搜索路由 → 动态注入 `search-index.js` → await 加载 Promise → 再渲染」，并缓存 Promise，避免重复注入。其它路由不要引用 `HUB_SEARCH`。
- 统一骨架屏/加载态；模块 iframe 加淡入，不要白闪。
- a11y 基础：skip link、`:focus-visible`、搜索/筛选 aria-live、对比度校正。
- 修 `initStory` 监听泄漏。

验收：功能零回归；移动端可用；光标在模块内连续；主题切换不闪；首屏不再加载 937KB。

### Phase 2：GSAP 动效系统（3–4 天）

- vendor GSAP + ScrollTrigger；建立 `motion` token（时长/缓动/stagger）。
- Hero 入场、路由转场、story ScrollTrigger、countUp、列表 stagger、结果卡揭晓。
- 全部包 `gsap.context()` + `revert()`；reduced-motion / shot 模式直接终态。
- 保留旧实现开关（例如 `?motion=legacy`）便于回滚，验收后删除。

验收：60fps（中端笔记本 + 手机模拟）；无滚动劫持；无残留 tween；`?shot=1` 截图稳定。

### Phase 3：组件质感（3–4 天）

- 按 7.2 的 shortlist 做 3–5 个原生重写：卡片 spotlight/tilt、搜索 stagger、结果环、时间线进度、报头揭示。
- 只改外壳页面；模块内先不动逻辑。
- 每个效果都要有「关闭」路径（reduced-motion / 触屏 / 低性能）。

验收：效果有记忆点但不抢阅读；长列表不掉帧；触屏无 hover 依赖。

### Phase 4：模块内部重构（5–7 天，风险最高）

顺序：考研 → 实习 → 考公。每个模块单独做，做完立刻回归。

- 先定义七类页面原型：列表、详情、对比、筛选、表单、空态、骨架。
- CSS 优先；必须改 DOM 时，先确认对应 app.js 的渲染函数与事件委托，不要重写业务逻辑。
- 重点：详情弹窗、对比表、导入导出、筛选吸顶、移动端卡片化。
- 每个模块做完：截图 + 功能清单 + 已知风险。

验收：三个模块的详情/对比/筛选/导入导出全部可用；移动端可用；无 console error；数据未变。

### Phase 5：收口与发布（2 天）

- taste-skill 复审；字体/字阶/间距/圆角/阴影统一。
- 深色 parity；reduced-motion；键盘走查。
- 全量截图（8 路由 × 2 尺寸 × 2 主题）。
- 发布到 Qoder Sites，线上验证；GitHub 同步。
- 如视觉变化影响参赛帖，先通知用户，再决定是否更新截图/文案。

建议在 **11 月 20 日前**完成 Phase 1–4，留下 10 天给参赛帖更新、审核和意外回滚。

---

## 10. 验收清单（每个 Phase 结束都跑）

### 功能回归

- [ ] 8 条路由可直接打开、刷新、前进/后退。
- [ ] 搜索「北大」「税务局」「中信」各命中正确分组；点击结果进入模块并定位。
- [ ] 考研：筛选、详情弹窗、对比、CSV/报告导出、收藏、主题切换。
- [ ] 考公：筛选、详情、竞争比、导入导出、收藏、主题切换。
- [ ] 实习：公司库、时间轴、投递进度、渠道、攻略、导入导出、主题切换。
- [ ] 三轨档案填写后，三个模块都能预填。
- [ ] 路径决策 10 题可完成；分享链接可还原；打印预览正常。
- [ ] 时间线筛选、当前窗口高亮、剩余天数正确。
- [ ] 移动端导航、模块全屏、返回。
- [ ] 无 console error / 404。

### 视觉

- [ ] 1440×900、1280×800、390×844、360×800。
- [ ] 浅色/深色；模块深浅与外壳一致。
- [ ] 无横向溢出；无文字截断；无 fixed 元素跑出视口。
- [ ] 弹窗在 iframe 内可点、可关、可滚动。
- [ ] 字体在 Windows 上不是 SimSun 默认效果（或明确接受并做了字号/字重补偿）。

### 动效

- [ ] `prefers-reduced-motion` 下无动画、无闪烁、内容完整。
- [ ] `?shot=1` 下所有 reveal 可见、story 静态、无光标/颗粒。
- [ ] 快速连点导航不重叠、不残留。
- [ ] 离开路由后旧 tween/监听已清理。
- [ ] 触屏无 hover 依赖；光标不出现。

### 性能

- [ ] 首屏不加载 `search-index.js`（或证明懒加载生效）。
- [ ] 首屏 JS 总量有预算并记录；iframe 只在进入模块时加载。
- [ ] 中端设备 60fps；长列表滚动无明显掉帧。
- [ ] 图片/字体有缓存策略；无布局抖动（CLS）。

### 可访问性

- [ ] 键盘可走完首页 → 路径 → 结果 → 模块。
- [ ] 所有交互有可见 focus。
- [ ] 搜索/筛选结果变化有 aria-live。
- [ ] 文本对比度达到 AA（尤其 muted 小字）。
- [ ] 自定义光标不影响输入框/文本选择。

### 发布

- [ ] 线上 URL 可公开访问，标题/描述正确。
- [ ] 所有资源 200；无混合内容。
- [ ] 移动端真机打开正常。
- [ ] GitHub 提交干净，无临时文件/凭据。

---

## 11. 本地运行、截图、发布

### 本地

```bash
node tools/serve-hub.js
# http://127.0.0.1:8123
```

### 静态截图（Windows Edge 示例）

```bash
"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" \
  --headless=new --disable-gpu --hide-scrollbars \
  --window-size=1440,4200 --virtual-time-budget=5000 \
  --screenshot="contest/shots-v2/check-home.png" \
  "http://127.0.0.1:8123/?shot=1#/home"
```

- `?shot=1` 必须在 `#` 之前，外壳用 `location.search` 读取。
- 长页截图高度按内容估；不要用超高视口直接截 hero，`100svh` 会被撑大（已用 clamp 修过，但仍建议分段截）。
- 动效验收必须用真实浏览器，不要只看静态截图。

### 发布

沿用现有 Qoder Sites 项目，不要新建。成功过的链路：

1. `prepare_site(actionId="b2d3e4f5-6a7b-4c8d-9e0f-1a2b3c4d5e6f", projectRoot=<repo>, displayName=<沿用现有站点名>, slug="sanchalu", spa=false, webDirectory="hub")`
2. 查 `verificationOperationId` 对应 `get_operation`
3. 若 pending，用同一 actionId 重试 `prepare_site`
4. `publish_site`
5. `get_publish_status` 直到 `publication_completed`
6. 用应用内浏览器打开线上 URL，检查首页、三个模块、移动端

若 Qoder Sites 工具参数已变，以工具 schema 为准；不要改 slug、不要关公开访问。

### GitHub

- 仓库 `zcf2230/qiancheng-zhibei`，main 分支。
- 本机网络可能需要代理；提交前 `git status`，不要带上 `.cdp/.edge*/` 临时目录。
- 只在用户明确要求时推送；推送前确认没有凭据、没有他人截图。

---

## 12. 已知坑（避免重复踩）

1. **iframe 自动高度**：曾导致 3,067,064px 的假高度、页面颤抖、弹窗点不到。现在固定视口 + 内部滚动是刻意设计，不要「优化」掉。
2. **`100svh` 在超长无头视口里会被撑大**：hero/story 已用 `clamp(640px,100svh,980px)` 之类限制；新增全屏 section 时注意。
3. **数字滚动截到中间态**：`countUp` 有 1600ms 强制落终值 + `shotMode` 跳过；换 GSAP 后要保留这个兜底。
4. **考研预填崩溃**：`DATA` 初始为 null，曾因 `typeof null !== 'undefined'` 直接解引用导致整页脚本挂掉；改模块时保留 `if (DATA && ...)` 守卫。
5. **搜索索引全局加载**：937KB，移动端明显；改成按路由懒加载时，注意首页 marquee/统计不依赖 `HUB_SEARCH`。
6. **主题 FOUC**：三个模块都在 `<head>` 内联脚本里先写 `data-theme`；加外壳主题桥时不要破坏这段。
7. **`hub-module.css` 的 `!important`**：皮肤层靠它压旧样式；继续叠加会越来越难维护。新样式优先用变量和更精确选择器。
8. **`tokens.css` 是死文件**：不要以为改了它就会生效。
9. **考公自己的 CSS 没有移动端断点**：共享皮肤只有一个 980px 的侧栏缩窄规则，不等于移动端适配；任何「手机可用」的方案都必须先给考公补布局。
10. **实习登录门**：markup 还在但 hidden；不要因为「清理代码」把它恢复，也不要把 `data.enc.js` 接回去。
11. **天池帖**：已发布，可能审核中；不要在未授权时改帖/传图。
12. **Git 临时文件**：`contest/**/.cdp`、`.edge*` 曾被误提交过；`.gitignore` 已有规则，提交前仍要检查。

---

## 13. 第一轮你必须交付什么

在写任何生产代码之前：

1. **读**：`README.md`、`hub/index.html`、`hub/shell.js`、`hub/shell.css`、`hub/shared/hub-module.css`；再读三个参考仓库的 README / SKILL.md。
2. **审**：用 `?shot=1` 截 8 条路由（1440 与 390），对照第 6 节逐条确认/补充，输出一份「现状诊断 + 证据截图」。
3. **提**：三套方向方案。每套必须包含：
   - 一句话概念（不是「更现代」这种空话）。
   - 首页、路径、时间线、模块内部各改什么（结构级）。
   - 动效签名（哪 1–2 个动作让人记住）。
   - 引用了哪个 skill/组件，怎么落地（原生重写 / GSAP / CSS）。
   - 风险与工作量（人天）。
   - 为什么它不会变成「跟没改一样」。
4. **等**：用户确认一套后，再进入 Phase 1。不要三套一起写，也不要不确认就大改。
5. **实施**：Phase 1 完成后，给「改动清单 + 前后截图 + 功能回归结果 + 已知风险」，再进入下一阶段。

用户的工作方式：

- 中文沟通；不要用术语堆砌，截图和线上链接比代码解释有效。
- 大改版先方案后开工；方案确认后连续执行，不要每一步都问。
- 用户会亲自点、亲自看；「理论上应该没问题」不算验收。
- 不要问账号密码；需要登录态时让用户自己操作。
- 不要把「聚合了三个旧产品」写进任何文案；统一说「为本次比赛而作」。

---

## 14. 附：口径、数字、联系

### 对外数字（以当前构建产物为准）

- 考研院校：211 所；2027 简章已核对 47/211。
- 考公岗位：16,543 个（README/首页口径）；搜索索引里 g 类为 16,544 条，两个数不要在同一段文案里混用。
- 实习机构：1,064 家；当前开放 254 家，全年滚动 786 家，7 天内截止 9 家。
- 全局搜索：17,819 条。
- 统一时间线：36 条（考研 8 / 考公 22 / 实习 6）。
- 国考过审：3,025,502 人（2026-10-24 口径）。

> 注意：`contest/tianchi-post.md` 第五节里出现过「考研 243 所」「考公 1861 个岗位」，与当前数据口径不一致；如果用户要更新帖子，先提醒核对，不要照抄。

### 叙事口径

- 公开品牌：前程指北。
- 定位：考研 / 考公 / 实习一站式信息助手。
- 比赛：2026 Qoder 高校创造力大赛 · StudyHack 学习科研赛道。
- 禁止：聚合旧产品、旧版本、独立站、前作、三个工具合并。
- 数据原则：官方优先、留空不编、第三方标注。

### 联系

- 作者：Zaiayn，浙江工商大学金融学专业。
- 邮箱：3426493108@qq.com；微信：Zaiayn。
- 参赛帖：天池 post 1091505（已发布，改动需用户确认）。
- Qoder 账号信息只用于参赛材料，不要写进代码或提交。

---

## 15. 一句话收束

先把「手机能用、光标不断、主题不裂、搜索不拖慢」这四个基础问题修好，再用 GSAP 建立有节制的动效系统，最后才动三个模块的内部页面。每改一步都用截图和真机验收；不要为了显得努力而堆动画，也不要为了安全而只换颜色。用户要的是「一眼记住、点进去还站得住」的成品。
