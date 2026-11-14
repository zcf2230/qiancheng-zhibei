/* 本地起服务做一次冒烟：页面与关键资源是否 200、关键脚本是否在页面里。用完自动关服务。
 * 用法：node audit/smoke-hub.mjs */
import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const child = spawn(process.execPath, [path.join(root, 'tools/serve-hub.js')], { stdio: ['ignore', 'pipe', 'pipe'] });
const wait = ms => new Promise(r => setTimeout(r, ms));

let ready = false;
child.stdout.on('data', d => { if (String(d).includes('8123')) ready = true; });

await wait(1200);
if (!ready) await wait(800);

const urls = [
  ['/', 'hub 首页'],
  ['/shell.js', '外壳脚本'],
  ['/shell.css', '外壳样式'],
  ['/sw.js', 'Service Worker'],
  ['/modules/intern/', '实习模块页'],
  ['/modules/kaoyan/renderer/', '考研模块页'],
  ['/modules/gongkao/', '考公模块页'],
  ['/modules/intern/js/data-more6.js', '新增数据'],
  ['/modules/intern/js/app.js', '模块逻辑'],
  ['/shared/hub-stats.js', '首页统计'],
  ['/shared/search-index.json.gz', '搜索索引 gz']
];
let fail = 0;
for (const [u, label] of urls) {
  try {
    const r = await fetch('http://127.0.0.1:8123' + u);
    const body = u.endsWith('.gz') ? null : await r.text();
    const size = body == null ? 'binary' : body.length + 'B';
    const has = u === '/modules/intern/' ? body.includes('js/data-more6.js') : '';
    console.log(`${r.status}  ${label.padEnd(10)} ${u}  ${size}${has ? '  含 data-more6 引入' : ''}`);
    if (r.status !== 200 || (has === false)) fail++;
  } catch (e) {
    console.log(`ERR  ${label}  ${u}  ${e.message}`);
    fail++;
  }
}

/* 静态检查：模块页是否具备渲染所需的容器与脚本顺序 */
try {
  const html = await (await fetch('http://127.0.0.1:8123/modules/intern/')).text();
  const ids = ['companyList', 'statStrip', 'searchBox', 'discPanel', 'disciplineFilters', 'subFilters', 'categoryFilters'];
  const missing = ids.filter(id => !html.includes('id="' + id + '"'));
  const order = ['data.plain.js', 'data-more5.js', 'data-more6.js', 'app.js'].map(f => html.indexOf(f));
  const ordered = order.every((v, i) => v >= 0 && (i === 0 || v > order[i - 1]));
  console.log(`渲染容器缺失: ${missing.length ? missing.join(',') : '无'}；脚本顺序 data→more5→more6→app ${ordered ? '正确' : '异常'}`);
  if (missing.length || !ordered) fail++;
  const scripts = (html.match(/<script src="js\//g) || []).length;
  console.log(`模块页共加载 ${scripts} 个 js 文件`);
} catch (e) {
  console.log('页面检查失败: ' + e.message);
  fail++;
}

/* 搜索索引完整性：解压计数 + 三类齐全 + id 无重复 */
try {
  const gz = fs.readFileSync(path.join(root, 'hub/shared/search-index.json.gz'));
  const arr = JSON.parse(zlib.gunzipSync(gz).toString('utf8'));
  const c = {}; for (const e of arr) c[e.t] = (c[e.t] || 0) + 1;
  const okTypes = c.k > 0 && c.g > 0 && c.i > 0;
  const noDup = new Set(arr.map(e => e.t + ':' + e.id)).size === arr.length;
  console.log(`索引条目 ${arr.length}（k=${c.k} g=${c.g} i=${c.i}）；三类齐全 ${okTypes ? '是' : '否'}；id 无重复 ${noDup ? '是' : '否'}`);
  if (!okTypes || !noDup) fail++;
} catch (e) { console.log('索引校验失败: ' + e.message); fail++; }

/* 外壳版本一致性：index.html 引用的 shell.js/css?v= 与 HUB_BUILD 一致 */
try {
  const html = fs.readFileSync(path.join(root, 'hub/index.html'), 'utf8');
  const shell = fs.readFileSync(path.join(root, 'hub/shell.js'), 'utf8');
  const build = (shell.match(/HUB_BUILD = '([^']+)'/) || [])[1];
  const refOk = html.includes('shell.js?v=' + build) && html.includes('shell.css?v=' + build);
  console.log(`HUB_BUILD=${build}；index.html 引用一致 ${refOk ? '是' : '否'}`);
  if (!build || !refOk) fail++;
} catch (e) { console.log('版本校验失败: ' + e.message); fail++; }

child.kill();
await wait(400);
console.log(fail ? `冒烟失败 ${fail} 项` : '冒烟通过：页面与资源均 200，容器齐全，脚本顺序正确，索引与版本一致');
process.exit(fail ? 1 : 0);