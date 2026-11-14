/* 前程指北 Service Worker —— 离线缓存（version-aware）
 *
 * 设计红线（用户明确要求）：发布后绝不能让用户一直看到旧版。
 * 因此对 HTML/JS/CSS/JSON/数据一律 network-first：在线时强制 revalidate 拿最新，
 * 缓存只作「离线兜底」，永远不是在线的主来源。只有真正不可变的资源
 * （vendor 的 GSAP、字体、站内 UI 截图）才 cache-first。
 *
 * 版本不硬编码在本文件里：外壳用 sw.js?v=<HUB_BUILD> 注册，这里从自身 URL 读 v，
 * 缓存名 hub-<v>。发布时只要把外壳的 HUB_BUILD 与 shell.js/shell.css 的 ?v= 一起 bump，
 * 新 SW 安装即预缓存新核心、activate 清掉旧版本缓存。
 *
 * 退出开关：顶层页面带 ?nosw=1 时，外壳会注销所有 SW 且不再注册。 */

var VERSION = (new URL(self.location.href).searchParams.get('v')) || 'dev';
var CACHE = 'hub-' + VERSION;

/* 缓存条目上限：超出按插入序淘汰最旧的非核心条目，避免运行时缓存无限增长。
 * 核心路径（离线首页必需）永不淘汰。 */
var MAX_ENTRIES = 200;
var CORE_PATHS = ['/', '/index.html', '/shell.js', '/shell.css', '/shared/timeline-data.js', '/shared/hub-stats.js', '/shared/tokens.css', '/shared/hub-module.css', '/vendor/gsap.min.js', '/vendor/ScrollTrigger.min.js'];
function trimCache(cache) {
  cache.keys().then(function (keys) {
    var excess = keys.length - MAX_ENTRIES;
    if (excess <= 0) return;
    for (var i = 0; i < keys.length && excess > 0; i++) {
      var p = new URL(keys[i].url).pathname;
      if (CORE_PATHS.indexOf(p) >= 0) continue;
      cache.delete(keys[i]); excess--;
    }
  }).catch(function () {});
}

/* 不可变资源：同 URL 内容永不变，可放心 cache-first */
function isImmutable(url) {
  var p = url.pathname;
  return p.indexOf('/vendor/') === 0 || p.indexOf('/assets/') === 0 || p.indexOf('/fonts/') >= 0;
}

/* 离线兜底的外壳核心（带当前版本的 ?v=）。逐个 add，单个失败不拖垮整个 install。 */
function coreUrls() {
  return [
    './',
    'shell.js?v=' + VERSION,
    'shell.css?v=' + VERSION,
    'shared/timeline-data.js',
    'shared/hub-stats.js',
    'shared/tokens.css',
    'shared/hub-module.css',
    'vendor/gsap.min.js',
    'vendor/ScrollTrigger.min.js'
  ];
}

self.addEventListener('install', function (e) {
  e.waitUntil((function () {
    return caches.open(CACHE).then(function (cache) {
      return Promise.all(coreUrls().map(function (u) {
        return cache.add(new Request(u, { cache: 'reload' })).catch(function () {});
      }));
    }).then(function () { return self.skipWaiting(); });
  })());
});

self.addEventListener('activate', function (e) {
  e.waitUntil((function () {
    return caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) { if (k !== CACHE) return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); });
  })());
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;           // 跨域交给浏览器
  if (url.pathname.indexOf('/sw.js') === 0) return;           // 不缓存 SW 自身

  if (isImmutable(url)) {
    /* cache-first：命中直接回，未命中取网络并写入 */
    e.respondWith(caches.match(req).then(function (hit) {
      if (hit) return hit;
      return fetch(req).then(function (res) {
        if (res && res.status === 200 && res.type === 'basic') {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { return c.put(req, copy).then(function () { trimCache(c); }); }).catch(function () {});
        }
        return res;
      });
    }));
    return;
  }

  /* 其余一律 network-first：在线强制 revalidate（no-cache → 走 304，永远最新），
   * 失败才回退缓存；导航请求连缓存都没有时，回退到离线外壳首页。 */
  e.respondWith(
    fetch(req, { cache: 'no-cache' }).then(function (res) {
      if (res && res.status === 200 && res.type === 'basic') {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { return c.put(req, copy).then(function () { trimCache(c); }); }).catch(function () {});
      }
      return res;
    }).catch(function () {
      return caches.match(req).then(function (hit) {
        if (hit) return hit;
        if (req.mode === 'navigate') return caches.match('./');
        return Response.error();
      });
    })
  );
});