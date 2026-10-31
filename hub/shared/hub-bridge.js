/* 前程指北 · 外壳 ↔ 模块桥接（只读状态与指针坐标，不做高度同步）
 * 主题：接收外壳 hub-theme，调用模块自己的 HubTheme.set（会同步 localStorage 与开关高亮）。
 * 光标：把模块内指针坐标回传外壳，让彗尾在 iframe 内连续；进入模块时隐藏原生光标。
 * 独立打开（非 iframe）时桥接自动休眠。 */
(function () {
  'use strict';
  if (window.parent === window) return;
  var ORIGIN = location.origin;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var touch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  window.addEventListener('message', function (e) {
    if (e.origin !== ORIGIN || !e.data) return;
    if (e.data.type === 'hub-theme' && window.HubTheme && typeof window.HubTheme.set === 'function') {
      window.HubTheme.set(e.data.theme);
    } else if (e.data.type === 'hub-cursor-init') {
      setCursor(!!e.data.enabled && !reduce && !touch);
    }
  });

  var cursorOn = false, raf = 0, lx = 0, ly = 0;
  function send(inside) {
    try { window.parent.postMessage({ type: 'hub-cursor', x: lx, y: ly, inside: inside }, ORIGIN); } catch (err) {}
  }
  function onMove(e) {
    lx = e.clientX; ly = e.clientY;
    if (raf) return;
    raf = requestAnimationFrame(function () { raf = 0; send(true); });
  }
  function onLeave() { if (raf) { cancelAnimationFrame(raf); raf = 0; } send(false); }
  function setCursor(on) {
    if (on === cursorOn) return;
    cursorOn = on;
    document.documentElement.classList.toggle('custom-cursor', on);
    if (on) {
      document.addEventListener('pointermove', onMove, { passive: true });
      document.addEventListener('pointerleave', onLeave);
      window.addEventListener('blur', onLeave);
    } else {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('blur', onLeave);
      onLeave();
    }
  }

  try { window.parent.postMessage({ type: 'hub-bridge-ready', module: document.documentElement.getAttribute('data-module') || '' }, ORIGIN); } catch (e) {}
})();