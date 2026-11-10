import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataSrc = path.join(root, 'data-src', 'gongkao');
const dataOut = path.join(root, 'hub', 'modules', 'gongkao', 'data');
fs.mkdirSync(dataOut, { recursive: true });

let before = 0, after = 0;
for (const f of fs.readdirSync(dataSrc).filter(x => x.endsWith('.json'))) {
  const raw = fs.readFileSync(path.join(dataSrc, f));
  const gz = zlib.gzipSync(raw, { level: 9 });
  fs.writeFileSync(path.join(dataOut, f + '.gz'), gz);
  before += raw.length; after += gz.length;
}

const idxSrc = path.join(root, 'data-src', 'shared', 'search-index.js');
if (fs.existsSync(idxSrc)) {
  const sandbox = {};
  new Function('window', fs.readFileSync(idxSrc, 'utf8'))(sandbox);
  const gz = zlib.gzipSync(Buffer.from(JSON.stringify(sandbox.HUB_SEARCH)), { level: 9 });
  fs.writeFileSync(path.join(root, 'hub', 'shared', 'search-index.json.gz'), gz);
  console.log(`search-index gz ${(gz.length / 1048576).toFixed(2)} MB`);
}
console.log(`gongkao ${fs.readdirSync(dataSrc).filter(x => x.endsWith('.json')).length} files: ${(before / 1048576).toFixed(1)} MB -> ${(after / 1048576).toFixed(2)} MB`);
