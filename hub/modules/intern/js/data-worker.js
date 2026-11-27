/* 实习全部数据在 Worker 里解析：2.9MB 脚本的编译/执行不阻塞主线程。
 * 两阶段回传：先 data.plain（1064 家）让首屏尽快可见，再合并扩展数据回传全量。 */
self.window = self;
self.document = { addEventListener: function () {} };
self.onmessage = function (e) {
  var files = (e.data && e.data.files) || [];
  var base = (e.data && e.data.base) || [];
  try {
    self.DATA = { companies: base };
    if (files.length) {
      self.importScripts(files[0]);
      self.postMessage({ ok: true, phase: "base", data: self.DATA });
      if (files.length > 1) self.importScripts.apply(self, files.slice(1));
    } else {
      self.postMessage({ ok: true, phase: "base", data: self.DATA });
    }
    self.postMessage({ ok: true, phase: "full", data: self.DATA });
  } catch (err) {
    self.postMessage({ ok: false, error: String((err && err.message) || err) });
  }
};