// Local-first data layer (localStorage). Works 100% offline.
// Every record: { id, ...fields, updatedAt, dirty, deleted }
// dirty = not yet pushed to Supabase. deleted = soft delete (so deletes sync too).

const KEY = { tx: 'kf.tx', reminders: 'kf.reminders', tasks: 'kf.tasks' };
export const TABLES = Object.keys(KEY);

export const bus = new EventTarget();
function emit(remote = false) {
  bus.dispatchEvent(new CustomEvent('change', { detail: { remote } }));
}

function readArr(t) {
  try {
    const v = JSON.parse(localStorage.getItem(KEY[t]));
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}
function writeArr(t, arr) {
  localStorage.setItem(KEY[t], JSON.stringify(arr));
}

export const db = {
  all: readArr,
  list(t) {
    return readArr(t).filter((r) => !r.deleted);
  },
  upsert(t, rec) {
    const arr = readArr(t);
    const i = arr.findIndex((r) => r.id === rec.id);
    const item = { ...(i >= 0 ? arr[i] : {}), ...rec, updatedAt: Date.now(), dirty: true, deleted: !!rec.deleted };
    if (i >= 0) arr[i] = item; else arr.push(item);
    writeArr(t, arr);
    emit();
    return item;
  },
  remove(t, id) {
    const r = readArr(t).find((x) => x.id === id);
    if (r) return db.upsert(t, { ...r, deleted: true });
  },
  // called by sync after a successful push (only if record not edited meanwhile)
  markClean(t, recs) {
    const arr = readArr(t);
    let changed = false;
    for (const r of recs) {
      const x = arr.find((y) => y.id === r.id && y.updatedAt === r.updatedAt);
      if (x) { x.dirty = false; changed = true; }
    }
    if (changed) writeArr(t, arr);
  },
  // called by sync for remote rows (newer than local, and local not dirty)
  mergeRemote(t, rec, ts) {
    const arr = readArr(t);
    const i = arr.findIndex((r) => r.id === rec.id);
    if (i < 0) {
      arr.push({ ...rec, updatedAt: ts, dirty: false });
    } else {
      const cur = arr[i];
      if (cur.dirty || ts <= (cur.updatedAt || 0)) return;
      arr[i] = { ...rec, updatedAt: ts, dirty: false };
    }
    writeArr(t, arr);
    emit(true);
  },
  importAll(obj) {
    for (const t of TABLES) {
      for (const r of obj?.[t] || []) if (r && r.id) db.upsert(t, r);
    }
  },
};

export function getMeta(k, def = null) {
  try {
    const v = localStorage.getItem('kf.meta.' + k);
    return v === null ? def : JSON.parse(v);
  } catch {
    return def;
  }
}
export function setMeta(k, v) {
  localStorage.setItem('kf.meta.' + k, JSON.stringify(v));
}
