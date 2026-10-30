const http = require('http');
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..', 'hub');
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};
const FAVS = [];
http.createServer((req, res) => {
  let u = decodeURIComponent(req.url.split('?')[0]);
  const query = new URL(req.url, 'http://x').searchParams;
  // 本地 fixture：模拟 Qoder Sites Functions 的收藏 API（仅开发用，云端以 functions/ 为准）
  if (u.startsWith('/functions/v1/app/api/')) {
    const route = u.replace('/functions/v1/app', '');
    const send = (code, obj) => { res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' }); res.end(JSON.stringify(obj)); };
    if (route === '/api/me') return send(200, { ok: true, user: { id: 'dev-user', name: '本地测试员', picture: '' } });
    if (route === '/api/favorites' && req.method === 'GET') return send(200, { ok: true, items: FAVS.slice().sort((a, b) => b.created_at.localeCompare(a.created_at)) });
    if (route === '/api/favorites' && req.method === 'POST') {
      let raw = '';
      req.on('data', c => { raw += c; });
      req.on('end', () => {
        try {
          const b = JSON.parse(raw);
          const i = FAVS.findIndex(f => f.module === b.module && f.item_id === b.item_id);
          const row = { owner_id: 'dev-user', module: b.module, item_id: b.item_id, title: b.title, note: b.note || '', created_at: new Date().toISOString() };
          if (i >= 0) FAVS[i] = row; else FAVS.push(row);
          send(200, { ok: true, item: row });
        } catch (e) { send(400, { error: 'invalid_input' }); }
      });
      return;
    }
    if (route === '/api/favorites' && req.method === 'DELETE') {
      const i = FAVS.findIndex(f => f.module === query.get('module') && f.item_id === query.get('item_id'));
      if (i >= 0) FAVS.splice(i, 1);
      return send(200, { ok: true, removed: i >= 0 });
    }
    return send(404, { error: 'not_found' });
  }
  if (u.endsWith('/')) u += 'index.html';
  const f = path.join(root, u);
  if (!f.startsWith(root)) { res.writeHead(403); return res.end(); }
  fs.readFile(f, (e, d) => {
    if (e) { res.writeHead(404); return res.end('404'); }
    res.writeHead(200, { 'Content-Type': mime[path.extname(f)] || 'application/octet-stream' });
    res.end(d);
  });
}).listen(8123, '127.0.0.1', () => console.log('hub server on 8123'));
