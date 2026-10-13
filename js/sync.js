// Optional cloud sync with Supabase (REST / PostgREST, no SDK needed).
// Config comes from /api/config (Vercel env vars). If not set, app stays fully local.
import { db, TABLES, getMeta, setMeta } from './store.js';

// local table -> Supabase table
const REMOTE = { tx: 'kf_transactions', reminders: 'kf_reminders', tasks: 'kf_tasks' };
const CODE_KEY = 'kf.syncCode';

let cfg = null;
let timer = null;
let running = false;

export async function loadConfig() {
  try {
    const r = await fetch('/api/config', { cache: 'no-store' });
    if (r.ok) cfg = await r.json();
  } catch {
    cfg = null; // offline or no API (e.g. local static server) -> local only
  }
  return cfg;
}

export const isSyncReady = () => !!(cfg && cfg.supabaseUrl && cfg.supabaseAnonKey);
export const getSyncCode = () => localStorage.getItem(CODE_KEY) || '';
export const setSyncCode = (c) => {
  const v = (c || '').trim();
  if (v) localStorage.setItem(CODE_KEY, v); else localStorage.removeItem(CODE_KEY);
};

function headers(extra = {}) {
  return {
    apikey: cfg.supabaseAnonKey,
    Authorization: `Bearer ${cfg.supabaseAnonKey}`,
    'Content-Type': 'application/json',
    ...extra,
  };
}
const base = () => cfg.supabaseUrl.replace(/\/$/, '') + '/rest/v1/';

export function scheduleSync() {
  if (!isSyncReady() || !getSyncCode()) return;
  clearTimeout(timer);
  timer = setTimeout(() => { syncNow(); }, 1500);
}

export async function syncNow() {
  if (!isSyncReady()) return { ok: false, reason: 'notConfigured' };
  if (!getSyncCode()) return { ok: false, reason: 'noCode' };
  if (!navigator.onLine) return { ok: false, reason: 'offline' };
  if (running) return { ok: false, reason: 'busy' };
  running = true;
  try {
    const owner = getSyncCode();
    for (const local of TABLES) {
      const remote = REMOTE[local];

      // 1) PUSH local changes
      const dirty = db.all(local).filter((r) => r.dirty);
      if (dirty.length) {
        const body = dirty.map((r) => {
          const { updatedAt, dirty: _d, deleted, id, ...payload } = r;
          return { id, owner, payload, updated_at: updatedAt, deleted: !!deleted };
        });
        const res = await fetch(`${base()}${remote}?on_conflict=id`, {
          method: 'POST',
          headers: headers({ Prefer: 'resolution=merge-duplicates,return=minimal' }),
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error(`push ${remote} ${res.status}`);
        db.markClean(local, dirty);
      }

      // 2) PULL remote changes newer than last pull
      const since = Number(getMeta('since:' + local, 0)) || 0;
      const url = `${base()}${remote}?owner=eq.${encodeURIComponent(owner)}&updated_at=gt.${since}` +
        `&select=id,payload,updated_at,deleted&order=updated_at.asc`;
      const res = await fetch(url, { headers: headers() });
      if (!res.ok) throw new Error(`pull ${remote} ${res.status}`);
      const rows = await res.json();
      let max = since;
      for (const row of rows) {
        const ts = Number(row.updated_at);
        if (ts > max) max = ts;
        db.mergeRemote(local, { ...row.payload, id: row.id, deleted: !!row.deleted }, ts);
      }
      setMeta('since:' + local, max);
    }
    setMeta('lastSync', Date.now());
    return { ok: true };
  } catch (e) {
    console.warn('[sync]', e);
    return { ok: false, reason: e.message };
  } finally {
    running = false;
  }
}
