/* 把实习的数据脚本在构建期合并成 JSON.gz：
 *   基础包 data-base.json.gz  ← data.plain.js（1064 家，首屏用）
 *   全量包 data-full.json.gz  ← 全部 9 个数据脚本（3523 家）
 * 运行时只需 fetch + JSON.parse，避免在低端设备上编译 2.9MB JS 把主线程卡住。
 * 数据源仍是各 data-*.js（保持可核查的原始字段与出处），改完数据后重跑本脚本。
 *
 * 用法：node tools/build-intern-data.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const JS = path.join(root, 'hub/modules/intern/js');
const ORDER = ['data.plain.js', 'data-extra.js', 'data-more.js', 'data-more2.js', 'data-more3.js', 'data-more4.js', 'data-links.js', 'data-more5.js', 'data-more6.js'];

function run(files) {
  const sb = {
    window: {}, console,
    localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
    document: {
      createElement: () => ({ style: {}, classList: { add() {}, remove() {}, toggle() {} }, setAttribute() {}, appendChild() {} }),
      getElementById: () => null, querySelector: () => null, querySelectorAll: () => [],
      addEventListener() {}, head: { appendChild() {} }
    },
    location: { hash: '', search: '' }, setTimeout: () => 0,
    fetch: () => Promise.resolve({ json: () => Promise.resolve({}) })
  };
  sb.globalThis = sb;
  for (const f of files) {
    const p = path.join(JS, f);
    if (!fs.existsSync(p)) continue;
    vm.runInNewContext(fs.readFileSync(p, 'utf8'), sb, { filename: f });
  }
  if (!sb.window.DATA || !Array.isArray(sb.window.DATA.companies)) throw new Error('数据脚本没有产出 window.DATA.companies');
  return sb.window.DATA;
}

function write(name, data) {
  const json = JSON.stringify(data);
  const gz = zlib.gzipSync(Buffer.from(json), { level: 9 });
  fs.writeFileSync(path.join(JS, name + '.json.gz'), gz);
  console.log(`${name}.json.gz  ${data.companies.length} 家  ${(gz.length / 1024).toFixed(0)} KB（原始 ${(json.length / 1024).toFixed(0)} KB）`);
  return gz.length;
}

const base = run(['data.plain.js']);
const full = run(ORDER);
if (base.companies.length > full.companies.length) throw new Error('基础包比全量包还大，数据顺序异常');
write('data-base', base);
write('data-full', full);
console.log('提示：数据有变更时，记得同步递增 hub/modules/intern/js/app.js 里的 DATA_BUNDLE_V，避免旧缓存。');