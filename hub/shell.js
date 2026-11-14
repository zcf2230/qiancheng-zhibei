(function () {
  'use strict';
  window.HubModules = window.HubModules || {};
  var ROUTES = ['home', 'timeline', 'path', 'search', 'dashboard', 'about', 'kaoyan', 'gongkao', 'intern'];
  var FRAME_SRC = {
    kaoyan: 'modules/kaoyan/renderer/index.html',
    gongkao: 'modules/gongkao/index.html',
    intern: 'modules/intern/index.html'
  };
  var MODULE_META = {
    kaoyan: { name: '考研择校', color: '#176b75' },
    gongkao: { name: '考公岗位', color: '#5f7a2e' },
    intern: { name: '实习网申', color: '#2b6cb0' }
  };
  /* 发布版本号：必须与 index.html 里 shell.js/shell.css 的 ?v= 保持一致。
   * 一起 bump 后，新 Service Worker 安装即清旧缓存（见 sw.js）。 */
  var HUB_BUILD = '20261114d';
  var frame = null;
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  var shotMode = /[?&]shot=1/.test(location.search);
  if (shotMode) document.documentElement.classList.add('no-anim');
  if (isTouch) document.body.classList.add('touch');

  /* ---------------- 主题（外壳浅/深/随系统 + iframe 桥） ---------------- */
  var THEME_KEY = 'hub_theme_v1';
  var themeOverride = (location.search.match(/[?&]theme=(light|dark|auto)/) || [])[1] || null;
  function themePref() {
    if (themeOverride) return themeOverride;
    try { return localStorage.getItem(THEME_KEY) || 'auto'; } catch (e) { return 'auto'; }
  }
  function themeResolved(p) {
    return (p === 'dark' || (p === 'auto' && window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches)) ? 'dark' : 'light';
  }
  var applyingFromModule = false;
  function applyShellTheme(p, broadcast) {
    var eff = themeResolved(p);
    document.documentElement.setAttribute('data-theme', eff);
    document.documentElement.style.colorScheme = eff;
    document.querySelectorAll('.hub-drawer-theme [data-t]').forEach(function (b) { b.classList.toggle('on', b.dataset.t === p); });
    var btn = document.getElementById('hubThemeBtn');
    if (btn) btn.textContent = p === 'auto' ? '◐' : (eff === 'dark' ? '●' : '○');
    if (broadcast && frame && frame.contentWindow) {
      try { frame.contentWindow.postMessage({ type: 'hub-theme', theme: p }, location.origin); } catch (e) {}
    }
  }
  function setShellTheme(p, broadcast) {
    themeOverride = null;
    try { localStorage.setItem(THEME_KEY, p); } catch (e) {}
    applyShellTheme(p, broadcast !== false);
  }

  /* ---------------- 光标桥状态 / 路由清理 ---------------- */
  var cursorBridge = { active: false, x: 0, y: 0 };
  var cursorEnabled = false;
  var routeCleanups = [];
  function onRouteCleanup(fn) { routeCleanups.push(fn); }
  function flushRouteCleanups() {
    while (routeCleanups.length) { try { routeCleanups.pop()(); } catch (e) {} }
  }

  /* ---------------- 动效系统（GSAP 3.15.0 本地 vendor；?motion=legacy 回滚） ----------------
   * 分级：L1 微交互 .16 / L2 入场 .45 / L3 叙事 reveal .7；只动 transform/opacity/CSS 变量。
   * 每个路由一个 gsap.context，render 时 revert，避免旧 tween 操作已卸载 DOM。 */
  var legacyMotion = /[?&]motion=legacy/.test(location.search);
  var motionEnabled = false;
  var motionCtx = null;
  var MOTION = { micro: .16, enter: .45, reveal: .7, stagger: .06, easeOut: 'power3.out', easeInOut: 'power3.inOut' };
  /* 翻页纸的取色：用「要翻到的那一页」的主色调，而不是固定淡黄 */
  var PEEL_THEME = {
    home: { bg: 'linear-gradient(135deg, #0B1413 0%, #14312E 100%)', ink: true },
    path: { bg: 'linear-gradient(135deg, #FCF3DD 0%, #EAD6AD 100%)', ink: false },
    timeline: { bg: 'linear-gradient(135deg, #14312E 0%, #0A1513 100%)', ink: true },
    search: { bg: 'linear-gradient(135deg, #10333A 0%, #0A1513 68%, #2A2114 100%)', ink: true },
    about: { bg: 'linear-gradient(135deg, #22463E 0%, #10231F 100%)', ink: true },
    kaoyan: { bg: 'linear-gradient(135deg, #E9F6F3 0%, #CFE7E2 100%)', ink: false },
    gongkao: { bg: 'linear-gradient(135deg, #FBF1D8 0%, #EFDAAE 100%)', ink: false },
    intern: { bg: 'linear-gradient(135deg, #E6F5E5 0%, #D6EFD9 100%)', ink: false }
  };
  function motionOn() { return motionEnabled && !reduceMotion && !shotMode; }
  function beginMotion(el, setup) {
    if (!motionOn() || !window.gsap) return;
    if (!motionCtx) motionCtx = gsap.context(function () {}, el);
    motionCtx.add(setup);
  }
  function endMotion() {
    if (motionCtx) { try { motionCtx.revert(); } catch (e) {} motionCtx = null; }
  }

  function rootEl() { return document.getElementById('module-root'); }
  /* 内容层与 iframe 层分开。切走模块时只把 iframe 层隐藏、绝不从 DOM 移除——
   * 移除 iframe 会销毁浏览上下文，再进来就得重新下载/解析/渲染一遍（实习那 1.4MB 数据脚本尤其贵）。
   * 隐藏保留后，切回来是瞬时的，模块内的筛选、滚动位置、已加载数据都还在。 */
  var _layers = null;
  function layers() {
    if (_layers) return _layers;
    var root = rootEl();
    var route = document.createElement('div');
    route.className = 'route-layer';
    var fr = document.createElement('div');
    fr.className = 'frame-layer';
    fr.hidden = true;
    root.appendChild(route);
    root.appendChild(fr);
    _layers = { route: route, frame: fr };
    return _layers;
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ---------------- 光标 / 导航 / 揭示 / 倾斜 ---------------- */
  function initCursor() {
    if (isTouch || reduceMotion) return;
    var q = (location.search.match(/[?&]cursor=([a-z]+)/) || [])[1];
    if (q) { try { localStorage.setItem('hub_cursor_v1', q); } catch (e) {} }
    var mode = q || localStorage.getItem('hub_cursor_v1') || 'comet';
    if (['needle', 'comet', 'lens', 'minimal'].indexOf(mode) < 0) mode = 'needle';
    document.documentElement.setAttribute('data-cursor', mode);
    if (mode !== 'minimal') document.documentElement.classList.add('custom-cursor');
    cursorEnabled = (mode !== 'minimal');
    var dot = document.getElementById('cursorDot');
    var ring = document.getElementById('cursorRing');
    if (!dot || !ring) return;
    var needle = document.createElement('span');
    needle.className = 'cursor-needle';
    ring.appendChild(needle);
    var trail = document.createElement('div');
    trail.className = 'cursor-trail';
    var dots = [];
    for (var i = 0; i < 7; i++) {
      var s = document.createElement('i');
      trail.appendChild(s);
      dots.push({ el: s, x: -100, y: -100, k: 0.34 - i * 0.04 });
    }
    document.body.appendChild(trail);
    var tx = window.innerWidth / 2, ty = window.innerHeight / 2, rx = tx, ry = ty, angle = 0, lx = tx, ly = ty;
    window.addEventListener('pointermove', function (e) {
      cursorBridge.active = false;
      tx = e.clientX; ty = e.clientY;
      var dx = tx - lx, dy = ty - ly;
      if (dx * dx + dy * dy > 4) { angle = Math.atan2(dy, dx) * 180 / Math.PI + 90; lx = tx; ly = ty; }
    }, { passive: true });
    (function loop() {
      if (cursorBridge.active) { tx = cursorBridge.x; ty = cursorBridge.y; }
      rx += (tx - rx) * 0.2; ry += (ty - ry) * 0.2;
      ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px) translate(-50%,-50%) rotate(' + angle.toFixed(1) + 'deg)';
      dot.style.transform = 'translate(' + tx + 'px,' + ty + 'px) translate(-50%,-50%)';
      var px = tx, py = ty;
      for (var j = 0; j < dots.length; j++) {
        var d = dots[j];
        d.x += (px - d.x) * d.k; d.y += (py - d.y) * d.k;
        d.el.style.transform = 'translate(' + d.x + 'px,' + d.y + 'px) translate(-50%,-50%)';
        px = d.x; py = d.y;
      }
      requestAnimationFrame(loop);
    })();
    var hoverSel = 'a, button, input, select, textarea, .q-opt, .chip, .tl-row, .action, .bento-card';
    document.addEventListener('pointerover', function (e) { if (e.target.closest(hoverSel)) ring.classList.add('on'); });
    document.addEventListener('pointerout', function (e) { if (e.target.closest(hoverSel)) ring.classList.remove('on'); });
  }

  function initHeader() {
    var header = document.getElementById('hubHeader');
    if (!header) return;
    var onScroll = function () { header.classList.toggle('scrolled', window.scrollY > 10); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  var revealObs = ('IntersectionObserver' in window) ? new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); revealObs.unobserve(en.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }) : null;

  function bindReveal(scope) {
    if (!revealObs || reduceMotion) return;
    (scope || document).querySelectorAll('.reveal:not(.in)').forEach(function (el) { revealObs.observe(el); });
  }

  function initTilt() {
    if (isTouch || reduceMotion) return;
    document.addEventListener('pointermove', function (e) {
      var card = e.target.closest('.bento-card');
      if (!card) return;
      var r = card.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width;
      var py = (e.clientY - r.top) / r.height;
      card.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
      card.style.setProperty('--my', (py * 100).toFixed(1) + '%');
      card.style.transform = 'perspective(900px) rotateX(' + ((py - .5) * -5).toFixed(2) + 'deg) rotateY(' + ((px - .5) * 6).toFixed(2) + 'deg) translateY(-2px)';
    }, { passive: true });
    document.addEventListener('pointerout', function (e) {
      var card = e.target.closest('.bento-card');
      if (card) card.style.transform = '';
    });
  }

  function countUp(scope) {
    scope.querySelectorAll('[data-n]').forEach(function (b) {
      var target = parseInt(b.getAttribute('data-n'), 10);
      if (!isFinite(target)) return;
      var fmt = function (v) { return v.toLocaleString('en-US'); };
      b.textContent = fmt(target);
      setTimeout(function () { b.textContent = fmt(target); }, 1600);
      if (shotMode || reduceMotion || document.visibilityState !== 'visible') return;
      if (motionOn()) {
        var obj = { v: 0 };
        gsap.to(obj, { v: target, duration: 1.2, ease: 'power3.out', snap: { v: 1 }, onUpdate: function () { b.textContent = fmt(Math.round(obj.v)); } });
        return;
      }
      var t0 = null;
      function step(ts) {
        if (!t0) t0 = ts;
        var p = Math.min(1, (ts - t0) / 1200);
        b.textContent = fmt(Math.round(target * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }

  /* ---------------- 首页 ---------------- */
  function lights(n) {
    var pos = [[8,62],[16,38],[24,74],[33,52],[41,30],[48,66],[55,44],[62,72],[69,36],[76,58],[83,46],[90,70],[12,84],[88,26],[27,20],[59,88]];
    var out = '';
    for (var i = 0; i < n; i++) {
      var p2 = pos[i % pos.length];
      var d = 7 + (i % 5) * 2;
      var dl = ((i % 7) * 1.3).toFixed(1);
      var s2 = 2 + (i % 3);
      out += '<i style="--x:' + p2[0] + '%;--y:' + p2[1] + '%;--d:' + d + 's;--dl:' + dl + 's;--s:' + s2 + 'px"></i>';
    }
    return out;
  }
  function marqueeItems() {
    var st = window.HUB_STATS || {};
    var now = new Date();
    var out = [];
    if (st.internOpen) out.push(['实习网申', st.internOpen + ' 家正在开放申请']);
    if (st.internClosing7) out.push(['本周截止', st.internClosing7 + ' 家实习窗口将关闭']);
    (window.HUB_TIMELINE || []).slice(0, 6).forEach(function (t) {
      if (!t.start || !t.end) return;
      var s = new Date(t.start + 'T00:00:00');
      var e = new Date(t.end + 'T23:59:59');
      if (now >= s && now <= e) out.push([MODULE_META[t.module] ? MODULE_META[t.module].name : t.exam, t.stage + ' · 剩 ' + Math.ceil((e - now) / 86400000) + ' 天']);
    });
    if (st.gkStatDate) out.push(['考公岗位', '国考过审 ' + (st.gkPassed || 0).toLocaleString('en-US') + ' 人（' + st.gkStatDate + '）']);
    if (st.ky2027) out.push(['考研择校', '2027 简章覆盖 ' + st.ky2027 + '/' + st.kyTotal + ' 所']);
    out.push(['全局搜索', '87,104 条索引覆盖三条路']);
    return out;
  }

  function actionItems() {
    var st = window.HUB_STATS || {};
    var now = new Date();
    var items = [];
    (window.HUB_TIMELINE || []).forEach(function (t) {
      if (!t.start || !t.end) return;
      var s = new Date(t.start + 'T00:00:00');
      var e = new Date(t.end + 'T23:59:59');
      if (now >= s && now <= e && (e - now) / 86400000 <= 14) {
        items.push({ m: t.module, txt: t.stage + '进入收尾', meta: '剩 ' + Math.ceil((e - now) / 86400000) + ' 天', href: '#/' + t.module, urgent: true });
      } else if (now < s && (s - now) / 86400000 <= 7) {
        items.push({ m: t.module, txt: t.stage + '即将开始', meta: Math.ceil((s - now) / 86400000) + ' 天后', href: '#/' + t.module, urgent: false });
      }
    });
    if (st.internOpen) {
      items.push({ m: 'intern', txt: st.internOpen + ' 家机构实习正在开放网申（另有 ' + st.internRolling + ' 家全年滚动）', meta: st.internClosing7 ? st.internClosing7 + ' 家本周截止' : '滚动更新', href: '#/intern', urgent: !!st.internClosing7 });
    }
    if (st.gkStatDate) {
      items.push({ m: 'gongkao', txt: '国考报名过审人数已更新至 ' + st.gkStatDate + '：' + (st.gkPassed || 0).toLocaleString('en-US') + ' 人', meta: '竞争比可重算', href: '#/gongkao', urgent: false });
    }
    if (st.ky2027) {
      items.push({ m: 'kaoyan', txt: '2027 简章信息已覆盖 ' + st.ky2027 + '/' + st.kyTotal + ' 所院校（科目 / 学费 / 拟招）', meta: '复试线明年 3 月批量更新', href: '#/kaoyan', urgent: false });
    }
    items.sort(function (a, b) { return (b.urgent ? 1 : 0) - (a.urgent ? 1 : 0); });
    return items.slice(0, 6);
  }

  function renderHome(el) {
    var st = window.HUB_STATS || {};
    var internTotal = st.internTotal || 3523;
    var internOpen = st.internOpen || 0;
    var tlLen = (window.HUB_TIMELINE || []).length || 40;
    var chk = '<svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>';
    el.innerHTML =
      '<section class="hm-hero">' +
        '<div class="hm-wrap hm-hero-inner">' +
          '<div class="hm-pill"><span class="hm-dot"></span>考研 · 考公 · 实习 一站式信息助手</div>' +
          '<h1 class="hm-title">三条路，<span class="hm-a">一个坐标。</span></h1>' +
          '<p class="hm-lead">三条路的时间窗挤在同一个学期。把择校简章、岗位竞争度、网申时间线放进同一个地方，先看清，再选择。</p>' +
          '<div class="hm-cta">' +
            '<a class="btn btn-primary magnet" href="#/path">开始路径决策<span class="arr">→</span></a>' +
            '<button class="btn btn-ghost" type="button" data-scroll="hm-modules">浏览三个模块</button>' +
          '</div>' +
          '<div class="hm-stats">' +
            '<div class="hm-stat"><b data-n="81182">0</b><span>个考公岗位</span></div>' +
            '<div class="hm-stat"><b data-n="' + internTotal + '">0</b><span>家实习机构</span></div>' +
            '<div class="hm-stat"><b data-n="31">0</b><span>个考研大类</span></div>' +
            '<div class="hm-stat"><b data-n="' + tlLen + '">0</b><span>个时间线节点</span></div>' +
          '</div>' +
        '</div>' +
      '</section>' +

      '<section class="hm-sec" id="hm-modules">' +
        '<div class="hm-wrap">' +
          '<div class="hm-head reveal"><div class="hm-eyebrow">三个模块</div><h2 class="hm-h">点击卡片，<span class="hm-a">直接进入模块</span></h2>' +
          '<p class="hm-sub">考研看院校与分数线，考公看岗位与竞争比，实习看机构与时间窗。各自深入，又共享同一套时间线与搜索。</p></div>' +
          '<div class="hm-modules">' +
            '<a class="hm-module reveal d1" href="#/kaoyan" aria-label="进入考研择校模块">' +
              '<span class="hm-badge">31 大类</span>' +
              '<div class="hm-mtop"><span class="hm-ic"><svg viewBox="0 0 24 24"><path d="M12 3L2 8l10 5 10-5-10-5z"/><path d="M6 10v5c0 1.5 3 3 6 3s6-1.5 6-3v-5"/></svg></span><div><h3>考研择校</h3><div class="hm-msub">院校 · 专业 · 分数线</div></div></div>' +
              '<div class="hm-num">211</div><div class="hm-unit">所金融院校 · 覆盖全国</div>' +
              '<ul><li>' + chk + '复试线 / 学费 / 拟招 / 报录比</li><li>' + chk + '填预估分，自动冲稳保分档</li><li>' + chk + '字段完整度透明，缺口直达官方简章</li></ul>' +
              '<span class="hm-enter">进入考研择校<span class="arr">→</span></span>' +
            '</a>' +
            '<a class="hm-module reveal d2" href="#/gongkao" aria-label="进入考公岗位模块">' +
              '<span class="hm-badge">18 类考试</span>' +
              '<div class="hm-mtop"><span class="hm-ic"><svg viewBox="0 0 24 24"><path d="M3 21h18M5 21V8l7-5 7 5v13"/><path d="M9 21v-6h6v6"/></svg></span><div><h3>考公岗位</h3><div class="hm-msub">国考 · 省考 · 选调生</div></div></div>' +
              '<div class="hm-num">81,182</div><div class="hm-unit">个岗位 · 多省逐岗全量</div>' +
              '<ul><li>' + chk + '逐岗竞争比可测算</li><li>' + chk + '学历 / 专业 / 政治面貌多维筛选</li><li>' + chk + '筛选即链接，一键发给同学</li></ul>' +
              '<span class="hm-enter">进入考公岗位<span class="arr">→</span></span>' +
            '</a>' +
            '<a class="hm-module reveal d3" href="#/intern" aria-label="进入实习网申模块">' +
              '<span class="hm-badge">12 学科</span>' +
              '<div class="hm-mtop"><span class="hm-ic"><svg viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg></span><div><h3>实习网申</h3><div class="hm-msub">机构 · 学科 · 倒计时</div></div></div>' +
              '<div class="hm-num">' + internTotal.toLocaleString('en-US') + '</div><div class="hm-unit">家机构 · ' + internOpen.toLocaleString('en-US') + ' 家正在开放</div>' +
              '<ul><li>' + chk + '官网 / 网申链接逐条实测</li><li>' + chk + '按截止倒计时排投递顺序</li><li>' + chk + '覆盖金融 / 理工 / 人文 / 艺术等</li></ul>' +
              '<span class="hm-enter">进入实习网申<span class="arr">→</span></span>' +
            '</a>' +
          '</div>' +
        '</div>' +
      '</section>' +

      '<section class="hm-sec hm-alt">' +
        '<div class="hm-wrap">' +
          '<div class="hm-head reveal"><div class="hm-eyebrow">统一时间线</div><h2 class="hm-h">三条路的时间窗，<span class="hm-a">对齐到同一学期</span></h2>' +
          '<p class="hm-sub">国考报名、考研初试、实习网申往往撞在同几个月。把它们放在一起，一眼看清什么时候该做什么。</p></div>' +
          '<div class="hm-tl">' +
            '<div class="hm-tlcol reveal d1"><div class="hm-tlh"><b>考研</b></div>' +
              '<div class="hm-tli"><span class="hm-when">9月</span><span class="hm-what">预报名<em>研招网填报</em></span></div>' +
              '<div class="hm-tli"><span class="hm-when">10月</span><span class="hm-what">正式报名<em>确认报考信息</em></span></div>' +
              '<div class="hm-tli"><span class="hm-when">12月</span><span class="hm-what">初试<em>全国统考</em></span></div>' +
              '<div class="hm-tli"><span class="hm-when">3—4月</span><span class="hm-what">复试 / 调剂<em>各校陆续进行</em></span></div>' +
            '</div>' +
            '<div class="hm-tlcol reveal d2"><div class="hm-tlh"><b>考公</b></div>' +
              '<div class="hm-tli"><span class="hm-when">10月</span><span class="hm-what">国考报名<em>职位查询与填报</em></span></div>' +
              '<div class="hm-tli"><span class="hm-when">11—12月</span><span class="hm-what">国考笔试<em>行测 + 申论</em></span></div>' +
              '<div class="hm-tli"><span class="hm-when">2—3月</span><span class="hm-what">省考联考<em>多省同日笔试</em></span></div>' +
              '<div class="hm-tli"><span class="hm-when">4月起</span><span class="hm-what">面试 / 体检<em>分批进行</em></span></div>' +
            '</div>' +
            '<div class="hm-tlcol reveal d3"><div class="hm-tlh"><b>实习</b></div>' +
              '<div class="hm-tli"><span class="hm-when">9—11月</span><span class="hm-what">秋招网申<em>应届主战场</em></span></div>' +
              '<div class="hm-tli"><span class="hm-when">全年</span><span class="hm-what">日常实习<em>滚动开放</em></span></div>' +
              '<div class="hm-tli"><span class="hm-when">2—4月</span><span class="hm-what">春招开放<em>补录与暑期</em></span></div>' +
              '<div class="hm-tli"><span class="hm-when">5—8月</span><span class="hm-what">暑期实习<em>转正机会多</em></span></div>' +
            '</div>' +
          '</div>' +
          '<div class="hm-tlnote reveal"><svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>' + tlLen + ' 个节点可一键导出到手机 / 电脑日历，官方公告与预计推算分别标注。<a href="#/timeline">查看完整时间线 →</a></div>' +
        '</div>' +
      '</section>' +

      '<section class="hm-sec">' +
        '<div class="hm-wrap">' +
          '<div class="hm-head reveal"><div class="hm-eyebrow">实用功能</div><h2 class="hm-h">为「随手查」<span class="hm-a">而设计</span></h2>' +
          '<p class="hm-sub">在宿舍、在地铁、在宣讲会上，都能快速查到、记住、分享。</p></div>' +
          '<div class="hm-feats">' +
            '<div class="hm-feat reveal d1"><div class="hm-fic"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg></div><h4>全局搜索</h4><p>按 <span class="hm-kbd">⌘K</span> 一个框命中 <span class="hm-kbd">88,134</span> 条院校、岗位与机构索引，回车直达。</p></div>' +
            '<div class="hm-feat reveal d2"><div class="hm-fic"><svg viewBox="0 0 24 24"><path d="M10 13a5 5 0 007 0l3-3a5 5 0 00-7-7l-1 1"/><path d="M14 11a5 5 0 00-7 0l-3 3a5 5 0 007 7l1-1"/></svg></div><h4>筛选即链接</h4><p>整套筛选条件写进 URL，复制即可发给同学，打开就是同一屏。</p></div>' +
            '<div class="hm-feat reveal d3"><div class="hm-fic"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg></div><h4>我的三轨看板</h4><p>收藏、投递进度、择校清单聚成一页，可打印存 PDF，本机保存无需账号。</p></div>' +
            '<div class="hm-feat reveal d1"><div class="hm-fic"><svg viewBox="0 0 24 24"><path d="M3 3v18h18"/><path d="M7 14l4-4 3 3 5-6"/></svg></div><h4>字段完整度透明</h4><p>学费 / 拟招 / 复试线覆盖率摊开给你看，缺口一键直达官方简章。</p></div>' +
            '<div class="hm-feat reveal d2"><div class="hm-fic"><svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg></div><h4>日历导出</h4><p>关键节点一次性导入日历，官方公告与预计推算在标题里分别标注。</p></div>' +
            '<div class="hm-feat reveal d3"><div class="hm-fic"><svg viewBox="0 0 24 24"><path d="M5 12.55a11 11 0 0114 0M8.5 16a6 6 0 017 0M12 20h.01"/><path d="M2 8.82a15 15 0 0120 0"/></svg></div><h4>离线可用</h4><p>没网也能查已缓存的数据；在线时永远拿最新，不发旧版。</p></div>' +
          '</div>' +
        '</div>' +
      '</section>' +

      '<section class="hm-sec hm-alt">' +
        '<div class="hm-wrap">' +
          '<div class="hm-head reveal"><div class="hm-eyebrow">数据</div><h2 class="hm-h">来自官方，<span class="hm-a">缺口摊开给你看</span></h2>' +
          '<p class="hm-sub">每一个数字都标注出处与快照日期。官方优先、不确定就留空、第三方明确标注。</p></div>' +
          '<div class="hm-data reveal d1">' +
            '<div class="hm-dtop">' +
              '<div><div class="hm-bigidx" data-n="88134">0</div><div class="hm-bigidx-l">条全局搜索索引<br>院校专业 + 考公岗位 + 实习机构</div></div>' +
              '<div class="hm-cov">' +
                '<div class="hm-covrow"><div class="hm-covtop"><b>考公竞争度覆盖</b><span>56.8%</span></div><div class="hm-covbar"><i data-w="56.8%"></i></div></div>' +
                '<div class="hm-covrow"><div class="hm-covtop"><b>考研学费字段（金融试点）</b><span>77%</span></div><div class="hm-covbar"><i data-w="77%"></i></div></div>' +
                '<div class="hm-covrow"><div class="hm-covtop"><b>实习官网链接实测</b><span>100%</span></div><div class="hm-covbar"><i data-w="100%"></i></div></div>' +
              '</div>' +
            '</div>' +
            '<div class="hm-prov">' + ['浙江','江苏','广东','北京','福建','安徽','天津','湖南','湖北','四川','重庆','江西','河南','河北','山东','上海'].map(function (p) { return '<span class="hm-chip"><b>' + p + '</b> 职位表</span>'; }).join('') + '</div>' +
            '<div class="hm-dsrc">考公快照 2026-11-10 · 四川全量 · 国考统计每日自动检查 · 实习按模块同一套窗口口径计算</div>' +
          '</div>' +
        '</div>' +
      '</section>' +

      '<section class="hm-ctasec">' +
        '<div class="hm-wrap">' +
          '<div class="hm-ctabox reveal">' +
            '<h2>现在开始，把选择看清楚</h2>' +
            '<p>打开即用，无需注册。三条路的信息已经就位，剩下的，是你的决定。</p>' +
            '<div class="hm-ctabtns"><a class="btn btn-primary magnet" href="#/path">开始路径决策<span class="arr">→</span></a><a class="btn btn-ghost" href="#/timeline">看统一时间线</a></div>' +
          '</div>' +
        '</div>' +
      '</section>';

    /* 首屏关键内容常显（不加 .reveal），仅做位移动画，保证截图/慢设备下完整可读 */
    if (motionOn()) {
      beginMotion(el, function () {
        gsap.from(el.querySelectorAll('.hm-pill, .hm-lead, .hm-cta'), { y: 20, duration: .5, stagger: .1, delay: .2, ease: MOTION.easeOut });
      });
    }
    countUp(el);
    bindReveal(el);
    initMagnet(el);
    /* 覆盖率条填充 */
    el.querySelectorAll('.hm-covbar i[data-w]').forEach(function (b) {
      var w = b.getAttribute('data-w');
      if (reduceMotion) { b.style.width = w; return; }
      var obs = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { b.style.width = w; obs.disconnect(); } }); }, { threshold: .3 });
      obs.observe(b);
      /* 兜底：IO 被节流（后台标签页/截图）时也保证填充到终值 */
      setTimeout(function () { b.style.width = w; }, 1600);
    });
    /* 页内滚动（不改 hash，避免被路由当成未知路由） */
    el.querySelectorAll('[data-scroll]').forEach(function (b) {
      b.addEventListener('click', function () { var t = document.getElementById(b.getAttribute('data-scroll')); if (t) t.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' }); });
    });
  }

  function initMagnet(el) {
    if (isTouch || reduceMotion) return;
    el.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) * 0.18;
        var dy = (e.clientY - (r.top + r.height / 2)) * 0.24;
        b.style.transform = 'translate(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px)';
      });
      b.addEventListener('pointerleave', function () { b.style.transform = ''; });
    });
  }

  /* ---------------- 时间线 ---------------- */
  function daysBadge(t) {
    if (!t.start || !t.end) return '';
    var now = new Date();
    var s = new Date(t.start + 'T00:00:00');
    var e = new Date(t.end + 'T23:59:59');
    if (now >= s && now <= e) return '<span class="kind kind-now">进行中 · 剩 ' + Math.ceil((e - now) / 86400000) + ' 天</span>';
    if (now < s) return '<span class="kind">' + Math.ceil((s - now) / 86400000) + ' 天后开启</span>';
    return '';
  }
  function kindTag(kind) {
    if (kind === 'official') return '<span class="kind kind-official">官方公告</span>';
    if (kind === 'third') return '<span class="kind">第三方口径</span>';
    return '<span class="kind">预计 / 推算</span>';
  }
  function timelineRows(filter) {
    var now = new Date();
    return (window.HUB_TIMELINE || []).filter(function (t) { return filter === 'all' || t.module === filter; })
      .slice().sort(function (a, b) { return String(a.start || '9999-12-31').localeCompare(String(b.start || '9999-12-31')); })
      .map(function (t) {
      var cur = t.start && t.end && now >= new Date(t.start + 'T00:00:00') && now <= new Date(t.end + 'T23:59:59');
      var meta = MODULE_META[t.module] || { name: t.exam, color: '#176b75' };
      return '<a class="tl-row' + (cur ? ' now' : '') + '" href="#/' + t.module + '">' +
        '<div class="tl-body"><div class="tl-head"><span class="tl-date">' + esc(t.dateLabel || t.start || '') + '</span>' +
        '<span class="tl-mod" style="color:' + (meta.color || '#176b75') + '">' + esc(meta.name) + ' · ' + esc(t.exam) + '</span>' +
        kindTag(t.kind) + daysBadge(t) + '</div>' +
        '<div class="tl-stage">' + esc(t.stage) + '</div>' +
        (t.notes ? '<div class="tl-notes">' + esc(t.notes) + '</div>' : '') + '</div></a>';
    }).join('');
  }
  /* 泳道甘特：横轴月份、纵轴三轨；官方=实线块、推算=虚线块；今天=铜金竖线 */
  function ganttModel() {
    var items = (window.HUB_TIMELINE || []).filter(function (t) { return t.start; });
    if (!items.length) return null;
    var min = Infinity, max = -Infinity;
    items.forEach(function (t) {
      var s = new Date(t.start + 'T00:00:00').getTime();
      var e = new Date((t.end || t.start) + 'T23:59:59').getTime();
      if (s < min) min = s;
      if (e > max) max = e;
    });
    var d0 = new Date(min); d0.setDate(1); d0.setHours(0, 0, 0, 0);
    var d1 = new Date(max); d1.setMonth(d1.getMonth() + 1, 1); d1.setHours(0, 0, 0, 0);
    min = d0.getTime(); max = d1.getTime();
    var months = [];
    for (var d = new Date(min); d.getTime() < max; d.setMonth(d.getMonth() + 1)) {
      months.push({ t: d.getTime(), label: (d.getMonth() + 1) + '月', year: d.getFullYear() });
    }
    return { items: items, min: min, max: max, months: months };
  }
  /* 月历矩阵：每行一个月、三列三条轨。节点为完整文字条目，不按时长压缩宽度，
   * 因此永不截断；官方=左侧实线、推算=左侧虚线、当前窗口=铜金底。 */
  function matrixHtml(model, filter) {
    var now = new Date();
    var lanes = ['kaoyan', 'gongkao', 'intern'].filter(function (m) { return filter === 'all' || filter === m; });
    var groups = {};
    model.items.forEach(function (t) {
      var d = new Date(t.start + 'T00:00:00');
      var k = d.getFullYear() + '-' + d.getMonth();
      (groups[k] = groups[k] || []).push(t);
    });
    var out = '<div class="mx' + (lanes.length === 1 ? ' mx--single' : '') + '" id="mx">' +
      '<div class="mx-row mx-head"><span class="mx-month">月份</span>' +
      lanes.map(function (m) { return '<span class="mx-lane">' + esc(MODULE_META[m].name) + '</span>'; }).join('') + '</div>';
    model.months.forEach(function (mo) {
      var d = new Date(mo.t);
      var key = d.getFullYear() + '-' + d.getMonth();
      var isNowMonth = now.getFullYear() === d.getFullYear() && now.getMonth() === d.getMonth();
      var items = (groups[key] || []).filter(function (t) { return lanes.indexOf(t.module) > -1; })
        .sort(function (a, b) { return String(a.start).localeCompare(String(b.start)); });
      out += '<div class="mx-row' + (isNowMonth ? ' mx-now' : '') + '">' +
        '<span class="mx-month"><b>' + (d.getMonth() + 1) + '</b><em>月</em>' +
        (d.getMonth() === 0 || mo === model.months[0] ? '<small>' + d.getFullYear() + '</small>' : '') +
        (isNowMonth ? '<i class="mx-today">今天</i>' : '') + '</span>' +
        lanes.map(function (m) {
          var cell = items.filter(function (t) { return t.module === m; });
          return '<div class="mx-cell">' + (cell.length ? cell.map(function (t) {
            var s = new Date(t.start + 'T00:00:00'), e = new Date((t.end || t.start) + 'T23:59:59');
            var cur = now >= s && now <= e;
            var cls = 'mx-chip' + (t.kind === 'official' ? ' mx-official' : ' mx-est') + (cur ? ' mx-cur' : '');
            var range = t.end && t.end !== t.start ? (t.dateLabel || (t.start + ' → ' + t.end)) : (t.dateLabel || t.start);
            var label = esc(t.stage) + ' · ' + esc(range) + ' · ' + (t.kind === 'official' ? '官方公告' : '预计/推算');
            return '<a class="' + cls + '" href="#/' + m + '" title="' + label + '" aria-label="' + label + '"><b>' + esc(t.stage) + '</b><small>' + esc(range) + (cur ? ' · 进行中' : '') + '</small></a>';
          }).join('') : '<span class="mx-empty">本月无节点</span>') + '</div>';
        }).join('') + '</div>';
    });
    out += '</div><p class="g-legend"><i class="lg-official"></i>官方公告（实线）<i class="lg-est"></i>预计 / 推算（虚线）<i class="lg-now"></i>当前窗口</p>';
    return out;
  }
  function renderTimeline(el) {
    var nowT = new Date();
    var tlNow = 0, tlSoon = 0, tlMonth = 0;
    (window.HUB_TIMELINE || []).forEach(function (t) {
      if (!t.start) return;
      var s = new Date(t.start + 'T00:00:00'), e = new Date((t.end || t.start) + 'T23:59:59');
      if (nowT >= s && nowT <= e) tlNow++;
      if (nowT < s && (s - nowT) / 86400000 <= 7) tlSoon++;
      if (s.getFullYear() === nowT.getFullYear() && s.getMonth() === nowT.getMonth()) tlMonth++;
    });
    el.innerHTML =
      '<div class="page-head"><div class="page-kicker">Timeline</div><h2 class="page-title">统一时间线</h2>' +
      '<p class="page-sub">考研 / 考公 / 实习三条路的关键节点按时间对齐。「官方公告」来自官方渠道，「预计 / 推算」按往年规律估算，报考与投递前务必以当年官方通知为准。</p>' +
      '<div class="tl-headstats"><div class="tl-headstat"><b>' + tlNow + '</b><span>个窗口进行中</span></div>' +
      '<div class="tl-headstat"><b>' + tlSoon + '</b><span>个 7 天内开始</span></div>' +
      '<div class="tl-headstat"><b>' + tlMonth + '</b><span>个本月节点</span></div></div></div>' +
      '<div class="chips" id="tlChips"><button class="chip active" data-f="all">全部</button>' +
      '<button class="chip" data-f="kaoyan">考研</button><button class="chip" data-f="gongkao">考公</button><button class="chip" data-f="intern">实习</button>' +
      '<span class="tl-viewseg" role="group" aria-label="视图"><button class="chip active" data-v="matrix">月历</button><button class="chip" data-v="list">清单</button></span>' +
      '<button class="chip tl-ics" id="tlIcs" type="button" title="一次性导入手机/电脑日历；推算节点已标注">⬇ 导出日历 .ics</button></div>' +
      '<div id="tlMatrix"></div>' +
      '<div class="tl-wrap" id="tlListWrap" hidden><div class="tl-progress"><i id="tlFill"></i></div><div class="tl-list" id="tlList" aria-live="polite"></div></div>';
    var model = ganttModel();
    var mbox = el.querySelector('#tlMatrix');
    var listWrap = el.querySelector('#tlListWrap');
    var list = el.querySelector('#tlList');
    var view = window.matchMedia && matchMedia('(max-width: 980px)').matches ? 'list' : 'matrix';
    var filter = 'all';
    function paint() {
      if (view === 'matrix' && model) {
        mbox.innerHTML = matrixHtml(model, filter);
        mbox.hidden = false; listWrap.hidden = true;
        if (motionOn()) {
          beginMotion(el, function () {
            var rows = mbox.querySelectorAll('.mx-row');
            var tl = gsap.timeline();
            tl.from(rows, { y: 12, duration: .45, stagger: .035, ease: MOTION.easeOut });
            var cur = mbox.querySelector('.mx-now');
            if (cur) tl.from(cur, { backgroundColor: 'rgba(217,179,108,0)', duration: .6, ease: MOTION.easeInOut }, .3);
          });
        }
      } else {
        mbox.hidden = true; listWrap.hidden = false;
        list.innerHTML = timelineRows(filter);
      }
      el.querySelectorAll('#tlChips [data-v]').forEach(function (b) { b.classList.toggle('active', b.dataset.v === view); });
    }
    paint();
    bindReveal(el);
    el.querySelector('#tlChips').addEventListener('click', function (e) {
      var f = e.target.closest('[data-f]');
      var v = e.target.closest('[data-v]');
      if (f) {
        filter = f.dataset.f;
        el.querySelectorAll('#tlChips [data-f]').forEach(function (c) { c.classList.toggle('active', c === f); });
      }
      if (v) view = v.dataset.v;
      if (f || v) { endMotion(); paint(); }
    });
    var icsBtn = el.querySelector('#tlIcs');
    if (icsBtn) icsBtn.addEventListener('click', exportTimelineICS);
    var fill = el.querySelector('#tlFill');
    function onScroll() {
      var wrap = el.querySelector('.tl-wrap');
      if (!wrap || !fill || wrap.hidden) return;
      var r = wrap.getBoundingClientRect();
      var total = r.height;
      var seen = Math.min(total, Math.max(0, window.innerHeight * 0.35 - r.top));
      fill.style.height = (total > 0 ? Math.min(100, seen / total * 100) : 0) + '%';
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onRouteCleanup(function () { window.removeEventListener('scroll', onScroll); });
    onScroll();
  }

  /* ---------------- 路径决策 ---------------- */
  var QUIZ = [
    { dim: '毕业诉求', q: '1. 毕业后这几年，你最想要的是什么？', opts: [
      { t: '更深的学术训练与学历平台', s: { kaoyan: 3 } },
      { t: '稳定编制与长期确定性', s: { gongkao: 3 } },
      { t: '尽早进入行业攒真实经验', s: { intern: 3 } },
      { t: '还没想清楚，想先比较再选', s: { kaoyan: 1, gongkao: 1, intern: 1 } } ] },
    { dim: '学术兴趣', q: '2. 对读文献、写论文这类学术训练，你的真实感受是？', opts: [
      { t: '喜欢跟课题写论文，甚至考虑读博', s: { kaoyan: 3 } },
      { t: '一般，需要时能完成，谈不上热爱', s: { kaoyan: 1, gongkao: 1 } },
      { t: '更想解决具体业务问题，不想再写论文', s: { intern: 3 } } ] },
    { dim: '应试基础', q: '3. 数学与英语这两门硬科目，你现在的底子？', opts: [
      { t: '都扎实，应试型选手', s: { kaoyan: 3, gongkao: 1 } },
      { t: '一强一弱，需要针对性补', s: { kaoyan: 2, gongkao: 2 } },
      { t: '都弱或丢久了，不想从头捡', s: { intern: 3 } } ] },
    { dim: '时间投入', q: '4. 能拿出多少时间高强度备考？', opts: [
      { t: '能脱产或近乎脱产投入一年', s: { kaoyan: 3, gongkao: 2 } },
      { t: '只能课余 / 边实习边挤时间', s: { gongkao: 2, intern: 2 } },
      { t: '排斥长周期延迟满足，想要快反馈', s: { intern: 3 } } ] },
    { dim: '风险偏好', q: '5. 面对不确定性，你更接受哪种竞争形态？', opts: [
      { t: '一次押注一个目标，接受复试线波动', s: { kaoyan: 3 } },
      { t: '竞争比与进面分公开透明、可测算', s: { gongkao: 3 } },
      { t: '多线投递拿多个机会，比较后再选', s: { intern: 3 } } ] },
    { dim: '经济因素', q: '6. 经济上你的处境更接近？', opts: [
      { t: '家庭支持再读两三年，学费压力小', s: { kaoyan: 3 } },
      { t: '希望尽快经济独立、减轻家里负担', s: { intern: 3, gongkao: 1 } },
      { t: '居中，可接受短过渡期再定', s: { gongkao: 2, kaoyan: 1 } } ] },
    { dim: '地域偏好', q: '7. 未来三五年你想在哪里发展？', opts: [
      { t: '回本省 / 留家乡，地域资源重要', s: { gongkao: 3 } },
      { t: '去北上广深杭搏机会', s: { intern: 3, kaoyan: 1 } },
      { t: '无所谓，跟着目标（院校 / 岗位）走', s: { kaoyan: 2 } } ] },
    { dim: '年级窗口', q: '8. 你现在的年级 / 状态？', opts: [
      { t: '大二及以下，试错空间还大', s: { intern: 2, kaoyan: 1, gongkao: 1 } },
      { t: '大三，一年内必须定方向', s: { kaoyan: 2, gongkao: 2 } },
      { t: '大四 / gap / 在职，要尽快出结果', s: { gongkao: 2, intern: 2 } } ] },
    { dim: '已有资源', q: '9. 手里已经有的筹码是？', opts: [
      { t: '实习经历或留用 / return offer 线索', s: { intern: 3 } },
      { t: '竞赛、科研或论文经历', s: { kaoyan: 3 } },
      { t: '做过行测申论，有考公备考基础', s: { gongkao: 3 } },
      { t: '都没有，从零开始', s: { kaoyan: 1, gongkao: 1, intern: 1 } } ] },
    { dim: '五年画像', q: '10. 五年后你更希望自己是？', opts: [
      { t: '垂直领域的专家 / 研究者', s: { kaoyan: 3 } },
      { t: '体制内的骨干 / 公共服务者', s: { gongkao: 3 } },
      { t: '市场里的业务骨干 / 管理者', s: { intern: 3 } } ] }
  ];
  var PATH_INFO = {
    kaoyan: { name: '考研', why: '你倾向学历平台与深度备考，考研择校（含金融等 31 个专业大类）能帮你把目标定准。', next: '下一步：用「考研择校」填预估分做冲稳保分档，圈定 3~5 所目标院校。', href: '#/kaoyan' },
    gongkao: { name: '考公', why: '你重视稳定与确定性，岗位竞争度数据能帮你避开百里挑一的坑位。', next: '下一步：用「考公岗位」按专业 + 学历筛岗，看竞争比与进面分再决定报哪类。', href: '#/gongkao' },
    intern: { name: '实习', why: '你更信真实经验与多线机会，先把网申投起来，成本最低。', next: '下一步：用「实习网申」看当前开放批次，按倒计时排投递顺序。', href: '#/intern' }
  };
  var MAXP = { kaoyan: 0, gongkao: 0, intern: 0 };
  QUIZ.forEach(function (q) {
    ['kaoyan', 'gongkao', 'intern'].forEach(function (k) {
      var m = 0;
      q.opts.forEach(function (o) { m = Math.max(m, o.s[k] || 0); });
      MAXP[k] += m;
    });
  });

  function renderPath(el) {
    el.innerHTML =
      '<div class="page-head"><div class="page-kicker">Decision</div><h2 class="page-title">路径决策</h2>' +
      '<p class="page-sub">十道题覆盖毕业诉求、学术兴趣、应试基础、时间投入、风险偏好、经济因素、地域、年级窗口、已有资源与五年画像。规则透明，结果仅供参考；地址栏带 a= 参数可复现同一份结果。</p></div>' +
      '<div class="progress"><span class="progress-count" id="qCount">0 / 10</span><div class="progress-track"><div class="progress-fill" id="qFill"></div></div></div>' +
      '<div class="quiz-stage" id="quizStage"></div>' +
      '<div class="quiz-dots" id="quizDots"></div>' +
      '<div id="pathResult"></div>' +
      '<div class="profile-card reveal"><div class="stamp" style="font-size:11.5px;letter-spacing:.14em;color:var(--teal)">我的三轨档案（可选）</div>' +
      '<p class="page-sub" style="margin:6px 0 0;font-size:13px">只存在本机浏览器。保存后重新进入三个模块会自动预填：考研的预估分 / 省份 / 数学，考公档案的届别 / 专业，实习的城市筛选。</p>' +
      '<div class="profile-grid">' +
      '<label>毕业届别<select id="pfHubGrad"><option value="">不设</option><option>2027</option><option>2028</option><option>2029</option></select></label>' +
      '<label>专业<input id="pfHubMajor" type="text" placeholder="如：金融学"></label>' +
      '<label>预估总分<input id="pfHubScore" type="number" min="0" max="500" placeholder="如 370"></label>' +
      '<label>意向地域<input id="pfHubRegion" type="text" placeholder="如：浙江 / 上海"></label>' +
      '<label>考研数学<select id="pfHubMath"><option value="">不设</option><option>数三</option><option>396</option></select></label>' +
      '</div><button class="btn btn-primary" id="btnHubProfile" style="padding:11px 22px">保存档案</button>' +
      '<div class="saved-tip" id="hubProfileSaved"></div></div>';

    var answers = QUIZ.map(function () { return null; });
    var pre = (location.hash.match(/a=([\d,]+)/) || [])[1];
    if (pre) pre.split(',').forEach(function (v, i) { if (i < QUIZ.length && QUIZ[i].opts[+v]) answers[i] = +v; });

    var stage = el.querySelector('#quizStage');
    var dotsBox = el.querySelector('#quizDots');
    var cur = 0;
    for (var qi0 = 0; qi0 < QUIZ.length; qi0++) { if (answers[qi0] === null) { cur = qi0; break; } }

    var lastResult = null;
    var countEl = el.querySelector('#qCount');
    var fillEl = el.querySelector('#qFill');

    function allDone() { return answers.every(function (a) { return a !== null; }); }
    function updateProgress() {
      var done = answers.filter(function (a) { return a !== null; }).length;
      countEl.textContent = done + ' / ' + QUIZ.length;
      fillEl.style.width = (done / QUIZ.length * 100) + '%';
      dotsBox.querySelectorAll('button').forEach(function (d, i) {
        d.classList.toggle('answered', answers[i] !== null);
        d.classList.toggle('cur', i === cur);
      });
    }
    function renderStage() {
      var item = QUIZ[cur];
      stage.innerHTML =
        '<div class="q-card q-focus">' +
          '<div class="q-num">' + String(cur + 1).padStart(2, '0') + '<span>/ ' + QUIZ.length + '</span></div>' +
          '<div class="q-title"><span class="q-dim">' + esc(item.dim) + '</span>' + esc(item.q) + '</div>' +
          item.opts.map(function (o, oi) {
            return '<label class="q-opt"><input type="radio" name="q' + cur + '" value="' + oi + '"' + (answers[cur] === oi ? ' checked' : '') + '><span>' + esc(o.t) + '</span></label>';
          }).join('') +
          '<div class="q-nav">' +
            '<button class="btn btn-ghost" type="button" data-qnav="prev"' + (cur === 0 ? ' disabled' : '') + '>上一题</button>' +
            '<button class="btn btn-primary" type="button" data-qnav="next"' + (answers[cur] === null ? ' disabled' : '') + '>' + (cur === QUIZ.length - 1 ? '查看结论' : '下一题') + '<span class="arr">→</span></button>' +
          '</div>' +
        '</div>';
      dotsBox.innerHTML = QUIZ.map(function (q, i) {
        return '<button type="button" data-qdot="' + i + '" aria-label="第 ' + (i + 1) + ' 题 ' + esc(q.dim) + '"></button>';
      }).join('');
      updateProgress();
    }

    function updateResult() {
      if (answers.some(function (a) { return a === null; })) {
        el.querySelector('#pathResult').innerHTML = '<div class="hub-placeholder" style="margin-top:26px">答完十题后这里给出推荐路径与维度理由。</div>';
        return;
      }
      var score = { kaoyan: 0, gongkao: 0, intern: 0 };
      var reasons = { kaoyan: [], gongkao: [], intern: [] };
      answers.forEach(function (a, qi) {
        var opt = QUIZ[qi].opts[a];
        Object.keys(opt.s).forEach(function (k) {
          if (score[k] === undefined) return;
          score[k] += opt.s[k];
          if (opt.s[k] >= 2 && reasons[k].length < 4) reasons[k].push(QUIZ[qi].dim + '：' + opt.t);
        });
      });
      var order = Object.keys(score).sort(function (a, b) { return score[b] - score[a]; });
      lastResult = { score: score, reasons: reasons, order: order };
      var top = order[0], second = order[1];
      var info = PATH_INFO[top];
      var pct = Math.max(6, Math.min(100, Math.round(score[top] / (MAXP[top] || 1) * 100)));
      var up = (window.HUB_TIMELINE || []).filter(function (t) { return t.module === top && t.end && new Date(t.end + 'T23:59:59') >= new Date(); }).slice(0, 2)
        .map(function (t) { return '<li>' + esc(t.dateLabel || t.start) + ' · ' + esc(t.stage) + '</li>'; }).join('');
      el.querySelector('#pathResult').innerHTML =
        '<div class="result-card reveal in">' +
          '<div class="result-top">' +
            '<div class="ring" id="scoreRing"><b>' + score[top] + '</b></div>' +
            '<div><div class="result-headline"><small>主推荐</small>' + esc(info.name) + '</div>' +
            '<p style="margin:10px 0 0;color:rgba(239,236,227,.72);max-width:520px">' + esc(info.why) + '</p></div>' +
          '</div>' +
          (reasons[top].length ? '<div class="reason-box"><b>你的选择里支持这个推荐的维度</b><ul style="margin:0;padding-left:18px">' + reasons[top].map(function (r) { return '<li>' + esc(r) + '</li>'; }).join('') + '</ul></div>' : '') +
          (up ? '<div class="reason-box"><b>近期关键节点</b><ul style="margin:0;padding-left:18px">' + up + '</ul></div>' : '') +
          '<div class="result-actions">' +
            '<a class="btn btn-primary" href="' + info.href + '">进入' + esc(info.name) + '模块<span class="arr">→</span></a>' +
            '<button class="btn shiny-btn" id="btnHubReport">生成三轨规划报告（打印/PDF）</button>' +
          '</div>' +
          '<div class="result-alt">备选：' + esc(PATH_INFO[second].name) + '（' + score[second] + ' 分）——' + esc(PATH_INFO[second].why) + '</div>' +
        '</div>' + '<p class="page-sub" style="margin-top:14px">' + esc(info.next) + '</p>';
      var ring = el.querySelector('#scoreRing');
      if (ring) {
        if (reduceMotion || shotMode) ring.style.setProperty('--p', pct);
        else if (motionOn()) {
          gsap.to(ring, { '--p': pct, duration: .9, ease: 'power3.out' });
          setTimeout(function () { ring.style.setProperty('--p', pct); }, 1200);
        } else {
          var v = 0;
          var t0 = null;
          requestAnimationFrame(function step(ts) {
            if (!t0) t0 = ts;
            var p = Math.min(1, (ts - t0) / 1100);
            v = Math.round(pct * (1 - Math.pow(1 - p, 3)));
            ring.style.setProperty('--p', v);
            if (p < 1) requestAnimationFrame(step);
          });
        }
      }
    }

    stage.addEventListener('change', function (e) {
      if (e.target.type !== 'radio') return;
      answers[cur] = +e.target.value;
      updateProgress();
      updateResult();
      var nextBtn = stage.querySelector('[data-qnav="next"]');
      if (nextBtn) nextBtn.disabled = false;
      if (!allDone() && cur < QUIZ.length - 1) {
        setTimeout(function () { cur++; renderStage(); }, 260);
      } else if (allDone()) {
        renderStage();
        var r = el.querySelector('#pathResult');
        if (r) r.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      }
    });
    stage.addEventListener('click', function (e) {
      var nav = e.target.closest('[data-qnav]');
      if (!nav) return;
      if (nav.dataset.qnav === 'prev' && cur > 0) { cur--; renderStage(); }
      if (nav.dataset.qnav === 'next') {
        if (cur < QUIZ.length - 1) { cur++; renderStage(); }
        else { var r = el.querySelector('#pathResult'); if (r) r.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' }); }
      }
    });
    dotsBox.addEventListener('click', function (e) {
      var d = e.target.closest('[data-qdot]');
      if (d) { cur = +d.dataset.qdot; renderStage(); }
    });

    function buildReport() {
      if (!lastResult) return;
      var r = lastResult;
      var top = r.order[0];
      var info = PATH_INFO[top];
      var upcoming = (window.HUB_TIMELINE || []).filter(function (t) { return t.module === top && t.end && new Date(t.end + 'T23:59:59') >= new Date(); });
      var old = el.querySelector('#hubReport');
      if (old) old.remove();
      var div = document.createElement('div');
      div.id = 'hubReport';
      div.innerHTML =
        '<h2 style="font-family:var(--font-serif)">前程指北 · 三轨规划报告</h2>' +
        '<p>生成于 ' + new Date().toLocaleDateString('zh-CN') + ' · 决策得分：考研 ' + r.score.kaoyan + ' / 考公 ' + r.score.gongkao + ' / 实习 ' + r.score.intern + ' · 主推荐：' + esc(info.name) + '</p>' +
        (r.reasons[top].length ? '<p><b>支持推荐的维度</b></p><ul>' + r.reasons[top].map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' : '') +
        '<p><b>推荐路径近期关键节点</b></p>' +
        (upcoming.length ? '<table class="hub-report-table"><thead><tr><th>时间</th><th>节点</th><th>口径</th></tr></thead><tbody>' + upcoming.map(function (t) {
          return '<tr><td>' + esc(t.dateLabel || t.start) + '</td><td>' + esc(t.stage) + '</td><td>' + (t.kind === 'official' ? '官方公告' : (t.kind === 'third' ? '第三方口径' : '预计/推算')) + '</td></tr>';
        }).join('') + '</tbody></table>' : '<p>暂无</p>') +
        '<p><b>三轨对照</b></p>' +
        '<table class="hub-report-table"><thead><tr><th>维度</th><th>考研</th><th>考公</th><th>实习</th></tr></thead><tbody>' +
        '<tr><td>典型准备周期</td><td>10–12 个月，可脱产</td><td>3–6 个月，可兼顾</td><td>边做边投，滚动窗口</td></tr>' +
        '<tr><td>竞争形态</td><td>一次初试+复试，线波动</td><td>岗位公开，竞争比可测算</td><td>多线并行，offer 比较</td></tr>' +
        '<tr><td>成本与回报</td><td>学费+机会成本 → 学历平台</td><td>笔试+面试 → 稳定编制</td><td>无额外成本 → 薪资与留用</td></tr>' +
        '<tr><td>结果确定性</td><td>较低（复试线波动）</td><td>中（数据透明）</td><td>较高（多保底）</td></tr>' +
        '</tbody></table>' +
        '<p>数据口径：官方优先、留空不编、第三方标注。本报告由前程指北路径决策自动生成，仅供参考。</p>';
      el.appendChild(div);
      document.body.classList.add('report-mode');
      var clear = function () { document.body.classList.remove('report-mode'); window.removeEventListener('afterprint', clear); };
      window.addEventListener('afterprint', clear);
      window.print();
    }

    el.addEventListener('click', function (e) {
      if (e.target && e.target.id === 'btnHubReport') buildReport();
      if (e.target && e.target.id === 'btnHubProfile') {
        localStorage.setItem('hub_profile_v1', JSON.stringify({
          grad: el.querySelector('#pfHubGrad').value,
          major: el.querySelector('#pfHubMajor').value.trim(),
          score: el.querySelector('#pfHubScore').value,
          region: el.querySelector('#pfHubRegion').value.trim(),
          math: el.querySelector('#pfHubMath').value
        }));
        el.querySelector('#hubProfileSaved').textContent = '已保存，重新进入三个模块后生效。';
      }
    });

    var pf = {};
    try { pf = JSON.parse(localStorage.getItem('hub_profile_v1') || '{}'); } catch (e) {}
    el.querySelector('#pfHubGrad').value = pf.grad || '';
    el.querySelector('#pfHubMajor').value = pf.major || '';
    el.querySelector('#pfHubScore').value = pf.score || '';
    el.querySelector('#pfHubRegion').value = pf.region || '';
    el.querySelector('#pfHubMath').value = pf.math || '';
    renderStage();
    updateResult();
    bindReveal(el);
  }

  /* ---------------- 搜索 ---------------- */
  var SEARCH_ROUTE = { k: 'kaoyan', g: 'gongkao', i: 'intern' };
  var SEARCH_ALIAS = {
    '北大': '北京大学', '清华': '清华大学', '浙大': '浙江大学', '复旦': '复旦大学',
    '人大': '中国人民大学', '上交': '上海交通大学', '南大': '南京大学', '武大': '武汉大学',
    '厦大': '厦门大学', '川大': '四川大学', '山大': '山东大学', '中大': '中山大学',
    '央财': '中央财经大学', '上财': '上海财经大学', '西财': '西南财经大学',
    '东北财': '东北财经大学', '中南财': '中南财经政法大学', '江财': '江西财经大学',
    '外经贸': '对外经济贸易大学', '北航': '北京航空航天大学', '北理工': '北京理工大学',
    '北师大': '北京师范大学', '华科': '华中科技大学', '天大': '天津大学', '东大': '东南大学',
    '哈工大': '哈尔滨工业大学', '西交': '西安交通大学', '兰大': '兰州大学', '吉大': '吉林大学',
    '湖大': '湖南大学', '重大': '重庆大学', '暨大': '暨南大学', '苏大': '苏州大学', '郑大': '郑州大学'
  };
  function rankOf(n, s, q) {
    if (n.indexOf(q) === 0) return 0;
    if (n.indexOf(q) > 0) return 1;
    if (s.indexOf(q) > -1) return 2;
    var ni = 0, start = -1;
    for (var i = 0; i < n.length && ni < q.length; i++) {
      if (n[i] === q[ni]) { if (ni === 0) start = i; ni++; }
    }
    if (ni === q.length) return start === 0 ? 1 : 3;
    return -1;
  }
  function markHit(text, q, alias) {
    if (!q) return esc(text);
    var needle = q;
    var i = text.toLowerCase().indexOf(q.toLowerCase());
    if (i < 0 && alias) { needle = alias; i = text.toLowerCase().indexOf(alias.toLowerCase()); }
    if (i < 0) return esc(text);
    return esc(text.slice(0, i)) + '<mark>' + esc(text.slice(i, i + needle.length)) + '</mark>' + esc(text.slice(i + needle.length));
  }
  /* 搜索索引按路由懒加载：首屏不再下载 937KB；缓存 Promise 防重复注入 */
  var searchIndexPromise = null;
  function ensureSearchIndex() {
    if (window.HUB_SEARCH) return Promise.resolve(window.HUB_SEARCH);
    if (searchIndexPromise) return searchIndexPromise;
    searchIndexPromise = fetch('shared/search-index.json.gz?v=20261112', { cache: 'default' })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.arrayBuffer();
      })
      .then(function (buf) {
        var bytes = new Uint8Array(buf);
        if (bytes[0] === 0x1f && bytes[1] === 0x8b) {
          if (typeof DecompressionStream === 'undefined') throw new Error('浏览器不支持 gzip 解压');
          return new Response(new Blob([buf]).stream().pipeThrough(new DecompressionStream('gzip'))).text();
        }
        return new TextDecoder().decode(buf);
      })
      .then(function (txt) {
        window.HUB_SEARCH = JSON.parse(txt);
        return window.HUB_SEARCH;
      })
      .catch(function (e) { searchIndexPromise = null; throw e; });
    return searchIndexPromise;
  }
  var RECENT_KEY = 'hub_recent_v1';
  function recentGet() { try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); } catch (e) { return []; } }
  function recentPush(q) {
    if (!q) return;
    var list = recentGet().filter(function (x) { return x !== q; });
    list.unshift(q);
    try { localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, 6))); } catch (e) {}
  }
  function renderSearch(el, query) {
    var q0 = decodeURIComponent((query.match(/q=([^&]*)/) || [])[1] || '');
    el.innerHTML =
      '<div class="page-head"><div class="page-kicker">Search</div><h2 class="page-title">全局搜索</h2>' +
      '<p class="page-sub">一个搜索框同时命中考研院校、考公岗位与实习机构，共 87,104 条索引；点击结果直达模块并自动定位。</p></div>' +
      '<div class="palette"><input id="searchInput" type="search" placeholder="搜院校 / 招录机关 / 职位 / 公司，如：北大 税务局 中信" value="' + esc(q0) + '"><kbd>ESC 清空</kbd></div>' +
      '<div id="searchResults" aria-live="polite"></div>';
    var input = el.querySelector('#searchInput');
    var box = el.querySelector('#searchResults');
    var timer = null;
    var activeIdx = -1;
    function setActive(i) {
      var items = box.querySelectorAll('.sr-item');
      if (!items.length) { activeIdx = -1; return; }
      activeIdx = Math.max(0, Math.min(items.length - 1, i));
      items.forEach(function (it, k) { it.classList.toggle('active', k === activeIdx); });
      items[activeIdx].scrollIntoView({ block: 'nearest' });
    }
    function run(animate) {
      if (!window.HUB_SEARCH) return;
      var q = input.value.trim().toLowerCase();
      activeIdx = -1;
      if (!q) {
        var rec = recentGet();
        box.innerHTML = (rec.length ? '<div class="sr-recent"><span>最近搜索</span>' + rec.map(function (r) { return '<button class="chip" type="button" data-recent="' + esc(r) + '">' + esc(r) + '</button>'; }).join('') + '</div>' : '') +
          '<div class="hub-placeholder">输入关键词开始搜索；↑↓ 选择结果，Enter 打开。</div>';
        return;
      }
      var groups = { k: [], g: [], i: [] };
      var idx = window.HUB_SEARCH || [];
      var qq = SEARCH_ALIAS[q] || q;
      for (var i = 0; i < idx.length; i++) {
        var e = idx[i];
        var rank = Math.min(rankOf(e.n.toLowerCase(), e.s.toLowerCase(), qq), rankOf(e.n.toLowerCase(), e.s.toLowerCase(), q));
        if (rank < 0) continue;
        e._r = rank;
        if (groups[e.t].length < 30) groups[e.t].push(e);
      }
      var names = { k: '考研院校', g: '考公岗位', i: '实习机构' };
      var html = '';
      var total = groups.k.length + groups.g.length + groups.i.length;
      if (!total) { box.innerHTML = '<div class="hub-placeholder">没有匹配结果，试试更短的关键词（城市名、机关名、公司简称）。</div>'; return; }
      Object.keys(groups).forEach(function (t) {
        if (!groups[t].length) return;
        groups[t].sort(function (a, b) { return (a._r - b._r) || (a.n.length - b.n.length); });
        var show = groups[t].slice(0, 12);
        html += '<div class="sr-group"><h3>' + names[t] + '（' + groups[t].length + (groups[t].length > show.length ? '+' : '') + '）</h3>' +
          show.map(function (e) {
            return '<a class="sr-item" href="#/' + SEARCH_ROUTE[t] + '?focus=' + encodeURIComponent(e.id) + (e.m ? '&major=' + encodeURIComponent(e.m) : '') + '"><b>' + markHit(e.n, q, qq) + '</b><small>' + esc(e.s) + '</small></a>';
          }).join('') + '</div>';
      });
      box.innerHTML = html;
      if (animate && motionOn()) {
        beginMotion(el, function () {
          gsap.from(Array.prototype.slice.call(box.querySelectorAll('.sr-item'), 0, 12), { y: 14, duration: .35, stagger: .05, ease: MOTION.easeOut, clearProps: 'all' });
        });
      }
    }
    input.addEventListener('input', function () { if (timer) clearTimeout(timer); timer = setTimeout(run, 140); });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { input.value = ''; run(); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); setActive(activeIdx + 1); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setActive(activeIdx - 1); }
      if (e.key === 'Enter') {
        var items = box.querySelectorAll('.sr-item');
        var target = items[activeIdx >= 0 ? activeIdx : 0];
        if (target) { e.preventDefault(); recentPush(input.value.trim()); target.click(); }
      }
    });
    box.addEventListener('click', function (e) {
      var rc = e.target.closest('[data-recent]');
      if (rc) { input.value = rc.dataset.recent; run(true); input.focus(); return; }
      if (e.target.closest('.sr-item')) recentPush(input.value.trim());
    });
    if (!isTouch) setTimeout(function () { input.focus(); }, 80);
    box.innerHTML = '<div class="hub-placeholder">正在加载搜索索引…</div>';
    ensureSearchIndex().then(function () { run(true); }).catch(function () {
      box.innerHTML = '<div class="hub-placeholder">搜索索引加载失败，请刷新重试。</div>';
    });
  }

  /* ---------------- ⌘/Ctrl+K 快捷搜索浮层 ----------------
     复用全局搜索索引 / 别名 / 最近搜索；任意路由下唤起，选中直达模块。移动端用头部搜索按钮。 */
  var palEl = null, palInput = null, palBox = null, palActive = -1, palTimer = null;
  function palEnsure() {
    if (palEl) return;
    palEl = document.createElement('div');
    palEl.className = 'cmdk';
    palEl.hidden = true;
    palEl.innerHTML = '<div class="cmdk-mask"></div>' +
      '<div class="cmdk-panel" role="dialog" aria-modal="true" aria-label="快捷搜索">' +
      '<div class="cmdk-bar"><span class="cmdk-ico" aria-hidden="true">⌕</span><input id="cmdkInput" type="search" placeholder="搜院校 / 机关 / 职位 / 公司…" autocomplete="off"><kbd>ESC</kbd></div>' +
      '<div class="cmdk-results" id="cmdkResults" aria-live="polite"></div>' +
      '<div class="cmdk-foot"><span>↑↓ 选择</span><span>Enter 打开</span><span>⌘/Ctrl+K 唤起</span></div>' +
      '</div>';
    document.body.appendChild(palEl);
    palInput = palEl.querySelector('#cmdkInput');
    palBox = palEl.querySelector('#cmdkResults');
    palEl.querySelector('.cmdk-mask').addEventListener('click', closePalette);
    palInput.addEventListener('input', function () { if (palTimer) clearTimeout(palTimer); palTimer = setTimeout(palRun, 120); });
    palInput.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { closePalette(); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); palMove(1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); palMove(-1); }
      else if (e.key === 'Enter') {
        var items = palBox.querySelectorAll('.sr-item');
        var t = items[palActive >= 0 ? palActive : 0];
        if (t) { e.preventDefault(); recentPush(palInput.value.trim()); var href = t.getAttribute('href'); closePalette(); location.hash = href; }
      }
    });
    palBox.addEventListener('click', function (e) {
      var rc = e.target.closest('[data-recent]');
      if (rc) { palInput.value = rc.dataset.recent; palRun(); palInput.focus(); return; }
      if (e.target.closest('.sr-item')) { recentPush(palInput.value.trim()); closePalette(); }
    });
  }
  function openPalette() {
    palEnsure();
    palEl.hidden = false;
    document.body.classList.add('cmdk-open');
    palInput.value = ''; palActive = -1;
    palBox.innerHTML = '<div class="hub-placeholder">正在加载搜索索引…</div>';
    ensureSearchIndex().then(function () { palRun(); }).catch(function () {
      palBox.innerHTML = '<div class="hub-placeholder">索引加载失败，请重试。</div>';
    });
    setTimeout(function () { palInput.focus(); }, 30);
  }
  function closePalette() { if (palEl) { palEl.hidden = true; document.body.classList.remove('cmdk-open'); } }
  function palMove(d) {
    var items = palBox.querySelectorAll('.sr-item');
    if (!items.length) { palActive = -1; return; }
    palActive = Math.max(0, Math.min(items.length - 1, palActive + d));
    items.forEach(function (it, k) { it.classList.toggle('active', k === palActive); });
    items[palActive].scrollIntoView({ block: 'nearest' });
  }
  function palRun() {
    if (!window.HUB_SEARCH) return;
    var q = palInput.value.trim().toLowerCase(); palActive = -1;
    if (!q) {
      var rec = recentGet();
      palBox.innerHTML = (rec.length ? '<div class="sr-recent"><span>最近搜索</span>' + rec.map(function (r) { return '<button class="chip" type="button" data-recent="' + esc(r) + '">' + esc(r) + '</button>'; }).join('') + '</div>' : '') +
        '<div class="hub-placeholder">输入关键词，回车直达模块。</div>';
      return;
    }
    var groups = { k: [], g: [], i: [] }; var idx = window.HUB_SEARCH; var qq = SEARCH_ALIAS[q] || q;
    for (var i = 0; i < idx.length; i++) {
      var e = idx[i];
      var rank = Math.min(rankOf(e.n.toLowerCase(), e.s.toLowerCase(), qq), rankOf(e.n.toLowerCase(), e.s.toLowerCase(), q));
      if (rank < 0) continue;
      e._r = rank; if (groups[e.t].length < 20) groups[e.t].push(e);
    }
    var names = { k: '考研院校', g: '考公岗位', i: '实习机构' }; var html = '';
    var total = groups.k.length + groups.g.length + groups.i.length;
    if (!total) { palBox.innerHTML = '<div class="hub-placeholder">没有匹配，试试更短的关键词。</div>'; return; }
    Object.keys(groups).forEach(function (t) {
      if (!groups[t].length) return;
      groups[t].sort(function (a, b) { return (a._r - b._r) || (a.n.length - b.n.length); });
      var show = groups[t].slice(0, 6);
      html += '<div class="sr-group"><h3>' + names[t] + '</h3>' + show.map(function (e) {
        return '<a class="sr-item" href="#/' + SEARCH_ROUTE[t] + '?focus=' + encodeURIComponent(e.id) + (e.m ? '&major=' + encodeURIComponent(e.m) : '') + '"><b>' + markHit(e.n, q, qq) + '</b><small>' + esc(e.s) + '</small></a>';
      }).join('') + '</div>';
    });
    palBox.innerHTML = html;
  }
  function bindCmdK() {
    document.addEventListener('keydown', function (e) {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        if (palEl && !palEl.hidden) closePalette(); else openPalette();
      }
    });
    var btn = document.getElementById('hubSearchBtn');
    if (btn) btn.addEventListener('click', openPalette);
  }

  /* ---------------- 时间线导出 .ics ----------------
     一次性导入日历（静态站无法订阅式自动更新）；事件标题区分官方/第三方/推算。 */
  function icsEscape(s) { return String(s == null ? '' : s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n'); }
  function exportTimelineICS() {
    var tl = window.HUB_TIMELINE || [];
    if (!tl.length) { alert('时间线数据未加载'); return; }
    var kindTag = { official: '官方', third: '第三方', estimate: '推算' };
    var modName = { kaoyan: '考研', gongkao: '考公', intern: '实习' };
    var lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//qiancheng-zhibei//timeline//CN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'X-WR-CALNAME:前程指北·三轨时间线'];
    var stamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    var n = 0;
    tl.forEach(function (t, i) {
      if (!t.start) return;
      var s = t.start.replace(/-/g, '');
      var ed = new Date((t.end || t.start) + 'T00:00:00'); ed.setDate(ed.getDate() + 1);
      var es = ed.toISOString().slice(0, 10).replace(/-/g, '');
      var tag = kindTag[t.kind] || '';
      var summary = '[' + (modName[t.module] || t.module) + (tag ? '·' + tag : '') + '] ' + (t.exam ? t.exam + ' ' : '') + t.stage;
      var basis = t.kind === 'official' ? '官方公告' : t.kind === 'third' ? '第三方口径' : '预计/推算，务必以当年官方通知为准';
      var desc = (t.notes ? t.notes + '\n' : '') + '口径: ' + basis + (t.source ? '\n来源: ' + t.source : '');
      lines.push('BEGIN:VEVENT', 'UID:qczb-tl-' + i + '@qiancheng-zhibei', 'DTSTAMP:' + stamp, 'DTSTART;VALUE=DATE:' + s, 'DTEND;VALUE=DATE:' + es, 'SUMMARY:' + icsEscape(summary), 'DESCRIPTION:' + icsEscape(desc), 'END:VEVENT');
      n++;
    });
    lines.push('END:VCALENDAR');
    var blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = '前程指北-三轨时间线.ics';
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
    if (window.toast) toast('已导出 ' + n + ' 个节点，导入日历即可（推算节点已标注）');
  }

  /* ---------------- 我的三轨看板 ----------------
     聚合三模块本机收藏/进度 + 三轨档案；可打印。无账号体系，数据只在本机。 */
  function renderDashboard(el) {
    function ls(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } }
    var kyFav = ls('fav') || [];
    var gkFav = ls('gk_favorites') || []; var gkTasks = ls('gk_tasks') || [];
    var itFav = ls('internship_favorites_v1') || [];
    var itProg = ls('internship_progress_v1') || {};
    var prof = ls('hub_profile_v1') || {};
    var itTracked = 0; Object.keys(itProg).forEach(function (k) { var v = itProg[k]; if (v && v !== 'none') itTracked++; });
    function card(mod, title, num, unit, href, sub) {
      return '<a class="dash-card" href="#/' + href + '"><div class="dash-mod">' + mod + '</div><div class="dash-num">' + num + '<small> ' + unit + '</small></div><div class="dash-title">' + title + '</div><div class="dash-sub">' + sub + '</div><span class="dash-go">进入 →</span></a>';
    }
    var profRows = '';
    var profLabels = { grad: '届别', major: '专业', score: '预估分', region: '意向地域', math: '数学基础' };
    var hasProf = false;
    Object.keys(profLabels).forEach(function (k) { if (prof[k]) { hasProf = true; profRows += '<div class="dash-prof-item"><span>' + profLabels[k] + '</span><b>' + esc(String(prof[k])) + '</b></div>'; } });
    el.innerHTML =
      '<div class="page-head"><div class="page-kicker">My Tracks</div><h2 class="page-title">我的三轨</h2>' +
      '<p class="page-sub">考研 / 考公 / 实习三条路的收藏与进度汇总。数据只保存在本机浏览器，可打印或导出备份；换设备请用各模块的导出/导入。</p>' +
      '<button class="chip dash-print" id="dashPrint" type="button">⎙ 打印 / 存 PDF</button></div>' +
      '<div class="dash-grid">' +
      card('考研', '收藏院校', kyFav.length, '所', 'kaoyan', '择校清单，冲稳保分档') +
      card('考公', '收藏岗位', gkFav.length, '个', 'gongkao', (gkTasks.length ? '另有 ' + gkTasks.length + ' 条备考任务' : '岗位对比与备考任务')) +
      card('实习', '收藏机构', itFav.length, '家', 'intern', (itTracked ? '已跟踪 ' + itTracked + ' 家投递进度' : '投递进度看板')) +
      '</div>' +
      '<div class="dash-prof"><h3>三轨档案</h3>' + (hasProf ? '<div class="dash-prof-grid">' + profRows + '</div>' : '<p class="hub-placeholder">尚未填写。到「路径决策」或任一模块填写一次，三模块自动预填。</p>') + '</div>' +
      '<div class="dash-note">提示：收藏与进度存于本机 localStorage，清除浏览器数据会丢失；重要清单请在各模块导出备份。</div>';
    el.querySelector('#dashPrint').addEventListener('click', function () { window.print(); });
    bindReveal(el);
  }

  /* ---------------- 关于 ---------------- */
  function renderAbout(el) {
    el.innerHTML =
      '<div class="page-head"><div class="page-kicker">About</div><h2 class="page-title">关于本站</h2></div>' +
      '<p class="about-lead reveal">前程指北是为 2026 Qoder 高校创造力大赛 StudyHack 赛道而作的一站式信息助手，开发与部署全程在 Qoder 中完成。</p>' +
      '<div class="about-sec reveal"><h3>为什么做</h3><div><p>作者是金融学专业大三学生，和同届人一样站在考研、考公、实习的三岔口：三条路的时间窗挤在同一学期，信息却散在研招网、公务员局专题站和几十家公司官网。</p>' +
      '<div class="pull-quote">信息差和错过的窗口，比努力与否更能决定结果。</div>' +
      '<p>所以有了这个把三条路放进同一个地方的产品。</p></div></div>' +
      '<div class="about-sec reveal"><h3>架构</h3><div>' +
      '<div class="diagram"><div class="box">外壳：导航 / 首页 / 路径决策 / 统一时间线 / 全局搜索</div><div class="arrow">↓ hash 路由挂载 · iframe 沙箱隔离</div><div class="mods"><span>考研择校</span><span>考公岗位</span><span>实习网申</span></div></div>' +
      '<p>三个业务模块以 iframe 沙箱嵌入统一外壳：样式与全局变量天然隔离，模块可以独立演进；外壳负责跨路径能力与统一视觉层。</p></div></div>' +
      '<div class="about-sec reveal"><h3>数据三条铁律</h3><div><ul>' +
      '<li>官方优先：简章、职位表、公告以官方渠道为准，逐条标注参考年份与出处链接。</li>' +
      '<li>留空不编：查不到可靠数据就留空或标「待核实」，空缺本身就是有效信息。</li>' +
      '<li>第三方标注：非官方口径一律后缀标明来源，不与官方数据混排。</li>' +
      '</ul></div></div>' +
      '<div class="about-sec reveal"><h3>数据怎么更新</h3><div><ul>' +
      '<li>考研：每年 9–10 月按各校招生简章分批核对（批次脚本幂等写入 + 缺口报告）。</li>' +
      '<li>考公：国考报名期统计每天自动检查官方专题一次，有新通报自动写回并提示。</li>' +
      '<li>实习：官网链接程序化巡检，时间窗按往年规律推算并明确标注。</li>' +
      '</ul><p>收藏与投递进度保存在本机浏览器，不收集任何个人数据；换设备可用各模块内「导出 / 导入备份」迁移。</p></div></div>' +
      '<div class="about-sec reveal"><h3>技术选型</h3><div><p>无框架原生实现：外壳 hash 路由 + iframe 沙箱、构建期生成的统一时间线（40 条）与全局搜索索引（87,104 条，含简称表与子序列匹配）、十题路径决策、三轨规划报告打印、可打印择校报告与 CSV 导出。全站静态资源 + 边缘缓存，打开即用。</p></div></div>' +
      '<div class="letter reveal"><p>三岔路没有标准答案，只有看清之后自己选的那条。如果这个站能让你在某个路口少一点迷茫、少踩一个坑、多赶上一次截止日期，它就没有白做。愿你的每一个选择，都通向光明的未来。</p>' +
      '<p class="sig" style="font-size:14px">数据问题、功能建议或任何疑问，随时联系作者：邮箱 <a href="mailto:3426493108@qq.com">3426493108@qq.com</a> · 微信 Zaiayn。</p></div>';
    bindReveal(el);
  }

  /* ---------------- 模块顶栏与路由 ---------------- */
  function moduleBar(name) {
    var st = window.HUB_STATS || {};
    var meta = MODULE_META[name];
    var stat = '';
    if (name === 'kaoyan') stat = '211 所金融院校 · 31 专业大类';
    else if (name === 'gongkao') stat = '81,182 个岗位 · 快照 ' + (st.gkSnapshot || st.generatedAt || '');
    else if (name === 'intern') stat = (st.internOpen || 0) + ' 家开放中' + (st.internClosing7 ? ' · 本周截止 ' + st.internClosing7 + ' 家' : '');
    return '<div class="module-bar"><button class="menu-btn" type="button" aria-label="打开导航菜单">☰</button><span class="dot"></span><b>' + meta.name + '</b><span class="stat">' + esc(stat) + '</span>' +
      '<button class="fs-btn" type="button" aria-pressed="false">全屏</button>' +
      '<a class="back" href="#/home">返回首页</a></div>';
  }

  /* 预热模块入口资源（HTML/JS/CSS，不含数据）：点进模块时只剩数据请求。
   * 资源清单从模块 HTML 里现读——JS/CSS 带 ?v= 版本号，写死在外壳里一定会和真实请求对不上。
   * 两个时机：①页面 load 后 1.2s 空闲把三个模块都过一遍；②鼠标悬停/按下某个模块入口时立刻只热它，
   * 这样即使首页还没空闲就点进去，也有几百毫秒的提前量。省流量场景（saveData / 2g）整体跳过。 */
  var warmedNames = Object.create(null);
  function isDataUrl(u) {
    return /\.(json|gz)(\?|$)/i.test(u) || /\/data\//i.test(u) || /(^|\/)data[^/]*\.js(\?|$)/i.test(u);
  }
  function frameUrl(name, query) {
    return FRAME_SRC[name] + '?' + (query ? query + '&' : '') + 'hubtheme=' + themePref();
  }
  function connAllowsWarm() {
    var conn = navigator.connection || navigator.mozConnection || {};
    return !conn.saveData && !(conn.effectiveType && !/^3g|^4g/.test(conn.effectiveType));
  }
  function warmModule(name) {
    if (!FRAME_SRC[name] || warmedNames[name] || !connAllowsWarm()) return;
    warmedNames[name] = true;
    /* 用和 mountFrame 完全一致的地址预热，否则带 hubtheme 参数的请求命不中缓存 */
    var url = frameUrl(name);
    /* HTML 必须取新的：拿到旧副本就会去预热已经不存在的资源（比如已改成按需加载的 xlsx） */
    fetch(url, { cache: 'reload' }).then(function (r) { return r.text(); }).then(function (html) {
      var doc = new DOMParser().parseFromString(html, 'text/html');
      var base = new URL(url, location.href).href;
      doc.querySelectorAll('script[src], link[href]').forEach(function (n) {
        var u = n.getAttribute('src') || n.getAttribute('href');
        if (!u || /^(https?:)?\/\//.test(u) || /^data:/.test(u)) return;
        var abs = new URL(u, base).href;
        if (isDataUrl(abs)) return;
        /* vendor 目录（字体 CSS / GSAP）外壳已经加载过，再热一遍纯属重复下载 */
        if (/\/vendor\//.test(abs)) return;
        /* force-cache：缓存里有就直接用，绝不为了「预热」再下一次 */
        fetch(abs, { cache: 'force-cache' }).catch(function () {});
      });
    }).catch(function () { warmedNames[name] = false; });
  }
  function warmModules() { Object.keys(FRAME_SRC).forEach(warmModule); }
  /* 悬停/按下模块入口就预热那一个：比等页面空闲更贴合真实意图 */
  function bindWarmIntent() {
    var onIntent = function (e) {
      var a = e.target && e.target.closest ? e.target.closest('a[href^="#/"]') : null;
      if (!a) return;
      var name = (a.getAttribute('href') || '').replace(/^#\//, '').split('?')[0];
      if (FRAME_SRC[name]) warmModule(name);
    };
    document.addEventListener('pointerover', onIntent, { passive: true });
    document.addEventListener('pointerdown', onIntent, { passive: true });
    document.addEventListener('touchstart', onIntent, { passive: true });
    document.addEventListener('focusin', onIntent);
  }
  function scheduleWarm() {
    bindWarmIntent();
    var go = function () {
      if (typeof requestIdleCallback === 'function') requestIdleCallback(warmModules, { timeout: 2500 });
      else warmModules();
    };
    if (document.readyState === 'complete') setTimeout(go, 1200);
    else window.addEventListener('load', function () { setTimeout(go, 1200); });
  }

  /* Service Worker：离线兜底。动态资源 network-first，在线永远最新（详见 sw.js）。
   * 仅在 https/localhost 注册；?nosw=1 注销全部 SW 作为退出开关。 */
  function registerSW() {
    if (!('serviceWorker' in navigator)) return;
    var secure = location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    if (!secure) return;
    if (/[?&]nosw=1/.test(location.search)) {
      navigator.serviceWorker.getRegistrations().then(function (rs) {
        rs.forEach(function (r) { r.unregister(); });
      }).catch(function () {});
      return;
    }
    navigator.serviceWorker.register('sw.js?v=' + HUB_BUILD).catch(function () {});
  }

  /* 按 name|query 缓存已挂载的帧：同一模块同一入口再次进来直接复用，不重新加载 */
  var frameCache = Object.create(null);
  function mountFrame(name, el, query) {
    var key = name + '|' + query;
    /* 同一时刻只显示一个模块 */
    Object.keys(frameCache).forEach(function (k) { if (k !== key) frameCache[k].wrap.hidden = true; });
    var hit = frameCache[key];
    if (hit) {
      hit.wrap.hidden = false;
      frame = hit.frame;
      /* 期间外壳可能换过主题/光标/沉浸态，复用时要重新同步一次 */
      try {
        frame.contentWindow.postMessage({ type: 'hub-theme', theme: themePref() }, location.origin);
        frame.contentWindow.postMessage({ type: 'hub-cursor-init', enabled: cursorEnabled }, location.origin);
        frame.contentWindow.postMessage({ type: 'hub-immersive', on: false }, location.origin);
      } catch (e) {}
      return;
    }
    var wrap = document.createElement('div');
    wrap.className = 'frame-wrap';
    wrap.innerHTML = moduleBar(name);
    frame = document.createElement('iframe');
    frame.className = 'hub-frame';
    frame.title = name;
    frame.loading = 'lazy';
    frame.dataset.src = frameUrl(name, query);
    /* 立刻开始加载：掀角转场还有约 0.5s 才揭开，iframe 的网络请求与解析正好藏在这段时间里。
     * 之前为了「别和转场抢主线程」延后 640ms 才给 src，结果揭开时模块还没开始下载，白等一秒多。 */
    frame.src = frame.dataset.src;
    var skel = document.createElement('div');
    skel.className = 'frame-skel';
    skel.setAttribute('aria-hidden', 'true');
    skel.innerHTML = '<div class="sk-title"></div><div class="sk-row"></div><div class="sk-row"></div><div class="sk-row"></div><div class="sk-block"></div>';
    wrap.appendChild(frame);
    wrap.appendChild(skel);
    el.appendChild(wrap);
    frameCache[key] = { wrap: wrap, frame: frame };
    /* 缓存上限：同一模块带不同 ?focus= 会各存一份，超过 4 个就把最早且当前不可见的移除 */
    var keys = Object.keys(frameCache);
    if (keys.length > 4) {
      var oldK = keys.find(function (k) { return frameCache[k].wrap.hidden; }) || keys[0];
      if (oldK !== key) {
        if (frameCache[oldK].wrap.parentNode) frameCache[oldK].wrap.remove();
        delete frameCache[oldK];
      }
    }
    frame.addEventListener('load', function () {
      frame.classList.add('ready');
      /* 考研的数据是异步 fetch 的，load 时列表还没渲染：正常靠 hub-module-ready 撤骨架，这里只兜底 */
      if (name === 'kaoyan') setTimeout(function () { if (skel.parentNode) skel.remove(); }, 1800);
      else if (skel.parentNode) skel.remove();
      try {
        frame.contentWindow.postMessage({ type: 'hub-theme', theme: themePref() }, location.origin);
        frame.contentWindow.postMessage({ type: 'hub-cursor-init', enabled: cursorEnabled }, location.origin);
      } catch (e) {}
    });
    var menu = wrap.querySelector('.menu-btn');
    if (menu) menu.addEventListener('click', openDrawer);
    var fsBtn = wrap.querySelector('.fs-btn');
    if (fsBtn) fsBtn.addEventListener('click', toggleImmersive);
  }

  /* 模块沉浸模式：iframe 铺满窗口，顶部条保留退出键；Esc 也可退出 */
  function setImmersive(on) {
    document.body.classList.toggle('immersive', on);
    document.querySelectorAll('.fs-btn').forEach(function (b) {
      b.textContent = on ? '退出全屏' : '全屏';
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    if (frame && frame.contentWindow) {
      try { frame.contentWindow.postMessage({ type: 'hub-immersive', on: on }, location.origin); } catch (e) {}
    }
    if (on && frame) { try { frame.focus(); } catch (e) {} }
  }
  function toggleImmersive() { setImmersive(!document.body.classList.contains('immersive')); }

  /* ---------------- 抽屉 / 主题控件 / 跨 iframe 消息 ---------------- */
  var drawer = document.getElementById('hubDrawer');
  var tabMore = document.getElementById('tabMore');
  function openDrawer() {
    if (!drawer) return;
    drawer.hidden = false;
    void drawer.offsetWidth;
    drawer.classList.add('open');
    if (tabMore) tabMore.setAttribute('aria-expanded', 'true');
  }
  function closeDrawer(immediate) {
    if (!drawer || drawer.hidden) return;
    drawer.classList.remove('open');
    if (tabMore) tabMore.setAttribute('aria-expanded', 'false');
    if (immediate) { drawer.hidden = true; return; }
    setTimeout(function () { if (!drawer.classList.contains('open')) drawer.hidden = true; }, 320);
  }

  window.addEventListener('message', function (e) {
    if (e.origin !== location.origin || !e.data) return;
    if (e.data.type === 'hub-cursor') {
      if (!frame || !cursorEnabled) { cursorBridge.active = false; return; }
      if (e.data.inside) {
        var r = frame.getBoundingClientRect();
        cursorBridge.active = true;
        cursorBridge.x = r.left + e.data.x;
        cursorBridge.y = r.top + e.data.y;
      } else cursorBridge.active = false;
    } else if (e.data.type === 'hub-theme-changed') {
      setShellTheme(e.data.theme, false);
    } else if (e.data.type === 'hub-bridge-ready') {
      try {
        e.source.postMessage({ type: 'hub-theme', theme: themePref() }, location.origin);
        e.source.postMessage({ type: 'hub-cursor-init', enabled: cursorEnabled }, location.origin);
      } catch (err) {}
    } else if (e.data.type === 'hub-module-ready') {
      /* 只撤当前活跃帧的骨架：其余模块的帧可能还藏着（保活缓存），不能误删 */
      var aw = frame && frame.parentNode;
      if (frame) frame.classList.add('ready');
      var sk = aw ? aw.querySelector('.frame-skel') : null;
      if (sk) sk.remove();
    }
  });

  /* 离屏暂停 ambient 动效（光点/跑马灯/叙事光束） */
  var ambientObs = ('IntersectionObserver' in window) ? new IntersectionObserver(function (ens) {
    ens.forEach(function (en) { en.target.classList.toggle('paused', !en.isIntersecting); });
  }, { threshold: 0 }) : null;
  function bindAmbient(el) {
    if (!ambientObs) return;
    var targets = [el.querySelector('.hero'), el.querySelector('.story')].filter(Boolean);
    targets.forEach(function (t) { ambientObs.observe(t); });
    onRouteCleanup(function () { targets.forEach(function (t) { ambientObs.unobserve(t); }); });
  }

  /* 流星：只在路径 / 时间线 / 搜索 / 关于四条非首页路由出现，低频、可降级 */
  var meteorLayer = null;
  function syncMeteors(name) {
    var want = ['path', 'timeline', 'search', 'about'].indexOf(name) > -1;
    if (!want || reduceMotion || shotMode) {
      if (meteorLayer) { meteorLayer.remove(); meteorLayer = null; }
      return;
    }
    if (meteorLayer) return;
    meteorLayer = document.createElement('div');
    meteorLayer.className = 'meteor-layer';
    meteorLayer.setAttribute('aria-hidden', 'true');
    meteorLayer.innerHTML =
      '<i class="meteor meteor--teal" style="--t:-8%;--l:-18%;--dur:11s;--delay:.6s"></i>' +
      '<i class="meteor meteor--brass" style="--t:6%;--l:-26%;--dur:13s;--delay:2.6s"></i>' +
      '<i class="meteor meteor--teal" style="--t:-14%;--l:6%;--dur:12s;--delay:4.8s"></i>' +
      '<i class="meteor meteor--brass" style="--t:22%;--l:-30%;--dur:14s;--delay:7s"></i>' +
      '<i class="meteor meteor--teal" style="--t:-4%;--l:-10%;--dur:10s;--delay:9.2s"></i>' +
      '<i class="meteor meteor--brass" style="--t:36%;--l:-22%;--dur:15s;--delay:11.4s"></i>';
    document.body.appendChild(meteorLayer);
  }

  var curtain = document.getElementById('curtain');
  function render() {
    flushRouteCleanups();
    endMotion();
    cursorBridge.active = false;
    document.body.classList.remove('immersive');
    closeDrawer(true);
    var raw = (location.hash || '#/home').replace(/^#\/?/, '');
    var name = raw.split('?')[0] || 'home';
    var query = raw.split('?')[1] || '';
    if (ROUTES.indexOf(name) === -1) name = 'home';
    var L = layers();
    document.body.setAttribute('data-route', name);
    syncMeteors(name);
    document.querySelectorAll('.hub-nav a, .hub-tabbar a, .hub-drawer-nav a').forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('data-route') === name);
    });
    window.scrollTo(0, 0);
    if (FRAME_SRC[name]) {
      /* 模块路由：帧层接管，内容层清空并隐藏 */
      L.route.hidden = true;
      L.route.innerHTML = '';
      L.frame.hidden = false;
      return mountFrame(name, L.frame, query);
    }
    /* 内容路由：只隐藏帧层（iframe 保活，不销毁），再渲染内容层 */
    L.frame.hidden = true;
    frame = null;
    L.route.hidden = false;
    var el = L.route;
    el.innerHTML = '';
    if (name === 'home') return renderHome(el);
    if (name === 'timeline') return renderTimeline(el);
    if (name === 'path') return renderPath(el);
    if (name === 'search') return renderSearch(el, query);
    if (name === 'dashboard') return renderDashboard(el);
    if (name === 'about') return renderAbout(el);
  }

  var navTl = null;
  var navRendered = false;
  function navigate() {
    if (!curtain || reduceMotion || shotMode) { render(); return; }
    if (motionOn()) {
      var peel = document.getElementById('peel');
      if (navTl) navTl.kill();
      navRendered = false;
      var doRender = function () { if (navRendered) return; navRendered = true; render(); };
      var collapsedBR = 'polygon(100% 100%, 100% 100%, 100% 100%, 100% 100%)';
      var fullRect = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)';
      var collapsedTL = 'polygon(0% 0%, 0% 0%, 0% 0%, 0% 0%)';
      if (!peel) { doRender(); return; }
      var rawHash = (location.hash || '#/home').replace(/^#\/?/, '');
      var dest = rawHash.split('?')[0] || 'home';
      if (ROUTES.indexOf(dest) < 0) dest = 'home';
      var pt = PEEL_THEME[dest] || PEEL_THEME.home;
      peel.style.setProperty('--peel-bg', pt.bg);
      peel.classList.toggle('peel--ink', !!pt.ink);
      document.body.classList.add('peeling');
      navTl = gsap.timeline({
        onComplete: function () { navTl = null; document.body.classList.remove('peeling'); gsap.set(peel, { clipPath: collapsedTL }); }
      });
      /* 掀角：纸从右下角斜扫上来盖住页面，盖满时换页，再从左上角收起；
       * 前缘带折痕高光与投影（filter: drop-shadow 跟随 clip-path）。约 1.0s。 */
      navTl
        .set(peel, { clipPath: collapsedBR })
        .to(peel, { clipPath: fullRect, duration: .46, ease: 'power2.inOut' })
        .add(doRender)
        .to(peel, { clipPath: collapsedTL, duration: .54, ease: 'power2.out' });
      setTimeout(function () {
        if (!navRendered) {
          if (navTl) { navTl.kill(); navTl = null; }
          document.body.classList.remove('peeling');
          gsap.set(peel, { clipPath: collapsedTL });
          doRender();
        }
      }, 1250);
      return;
    }
    curtain.classList.add('on');
    setTimeout(function () {
      render();
      requestAnimationFrame(function () { setTimeout(function () { curtain.classList.remove('on'); }, 60); });
    }, 200);
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (window.gsap && window.ScrollTrigger && !legacyMotion && !reduceMotion && !shotMode) {
      gsap.registerPlugin(ScrollTrigger);
      gsap.defaults({ duration: .5, ease: 'power2.out' });
      motionEnabled = true;
      document.documentElement.classList.add('gsap-motion');
    }
    initCursor();
    initHeader();
    initTilt();
    bindCmdK();
    bindReveal(document);
    applyShellTheme(themePref(), false);
    var themeBtn = document.getElementById('hubThemeBtn');
    if (themeBtn) themeBtn.addEventListener('click', function () {
      var order = ['light', 'dark', 'auto'];
      var next = order[(order.indexOf(themePref()) + 1) % order.length];
      setShellTheme(next, true);
    });
    if (tabMore) tabMore.addEventListener('click', openDrawer);
    var drawerClose = document.getElementById('drawerClose');
    if (drawerClose) drawerClose.addEventListener('click', function () { closeDrawer(false); });
    if (drawer) {
      drawer.addEventListener('click', function (e) {
        if (e.target.closest('.hub-drawer-nav a')) closeDrawer(false);
        var t = e.target.closest('.hub-drawer-theme [data-t]');
        if (t) setShellTheme(t.dataset.t, true);
      });
    }
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (document.body.classList.contains('immersive')) { setImmersive(false); return; }
      closeDrawer(false);
    });
    if (window.matchMedia) {
      var mq = matchMedia('(prefers-color-scheme: dark)');
      var onSys = function () { if (themePref() === 'auto') applyShellTheme('auto', true); };
      if (mq.addEventListener) mq.addEventListener('change', onSys);
    }
    document.body.setAttribute('data-route', (location.hash || '#/home').replace(/^#\/?/, '').split('?')[0] || 'home');
    render();
    scheduleWarm();
    registerSW();
  });
  window.addEventListener('hashchange', navigate);
})();
