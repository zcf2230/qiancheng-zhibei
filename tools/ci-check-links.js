/* 实习机构官网链接巡检（模块 js/link-status.json 的生成器）。
 *
 * 用法：
 *   node tools/ci-check-links.js                 # 全量巡检
 *   node tools/ci-check-links.js --limit 50      # 只查前 50 家（调试）
 *   node tools/ci-check-links.js --concurrency 8
 *
 * 产物只含公司 id、状态、连续失败次数、首次失败日期与失败原因——不含公司名与 URL，
 * 因此可以安全放进公开仓库。模块读不到该文件时一切照旧，巡检只是锦上添花。
 *
 * 判定：2xx/3xx 视为 ok；超时/5xx/网络错误记 warn；404/410/DNS 不存在或连续失败 ≥3 次记 bad。
 * 连续失败次数从上一份 link-status.json 继承，成功即清零。 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const JS = path.join(root, 'hub/modules/intern/js');
const OUT = path.join(JS, 'link-status.json');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const argv = process.argv.slice(2);
const flag = (n, d) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : d; };
const LIMIT = +flag('limit', 0);
const CONC = +flag('concurrency', 6);
const TIMEOUT = +flag('timeout', 15000);

/* 按模块的加载顺序执行数据脚本，拿到合并后的 companies（含各批扩量与链接补充） */
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
  const order = ['data.plain.js', 'data-extra.js', 'data-more.js', 'data-more2.js', 'data-more3.js', 'data-more4.js', 'data-links.js', 'data-more5.js', 'data-more6.js'];
  for (const f of order) {
    const p = path.join(JS, f);
    if (fs.existsSync(p)) vm.runInNewContext(fs.readFileSync(p, 'utf8'), sb, { filename: f });
  }
  return sb.window.DATA?.companies || [];
}

async function probe(url) {
  const c = new AbortController();
  const to = setTimeout(() => c.abort(), TIMEOUT);
  try {
    const r = await fetch(url, { signal: c.signal, redirect: 'follow', headers: { 'User-Agent': UA, 'Accept-Language': 'zh-CN,zh;q=0.9' } });
    // 只读头部即可判活，避免把整站 HTML 拉下来
    try { await r.arrayBuffer(); } catch {}
    if (r.status >= 200 && r.status < 400) return { s: 'ok', why: '' };
    if (r.status === 404 || r.status === 410) return { s: 'bad', why: 'HTTP ' + r.status };
    return { s: 'warn', why: 'HTTP ' + r.status };
  } catch (e) {
    const code = (e.cause && e.cause.code) || e.name || 'ERR';
    const hard = /ENOTFOUND|EAI_AGAIN|ERR_TLS_CERT_ALTNAME_INVALID|CERT_HAS_EXPIRED/.test(code);
    return { s: hard ? 'bad' : 'warn', why: code };
  } finally { clearTimeout(to); }
}

const companies = loadCompanies().filter(c => c.applyLink);
const targets = LIMIT ? companies.slice(0, LIMIT) : companies;
const prev = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : { entries: {} };
const today = new Date().toISOString().slice(0, 10);
const entries = { ...(prev.entries || {}) };
const summary = { total: targets.length, ok: 0, warn: 0, bad: 0 };

let cursor = 0, done = 0;
await Promise.all(Array.from({ length: CONC }, async () => {
  while (cursor < targets.length) {
    const c = targets[cursor++];
    const r = await probe(c.applyLink);
    const old = entries[c.id];
    if (r.s === 'ok') {
      delete entries[c.id];                       // 成功即清除历史失败记录
    } else {
      const f = (old?.f || 0) + 1;
      const s = (r.s === 'bad' || f >= 3) ? 'bad' : 'warn';
      entries[c.id] = { s, f, first: old?.first || today, why: r.why };
      r.s = s;
    }
    summary[r.s]++;
    done++;
    if (done % 50 === 0) console.log(`  ...${done}/${targets.length} ok=${summary.ok} warn=${summary.warn} bad=${summary.bad}`);
  }
}));

fs.writeFileSync(OUT, JSON.stringify({ checkedAt: new Date().toISOString(), summary, entries }, null, 1) + '\n');
console.log(`巡检 ${targets.length} 家：ok=${summary.ok} warn=${summary.warn} bad=${summary.bad} → ${path.relative(root, OUT)}`);