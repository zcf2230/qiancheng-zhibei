import fs from 'node:fs';
import zlib from 'node:zlib';

const gz = fs.readFileSync('hub/shared/search-index.json.gz');
const arr = JSON.parse(zlib.gunzipSync(gz).toString('utf8'));
const c = {};
for (const e of arr) c[e.t] = (c[e.t] || 0) + 1;
console.log('gz 解压后条目:', JSON.stringify(c), '合计', arr.length);
const target = arr.find(e => e.t === 'i' && e.n === '华虹半导体');
console.log('抽查新机构:', target ? JSON.stringify(target) : '(未找到)');
const sample = arr.filter(e => e.t === 'i').slice(-2);
console.log('末尾两条:', JSON.stringify(sample));
console.log('hub-stats:', fs.readFileSync('hub/shared/hub-stats.js', 'utf8').match(/window\.HUB_STATS = .*/)[0]);