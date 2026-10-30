const json = (value, status = 200) => Response.json(value, { status, headers: { 'cache-control': 'private, no-store' } });
const MODULES = ['kaoyan', 'gongkao', 'intern'];
const MAX_BODY = 4096;

async function readJsonBody(request) {
  if (request.headers.get('content-type')?.split(';')[0].trim() !== 'application/json') return { error: 'invalid_input', status: 415 };
  const reader = request.body?.getReader();
  if (!reader) return { error: 'invalid_input', status: 400 };
  let size = 0;
  const chunks = [];
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > MAX_BODY) { await reader.cancel(); return { error: 'invalid_input', status: 413 }; }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  try {
    return { value: JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)) };
  } catch {
    return { error: 'invalid_input', status: 400 };
  }
}

export function createFavorites({ db, requireUser, BackendError }) {
  return async function handleFavorites(ctx) {
    const { request } = ctx;
    const url = new URL(request.url);
    const route = (url.pathname.match(/\/api\/(me|favorites)$/) || [])[1];
    if (!route) return json({ error: 'not_found' }, 404);
    let writing = false;
    try {
      if (route === 'me') {
        if (request.method !== 'GET') return json({ error: 'method_not_allowed' }, 405);
        const user = requireUser(ctx);
        return json({ ok: true, user: { id: user.id, name: user.name, picture: user.picture } });
      }
      const user = requireUser(ctx);
      if (request.method === 'GET') {
        const result = await db.from('favorites')
          .select('module,item_id,title,note,created_at')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false })
          .limit(200);
        if (result.error || !Array.isArray(result.data)) return json({ error: 'favorites_unavailable' }, 503);
        return json({ ok: true, items: result.data });
      }
      if (request.method === 'POST') {
        const body = await readJsonBody(request);
        if (body.error) return json({ error: body.error }, body.status);
        const input = body.value;
        const module = input && input.module;
        const itemId = input && input.item_id;
        const title = input && typeof input.title === 'string' ? input.title.trim() : '';
        if (!MODULES.includes(module)) return json({ error: 'invalid_input' }, 400);
        if (typeof itemId !== 'string' || !itemId || itemId.length > 128) return json({ error: 'invalid_input' }, 400);
        if (!title || new TextEncoder().encode(title).length > 200) return json({ error: 'invalid_input' }, 400);
        const note = input && typeof input.note === 'string' ? input.note.slice(0, 500) : '';
        writing = true;
        let result = await db.from('favorites').insertIfAbsent({
          owner_id: user.id, module, item_id: itemId, title, note,
          created_at: new Date().toISOString()
        }, { onConflict: 'owner_id,module,item_id' }).select('module,item_id,title,note,created_at');
        if (!result.error && Array.isArray(result.data) && result.data.length === 0) {
          result = await db.from('favorites').update({ title, note })
            .eq('owner_id', user.id).eq('module', module).eq('item_id', itemId)
            .select('module,item_id,title,note,created_at');
        }
        const row = Array.isArray(result.data) ? result.data[0] : undefined;
        if (result.error || !row) {
          const rejected = result.error && [400, 401, 403, 409, 422].includes(result.error.status);
          return json({ error: rejected ? 'write_rejected' : 'write_result_unknown' }, 503);
        }
        return json({ ok: true, item: row });
      }
      if (request.method === 'DELETE') {
        const module = url.searchParams.get('module');
        const itemId = url.searchParams.get('item_id');
        if (!MODULES.includes(module) || typeof itemId !== 'string' || !itemId || itemId.length > 128) return json({ error: 'invalid_input' }, 400);
        writing = true;
        const result = await db.from('favorites').delete()
          .eq('owner_id', user.id).eq('module', module).eq('item_id', itemId)
          .select('item_id').maybeSingle();
        if (result.error) return json({ error: 'write_result_unknown' }, 503);
        return json({ ok: true, removed: !!result.data });
      }
      return json({ error: 'method_not_allowed' }, 405);
    } catch (error) {
      const isAuth = error instanceof BackendError && [401, 403].includes(error.status);
      return json(
        { error: isAuth ? error.code : (writing ? 'write_result_unknown' : 'favorites_unavailable') },
        isAuth ? error.status : 503);
    }
  };
}
