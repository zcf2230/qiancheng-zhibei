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

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  var frame = null;

  function rootEl() { return document.getElementById('module-root'); }

  function mountFrame(name, el, query) {
    frame = document.createElement('iframe');
    frame.className = 'hub-frame';
    frame.title = name;
    frame.src = FRAME_SRC[name] + (query ? '?' + query : '');
    el.appendChild(frame);
  }

  function unmountFrame() {
    if (frame) { frame.remove(); frame = null; }
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
      items.push({
        m: 'intern',
        txt: st.internOpen + ' 家机构寒假实习正在开放网申（另有 ' + st.internRolling + ' 家全年滚动）',
        meta: st.internClosing7 ? st.internClosing7 + ' 家本周截止' : '滚动更新',
        href: '#/intern', urgent: !!st.internClosing7
      });
    }
    if (st.gkStatDate) {
      items.push({
        m: 'gongkao',
        txt: '国考报名过审人数已更新至 ' + st.gkStatDate + '：' + (st.gkPassed || 0).toLocaleString('en-US') + ' 人',
        meta: '竞争比可重算', href: '#/gongkao', urgent: false
      });
    }
    if (st.ky2027) {
      items.push({
        m: 'kaoyan',
        txt: '2027 简章信息已覆盖 ' + st.ky2027 + '/' + st.kyTotal + ' 所院校（科目 / 学费 / 拟招）',
        meta: '复试线明年 3 月批量更新', href: '#/kaoyan', urgent: false
      });
    }
    items.sort(function (a, b) { return (b.urgent ? 1 : 0) - (a.urgent ? 1 : 0); });
    return items.slice(0, 6);
  }

  /* ---------------- 首页 ---------------- */
  function countUp(el) {
    el.querySelectorAll('.hub-stat b').forEach(function (b) {
      var target = parseInt(b.getAttribute('data-n'), 10);
      if (!isFinite(target)) return;
      var fmt = function (v) { return v.toLocaleString('en-US'); };
      b.textContent = fmt(target);
      if (document.visibilityState !== 'visible') return;
      var t0 = null;
      function step(ts) {
        if (!t0) t0 = ts;
        var p = Math.min(1, (ts - t0) / 700);
        b.textContent = fmt(Math.round(target * p));
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }

  function renderHome(el) {
    var now = new Date();
    var upcoming = (window.HUB_TIMELINE || []).filter(function (t) {
      return t.end && new Date(t.end + 'T23:59:59') >= now;
    }).slice(0, 3);
    el.innerHTML =
      '<section class="hub-home-hero"><h1>前程指北</h1>' +
      '<p>考研、考公、实习，大学生毕业去向的三条路。把择校简章、岗位竞争度、网申时间线放在同一个地方，先看清再选择。</p>' +
      '<div class="hub-cta"><a class="hub-btn" href="#/path">开始路径决策</a>' +
      '<a class="hub-btn hub-btn-ghost" href="#/timeline">查看统一时间线</a>' +
      '<a class="hub-btn hub-btn-ghost" href="#/search">全局搜索</a></div>' +
      '<svg class="hub-hero-compass" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="46" fill="none" stroke="#fff" stroke-width="2"/><circle cx="50" cy="50" r="34" fill="none" stroke="#fff" stroke-width="1"/><path d="M50 12 L56 44 L50 50 L44 44 Z" fill="#fff"/><path d="M50 88 L44 56 L50 50 L56 56 Z" fill="#fff" opacity=".55"/><text x="50" y="9" text-anchor="middle" font-size="9" fill="#fff">北</text></svg>' +
      '</section>' +
      '<section class="hub-stats">' +
      '<div class="hub-stat"><b data-n="211">0</b><span>所金融考研院校</span></div>' +
      '<div class="hub-stat"><b data-n="16543">0</b><span>个考公岗位（截至 2026-10-28）</span></div>' +
      '<div class="hub-stat"><b data-n="1064">0</b><span>家实习机构</span></div>' +
      '<div class="hub-stat"><b data-n="36">0</b><span>个关键时间节点</span></div>' +
      '</section>' +
      (upcoming.length
        ? '<section class="hub-section"><h2>本期窗口</h2><div class="hub-tl-list">' + upcoming.map(function (t) {
            var meta = MODULE_META[t.module] || { name: t.exam, color: '#176b75' };
            return '<a class="hub-tl-row" href="#/' + t.module + '"><span class="hub-tl-dot" style="background:' + meta.color + '"></span>' +
              '<div class="hub-tl-body"><div class="hub-tl-head"><span class="hub-tl-date">' + (t.dateLabel || t.start || '') + '</span>' +
              '<span class="hub-tl-mod" style="color:' + meta.color + '">' + meta.name + ' · ' + t.exam + '</span>' + kindTag(t.kind) + daysBadge(t) + '</div>' +
              '<div class="hub-tl-stage">' + t.stage + '</div></div></a>';
          }).join('') + '</div></section>'
        : '') +
      '<section class="hub-section"><h2>本周行动清单</h2>' +
      '<p class="hub-page-sub">由统一时间线与三个库的最新统计自动汇总（统计口径 ' + ((window.HUB_STATS || {}).generatedAt || '') + '），点击直达对应模块。</p>' +
      '<div class="hub-tl-list">' + actionItems().map(function (it) {
        var meta = MODULE_META[it.m] || { name: it.m, color: '#176b75' };
        return '<a class="hub-tl-row' + (it.urgent ? ' hub-tl-now' : '') + '" href="' + it.href + '">' +
          '<span class="hub-tl-dot" style="background:' + meta.color + '"></span>' +
          '<div class="hub-tl-body"><div class="hub-tl-head"><span class="hub-tl-mod" style="color:' + meta.color + '">' + meta.name + '</span>' +
          '<span class="hub-kind' + (it.urgent ? ' hub-kind-now' : '') + '">' + it.meta + '</span></div>' +
          '<div class="hub-tl-stage">' + esc(it.txt) + '</div></div></a>';
      }).join('') + '</div></section>' +
      '<section class="hub-section"><h2>怎么用</h2><div class="hub-steps">' +
      '<div class="hub-step"><b>1</b><p>答十道路径决策题，拿到主推荐、维度理由与备选。</p></div>' +
      '<div class="hub-step"><b>2</b><p>看统一时间线，确认当前开放窗口与剩余天数。</p></div>' +
      '<div class="hub-step"><b>3</b><p>进模块深查：择校分档 / 筛岗看竞争比 / 按倒计时排投递。</p></div>' +
      '</div></section>' +
      '<section class="hub-section"><h2>数据新鲜度</h2><div class="hub-fresh">' +
      '<div class="hub-fresh-item"><b>考研择校</b><span>2027 简章项已核对（2026-10）· 复试线待 2027-03 更新</span></div>' +
      '<div class="hub-fresh-item"><b>考公岗位</b><span>数据快照 2026-10-28 · 国考报名期统计每日自动检查</span></div>' +
      '<div class="hub-fresh-item"><b>实习网申</b><span>数据整理 2026-10-28 · 430 条官网链接实测 · 3 天前巡检</span></div>' +
      '</div></section>' +
      '<section class="hub-section"><h2>数据与口径</h2><div class="hub-notes">' +
      '<p>官方优先：简章、职位表、公告以官方渠道为准，逐条标注参考年份与出处。</p>' +
      '<p>留空不编：查不到可靠数据就留空或标「待核实」，空缺本身就是有效信息。</p>' +
      '<p>第三方标注：非官方口径（如报名期统计）一律后缀标明来源，不与官方数据混排。</p>' +
      '</div></section>';
    countUp(el);
  }

  /* ---------------- 统一时间线 ---------------- */
  function daysBadge(t) {
    if (!t.start || !t.end) return '';
    var now = new Date();
    var s = new Date(t.start + 'T00:00:00');
    var e = new Date(t.end + 'T23:59:59');
    if (now >= s && now <= e) {
      return '<span class="hub-kind hub-kind-now">进行中 · 剩 ' + Math.ceil((e - now) / 86400000) + ' 天</span>';
    }
    if (now < s) {
      return '<span class="hub-kind">' + Math.ceil((s - now) / 86400000) + ' 天后开启</span>';
    }
    return '';
  }

  function kindTag(kind) {
    if (kind === 'official') return '<span class="hub-kind hub-kind-official">官方公告</span>';
    if (kind === 'third') return '<span class="hub-kind hub-kind-third">第三方口径</span>';
    return '<span class="hub-kind hub-kind-estimate">预计 / 推算</span>';
  }

  function timelineEntries(filter) {
    var now = new Date();
    return (window.HUB_TIMELINE || []).filter(function (t) {
      return filter === 'all' || t.module === filter;
    }).map(function (t) {
      var cur = t.start && t.end && now >= new Date(t.start + 'T00:00:00') && now <= new Date(t.end + 'T23:59:59');
      var meta = MODULE_META[t.module] || { name: t.exam };
      return '<div class="hub-tl-row' + (cur ? ' hub-tl-now' : '') + '">' +
        '<span class="hub-tl-dot" style="background:' + (meta.color || '#176b75') + '"></span>' +
        '<div class="hub-tl-body">' +
        '<div class="hub-tl-head"><span class="hub-tl-date">' + (t.dateLabel || t.start || '') + '</span>' +
        '<span class="hub-tl-mod" style="color:' + (meta.color || '#176b75') + '">' + meta.name + ' · ' + t.exam + '</span>' +
        kindTag(t.kind) + daysBadge(t) + '</div>' +
        '<div class="hub-tl-stage">' + t.stage + '</div>' +
        (t.notes ? '<div class="hub-tl-notes">' + t.notes + '</div>' : '') +
        '</div></div>';
    }).join('');
  }

  function renderTimeline(el) {
    el.innerHTML =
      '<h2 class="hub-page-title">统一时间线</h2>' +
      '<p class="hub-page-sub">考研 / 考公 / 实习三条路的关键节点按时间对齐。「官方公告」来自官方渠道，「预计 / 推算」按往年规律估算，投递与报考前务必以当年官方通知为准。</p>' +
      '<div class="hub-chips" id="tlChips">' +
      '<button class="hub-chip active" data-f="all">全部</button>' +
      '<button class="hub-chip" data-f="kaoyan">考研</button>' +
      '<button class="hub-chip" data-f="gongkao">考公</button>' +
      '<button class="hub-chip" data-f="intern">实习</button>' +
      '</div>' +
      '<div class="hub-tl-list" id="tlList"></div>';
    var list = el.querySelector('#tlList');
    list.innerHTML = timelineEntries('all');
    el.querySelector('#tlChips').addEventListener('click', function (e) {
      var b = e.target.closest('.hub-chip');
      if (!b) return;
      el.querySelectorAll('.hub-chip').forEach(function (c) { c.classList.toggle('active', c === b); });
      list.innerHTML = timelineEntries(b.dataset.f);
    });
  }

  /* ---------------- 路径决策 ---------------- */
  var QUIZ = [
    {
      dim: '毕业诉求', q: '1. 毕业后这几年，你最想要的是什么？',
      opts: [
        { t: '更深的学术训练与学历平台', s: { kaoyan: 3 } },
        { t: '稳定编制与长期确定性', s: { gongkao: 3 } },
        { t: '尽早进入行业攒真实经验', s: { intern: 3 } },
        { t: '还没想清楚，想先比较再选', s: { kaoyan: 1, gongkao: 1, intern: 1 } }
      ]
    },
    {
      dim: '学术兴趣', q: '2. 对读文献、写论文这类学术训练，你的真实感受是？',
      opts: [
        { t: '喜欢跟课题写论文，甚至考虑读博', s: { kaoyan: 3 } },
        { t: '一般，需要时能完成，谈不上热爱', s: { kaoyan: 1, gongkao: 1 } },
        { t: '更想解决具体业务问题，不想再写论文', s: { intern: 3 } }
      ]
    },
    {
      dim: '应试基础', q: '3. 数学与英语这两门硬科目，你现在的底子？',
      opts: [
        { t: '都扎实，应试型选手', s: { kaoyan: 3, gongkao: 1 } },
        { t: '一强一弱，需要针对性补', s: { kaoyan: 2, gongkao: 2 } },
        { t: '都弱或丢久了，不想从头捡', s: { intern: 3 } }
      ]
    },
    {
      dim: '时间投入', q: '4. 能拿出多少时间高强度备考？',
      opts: [
        { t: '能脱产或近乎脱产投入一年', s: { kaoyan: 3, gongkao: 2 } },
        { t: '只能课余 / 边实习边挤时间', s: { gongkao: 2, intern: 2 } },
        { t: '排斥长周期延迟满足，想要快反馈', s: { intern: 3 } }
      ]
    },
    {
      dim: '风险偏好', q: '5. 面对不确定性，你更接受哪种竞争形态？',
      opts: [
        { t: '一次押注一个目标，接受复试线波动', s: { kaoyan: 3 } },
        { t: '竞争比与进面分公开透明、可测算', s: { gongkao: 3 } },
        { t: '多线投递拿多个机会，比较后再选', s: { intern: 3 } }
      ]
    },
    {
      dim: '经济因素', q: '6. 经济上你的处境更接近？',
      opts: [
        { t: '家庭支持再读两三年，学费压力小', s: { kaoyan: 3 } },
        { t: '希望尽快经济独立、减轻家里负担', s: { intern: 3, gongkao: 1 } },
        { t: '居中，可接受短过渡期再定', s: { gongkao: 2, kaoyan: 1 } }
      ]
    },
    {
      dim: '地域偏好', q: '7. 未来三五年你想在哪里发展？',
      opts: [
        { t: '回本省 / 留家乡，地域资源重要', s: { gongkao: 3 } },
        { t: '去北上广深杭搏机会', s: { intern: 3, kaoyan: 1 } },
        { t: '无所谓，跟着目标（院校 / 岗位）走', s: { kaoyan: 2 } }
      ]
    },
    {
      dim: '年级窗口', q: '8. 你现在的年级 / 状态？',
      opts: [
        { t: '大二及以下，试错空间还大', s: { intern: 2, kaoyan: 1, gongkao: 1 } },
        { t: '大三，一年内必须定方向', s: { kaoyan: 2, gongkao: 2 } },
        { t: '大四 / gap / 在职，要尽快出结果', s: { gongkao: 2, intern: 2 } }
      ]
    },
    {
      dim: '已有资源', q: '9. 手里已经有的筹码是？',
      opts: [
        { t: '实习经历或留用 / return offer 线索', s: { intern: 3 } },
        { t: '竞赛、科研或论文经历', s: { kaoyan: 3 } },
        { t: '做过行测申论，有考公备考基础', s: { gongkao: 3 } },
        { t: '都没有，从零开始', s: { kaoyan: 1, gongkao: 1, intern: 1 } }
      ]
    },
    {
      dim: '五年画像', q: '10. 五年后你更希望自己是？',
      opts: [
        { t: '垂直领域的专家 / 研究者', s: { kaoyan: 3 } },
        { t: '体制内的骨干 / 公共服务者', s: { gongkao: 3 } },
        { t: '市场里的业务骨干 / 管理者', s: { intern: 3 } }
      ]
    }
  ];
  var PATH_INFO = {
    kaoyan: {
      name: '考研', why: '你倾向学历平台与深度备考，金融考研的择校信息（学费、学制、初试科目、复试线）能帮你把目标定准。',
      next: '下一步：用「考研择校」填预估分做冲稳保分档，圈定 3~5 所目标院校。', href: '#/kaoyan'
    },
    gongkao: {
      name: '考公', why: '你重视稳定与确定性，国考 / 选调 / 省考的岗位竞争度数据能帮你避开百里挑一的坑位。',
      next: '下一步：用「考公岗位」按专业 + 学历筛岗，看竞争比与进面分再决定报哪类。', href: '#/gongkao'
    },
    intern: {
      name: '实习', why: '你更信真实经验与多线机会，金融机构的网申窗口短而密，先投起来成本最低。',
      next: '下一步：用「实习网申」看当前开放的寒假 / 暑期批次，按倒计时排投递顺序。', href: '#/intern'
    }
  };

  function renderPath(el) {
    el.innerHTML =
      '<h2 class="hub-page-title">路径决策</h2>' +
      '<p class="hub-page-sub">十道题覆盖毕业诉求、学术兴趣、应试基础、时间投入、风险偏好、经济因素、地域、年级窗口、已有资源与五年画像，按你的偏好给考研 / 考公 / 实习打分，给出主推荐、维度理由与备选。规则透明，结果仅供参考。地址栏带 a= 参数时可复现同一份结果，便于分享。</p>' +
      '<div class="hub-quiz" id="quizBox"></div>' +
      '<div class="hub-path-result" id="pathResult"></div>' +
      '<div class="hub-section"><h2>我的三轨档案（可选）</h2>' +
      '<p class="hub-page-sub">只存在你这台设备的浏览器里。保存后重新进入三个模块会自动预填：考研的预估分 / 省份 / 数学科目，考公档案的届别 / 专业 / 地区，实习的城市筛选。</p>' +
      '<div class="hub-profile-form">' +
      '<label>毕业届别<select id="pfHubGrad"><option value="">不设</option><option>2027</option><option>2028</option><option>2029</option></select></label>' +
      '<label>专业<input id="pfHubMajor" type="text" placeholder="如：金融学"></label>' +
      '<label>预估总分<input id="pfHubScore" type="number" min="0" max="500" placeholder="如 370"></label>' +
      '<label>意向地域<input id="pfHubRegion" type="text" placeholder="如：浙江 / 上海"></label>' +
      '<label>考研数学<select id="pfHubMath"><option value="">不设</option><option>数三</option><option>396</option></select></label>' +
      '</div>' +
      '<button class="hub-btn" id="btnHubProfile">保存档案</button>' +
      '<div class="hub-profile-saved" id="hubProfileSaved"></div></div>';
    var answers = [];
    for (var i0 = 0; i0 < QUIZ.length; i0++) answers.push(null);
    var lastResult = null;
    var pre = (location.hash.match(/a=([\d,]+)/) || [])[1];
    if (pre) {
      pre.split(',').forEach(function (v, i) { if (i < QUIZ.length && QUIZ[i].opts[+v]) answers[i] = +v; });
    }
    var box = el.querySelector('#quizBox');
    box.innerHTML = QUIZ.map(function (item, qi) {
      return '<div class="hub-quiz-q"><div class="hub-quiz-title">' + item.q + '</div>' +
        item.opts.map(function (o, oi) {
          return '<label class="hub-quiz-opt"><input type="radio" name="q' + qi + '" value="' + oi + '"' + (answers[qi] === oi ? ' checked' : '') + '><span>' + o.t + '</span></label>';
        }).join('') + '</div>';
    }).join('');
    box.addEventListener('change', function (e) {
      if (e.target.type !== 'radio') return;
      answers[+e.target.name.slice(1)] = +e.target.value;
      updateResult();
    });
    function updateResult() {
      if (answers.some(function (a) { return a === null; })) {
        el.querySelector('#pathResult').innerHTML = '<div class="hub-placeholder">答完十题后这里给出推荐路径与维度理由。</div>';
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
      var upcoming = (window.HUB_TIMELINE || []).filter(function (t) {
        return t.module === top && t.end && new Date(t.end + 'T23:59:59') >= new Date();
      }).slice(0, 2).map(function (t) {
        return '<li>' + (t.dateLabel || t.start) + ' · ' + t.stage + '</li>';
      }).join('');
      el.querySelector('#pathResult').innerHTML =
        '<div class="hub-path-card">' +
        '<div class="hub-path-top">主推荐：' + info.name + ' <span class="hub-path-score">' + score[top] + ' 分</span></div>' +
        '<p>' + info.why + '</p>' +
        (reasons[top].length ? '<div class="hub-path-next"><b>你的选择里支持这个推荐的维度</b><ul>' +
          reasons[top].map(function (r) { return '<li>' + esc(r) + '</li>'; }).join('') + '</ul></div>' : '') +
        (upcoming ? '<div class="hub-path-next"><b>近期关键节点</b><ul>' + upcoming + '</ul></div>' : '') +
        '<p class="hub-path-next-line">' + info.next + '</p>' +
        '<a class="hub-btn" href="' + info.href + '">进入' + info.name + '模块</a>' +
        '<button class="hub-btn" id="btnHubReport" style="margin-left:8px;background:var(--hub-surface);color:var(--hub-primary);border:1px solid var(--hub-primary)">生成三轨规划报告（打印/PDF）</button>' +
        '</div>' +
        '<div class="hub-path-alt">备选：' + PATH_INFO[second].name + '（' + score[second] + ' 分）——' + PATH_INFO[second].why + '</div>';
    }

    function buildReport() {
      if (!lastResult) return;
      var r = lastResult;
      var top = r.order[0];
      var info = PATH_INFO[top];
      var upcoming = (window.HUB_TIMELINE || []).filter(function (t) {
        return t.module === top && t.end && new Date(t.end + 'T23:59:59') >= new Date();
      });
      var old = el.querySelector('#hubReport');
      if (old) old.remove();
      var div = document.createElement('div');
      div.id = 'hubReport';
      div.innerHTML =
        '<h2>前程指北 · 三轨规划报告</h2>' +
        '<p class="hub-path-next-line">生成于 ' + new Date().toLocaleDateString('zh-CN') + ' · 决策得分：考研 ' + r.score.kaoyan + ' / 考公 ' + r.score.gongkao + ' / 实习 ' + r.score.intern + ' · 主推荐：' + info.name + '</p>' +
        (r.reasons[top].length ? '<p><b>支持推荐的维度</b></p><ul>' + r.reasons[top].map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' : '') +
        '<p><b>推荐路径近期关键节点</b></p>' +
        (upcoming.length
          ? '<table class="hub-report-table"><thead><tr><th>时间</th><th>节点</th><th>口径</th></tr></thead><tbody>' + upcoming.map(function (t) {
              return '<tr><td>' + esc(t.dateLabel || t.start) + '</td><td>' + esc(t.stage) + '</td><td>' + (t.kind === 'official' ? '官方公告' : (t.kind === 'third' ? '第三方口径' : '预计/推算')) + '</td></tr>';
            }).join('') + '</tbody></table>'
          : '<p>暂无</p>') +
        '<p><b>三轨对照</b></p>' +
        '<table class="hub-report-table"><thead><tr><th>维度</th><th>考研</th><th>考公</th><th>实习</th></tr></thead><tbody>' +
        '<tr><td>典型准备周期</td><td>10–12 个月，可脱产</td><td>3–6 个月，可兼顾</td><td>边做边投，滚动窗口</td></tr>' +
        '<tr><td>竞争形态</td><td>一次初试+复试，线波动</td><td>岗位公开，竞争比可测算</td><td>多线并行，offer 比较</td></tr>' +
        '<tr><td>成本与回报</td><td>学费+机会成本 → 学历平台</td><td>笔试+面试 → 稳定编制</td><td>无额外成本 → 薪资与留用</td></tr>' +
        '<tr><td>结果确定性</td><td>较低（复试线波动）</td><td>中（数据透明）</td><td>较高（多保底）</td></tr>' +
        '</tbody></table>' +
        '<p class="hub-path-next-line">数据口径：官方优先、留空不编、第三方标注。本报告由前程指北路径决策自动生成，仅供参考。</p>';
      el.appendChild(div);
      document.body.classList.add('report-mode');
      var clear = function () {
        document.body.classList.remove('report-mode');
        window.removeEventListener('afterprint', clear);
      };
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
    updateResult();
  }

  /* ---------------- 全局搜索 ---------------- */
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
  function renderSearch(el, query) {
    var q0 = decodeURIComponent((query.match(/q=([^&]*)/) || [])[1] || '');
    el.innerHTML =
      '<h2 class="hub-page-title">全局搜索</h2>' +
      '<p class="hub-page-sub">一个搜索框同时命中考研院校、考公岗位与实习机构（构建期索引 17,819 条），点击结果直达对应模块并定位。</p>' +
      '<div class="hub-search-box"><input id="searchInput" type="search" placeholder="搜院校 / 招录机关 / 职位 / 公司，如：北大 税务局 中信" value="' + esc(q0) + '"></div>' +
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
        var n = e.n.toLowerCase();
        var s = e.s.toLowerCase();
        var rank = Math.min(rankOf(n, s, qq), rankOf(n, s, q));
        if (rank < 0) continue;
        e._r = rank;
        if (groups[e.t].length < 30) groups[e.t].push(e);
      }
      var names = { k: '考研院校', g: '考公岗位', i: '实习机构' };
      var html = '';
      var total = groups.k.length + groups.g.length + groups.i.length;
      if (!total) { box.innerHTML = '<div class="hub-placeholder">没有匹配结果，试试更短的关键词（如城市名、机关名、公司简称）。</div>'; return; }
      Object.keys(groups).forEach(function (t) {
        if (!groups[t].length) return;
        groups[t].sort(function (a, b) { return (a._r - b._r) || (a.n.length - b.n.length); });
        var show = groups[t].slice(0, 15);
        html += '<div class="hub-search-group"><h3>' + names[t] + '（' + groups[t].length + (groups[t].length > show.length ? '+' : '') + '）</h3>' +
          show.map(function (e) {
            return '<a class="hub-search-item" href="#/' + SEARCH_ROUTE[t] + '?focus=' + encodeURIComponent(e.id) + '"><b>' + esc(e.n) + '</b><small>' + esc(e.s) + '</small></a>';
          }).join('') + '</div>';
      });
      box.innerHTML = html;
    }
    input.addEventListener('input', function () {
      if (timer) clearTimeout(timer);
      timer = setTimeout(run, 150);
    });
    run();
  }

  /* ---------------- 关于本站 ---------------- */
  function renderAbout(el) {
    el.innerHTML =
      '<h2 class="hub-page-title">关于本站</h2>' +
      '<p class="hub-page-sub">前程指北是为 2026 Qoder 高校创造力大赛 StudyHack 赛道而作的一站式信息助手，开发与部署全程在 Qoder 中完成。</p>' +
      '<div class="hub-about-sec"><h3>为什么做</h3><p>作者是金融学专业大三学生，和同届人一样站在考研、考公、实习的三岔口：三条路的时间窗挤在同一学期，信息却散在研招网、公务员局专题站和几十家公司官网。信息差和错过窗口，比努力与否更能决定结果——所以有了这个把三条路放进同一个地方的产品。</p></div>' +
      '<div class="hub-about-sec"><h3>架构：外壳 + iframe 沙箱</h3>' +
      '<div class="hub-about-diagram">' +
      '<div class="hub-about-box">外壳 shell：导航 / 首页 / 路径决策 / 统一时间线 / 全局搜索</div>' +
      '<div class="hub-about-arrow">↓ hash 路由挂载 · 三层能力各自独立演进 ↓</div>' +
      '<div class="hub-about-mods"><span>考研择校</span><span>考公岗位</span><span>实习网申</span></div>' +
      '</div>' +
      '<p>三个业务模块以 iframe 沙箱嵌入统一外壳：样式与全局变量天然隔离，模块可以独立演进而不互相拖累；外壳负责跨路径能力与统一视觉层（shared/hub-module.css）。</p></div>' +
      '<div class="hub-about-sec"><h3>数据三条铁律</h3><ul>' +
      '<li>官方优先：简章、职位表、公告以官方渠道为准，逐条标注参考年份与出处链接。</li>' +
      '<li>留空不编：查不到可靠数据就留空或标「待核实」，空缺本身就是有效信息。</li>' +
      '<li>第三方标注：非官方口径一律后缀标明来源（如「第三方」），不与官方数据混排。</li>' +
      '</ul></div>' +
      '<div class="hub-about-sec"><h3>数据怎么更新</h3><ul>' +
      '<li>考研：每年 9–10 月按各校招生简章分批核对（批次脚本幂等写入 + 体检表报告缺口）。</li>' +
      '<li>考公：国考报名期统计每天自动检查官方专题一次，有新通报自动写回并提示。</li>' +
      '<li>实习：官网链接程序化巡检（最近一次 3 天前），时间窗按往年规律推算并明确标注。</li>' +
      '</ul><p>收藏与投递进度保存在你本机浏览器里，不收集任何个人数据；换设备时可用各模块内的「导出 / 导入备份」迁移。云端账号同步为赛后迭代方向。</p></div>' +
      '<div class="hub-about-sec"><h3>技术选型与实现</h3><p>整体采用无框架原生实现：外壳 hash 路由 + iframe 沙箱、构建期生成的统一时间线（36 条）与全局搜索索引（17,819 条，含简称表与子序列匹配）、十题路径决策打分、三轨规划报告打印、可打印的择校报告与 CSV 导出。全站为静态资源 + 边缘缓存，打开即用、无需安装。</p></div>' +
      '<div class="hub-about-sec"><h3>作者的话</h3>' +
      '<p>三岔路没有标准答案，只有看清之后自己选的那条。如果这个站能让你在某个路口少一点迷茫、少踩一个坑、多赶上一次截止日期，它就没有白做。愿你的每一个选择，都通向光明的未来。</p>' +
      '<p>数据问题、功能建议或任何疑问，随时联系作者：邮箱 <b>3426493108@qq.com</b> · 微信 <b>Zaiayn</b>。</p></div>';
  }

  /* ---------------- 路由 ---------------- */
  function render() {
    var raw = (location.hash || '#/home').replace(/^#\/?/, '');
    var name = raw.split('?')[0] || 'home';
    var query = raw.split('?')[1] || '';
    if (ROUTES.indexOf(name) === -1) name = 'home';
    unmountFrame();
    var el = rootEl();
    el.innerHTML = '';
    document.querySelectorAll('.hub-nav a').forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('data-route') === name);
    });
    if (name === 'home') { renderHome(el); return; }
    if (name === 'timeline') { renderTimeline(el); return; }
    if (name === 'path') { renderPath(el); return; }
    if (name === 'search') { renderSearch(el, query); return; }
    if (name === 'about') { renderAbout(el); return; }
    mountFrame(name, el, query);
  }

  window.addEventListener('hashchange', render);
  document.addEventListener('DOMContentLoaded', render);
})();
