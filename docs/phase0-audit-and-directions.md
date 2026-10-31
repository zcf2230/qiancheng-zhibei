# Phase 0 · 现状审计与三套方向方案（待用户确认）

> 日期：2026-10-31 · 审计人：接手的前端设计工程师
> 状态：**方案待确认，未写任何生产代码**。数据、叙事口径、iframe 固定视口架构均未改动。
> 证据目录：`contest/audit-baseline/`（curated 截图 + inspect report.json）。
> 完整截图与测量原始输出在本机工作区 `…/2026-10-31/dd86c6ff/audit/`（含 8 路由 × 1440/390、长页、弹窗、割裂证据、inspect 全量截图）。

---

## 0. 取证方法与三个必须知道的坑

1. **Edge headless `--window-size=390` 不可信**：它有最小窗宽（实测约 500px），产出的「390」截图是 ~500px 布局被裁切到 390，会伪造出「横向溢出/文字被切」的假象。**移动端结论一律以 taste-skill `inspect.mjs` 的 CDP 真 390 模拟为准**（`true390-*.jpg`）。真 390 下外壳首页**没有**横向溢出。
2. **inspect 的 probe 只在顶层 document 跑，不穿透 iframe**。打外壳路由测不到模块内部；模块必须单独打模块 `index.html`（`--app`）。
3. **inspect 每次运行会清空 `--out` 旧截图**，8 条路由必须各用独立 `--out`。

工具链：taste-skill v2（`refs/taste-skill`，已 clone 到项目外）、gsap-skills（`refs/gsap-skills`）、react-bits（仅线上 README，**MIT + Commons Clause**，只作交互语汇参考、原生重写，不搬源码）。

---

## 1. 八条路由审计（问题 / 证据 / 优先级）

优先级沿用交接文档 P0–P3。**加粗**为本次新发现或推翻交接假设的项。

### home
| 优先级 | 问题 | 证据 |
|---|---|---|
| P0 | ≤980px 无导航，只剩品牌+「开始决策」 | `shell.css:459`；`true390-home.jpg` |
| P1 | **五个 section 全是同一版式原型**：kicker+衬线 h2+同款圆角卡网格（bento 4 卡 / actions 6 行 / story 3 面板 / steps 3 卡 / editorial 2 卡） | `tall-home.png`；taste `card-rows`/`icon-cards` |
| P1 | **全站零真实图片/界面截图**，inspect `few-pictures` FAIL（0 张） | `inspect-home-report.json`；产品自身界面（考研列表）其实很好看却从未在首页出现 |
| P1 | **h1 只有品牌名「前程指北」**，首屏没有大字说清「这是什么」，inspect `name-only-title` FAIL | `d1440-home.png`；lead 仅 16px |
| P1 | 衬线未真正加载，Windows 回退 SimSun | `shell.css:30` 无 @font-face；taste type.md §5 |
| P2 | 同一组数字（211/16,543/1,064/36）在 bento、story、marquee 重复三遍，无新增信息 | `tall-home.png` |
| P2 | story 300vh 过长；shot 模式下左栏大编号+3 点对着 3 面板，左侧近半屏空 | `shell.css:276`；`tall-home.png` |
| P2 | 行动清单是通知feed式平铺列表，不是「本周该干什么」 | `d1440`/`tall-home.png` |

### path
| 优先级 | 问题 | 证据 |
|---|---|---|
| P1 | **10 张同款问卷卡一次铺满约 4 屏，转化关键的结果卡被埋在最底部**；改顶部答案时结果在屏外更新 | `tall-path-result.png` |
| P2 | 分数环填充用「占满分百分比」，环心数字却是原始分（22），两者口径不一致易误读 | `shell.js:499,505` |
| P1 | 问卷=重复卡原型，无单题聚焦/大题号节奏 | `tall-path-result.png` |

### timeline
| 优先级 | 问题 | 证据 |
|---|---|---|
| P1 | **单列 36 行，三条轨 interleaved，「对齐三条路」的承诺没有视觉结构**（无泳道/无甘特） | `tall-timeline.png` |
| P1 | **没有「今天」标记**；当前窗口仅靠边框+徽章 | `tall-timeline.png` |
| P2 | 官方/推算只是小 pill，不是结构区分 | `shell.js:331-335` |
| P2 | 36 行全展开约 7000px，无月份分组/吸顶 | `tall-timeline.png` |

### search
| 优先级 | 问题 | 证据 |
|---|---|---|
| P1 | **简称命中无高亮**：`markHit` 用原始 q（北大），别名展开后的「北京大学」不含 q，`<mark>` 不生效，结果没有「为什么命中」的解释 | `shell.js:624-628,645-648`；`d1440-search.png` 无任何高亮 |
| P1 | 937KB 索引首屏全量加载 | `hub/index.html:54` |
| P2 | 无键盘导航/分组计数弱/无最近搜索/空态仅占位框 | `shell.js:630-672` |

### about
| 优先级 | 问题 | 证据 |
|---|---|---|
| P2 | 架构图=「一个黑盒+箭头+三个圆角盒」，信息量低 | `shell.js:683` |
| — | 编辑式长文+信件感成立，保留 | `d1440-about.png` |

### kaoyan
| 优先级 | 问题 | 证据 |
|---|---|---|
| P0 | **移动端坏掉的根因是皮肤层**：`hub-module.css:340/361` 用 `!important` 锁侧栏 232/200px，压掉考研自身 `styles.css:367` 的 `width:100%`（无 !important）→ ≤900 本该变顶部横条，实际变成 200px 宽的竖块吃掉首屏 | `m390-kaoyan.png`（500 裁切版仍可见竖块）；agent 取证 |
| P1 | **详情/对比/编辑/报告内部未被皮肤覆盖**：`.kv/.years/.detail-sec/.cmp-table/.form-grid/#report` 仍是原工具质感；详情=纯 label:value dump + 整段备注墙 | `modal-kaoyan-detail.png`；`styles.css:172-201,250` |
| P1 | **head 没有防 FOUC 脚本**（交接文档说三个都有，错）：主题在 body 末尾 app.js:34 才执行 → 深色用户必闪白 | `kaoyan/renderer/index.html:3-10` |
| P1 | 无骨架/加载文案；`getApi` 失败无 catch → 白屏无提示 | `app.js:47-79,897` |
| P2 | 筛选为原生 select；**零事件委托、全内联 onclick 字符串**（改 DOM 风险最高） | `app.js:339,344,345` |

### gongkao
| 优先级 | 问题 | 证据 |
|---|---|---|
| P0 | **全文件 0 个 @media**；`.shell` flex+100vh、侧栏固定、`.statbar` 6 格不换行、`.pos-table` 固定列宽合计 592px 靠横向滚动 → 真 390 下仍是工作台布局，阅读/点选困难 | `style.css:67,70,285-308`；`true390-gongkao.jpg` |
| P1 | 详情/分析/档案/导入预览内部未覆盖；`.chart-bar.hot` 硬编码 `#bf3125` 与皮肤青绿冲突 | `style.css:480,558-576` |
| P2 | inspect `tiny-text` FAIL（9/10px）、`no-title` FAIL（无 h1）、数字左对齐 519/921 | `inspect-gongkao-report.json` |
| — | **全事件委托**（`data-uid`/`data-act`），改 DOM 风险反而最低 | `app.js:1159-1264` |

### intern
| 优先级 | 问题 | 证据 |
|---|---|---|
| P1 | **皮肤把全屏遮罩容器刷成不透明面板**：实习 `.modal` 是 fixed 全屏容器（`css/style.css:284`），皮肤 `hub-module.css:287` 给它 surface+radius+shadow → 整个 iframe 被纸色盖死再叠 .42 黑遮罩（双层不透明） | agent 取证 §2 |
| P1 | 看板/渠道/攻略/时间轴未覆盖（皮肤写的 `.tl-item.next` 与实习类名不匹配） | `css/style.css:321,337,354` |
| P2 | tab 用 emoji（📋✅📨📝），与编辑感 DNA 冲突；inspect `emoji` FAIL | `d1440-intern.png` |
| P2 | **口径不一致**：模块内算「253 家开放」，外壳 hub-stats/模块条为 254 | `d1440-intern.png` vs `shell.js:708` |

### 跨页（外壳 ↔ iframe）
| 优先级 | 问题 | 证据 |
|---|---|---|
| P0 | **光标进 iframe 即断**：彗尾只监听顶层 pointermove | `shell.js:54` |
| P0 | **深浅割裂实测**：系统偏好深色时外壳 body=`#F7F4EC`、iframe `data-theme=dark`；外壳无主题开关 | `seam-shell-light-module-dark.png`；evaluate 实测 |
| P1 | `initStory` 每次 renderHome 叠加 scroll 监听从不 remove；`renderTimeline`  likewise | `shell.js:304,376` |
| P1 | 模块 iframe 加载态不统一（仅考公有 bootSplash），切模块白闪 | `gongkao/index.html:19` |
| P2 | a11y：无 skip link、无全局 :focus-visible、无 aria-live、muted 对比度偏低 | `shell.css` 全文 |

---

## 2. 与交接文档假设的四处修正

1. 考研 head **没有**防 FOUC 内联脚本（考公/实习有）。
2. 考研移动端缺陷的**根因在皮肤层 !important**，不是模块没写断点（模块写了 900/420）。
3. 「考公风险最高」就**改 DOM** 而言不成立：考公全委托最安全，考研零委托最危险。CSS-only 皮肤工作三者风险都低；涉及 DOM 重排时顺序应按委托安全性重排。
4. 暖纸+铜金**不**落在 taste-skill 禁的 assistant palette（实测色相：#A9762F h=34.9、#D9B36C h=39.1，均不在 terracotta 的 h∈[6,30]；#F7F4EC 仅 `palette-cream` WARN）。**DNA 可保留**，只需 `--allow palette-cream`。红线：别引入 h6–30 的锈橙。

---

## 3. taste-skill 冲突与豁免清单（品牌资产 vs 该改的）

**走 `--allow` 保留（用户已认可的 DNA，报告里声明理由）**：`palette-cream`、`pill-nav`（浮岛胶囊，须自证不压字）、`glass`（外壳仅 1 条吸顶玻璃带）、`hairline`/`outlined-box`（外壳刊头细线；app 内自动豁免）、`numbering`（外壳刊头大编号；app 内编号只作数据才合法）、`eyebrow`/`micro-label`（刊头 kicker）。
**彗尾光标**：taste motion.md §8 明禁 custom cursor，但**用户已定稿 comet**，属用户决策优先，保留；要修的是 iframe 桥（P0），不是删除。

**建议改、不豁免（真 FAIL 且非 DNA）**：
- `.btn-primary`/`.hub-nav-cta` 的静止光晕阴影 → `button-fx`+`shadow` FAIL；改 flat fill。
- `.progress-fill` linear-gradient、`.ring` conic-gradient → lint `gradient` FAIL；进度改 flat 色条，分数环改 SVG stroke-dashoffset（单色描边不算渐变填充）。
- 模块内 <11px 文字、无 h1、数字左对齐、硬编码 #bf3125、emoji tab → 按 app-screens 规则改。
- 外壳 `few-pictures` FAIL → **加入真实界面裁切图**（产品自己的 UI 是最强证据，也符合 taste「software 的界面碎片算图片」）。

**app-screen 模式关键差异**（三个 iframe 模块适用，`references/app-screens.md`）：细线/编号/重复卡片/静止阴影在 app 内合法；**无动效下限、无图片下限**；但 gradient/emoji/contrast/overflow/tiny-text/无 h1 仍 FAIL；新增 `sidebar-phone`（手机侧栏 >30% 宽）、面板玻璃 FAIL、KPI ≥48px WARN、h1 18–32px。→ **模块内的大衬线标题/大 KPI 要降档**，外壳保留大字。

---

## 4. 动效清单（保留 CSS / 上 GSAP / 删除或降级）

**保留 CSS**：微交互 hover/focus/chip（120–200ms）、弹窗/抽屉 transition、呼吸光与报头扫光（**加离屏暂停 + reduced-motion 停**）、marquee（离屏暂停）。
**上 GSAP（仅外壳，本地 vendor）**：hero 入场 timeline（0.8–1.2s）、路由转场（替 `setTimeout(200)`，保留连点保护）、story 改 ScrollTrigger（**顺带修监听泄漏**）、countUp（保留 `?shot=1` 与 1600ms 兜底）、搜索/列表 stagger（仅前 12 条）、结果环绘制、时间线今天线 scrub。全部 `gsap.context()`+`revert()`、`gsap.matchMedia()` 处理 reduced-motion/移动端。
**删除/降级**：`initStory`/`renderTimeline` 手写 scroll 监听（泄漏）；`initTilt` 全局 pointermove（改事件委托、仅 hover 卡）；三模块注入的 560×560 fixed 指针光晕 div（改 CSS 跟随或删）；漂浮光点无限循环（离屏暂停或删）。
**不引入**：Lenis/平滑滚动、滚动劫持、满屏 parallax、Image Trail、Click Spark、全屏 Particles。

---

## 5. 共享 Phase 1 基线（三套方向都必做，约 3 人天）

移动端真导航（底部 tab bar）+ 模块全屏模式（`100dvh−返回条`，不做自动高度）；主题桥（外壳浅/深/随系统 + postMessage 双向，模块暴露 `window.HubTheme`，考研最省/实习一行/考公需提升闭包）；光标桥（iframe pointermove 回传或进 iframe 切原生+边缘淡出，二选一实测）；搜索索引懒加载；统一骨架+iframe 淡入；修皮肤 !important 压断点、实习 .modal 双层遮罩、考研 FOUC；a11y 基础；修监听泄漏；衬线自托管子集 woff2 真正加载。

---

## 6. 三套方向方案

### 方向 A ·「晨刊」The Morning Edition（推荐）
**一句话概念**：把站点做成一份「本周晨刊」——首页是头版（lead story=本周最紧急窗口，配一张真实模块界面裁切图作「本版照片」），时间线是刊期日历（三泳道甘特+今天竖线），路径决策是问答专栏，模块是资料室档案页。
**结构变化**：
- 首页：头版网格（lead 大块+界面图；右栏数据速览竖排）→ 三轨**对照表**（编辑式表格，替代三个同款卡）→ 报尾。删除 bento 四同款卡与 steps 三同款卡。
- 时间线：三泳道甘特（横轴月份/纵轴三轨）+今天竖线；官方=实线块、推算=虚线块（结构区分）。390 转置为纵向泳道。
- 路径：单题聚焦（一次一题、大题号、进度刊头）；结果=整版深色「结论版」。
- 模块：七原型统一「档案页」——列表=索引表、详情=右栏档案卡（`1fr 384px`）、对比=数字右对齐表、筛选=吸顶工具条、空态=保留框+一句说明。
**动效签名**：① 头版「付印」入场（标题行上升+界面图从裁切框展开，GSAP timeline 0.9s）；② 今天竖线随滚动「划刊」（ScrollTrigger scrub）。
**引用**：taste layout.md §2/§7、app-screens §3.4/§7.4/§11；gsap-timeline、gsap-scrolltrigger；react-bits Split Text / Spotlight Card 原生重写。
**风险/工作量**：甘特移动端转置是主要风险；共享 3 + 额外 12 ≈ **15 人天**。
**为什么不算「跟没改一样」**：首页从「卡网格堆叠」换成「头版+对照表」两种新版式原型，并首次出现真实界面图；时间线从列表变甘特——都是结构级，不是换色。

### 方向 B ·「指北驾驶舱」The Compass Console
**一句话概念**：让「指北」真的会指——全站围绕一个「当前坐标」（今天+你的三轨档案）组织，首页是驾驶舱（罗盘指向主推荐/最紧急轨道），模块是同一坐标下的三个仪表。
**结构变化**：首页左固定罗盘+当前窗口读数（sticky 侧栏）、右滚三轨长卷；时间线以「今天」为原点的相对轴（−30…+120 天）三轨色带；路径结果驱动罗盘与首页坐标；模块报头加「坐标条」、列表加「与你的匹配度」结构列。
**动效签名**：① 罗盘指针弹性转向（跨路由角度连续）；② 坐标条数字滚动。
**引用**：gsap-core matchMedia；react-bits Count Up / Spotlight Card；taste app-screens §9.1（KPI 尺寸纪律）。
**风险/工作量**：罗盘必须真编码信息否则沦为装饰（taste 禁 decorative shape）；跨 iframe 只读状态需 postMessage；共享 3 + 额外 13 ≈ **16 人天**（最紧）。
**为什么不算没改**：引入全站统一「坐标」信息结构 + sticky 驾驶舱版式。

### 方向 C ·「纸面档案」The Paper Record（保守）
**一句话概念**：不动版式原型，把现有编辑感「做真」——字体落地、字阶/间距纪律、状态补全、模块七原型皮肤补全、移动端重排；结构变化集中在模块内部与移动端。
**结构变化**：首页保留 hero/bento/story 但 story 缩 2 panel、bento 改不等宽 2×2、加 1–2 张界面裁切图、行动清单改按日期分组的 briefing；时间线保留单列但加今天标记+月份吸顶+官方/推算左色条；路径结果改 sticky 侧栏（桌面）/吸顶条（移动）；模块补全七原型皮肤并修三个根因 bug。
**动效签名**：① 报头一次性文字揭示；② 详情「档案展开」CSS transition。基本不新增 GSAP（仅修泄漏+路由转场）。
**引用**：taste type.md §5、app-screens §11、motion.md §4 token。
**风险/工作量**：最低；共享 3 + 额外 8 ≈ **11 人天**。
**为什么不算没改 / 隐患**：模块内部质感与移动端是实打实翻身；但外壳记忆点增量最小，**仍有可能被评「跟没改一样」**——这是它的代价。

---

## 7. 推荐

**推荐 A**。它在「结构级变化 + 记忆点 + 补齐零图片短板」三者上最平衡，且甘特时间线直接兑现「统一时间线对齐三条路」的产品承诺；15 人天可在 11-20 前完成 Phase 1–4。B 记忆点强但罗盘有装饰化风险且工期最紧；C 最稳但记忆点增量不足，适合作为 A 的降级回退路径（A 的模块七原型工作与 C 完全共用）。

**等用户确认一套后再进入 Phase 1；不三套一起写。**

> 用户已确认 **方向 A（晨刊）**。以下为实施记录。

---

## 8. Phase 1 实施记录（已完成，2026-10-31）

后截图：`contest/phase1-after/`（双主题桌面 + 真 390 移动）。

### 改动清单
- **移动导航**：`hub/index.html` 新增底部 tab bar（首页/决策/时间线/搜索/模块）+ 全屏抽屉（8 路由 + 主题三段）；`shell.css` 新增 tabbar/drawer 样式；`shell.js` openDrawer/closeDrawer（强制 reflow，不依赖 rAF）、Esc 关闭、路由切换自动关。
- **模块全屏模式**：≤980 且路由为三模块时隐藏页头/页脚/tabbar，module-bar 变 44px 吸顶返回条（含 ☰ 菜单按钮），iframe `calc(100dvh - 44px)`，**不做自动高度**。
- **主题桥**：外壳新增浅/深/随系统（`hub_theme_v1` + head boot 防 FOUC + `?theme=` 覆盖供确定性截图）；`shell.css` 深色整页翻墨 token；postMessage 双向（`hub-theme` / `hub-theme-changed`，校验 origin）；三模块暴露 `window.HubTheme` 并在 setTheme 内回传；mountFrame 以 `hubtheme=` 参数让模块首绘即同色。
- **光标桥**：新增 `hub/shared/hub-bridge.js`（模块内 pointermove 经 rAF 节流回传坐标，外壳加 iframe 偏移驱动彗尾；进入模块隐藏原生光标）；删除三模块各自注入的 560×560 指针光晕 div（减一个常驻 rAF 与 ambient 噪声）。
- **搜索懒加载**：`index.html` 移除首屏 `search-index.js`；`ensureSearchIndex()` 缓存 Promise 动态注入；加载态/失败态占位；`#searchResults` aria-live。
- **骨架+淡入**：mountFrame 加 `.frame-skel`（等尺寸灰条、无 shimmer）与 iframe `.ready` 淡入；`?shot=1` 直接终态。
- **根因修复**：考研/考公 `index.html` **补 viewport meta**（真机此前用 980px 布局视口挤缩桌面版）；皮肤侧栏宽度改为仅 ≥981 锁定（不再 !important 压模块断点）；皮肤补考公 ≤980 移动布局（顶栏横排导航/全宽内容/KPI 换行/表格横滚）与考研 ≤900 横排导航（修 `.tabs{flex-wrap:wrap}` 与 `.tab{width:100%}` 导致的竖排）；实习 `.modal` 全屏容器不再被刷不透明（按 data-module 区分面板/容器）；考研 head 补防 FOUC 脚本。
- **a11y**：skip link、全局 `:focus-visible`、搜索/时间线 aria-live、`--muted` 与新增 `--brass-text`（铜金文字加深到 AA）、模块 <11px 文字抬到 11px。
- **泄漏**：`routeCleanups` 机制，initStory/renderTimeline 的 scroll 监听在路由切换时移除；ambient 动效离屏暂停（IntersectionObserver）。

### 回归结果（真实浏览器 + CDP 真 390）
- 8 路由可打开/刷新/前进后退；全程 **0 console error**。
- 首页不加载 HUB_SEARCH；进搜索才注入 17,819 条并命中「北大」11 条；点击结果 `#/kaoyan?focus=pkd` 且 hubtheme 参数共存。
- 主题下行（外壳→模块：data-theme/localStorage/开关高亮三者同步）与上行（模块→外壳）均验证。
- 考研详情开/关、对比浮条、考公详情开/关、实习详情（容器透明/面板正常/可滚动）均正常；弹窗仍在固定视口内。
- 路径 `?a=` 还原结果卡+分数环；时间线 36→考研 8 筛选正常。
- 真 390：外壳 tab bar 可见；考研/考公顶部横排导航 + 全宽内容；inspect 无 overflow / sidebar-phone FAIL。
- 深色：外壳与模块同色整页翻墨（`after-dark-kaoyan.png`）。

### 已知风险 / 遗留
- **光标连续性需在可见浏览器复核**：in-app 浏览器处于 hidden 时 rAF 被节流，无法在此环境目视彗尾；桥接链路已按坐标回传实现并隐藏模块原生光标，逻辑经代码与消息路径验证，待真机/可见窗口确认。
- 考研/考公移动顶部块仍约 200px（品牌+导航+主题段），Phase 4 压缩。
- 模块内 emoji / <11px 残留 / 无 h1 / 数字左对齐 / 硬编码 #bf3125 → Phase 4。
- 衬线真正加载（自托管子集 woff2）→ Phase 5。
- 外壳 `few-pictures` / `name-only-title` / 版式同质 → Phase 3（方向 A）。

---

## 9. Phase 2 实施记录（已完成，2026-10-31）

- **vendor**：`hub/vendor/gsap.min.js` + `ScrollTrigger.min.js`，**GSAP 3.15.0**（npm pack 解出，非 CDN），`defer` 加载；`?motion=legacy` 回滚手写实现。
- **motion token**：`MOTION = { micro:.16, enter:.45, reveal:.7, stagger:.06, easeOut:'power3.out', easeInOut:'power3.inOut' }`；`gsap.defaults(.5/power2.out)`；插件注册一次。
- **context 生命周期**：每路由一个 `gsap.context`（`beginMotion` 累加、`render()` 时 `endMotion→revert`）。验证：home `ScrollTrigger.getAll()=1` → 切走 `0` → 切回 `1`，无累积。
- **接管项**：hero 分字+lead/CTA 入场 timeline；路由幕布改 GSAP timeline（保留连点 kill 保护）；story 改 ScrollTrigger（替手写 scroll 监听）；countUp 改 gsap snap（保留 1600ms 兜底与 shot 直落）；结果环改 gsap 动画 `--p`（shot/reduced 直落）；搜索结果首屏 stagger（仅前 12 条）。
- **降级**：`gsap-motion` class 仅在真正接管时加（shot/reduced 不关 CSS 动画，避免标题隐形）；`html.gsap-motion` 下关掉对应 CSS 动画防双重驱动。
- **兜底**：转场 800ms 内未 render 则强制 render+收幕布（切后台 rAF 停摆/异常时内容仍出现）。
- **验证**：legacy（无 gsap class、CSS 分字、手写 story）与 shot（no-anim、不拆字、reveal=1、ST=0）两条路径正确；0 console error。
- **遗留**：60fps 与入场目视需可见浏览器复核（in-app hidden 时 rAF 节流）。

---

## 10. Phase 3 实施记录（方向 A 外壳重构，已完成，2026-10-31）

后截图：`contest/phase3-after/`。真实界面碎片：`hub/assets/ui/ui-{kaoyan,gongkao,intern,search}.png`（产品自身 UI 截图，`data-ui` 包裹、懒加载、带宽高防 CLS）。

- **首页=头版**：hero 增加 ≥18px _plain 说明行「考研 · 考公 · 实习，一站式信息助手」（修 `name-only-title`）；删除 bento 四同款卡 / actions 平铺 / 300vh story / steps 三同款卡；改为 头版网格（lead story=本周最紧急窗口 + 去处理 CTA + 其余窗口细线列表｜真实考研界面图｜四格数据速览竖栏）→ 三轨对照表（当前窗口动态 + 4 行编辑式事实｜考公界面图）→ 实习 band（界面图 + 文案）→ 三步（真实搜索界面图 + 真 `<ol>`）→ 报尾数据口径卡。首页现有 4 张真实图片（修 `few-pictures`），相邻 section 版式互不相同。
- **时间线=泳道甘特**：横轴月份、纵轴三轨；区间=条块、单日=菱形里程碑；官方=实线青绿、推算=虚线铜金、当前窗口=铜金填充+微光；**今天=铜金竖线**（结构级区分，不再靠小标签）；同轨重叠自动分行堆叠；图例说明口径；泳道/清单双视图（移动默认清单，保留原列表作无障碍替代）；筛选 chips 作用于两视图。签名动效：进入视口时条块 scaleX 展开 + 今天线 scaleY 划下（ScrollTrigger once）。
- **路径=单题聚焦**：一次一题（大题号 01/10 + 维度 kicker + 衬线题干 + 选项行 + 上一题/下一题），答完自动跳题、点轨可回跳；答完十题结果整版揭晓并滚动到位；`?a=` 还原与打印报告逻辑不变。修「结果埋底 4 屏」。
- **搜索**：别名命中高亮修复（`markHit(text,q,alias)`，北大→北京大学 现在有 `<mark>`）；↑↓/Enter 键盘导航 + `.active` 态；最近搜索 chips（`hub_recent_v1`，点击结果/Enter 记录）；空态提示键盘用法。
- **验证**：甘特 36 块/3 轨/今天线/筛选→单轨/清单 36→22；单题答一题跳下一题（1/10→Q02）；`?a=` 还原 10/10+结果+环 79；搜索 mark/键盘/最近/焦点直达全通过；0 console error。
- **遗留**：about 架构图仍为三圆角盒（方向 A 允许保留编辑式长文，图信息量提升放 Phase 5）；旧 bento/actions/story/steps 的 CSS 待 Phase 5 清理。

---

## 11. Phase 4 实施记录（模块七原型，已完成首轮，2026-10-31）

CSS-first、按 `data-module` 作用域，**未改任何业务逻辑/事件委托**。

- **详情原型**：考研 `.kv` / 考公 `.detail-grid` 统一 112px label 列 + 14px 值列、1.7 行高、分组标题与年份块/出处链接层级；移动端转单列。
- **对比原型**：tabular 数字、表头衬线层级、身份列加宽不先截断。
- **表单原型**：label 在上 12.5/500、input 40px/radius8、字段间 16px。
- **空态原型**：考研/考公/实习空态统一「保留框 + 一句说明」虚线框；实习看板空列同。
- **实习**：看板/渠道/攻略/统计卡纳入统一卡片语言（去静止重阴影）、时间轴条品牌色；**tab 去 emoji**（📋✅📨📝 移除，页签切换回归通过）。
- **考公**：硬编码 `#bf3125` 图表热色 → 品牌铜金（含深色变体）；`.issue-box` 硬编码浅粉 → token；`.ov-lab` 10.5/9px → 12/11px。
- **h1**：考研 `logo-title`、考公 `brand-name` 提升为 `<h1>` 18px（修 app `no-title`）；实习报头 h1 降档 28px、KPI 24px（app-screens §9.1）。
- **验证**：考研详情 kv 14px/112px+1fr、实习 kanban radius14/shadow none、考公 hot 色 = #A9762F 且无渐变、三模块页签/详情开闭回归通过、0 console error。
- **已知限制**：表格逐列数字右对齐需 app.js 加列 class（DOM 改动，留待后续单独回归）；考研/实习无模块内骨架（外壳骨架已覆盖 iframe 加载期）；功能性glyph（★✕⚠）保留为 UI 图标，非装饰 emoji。

---

## 12. Phase 5 实施记录（收口，2026-10-31）

- **字体真正落地**：`@fontsource/noto-serif-sc` 5.3.1 → `hub/vendor/fonts/noto-serif-sc/`（600/700 两档，unicode-range 编号子集，浏览器只下载用到的子集；已去掉 `.woff` 回退与全量 CJK 文件，磁盘 6.9MB、首屏只取数个子集）。外壳与三模块均接入；实测 `document.fonts` 已加载 `Noto Serif SC`，Windows 不再回退 SimSun。
- **收口截图矩阵**：`contest/final-shots/` 共 **33 张** = 8 路由 × {1440×900, 390×844} × {浅色, 深色} + `reduced-motion-home.png`（用 CDP `Emulation.setDeviceMetricsOverride` 真 390 模拟，非 `--window-size`）。
- **reduced-motion**：强制 `prefers-reduced-motion` 下首页内容完整、不拆字、无入场、无空白。
- **仓库状态**：未提交、未发布。改动 11 个已跟踪文件（`hub/index.html`、`shell.js/css`、`hub-module.css`、三个模块的 html + 两处 app.js 主题导出）；新增 `hub/shared/hub-bridge.js`、`hub/vendor/`、`hub/assets/ui/`、`docs/`、`contest/{audit-baseline,phase1-after,phase3-after,final-shots}`。**`contest/tianchi-post.md` 的改动是接手前就存在的，未由本次改动产生，也未编辑。**
- **仍待用户确认/验收**：
  1. **彗尾光标与 GSAP 入场/转场的目视验收**：自动化环境（in-app hidden）rAF 被节流，无法目视；桥接与 context/revert 已逻辑验证，请在可见浏览器点三个模块确认。
  2. **发布**：沿用 actionId 发布到 Qoder Sites 属共享状态操作，待用户确认。
  3. **GitHub**：仅在用户明确要求时提交/推送。
- **明确遗留（未做，避免超范围）**：旧 bento/actions/story/steps 死 CSS 未删；`hub/shared/tokens.css` 死文件未删（已不加载）；表格逐列数字右对齐需 app.js 列 class；about 架构图仍为三圆角盒；实习模块内统计口径 253 与外壳 hub-stats 254 的差异**未改数据**，需用户定夺以哪个为准。

### 用户决策（2026-10-31）
- **先本地验收，验收通过后再发布**到 Qoder Sites（沿用 actionId，不新建站点）。
- **暂不提交 git / 不 push**；工作区改动保留，由用户后续整理。

---

## 13. Phase 6 用户反馈修订（2026-10-31）

用户反馈两点：① 时间线小框文字截断；②「和做之前没有太大的区别」。

### 6.1 时间线改为「月份 × 三轨」月历矩阵
- 甘特条按真实时长绘制，1–3 天节点只有十几像素，中文必然截断；**不把条硬撑宽**（会篡改时长）。
- 改为整月一行、三轨一列的月历矩阵：节点为**完整文字条目**（标题 + 日期范围 + 进行中），永不截断；官方=左实线、推算=左虚线、当前窗口=铜金底；月份大号衬线数字在左，含「今天」徽章与铜金左边线；空月显示「本月无节点」。桌面默认月历，移动/紧凑切「清单」。

### 6.2 表面加码（用户选 A 深墨节奏 + B 大字号编辑版）
- **深墨节奏**：首页「头版/封面故事」改为深墨整幅带，并与 hero 之间不留纸缝，墨色连成一整幅封面；时间线、搜索第一屏改为**深墨刊头带**（大标题 + 3 个真实读数：进行中 / 7 天内开始 / 本月节点）。
- **大字号编辑版**：正文 15→16px、行高 1.75；page-title clamp(42–76px)、section h2 clamp(30–50px)、页宽不变；hero 说明行 20–28px、lead 17.5px；section 间距 96→132px（移动 84px）；卡片去 1px 描边改为色调分层（表格/输入仍保留线）。
- 验证：外壳无横向溢出；搜索刊头为墨底、标题 52px@718；0 console error；截图见 `contest/final-shots/{home-cover3,timeline-ink,search-ink,timeline-matrix2}.png`。
- **仍待目视**：光标连续性、GSAP 手感、真机 390。

---

## 14. Phase 7 用户反馈修订 + 数据核查（2026-10-31）

### 14.1 文案
- 实习 band 标题「截止密的时候，顺序比努力重要」读不通 → 改为「**截止日期撞在一起时，先投哪家比投得多更重要**」；正文改为「按倒计时排好投递顺序，把最想去的放在最前面」。

### 14.2 色调统一
- **首页整页墨底**：延续前两屏形式，后续 section（对照表、实习 band、三步、数据卡、页脚）全部改为墨底 + 浅色文字；数据密集块用 `#16211E` 深面而非白卡；表格线改浅色；图片描边改浅色。首页不再出现「墨—纸—墨」夹层。
- **时间线 / 搜索刊头**：去掉纯黑，改为「铜金右上光晕 + 青绿左上光晕 + 深墨纵向渐变」三层，底边一道铜金细线，深色模式有独立配色。
- **关于页报头**：换成松绿（#22463E→#10231F）+ 铜金光晕的不同色相，与下方暖纸形成对比、降低疲劳；正文仍为纸面。

### 14.3 数据核查（只读取证，未造数）
脚本：`…/2026-10-31/dd86c6ff/audit/data-audit.js`（按 `intern/js/app.js` 的 `parseWindow/companyStatus` 原样复算）。
- **考研**：211 所 ✓；2027 简章核对 **47** ✓（逐校统计 `z.e` 含「2027」官方拟招文本的院校 = 47，与 `hub-stats.ky2027` 一致）。`y` 参考年份分布 2026:209 / 2025:2。
- **考公**：数据文件 `positions` 合计 **16,544**（国考 2,404+2,383、浙江 4,004、浙江选调 621、山东 5,904、上海 1,203 等），与搜索索引一致；站点文案为 **16,543**。**差异未擅改**——疑似扣除 1 条「机关汇总（非具体职位）」，需确定口径。
- **实习**：按今天（10-31）重算 **open=253 / rolling=787 / closing7=8**；旧 `hub-stats` 为 10-30 的 254/786/9，属自然过期。**已回写 `hub/shared/hub-stats.js`**（`generatedAt=2026-10-31`，并在注释里写明算法与考公口径说明）。首页、模块条、band 文案随之更新；`254` 已消失。
- **国考过审 3,025,502（2026-10-24）**：属官方快照，且报名（10-24）/资格审查（10-26）均已结束，可能已有最终值；**无官方来源不改**，建议人工核对后更新 `gkStatDate/gkPassed`。
- **时间线**：36 条节点日期本身未变；当前窗口/剩余天数由日期实时计算，无静态过期文案。

### 14.4 风险提示
- 首页整页墨底是对「浅色纸感为主」旧约定的有意偏离（按本次用户要求统一为前两屏形式）；内页与三模块仍为纸面，形成「封面/内页」关系。若觉得太重，可退回「墨底封面 + 纸面内页」并用刊头式渐变过渡消除割裂。

---

## 15. Phase 8 视觉与动效修订（2026-10-31，用户二次反馈）

- **关于页标题**：`关于本站` 放大到 clamp(56–104px)、近白刻度、铜金下划线 + 轻投影，松绿报头上足够醒目。
- **路径页报头**：新增暖沙渐变色带（#FCF3DD→#EAD6AD）+ 铜金底线，与关于/时间线同构但更明快，不再单调白底。
- **首页明艳化**（保留第一屏 hero 不动）：头版改暖沙整幅带（顶部 3px 青绿规线）、三轨对照改冷青全幅带、实习 band 改薄荷全幅带；后续 section 回到纸面；去掉了上一版的整页墨底与「墨—纸—墨」夹层。
- **页脚字**：描边从 .12 提到 .36（首页 .44），「前程指北」大字在纸面上可辨。
- **流星效果**：路径 / 时间线 / 搜索 / 关于四条路由叠加 `.meteor-layer`，3 条低频流星（15/19/23s 周期，青绿/铜金），`pointer-events:none`；`prefers-reduced-motion` 与 `?shot=1` 下不渲染；首页不出现。
- **翻书转场**：替换原「从上到下拉黑」幕布。整块 `#module-root` 绕**左侧书脊**做 3D 翻转：`rotateY 0→-90°`（0.30s，ease power2.in，带 y:-10 / rotation:-1.2 的向上抬升）→ 边沿处换页 → `88°→0`（0.36s，power3.out），配 `#flipShade` 对角光影峰值 0.62，总时长约 0.7s；兜底 900ms 强制渲染并复位；`?motion=legacy/reduced-motion/shot` 下直接换页。
- **数据复核（用户要求，考研/考公/实习）**：结果与上一轮一致——考研 211 所、2027 简章 47 ✓（`z.e` 含 2027 官方拟招文本的院校数）；实习 open 253 / rolling 787 / closing7 8（已回写 hub-stats，`generatedAt=2026-10-31`）；考公数据行 16,544 vs 文案 16,543 仍待定口径；国考过审 3,025,502 仍为 2026-10-24 官方快照，报名/审查已结束，建议人工核对最终通报。
- 另：实习官网链接实测时间 `verifiedAt=2026-10-24`，已 7 天未巡检；仓内无 `tools/ci-check-links.js`，需原构建环境重跑。
- 验证：0 console error；无横向溢出；`?shot=1` 下流星/翻书正确关闭。**翻书与流星的观感需在可见浏览器目视确认**（自动化环境 rAF 被节流）。

---

## 16. Phase 9 质感修订（2026-10-31，用户三次反馈）

- **页脚刊名**：从「单线描边」改为**横向青绿→铜金渐变填充**（`background-clip:text`）+ 1.5px 描边 + **6px 铜金错位投影**（模拟印刷套色偏移）+ 轻微纸面投影；不再是空心细线骨架。
- **首页色块衔接**：三条全幅带改为**纵向渐变，边界同色相接**——hero 墨色 `#071010` → 暖沙 `#FCF1D8/#F7E7C4` → 冷青 `#E9F6F3` → 薄荷 `#E6F5E5` → 纸色 `#F7F4EC`；去掉头版顶部 3px 硬线，交界不再生硬。
- **流星加密**：3 条 → **6 条**，周期 10–15s（原 15–23s），延迟 0.6/2.6/4.8/7/9.2/11.4s，长度 220px；青绿与铜金交替，仍为 `pointer-events:none`，reduced-motion / `?shot=1` 关闭。
- **翻书放慢并加纸感**：掀出 0.30s→**0.48s**（`rotateY 0→-84`，`rotateX 2°`、`y:-18`、`rotation:-1.4°`），换页后从 `-14°/y:6` 用 **0.42s** 摊平，总时长约 **1.05s**；新增**书脊铜金细线**（`.flipping::before`）、**纸面明暗渐变**（`.flipping::after`，暗部在书脊、右侧反光）与**整块投影**；`#flipShade` 光影峰值 0.68；兜底 900→1300ms。不再翻到 ±90° 全消失，避免「页面凭空消失」的空帧。
- 验证：路径/搜索各 6 条流星、转场锁翻页类、结束后复位、0 console error。翻书手感仍需可见浏览器确认。

---

## 17. Phase 10 掀角版转场 + 口径落定（2026-10-31）

- **回退第一处渐变**：hero 与头版之间改回干净硬切（暖沙起始 + 3px 青绿规线），不再溶黑；头版底部仍渐入冷青对照带，其余区块渐变保留。
- **掀角转场（v3）**：弃用 3D 内容翻转，改为 `#peel` 纸面层——带折痕高光、纸纹与 `drop-shadow` 投影的纸，从右下角三角形展开盖满，盖满时换页，再向左侧收拢露出新页；`clip-path` 四点插值，0.46s + 0.54s ≈ 1.0s，兜底 1.25s；`?shot=1`/reduced-motion 关闭。
  - 真实「照片级掀角」需快照当前页：html2canvas 约 +180KB、DOM→canvas 100–400ms 卡顿、单次 5–15MB 临时内存，且 **html2canvas 不绘制 iframe 内容** → 三个模块页会白页；故采用无快照的纸面扫页方案（合成层动画，近零成本）。
- **考公口径落定 16,543**：站点与 README 已统一（搜索索引 g=16,544 为数据条目数，两者不混排）。`contest/tianchi-post.md` 与 `xiaohongshu-note.md` 仍写 16544，属已发布材料，按 C8 待用户确认后再改。
- **国考过审更新**：按国家公务员局公告，2027 年度资格审查 2026-10-26 18:00 结束，**过审 345 万人**、竞争比约 97:1；`gkStatDate=2026-10-26`、`gkPassed=3450000`（原 3,025,502 为 10-24 中间数）。另加 `gkSnapshot=2026-10-28` 供模块顶栏显示真实岗位快照日。
- 验证：首页显示 3,450,000 / 2026-10-26、16,543 保留、跳转后 `clip-path` 复位、无横向溢出、0 console error。

### 补充（同日）：翻页纸按落点页取色
- `PEEL_THEME` 为 8 条路由各配一张纸的颜色：home 墨蓝、path 暖沙、timeline 深青、search 墨青偏铜、about 松绿、kaoyan 薄荷、gongkao 沙金、intern 浅绿；深色落点同时切 `.peel--ink`（纸纹与折痕改浅色、投影加重）。导航开始时同步写入 `--peel-bg`，随翻页动画展开。
- 已验证 7 条路由的取值与 `peel--ink` 切换正确，0 console error。