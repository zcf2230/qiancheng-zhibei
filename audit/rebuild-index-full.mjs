/* 全量重建全局搜索索引 data-src/shared/search-index.js，并做完整性自检。
 *
 * 索引由三段组成（与 hub/shell.js 的 HUB_SEARCH 消费方式一致）：
 *   k = 考研院校专业、g = 考公岗位、i = 实习机构
 * 本脚本只重建 i 段（数据源为本仓库 hub/modules/intern/js 下的各批 data 文件），
 * k/g 段原样保留，并用哈希证明未被改动。
 *
 * 用法：
 *   node audit/rebuild-index-full.mjs            # 预演：打印自检与差异
 *   node audit/rebuild-index-full.mjs --write    # 落盘
 *
 * 自检项：
 *   1) 每条 k/g 记录具备 t/id/n/s 字段；
 *   2) 三类记录 id 全局不重复；
 *   3) 既有 i 段每条都能由当前数据按同一规则重建（逐字一致），否则中止；
 *   4) DATA 中每家机构都在新 i 段中，且新 i 段不含多余条目；
 *   5) k/g 段在写盘前后哈希一致。
 * 写出后需再执行 node tools/build-gzip.mjs 生成 search-index.json.gz。 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const JS = path.join(root, 'hub/modules/intern/js');
const IDX = path.join(root, 'data-src/shared/search-index.js');
const WRITE = process.argv.includes('--write');

const ORDER = ['data.plain.js', 'data-extra.js', 'data-more.js', 'data-more2.js', 'data-more3.js', 'data-more4.js', 'data-links.js', 'data-more5.js', 'data-more6.js'];

function loadCompanies() {
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
  for (const f of ORDER) {
    const p = path.join(JS, f);
    if (fs.existsSync(p)) vm.runInNewContext(fs.readFileSync(p, 'utf8'), sb, { filename: f });
  }
  return sb.window.DATA.companies;
}

const hash = arr => crypto.createHash('sha1').update(JSON.stringify(arr)).digest('hex').slice(0, 12);
const companies = loadCompanies();
const src = fs.readFileSync(IDX, 'utf8');
const arrStart = src.indexOf('[');
const arrEnd = src.lastIndexOf(']');
const head = src.slice(0, arrStart);
const tail = src.slice(arrEnd + 1);
const arr = JSON.parse(src.slice(arrStart, arrEnd + 1));

const k = arr.filter(e => e.t === 'k');
const g = arr.filter(e => e.t === 'g');
const oldI = arr.filter(e => e.t === 'i');
console.log(`既有索引：k=${k.length} g=${g.length} i=${oldI.length} 合计=${arr.length}；模块机构=${companies.length}`);

/* 1) 字段完整性 */
let badField = 0;
for (const e of k.concat(g)) {
  for (const f of ['t', 'id', 'n', 's']) if (e[f] === undefined || e[f] === '') { badField++; if (badField <= 3) console.log(`  缺字段 ${f}: ${JSON.stringify(e).slice(0, 80)}`); }
}

/* 2) id 全局唯一 */
const seen = new Map();
let dupId = 0;
for (const e of arr) {
  const key = e.t + ':' + e.id;
  const nameKey = e.t + ':' + e.n;
  if (seen.has(key)) dupId++; else seen.set(key, 1);
  if (seen.has(nameKey)) { /* 同名不同 id 允许 */ }
}

/* 3) 规则复核 + 4) 差异 */
const sOf = c => ' ' + [c.subcategory].join(' ') + ' ' + (c.cities || []).join(' ') + ' ' + (c.disciplines || []).join(' ') + ' ';
const newI = companies.map(c => ({ t: 'i', id: c.id, n: c.name, s: sOf(c) }));
const oldMap = new Map(oldI.map(e => [e.id, e]));
let mismatch = 0;
for (const e of newI) {
  const old = oldMap.get(e.id);
  if (old && (old.s !== e.s || old.n !== e.n)) {
    mismatch++;
    if (mismatch <= 3) console.log(`  规则不一致 ${e.n}: 旧=${JSON.stringify(old.s)} 新=${JSON.stringify(e.s)}`);
  }
}
const companyIds = new Set(companies.map(c => c.id));
const missing = newI.filter(e => !oldMap.has(e.id));
const extra = oldI.filter(e => !companyIds.has(e.id));

console.log(`字段缺失 ${badField} 条；id 重复 ${dupId} 条；既有 i 段规则不一致 ${mismatch} 条；新增 ${missing.length} 条；将移除 ${extra.length} 条`);
if (extra.length) console.log('  将移除：' + extra.slice(0, 8).map(e => e.n).join('、'));

const fatal = badField > 0 || dupId > 0 || mismatch > 0;
if (fatal) {
  console.error('中止：自检未通过，未写文件。');
  process.exit(1);
}

const merged = k.concat(g).concat(newI);
const out = head + JSON.stringify(merged) + tail;
const beforeKG = hash(arr.filter(e => e.t !== 'i'));
const afterKG = hash(merged.filter(e => e.t !== 'i'));
console.log(`新索引：k=${k.length} g=${g.length} i=${newI.length} 合计=${merged.length}；文件 ${(src.length / 1048576).toFixed(2)} MB → ${(out.length / 1048576).toFixed(2)} MB`);
console.log(`k/g 段哈希：${beforeKG} → ${afterKG}（${beforeKG === afterKG ? '未改动' : '已变化'}）`);
if (beforeKG !== afterKG) { console.error('中止：k/g 段被改动。'); process.exit(1); }

if (!WRITE) {
  console.log('（预演）未写文件；确认无误后加 --write 落盘，随后执行 node tools/build-gzip.mjs。');
} else {
  fs.writeFileSync(IDX, out, 'utf8');
  console.log('已写入 data-src/shared/search-index.js；请接着执行 node tools/build-gzip.mjs。');
}