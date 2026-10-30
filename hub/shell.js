(function () {
  'use strict';
  window.HubModules = window.HubModules || {};
  var ROUTES = ['home', 'timeline', 'path', 'search', 'about', 'kaoyan', 'gongkao', 'intern'];
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
  var frame = null;
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  var shotMode = /[?&]shot=1/.test(location.search);
  if (shotMode) document.documentElement.classList.add('no-anim');
  if (isTouch) document.body.classList.add('touch');

  function rootEl() { return document.getElementById('module-root'); }
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
      tx = e.clientX; ty = e.clientY;
      var dx = tx - lx, dy = ty - ly;
      if (dx * dx + dy * dy > 4) { angle = Math.atan2(dy, dx) * 180 / Math.PI + 90; lx = tx; ly = ty; }
    }, { passive: true });
    (function loop() {
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
    out.push(['全局搜索', '17,819 条索引覆盖三条路']);
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

  var STORY = [
    { m: 'kaoyan', k: '第一轨道', t: '考研', d: '一次押注，换更高的平台。简章、学费学制、初试科目、复试线，逐条标年份和出处——不用在几十个网页之间来回对照。', stats: [['211', '所院校覆盖'], ['8', '个关键节点']], go: '进入考研择校' },
    { m: 'gongkao', k: '第二轨道', t: '考公', d: '国考与三省选调、省考岗位全库，竞争比和进面分公开可算。先把门槛卡死，再谈分数——别在资格不符的岗位上浪费一年。', stats: [['16,543', '个岗位'], ['5', '类考试']], go: '进入考公岗位' },
    { m: 'intern', k: '第三轨道', t: '实习', d: '1,064 家机构的网申批次与倒计时，投递进度板上墙。截止日期密的时候，顺序比努力更重要。', stats: [['254', '家开放中'], ['1,064', '家收录']], go: '进入实习网申' }
  ];

  function renderHome(el) {
    var st = window.HUB_STATS || {};
    var mq = marqueeItems();
    var mqHtml = mq.concat(mq).map(function (x) { return '<span><b>' + esc(x[0]) + '</b>' + esc(x[1]) + '</span>'; }).join('');
    el.innerHTML =
      '<section class="hero">' +
        '<div class="hero-aurora"><i></i><i></i><i></i></div><div class="hero-lights">' + lights(16) + '</div>' +
        '<svg class="hero-compass" viewBox="0 0 200 200" fill="none" aria-hidden="true">' +
          '<circle cx="100" cy="100" r="92" stroke="rgba(242,239,230,.25)" stroke-width="1"/>' +
          '<circle cx="100" cy="100" r="64" stroke="rgba(242,239,230,.14)" stroke-width="1"/>' +
          '<path d="M100 24 L112 88 L100 100 L88 88 Z" fill="#37C2B4"/>' +
          '<path d="M100 176 L88 112 L100 100 L112 112 Z" fill="rgba(242,239,230,.28)"/>' +
          '<text x="100" y="18" text-anchor="middle" font-size="13" fill="rgba(242,239,230,.7)" font-family="serif">北</text>' +
        '</svg>' +
        '<div class="hero-inner">' +
          '<div class="hero-eyebrow">2026 Qoder 高校创造力大赛 · StudyHack</div>' +
          '<h1 id="heroTitle">前程指北</h1>' +
          '<p class="hero-lead">考研、考公、实习——三条路的时间窗挤在同一个学期。把择校简章、岗位竞争度、网申时间线放进同一个地方，先看清，再选择。</p>' +
          '<div class="hero-cta">' +
            '<a class="btn btn-primary magnet" href="#/path">开始路径决策<span class="arr">→</span></a>' +
            '<a class="btn btn-ghost magnet" href="#/timeline">查看统一时间线<span class="arr">→</span></a>' +
          '</div>' +
        '</div>' +
        '<div class="hero-marquee"><div class="hero-marquee-track">' + mqHtml + '</div></div>' +
        '<div class="hero-scroll">SCROLL</div>' +
      '</section>' +

      '<section class="section reveal"><div class="bento">' +
        '<div class="bento-card"><u>考研</u><b data-n="211">0</b><span>所金融考研院校</span></div>' +
        '<div class="bento-card"><u>考公</u><b data-n="16543">0</b><span>个岗位（截至 2026-10-28）</span></div>' +
        '<div class="bento-card"><u>实习</u><b data-n="1064">0</b><span>家机构收录</span></div>' +
        '<div class="bento-card"><u>时间线</u><b data-n="36">0</b><span>个关键节点</span></div>' +
      '</div></section>' +

      '<section class="section reveal"><div class="section-head"><div><div class="section-kicker">Now</div><h2>本周行动清单</h2></div>' +
      '<p class="section-sub">由统一时间线与三个库的最新统计自动汇总（口径 ' + esc(st.generatedAt || '') + '），紧急项优先。</p></div>' +
      '<div class="actions">' + actionItems().map(function (it) {
        var meta = MODULE_META[it.m] || { name: it.m };
        return '<a class="action' + (it.urgent ? ' urgent' : '') + '" href="' + it.href + '">' +
          '<span class="action-tag">' + esc(meta.name) + '</span>' +
          '<span class="action-text">' + esc(it.txt) + '</span>' +
          '<span class="action-meta">' + esc(it.meta) + '</span></a>';
      }).join('') + '</div></section>' +

      '<section class="story" id="storySec">' +
        '<div class="story-pin"><div class="story-bg"><div class="hero-lights">' + lights(9) + '</div></div>' +
          '<div class="story-inner">' +
            '<div class="story-index"><span class="big" id="storyNum">01</span><div class="dots" id="storyDots"><i class="on"></i><i></i><i></i></div></div>' +
            '<div class="story-panels" id="storyPanels">' +
              STORY.map(function (s) {
                return '<article class="story-panel' + (s === STORY[0] ? ' on' : '') + '"><div class="k">' + s.k + '</div><h3>' + s.t + '</h3><p>' + s.d + '</p>' +
                  '<div class="stat">' + s.stats.map(function (x) { return '<div><b>' + x[0] + '</b><span>' + x[1] + '</span></div>'; }).join('') + '</div>' +
                  '<a class="go" href="#/' + s.m + '">' + s.go + ' →</a></article>';
              }).join('') +
            '</div>' +
          '</div>' +
        '</div>' +
      '</section>' +

      '<section class="section reveal"><div class="section-head"><div><div class="section-kicker">How</div><h2>三步用起来</h2></div></div>' +
      '<div class="steps">' +
        '<div class="step reveal d1"><b>01</b><p>答十道路径决策题，拿到主推荐、维度理由与备选。</p></div>' +
        '<div class="step reveal d2"><b>02</b><p>看统一时间线，确认本周窗口和剩余天数。</p></div>' +
        '<div class="step reveal d3"><b>03</b><p>进对应模块深查：择校分档、筛岗看竞争比、按倒计时排投递。</p></div>' +
      '</div></section>' +

      '<section class="section reveal"><div class="editorial">' +
        '<div class="ed-card"><div class="stamp">数据新鲜度</div><div class="fresh-grid">' +
          '<div class="fresh-item"><b>考研择校</b><span>2027 简章项已核对（2026-10）· 复试线待 2027-03</span></div>' +
          '<div class="fresh-item"><b>考公岗位</b><span>快照 2026-10-28 · 国考统计每日自动检查</span></div>' +
          '<div class="fresh-item"><b>实习网申</b><span>整理 2026-10-28 · 430 条官网链接实测</span></div>' +
        '</div></div>' +
        '<div class="ed-card"><div class="stamp">数据与口径</div><ul>' +
          '<li>官方优先：简章、职位表、公告以官方渠道为准，逐条标注年份与出处。</li>' +
          '<li>留空不编：查不到可靠数据就留空或标「待核实」。</li>' +
          '<li>第三方标注：非官方口径一律后缀标明来源。</li>' +
          '<li>零账号：收藏与进度只留在你自己的浏览器。</li>' +
        '</ul></div>' +
      '</div></section>';

    var h1 = el.querySelector('#heroTitle');
    if (h1 && !reduceMotion && !shotMode) {
      var txt = h1.textContent;
      h1.innerHTML = txt.split('').map(function (c, i) { return '<span class="ch" style="--i:' + i + '">' + c + '</span>'; }).join('');
    }
    countUp(el);
    bindReveal(el);
    initStory(el);
    initMagnet(el);
  }

  function initStory(el) {
    var sec = el.querySelector('#storySec');
    if (!sec) return;
    var panels = Array.prototype.slice.call(el.querySelectorAll('.story-panel'));
    var dots = Array.prototype.slice.call(el.querySelectorAll('#storyDots i'));
    var num = el.querySelector('#storyNum');
    var last = -1;
    function update() {
      var r = sec.getBoundingClientRect();
      var total = sec.offsetHeight - window.innerHeight;
      var p = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0;
      var idx = Math.min(panels.length - 1, Math.floor(p * panels.length * 0.999));
      if (idx === last) return;
      last = idx;
      panels.forEach(function (pn, i) { pn.classList.toggle('on', i === idx); });
      dots.forEach(function (d, i) { d.classList.toggle('on', i === idx); });
      if (num) num.textContent = '0' + (idx + 1);
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
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
  function renderTimeline(el) {
    el.innerHTML =
      '<div class="page-head"><div class="page-kicker">Timeline</div><h2 class="page-title">统一时间线</h2>' +
      '<p class="page-sub">考研 / 考公 / 实习三条路的关键节点按时间对齐。「官方公告」来自官方渠道，「预计 / 推算」按往年规律估算，报考与投递前务必以当年官方通知为准。</p></div>' +
      '<div class="chips" id="tlChips"><button class="chip active" data-f="all">全部</button>' +
      '<button class="chip" data-f="kaoyan">考研</button><button class="chip" data-f="gongkao">考公</button><button class="chip" data-f="intern">实习</button></div>' +
      '<div class="tl-wrap"><div class="tl-progress"><i id="tlFill"></i></div><div class="tl-list" id="tlList"></div></div>';
    var list = el.querySelector('#tlList');
    list.innerHTML = timelineRows('all');
    bindReveal(el);
    el.querySelector('#tlChips').addEventListener('click', function (e) {
      var b = e.target.closest('.chip');
      if (!b) return;
      el.querySelectorAll('.chip').forEach(function (c) { c.classList.toggle('active', c === b); });
      list.innerHTML = timelineRows(b.dataset.f);
    });
    var fill = el.querySelector('#tlFill');
    function onScroll() {
      var wrap = el.querySelector('.tl-wrap');
      if (!wrap || !fill) return;
      var r = wrap.getBoundingClientRect();
      var total = r.height;
      var seen = Math.min(total, Math.max(0, window.innerHeight * 0.35 - r.top));
      fill.style.height = (total > 0 ? Math.min(100, seen / total * 100) : 0) + '%';
    }
    window.addEventListener('scroll', onScroll, { passive: true });
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
    kaoyan: { name: '考研', why: '你倾向学历平台与深度备考，金融考研的择校信息能帮你把目标定准。', next: '下一步：用「考研择校」填预估分做冲稳保分档，圈定 3~5 所目标院校。', href: '#/kaoyan' },
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
      '<div class="quiz" id="quizBox"></div>' +
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

    var box = el.querySelector('#quizBox');
    box.innerHTML = QUIZ.map(function (item, qi) {
      return '<div class="q-card reveal" data-qi="' + qi + '"><div class="q-title"><span style="color:var(--teal);font-size:12px;letter-spacing:.14em">' + esc(item.dim) + '</span><br>' + esc(item.q) + '</div>' +
        item.opts.map(function (o, oi) {
          return '<label class="q-opt"><input type="radio" name="q' + qi + '" value="' + oi + '"' + (answers[qi] === oi ? ' checked' : '') + '><span>' + esc(o.t) + '</span></label>';
        }).join('') + '</div>';
    }).join('');

    var lastResult = null;
    var countEl = el.querySelector('#qCount');
    var fillEl = el.querySelector('#qFill');

    function updateProgress() {
      var done = answers.filter(function (a) { return a !== null; }).length;
      countEl.textContent = done + ' / ' + QUIZ.length;
      fillEl.style.width = (done / QUIZ.length * 100) + '%';
      el.querySelectorAll('.q-card').forEach(function (c, i) { c.classList.toggle('answered', answers[i] !== null); });
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
        if (reduceMotion) ring.style.setProperty('--p', pct);
        else {
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

    box.addEventListener('change', function (e) {
      if (e.target.type !== 'radio') return;
      answers[+e.target.name.slice(1)] = +e.target.value;
      updateProgress();
      updateResult();
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
    updateProgress();
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
  function markHit(text, q) {
    if (!q) return esc(text);
    var i = text.toLowerCase().indexOf(q.toLowerCase());
    if (i < 0) return esc(text);
    return esc(text.slice(0, i)) + '<mark>' + esc(text.slice(i, i + q.length)) + '</mark>' + esc(text.slice(i + q.length));
  }
  function renderSearch(el, query) {
    var q0 = decodeURIComponent((query.match(/q=([^&]*)/) || [])[1] || '');
    el.innerHTML =
      '<div class="page-head"><div class="page-kicker">Search</div><h2 class="page-title">全局搜索</h2>' +
      '<p class="page-sub">一个搜索框同时命中考研院校、考公岗位与实习机构，共 17,819 条索引；点击结果直达模块并自动定位。</p></div>' +
      '<div class="palette"><input id="searchInput" type="search" placeholder="搜院校 / 招录机关 / 职位 / 公司，如：北大 税务局 中信" value="' + esc(q0) + '"><kbd>ESC 清空</kbd></div>' +
      '<div id="searchResults"></div>';
    var input = el.querySelector('#searchInput');
    var box = el.querySelector('#searchResults');
    var timer = null;
    function run() {
      var q = input.value.trim().toLowerCase();
      if (!q) { box.innerHTML = '<div class="hub-placeholder">输入关键词开始搜索。</div>'; return; }
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
            return '<a class="sr-item" href="#/' + SEARCH_ROUTE[t] + '?focus=' + encodeURIComponent(e.id) + '"><b>' + markHit(e.n, q) + '</b><small>' + esc(e.s) + '</small></a>';
          }).join('') + '</div>';
      });
      box.innerHTML = html;
    }
    input.addEventListener('input', function () { if (timer) clearTimeout(timer); timer = setTimeout(run, 140); });
    input.addEventListener('keydown', function (e) { if (e.key === 'Escape') { input.value = ''; run(); } });
    if (!isTouch) setTimeout(function () { input.focus(); }, 80);
    run();
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
      '<div class="about-sec reveal"><h3>技术选型</h3><div><p>无框架原生实现：外壳 hash 路由 + iframe 沙箱、构建期生成的统一时间线（36 条）与全局搜索索引（17,819 条，含简称表与子序列匹配）、十题路径决策、三轨规划报告打印、可打印择校报告与 CSV 导出。全站静态资源 + 边缘缓存，打开即用。</p></div></div>' +
      '<div class="letter reveal"><p>三岔路没有标准答案，只有看清之后自己选的那条。如果这个站能让你在某个路口少一点迷茫、少踩一个坑、多赶上一次截止日期，它就没有白做。愿你的每一个选择，都通向光明的未来。</p>' +
      '<p class="sig" style="font-size:14px">数据问题、功能建议或任何疑问，随时联系作者：邮箱 <a href="mailto:3426493108@qq.com">3426493108@qq.com</a> · 微信 Zaiayn。</p></div>';
    bindReveal(el);
  }

  /* ---------------- 模块顶栏与路由 ---------------- */
  function moduleBar(name) {
    var st = window.HUB_STATS || {};
    var meta = MODULE_META[name];
    var stat = '';
    if (name === 'kaoyan') stat = '211 所院校 · 2027 简章已核对';
    else if (name === 'gongkao') stat = '16,543 个岗位 · 快照 ' + (st.generatedAt || '');
    else if (name === 'intern') stat = (st.internOpen || 0) + ' 家开放中' + (st.internClosing7 ? ' · 本周截止 ' + st.internClosing7 + ' 家' : '');
    return '<div class="module-bar"><span class="dot"></span><b>' + meta.name + '</b><span class="stat">' + esc(stat) + '</span>' +
      '<a class="back" href="#/home">返回首页</a></div>';
  }

  function mountFrame(name, el, query) {
    var wrap = document.createElement('div');
    wrap.innerHTML = moduleBar(name);
    frame = document.createElement('iframe');
    frame.className = 'hub-frame';
    frame.title = name;
    frame.loading = 'lazy';
    frame.src = FRAME_SRC[name] + (query ? '?' + query : '');
    wrap.appendChild(frame);
    el.appendChild(wrap);
  }

  var curtain = document.getElementById('curtain');
  function render() {
    var raw = (location.hash || '#/home').replace(/^#\/?/, '');
    var name = raw.split('?')[0] || 'home';
    var query = raw.split('?')[1] || '';
    if (ROUTES.indexOf(name) === -1) name = 'home';
    if (frame) { frame.remove(); frame = null; }
    var el = rootEl();
    el.innerHTML = '';
    document.body.setAttribute('data-route', name);
    document.querySelectorAll('.hub-nav a').forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('data-route') === name);
    });
    window.scrollTo(0, 0);
    if (name === 'home') return renderHome(el);
    if (name === 'timeline') return renderTimeline(el);
    if (name === 'path') return renderPath(el);
    if (name === 'search') return renderSearch(el, query);
    if (name === 'about') return renderAbout(el);
    mountFrame(name, el, query);
  }

  function navigate() {
    if (!curtain || reduceMotion) { render(); return; }
    curtain.classList.add('on');
    setTimeout(function () {
      render();
      requestAnimationFrame(function () { setTimeout(function () { curtain.classList.remove('on'); }, 60); });
    }, 200);
  }

  document.addEventListener('DOMContentLoaded', function () {
    initCursor();
    initHeader();
    initTilt();
    bindReveal(document);
    document.body.setAttribute('data-route', (location.hash || '#/home').replace(/^#\/?/, '').split('?')[0] || 'home');
    render();
  });
  window.addEventListener('hashchange', navigate);
})();
