/* 重算首页枢纽统计 hub/shared/hub-stats.js 中的实习相关字段。
 *
 * 口径与模块一致：切片复用 hub/modules/intern/js/app.js 的 parseOne / parseWindow / companyStatus，
 * internOpen = state==='opening'（不含全年滚动），internRolling = state==='rolling'，
 * internClosing7 = 截止日为明确日期且剩余 ≤7 天的 opening 数量。
 *
 * 用法：
 *   node audit/recalc-hub-stats.mjs                 # 预演（先用旧快照自检，再打印新值）
 *   node audit/recalc-hub-stats.mjs --write         # 写回 hub-stats.js
 *   node audit/recalc-hub-stats.mjs --date 2026-11-11   # 指定统计基准日（默认今天）
 *
 * 自检：先用「不含 data-more6」的数据 + 文件里的 generatedAt 计算，结果必须与现有数字完全一致，
 * 否则说明口径已变，脚本会中止，不覆盖线上统计。 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const JS = path.join(root, 'hub/modules/intern/js');
const STATS = path.join(root, 'hub/shared/hub-stats.js');
const WRITE = process.argv.includes('--write');
const argDate = (() => { const i = process.argv.indexOf('--date'); return i >= 0 ? process.argv[i + 1] : null; })();

/* ---------- 与 app.js 同源的日期/状态逻辑（winter 赛季） ---------- */
const DAY_OF = { "上旬": 6, "中旬": 15, "下旬": 24, "初": 3, "中": 15, "底": 27, "末": 27 };
function parseOne(str, type) {
  if (!str) return null;
  const s = String(str).replace(/约|左右|2026年|2027年|每年|前后/g, '').trim();
  const iso = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (iso) return new Date(+iso[1], +iso[2] - 1, +iso[3]);
  const m = s.match(/(\d{1,2})\s*月(?:\s*(上旬|中旬|下旬|初|中|底|末)|\s*(\d{1,2})\s*日)?/);
  if (!m) return null;
  const month = parseInt(m[1], 10);
  let day = m[2] ? DAY_OF[m[2]] : (m[3] ? parseInt(m[3], 10) : 10);
  if (!day) day = 15;
  let year;
  if (/秋招|校招|校园招聘/.test(String(type || ''))) year = 2026;
  else if (type && type.indexOf('暑期') >= 0) year = month >= 9 ? 2026 : 2027;
  else year = month >= 9 ? 2026 : 2027;
  return new Date(year, month - 1, day);
}
const isRolling = s => /全年|滚动|长期|随时|常年在招/.test(String(s || ''));
const isUntilFilled = s => /招满即止|额满即止|岗位满即止/.test(String(s || ''));
function parseWindow(openStr, closeStr, type) {
  if (isRolling(openStr)) return { rolling: true };
  let open = parseOne(openStr, type);
  if (!open) return (isRolling(closeStr) || isUntilFilled(closeStr)) ? { rolling: true } : null;
  let close = parseOne(closeStr, type);
  if (!close && openStr && !isUntilFilled(closeStr)) {
    const parts = String(openStr).split(/[-—–~至]|到/);
    if (parts.length === 2) {
      let left = parts[0]; const right = parts[1];
      if (!/月/.test(left) && /月/.test(right)) left += '月';
      const rangeOpen = parseOne(left, type), rangeClose = parseOne(right, type);
      if (rangeOpen && rangeClose) { open = rangeOpen; close = rangeClose; }
    }
  }
  if (close && close < open) close = new Date(close.getFullYear() + 1, close.getMonth(), close.getDate());
  const untilFilled = !close && isUntilFilled(closeStr);
  return { open, close: close || (untilFilled ? null : new Date(open.getFullYear(), open.getMonth() + 1, open.getDate())), rolling: false, untilFilled };
}
function daysBetween(a, b) { return Math.round((b - a) / 86400000); }
function companyStatus(c, today) {
  const wins = [];
  (c.batches || []).forEach(b => { const w = parseWindow(b.open, b.close, b.type); if (w) wins.push({ batch: b, w }); });
  let best = null;
  const order = { opening: 0, rolling: 1, soon: 2, unknown: 3, closed: 4 };
  wins.forEach(it => {
    let st;
    if (it.w.rolling) st = { state: 'rolling', days: 0 };
    else {
      const o = it.w.open, cl = it.w.close;
      if (o && today >= o && (!cl || today <= cl)) st = { state: 'opening', days: cl ? daysBetween(today, cl) : null, precise: !!cl };
      else if (o && today < o) st = { state: 'soon', days: daysBetween(today, o) };
      else if (cl && today > cl) st = { state: 'closed', days: null };
      else st = { state: 'unknown', days: null };
    }
    if (!best || order[st.state] < order[best.state] || (st.state === 'soon' && best.state === 'soon' && st.days < best.days)) { st.batch = it; best = st; }
  });
  return best || { state: 'unknown', days: null, batch: null };
}

function loadCompanies(with6) {
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
  const order = ['data.plain.js', 'data-extra.js', 'data-more.js', 'data-more2.js', 'data-more3.js', 'data-more4.js', 'data-links.js', 'data-more5.js'];
  if (with6) order.push('data-more6.js');
  for (const f of order) {
    const p = path.join(JS, f);
    if (fs.existsSync(p)) vm.runInNewContext(fs.readFileSync(p, 'utf8'), sb, { filename: f });
  }
  return sb.window.DATA.companies;
}

function tally(companies, dayISO) {
  const today = new Date(dayISO + 'T00:00:00');
  const out = { open: 0, rolling: 0, soon: 0, closed: 0, unknown: 0, closing7: 0, total: companies.length };
  for (const c of companies) {
    const st = companyStatus(c, today);
    if (st.state === 'opening') {
      out.open++;
      if (st.days != null && st.days <= 7 && st.precise) out.closing7++;
    } else if (st.state === 'rolling') out.rolling++;
    else if (st.state === 'soon') out.soon++;
    else if (st.state === 'closed') out.closed++;
    else out.unknown++;
  }
  return out;
}

const src = fs.readFileSync(STATS, 'utf8');
const m = src.match(/window\.HUB_STATS = (\{[\s\S]*?\});/);
if (!m) { console.error('未找到 window.HUB_STATS'); process.exit(1); }
const cur = JSON.parse(m[1]);

/* 自检：用不含 data-more6 的数据 + 旧快照日期，必须复现旧值 */
const base = tally(loadCompanies(false), cur.generatedAt);
const expected = { open: cur.internOpen, rolling: cur.internRolling, closing7: cur.internClosing7, total: cur.internTotal };
const same = base.open === expected.open && base.rolling === expected.rolling &&
  base.closing7 === expected.closing7 && base.total === expected.total;
console.log('自检（不含 data-more6，基准日 ' + cur.generatedAt + '）：');
console.log(`  open ${base.open}/${expected.open}  rolling ${base.rolling}/${expected.rolling}  closing7 ${base.closing7}/${expected.closing7}  total ${base.total}/${expected.total}  → ${same ? '口径一致' : '不一致'}`);
if (!same) {
  console.error('中止：与现有 hub-stats 数字不一致，口径可能已变，未覆盖文件。');
  process.exit(1);
}

const day = argDate || new Date().toISOString().slice(0, 10);
const next = tally(loadCompanies(true), day);
console.log('\n新值（含 data-more6，基准日 ' + day + '）：');
console.log(`  total ${cur.internTotal} → ${next.total}`);
console.log(`  open ${cur.internOpen} → ${next.open}（不含全年滚动）`);
console.log(`  rolling ${cur.internRolling} → ${next.rolling}`);
console.log(`  closing7 ${cur.internClosing7} → ${next.closing7}`);
console.log(`  其他状态：soon ${next.soon}、closed ${next.closed}、unknown ${next.unknown}`);

const updated = Object.assign({}, cur, {
  generatedAt: day,
  internOpen: next.open,
  internRolling: next.rolling,
  internClosing7: next.closing7,
  internTotal: next.total
});
if (!WRITE) {
  console.log('\n（预演）未写文件；确认无误后加 --write 落盘。');
} else {
  const out = src.replace(m[1], JSON.stringify(updated));
  fs.writeFileSync(STATS, out, 'utf8');
  console.log('\n已写入 ' + path.relative(root, STATS));
}