import { LANGS, t, getLang, setLang, applyI18n, localeFor } from './i18n.js';
import { db, bus, getMeta, setMeta } from './store.js';
import { drawBars, drawDonut } from './charts.js';
import { loadConfig, syncNow, scheduleSync, isSyncReady, getSyncCode, setSyncCode } from './sync.js';

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const VIEWS = ['home', 'money', 'reminders', 'tasks', 'chat', 'settings'];
const CATS = ['food', 'travel', 'bills', 'shopping', 'health', 'salary', 'business', 'other'];
const COLORS = ['#60a5fa', '#f472b6', '#34d399', '#fbbf24', '#a78bfa', '#f87171', '#22d3ee', '#94a3b8'];

let curMonth = monthOf(new Date()); // month shown in Money view
let deferredPrompt = null;
let chartCancels = [];
let renderQueued = 0;

/* ---------- helpers ---------- */
function uid() {
  return crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}
function monthOf(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
function dayISO(d = new Date()) {
  return `${monthOf(d)}-${String(d.getDate()).padStart(2, '0')}`;
}
function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function fmt(n, digits = 0) {
  return new Intl.NumberFormat(localeFor(), { style: 'currency', currency: 'INR', maximumFractionDigits: digits }).format(n || 0);
}
function fmtDate(iso) {
  return new Date(iso + 'T00:00').toLocaleDateString(localeFor(), { day: '2-digit', month: 'short', year: 'numeric' });
}
function fmtDT(at) {
  return new Date(at).toLocaleString(localeFor(), { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}
const catLabel = (c) => t('cat.' + c);
const delay = (i) => `--i:${Math.min(i, 12)}`;

function toast(msg) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  $('#toasts').appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.remove(), 350);
  }, 2600);
}

// Smooth count-up for numbers (rAF, transform-free text update)
function countUp(el, to) {
  const from = Number(el.dataset.v) || 0;
  el.dataset.v = to;
  const s = performance.now();
  const dur = 650;
  const step = (now) => {
    const p = Math.min(1, (now - s) / dur);
    const e = 1 - Math.pow(1 - p, 3);
    el.textContent = fmt(from + (to - from) * e);
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/* ---------- routing & rendering ---------- */
function currentView() {
  const v = location.hash.slice(1);
  return VIEWS.includes(v) ? v : 'home';
}

function route() {
  const v = currentView();
  $$('.view').forEach((s) => s.classList.toggle('active', s.dataset.view === v));
  $$('.nav-btn').forEach((b) => {
    const on = b.dataset.view === v;
    b.classList.toggle('active', on);
    if (on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
  });
  renderAll();
  window.scrollTo({ top: 0 });
}

function renderAll() {
  renderHome();
  const v = currentView();
  if (v === 'money') renderMoney();
  if (v === 'reminders') renderReminders();
  if (v === 'tasks') renderTasks();
  if (v === 'chat') renderChat();
  if (v === 'settings') renderSettings();
}

function requestRender() {
  if (!renderQueued) {
    renderQueued = requestAnimationFrame(() => { renderQueued = 0; renderAll(); });
  }
}

function renderHome() {
  const now = new Date();
  const mk = monthOf(now);
  let inc = 0, exp = 0, mInc = 0, mExp = 0;
  for (const r of db.list('tx')) {
    const a = Number(r.amount) || 0;
    const isMonth = r.date.startsWith(mk);
    if (r.type === 'income') { inc += a; if (isMonth) mInc += a; }
    else { exp += a; if (isMonth) mExp += a; }
  }
  countUp($('#wBalance'), inc - exp);
  countUp($('#wIncome'), mInc);
  countUp($('#wExpense'), mExp);

  const cutoff = Date.now() - 60000;
  const next = db.list('reminders')
    .filter((r) => !r.done && new Date(r.at).getTime() >= cutoff)
    .sort((a, b) => a.at.localeCompare(b.at))[0];
  $('#wNext').innerHTML = next
    ? `<strong>${esc(next.title)}</strong><small class="muted block">${fmtDT(next.at)}</small>`
    : `<span class="muted">${t('home.none')}</span>`;
  $('#wTasks').textContent = db.list('tasks').filter((x) => !x.done).length;
}

function tickClock() {
  const d = new Date();
  $('#clock').textContent = d.toLocaleTimeString(localeFor(), { hour: '2-digit', minute: '2-digit' });
  $('#dateText').textContent = d.toLocaleDateString(localeFor(), { weekday: 'long', day: 'numeric', month: 'long' });
}

/* ----- Money ----- */
function renderMoney() {
  const sel = $('#txCat');
  const cur = sel.value;
  sel.innerHTML = CATS.map((c) => `<option value="${c}">${esc(catLabel(c))}</option>`).join('');
  if (cur) sel.value = cur;

  const rows = db.list('tx')
    .filter((r) => r.date.startsWith(curMonth))
    .sort((a, b) => b.date.localeCompare(a.date) || b.updatedAt - a.updatedAt);
  $('#txList').innerHTML = rows.length
    ? rows.map((r, i) => `
      <li class="item ${r.type}" style="${delay(i)}">
        <span class="badge-type">${r.type === 'income' ? '↑' : '↓'}</span>
        <div class="grow">
          <strong>${esc(catLabel(r.category))}</strong>${r.note ? ` <span class="muted">· ${esc(r.note)}</span>` : ''}
          <small class="muted block">${fmtDate(r.date)}</small>
        </div>
        <b class="${r.type === 'income' ? 'inc' : 'exp'}">${r.type === 'income' ? '+' : '−'}${fmt(r.amount, 2)}</b>
        <button class="icon-btn small" data-del="tx:${r.id}" aria-label="delete">✕</button>
      </li>`).join('')
    : `<li class="empty">${t('common.empty')}</li>`;

  // last 6 months bar chart
  const base = new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) months.push(monthOf(new Date(base.getFullYear(), base.getMonth() - i, 1)));
  const labels = months.map((m) => new Date(m + '-01T00:00').toLocaleDateString(localeFor(), { month: 'short' }));
  const incS = months.map(() => 0);
  const expS = months.map(() => 0);
  for (const r of db.list('tx')) {
    const i = months.indexOf(r.date.slice(0, 7));
    if (i < 0) continue;
    (r.type === 'income' ? incS : expS)[i] += Number(r.amount) || 0;
  }

  // category donut for selected month
  const byCat = {};
  for (const r of db.list('tx')) {
    if (r.type === 'expense' && r.date.startsWith(curMonth)) byCat[r.category] = (byCat[r.category] || 0) + (Number(r.amount) || 0);
  }
  const slices = Object.entries(byCat)
    .sort((a, b) => b[1] - a[1])
    .map(([c, v]) => ({ label: catLabel(c), value: v, color: COLORS[CATS.indexOf(c) % COLORS.length] }));

  chartCancels.forEach((f) => f());
  chartCancels = [
    drawBars($('#chBar'), labels, [incS, expS], ['#34d399', '#f87171']),
    drawDonut($('#chDonut'), slices),
  ];
  $('#catLegend').innerHTML = slices.length
    ? slices.map((s) => `<li><i class="dot" style="background:${s.color}"></i><span class="grow">${esc(s.label)}</span><b>${fmt(s.value)}</b></li>`).join('')
    : `<li class="muted">${t('money.noData')}</li>`;
}

/* ----- Reminders ----- */
function renderReminders() {
  const now = Date.now();
  const list = db.list('reminders').sort((a, b) => a.at.localeCompare(b.at));
  $('#remList').innerHTML = list.length
    ? list.map((r, i) => {
        const due = !r.done && new Date(r.at).getTime() <= now;
        return `
      <li class="item rem ${r.done ? 'done' : ''} ${due ? 'due' : ''}" style="${delay(i)}">
        <input type="checkbox" class="chk" data-done="${r.id}" ${r.done ? 'checked' : ''} aria-label="${esc(t('rem.markDone'))}">
        <div class="grow">
          <strong>${esc(r.title)}</strong>
          <small class="muted block">${fmtDT(r.at)}${due ? ` · <b class="exp">${t('rem.due')}</b>` : ''}</small>
        </div>
        <button class="icon-btn small" data-del="reminders:${r.id}" aria-label="delete">✕</button>
      </li>`;
      }).join('')
    : `<li class="empty">${t('common.empty')}</li>`;

  const perm = (typeof Notification !== 'undefined' ? Notification.permission : 'unsupported');
  $('#notifHint').textContent = perm === 'granted' ? t('rem.notifyOn')
    : perm === 'denied' ? t('rem.notifyDenied')
    : perm === 'default' ? t('rem.notifyAsk') : '';
}

// Fires in-app toast + system notification when a reminder is due (page/app must be open)
function checkDue() {
  const now = Date.now();
  for (const r of db.list('reminders')) {
    if (r.done || r.notified) continue;
    if (new Date(r.at).getTime() > now) continue;
    db.upsert('reminders', { ...r, notified: true });
    toast('⏰ ' + r.title);
    if (navigator.vibrate) navigator.vibrate([120, 80, 120]);
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      const opts = { body: r.title, icon: '/icons/icon-192.png', tag: r.id };
      if (navigator.serviceWorker) {
        navigator.serviceWorker.getRegistration().then((reg) => {
          if (reg) reg.showNotification(t('appName'), opts);
          else new Notification(t('appName'), opts);
        }).catch(() => {});
      } else {
        new Notification(t('appName'), opts);
      }
    }
  }
}

/* ----- Tasks ----- */
function renderTasks() {
  const list = db.list('tasks').sort((a, b) => Number(a.done) - Number(b.done) || b.updatedAt - a.updatedAt);
  $('#taskList').innerHTML = list.length
    ? list.map((r, i) => `
      <li class="item task ${r.done ? 'done' : ''}" style="${delay(i)}">
        <input type="checkbox" class="chk" data-task="${r.id}" ${r.done ? 'checked' : ''} aria-label="${esc(t('rem.markDone'))}">
        <span class="grow task-title">${esc(r.title)}</span>
        <button class="icon-btn small" data-del="tasks:${r.id}" aria-label="delete">✕</button>
      </li>`).join('')
    : `<li class="empty">${t('common.empty')}</li>`;
  $('#taskLeft').textContent = `${list.filter((x) => !x.done).length} ${t('task.left')}`;
}

/* ----- Chat (WhatsApp direct) ----- */
function chatNumber() {
  const raw = $('#chatPhone').value.trim();
  const digits = raw.replace(/\D/g, '');
  if (raw.startsWith('+')) return digits;
  const cc = $('#ccSelect').value;
  return cc + digits.replace(/^0+/, '');
}
const validNumber = (n) => /^\d{8,15}$/.test(n);

function updateChatPreview() {
  const n = chatNumber();
  const ok = validNumber(n);
  $('#chatPreview').textContent = ok ? `${t('chat.preview')}: +${n}` : '';
  const callBtn = $('#callBtn');
  callBtn.href = ok ? `tel:+${n}` : '#';
  callBtn.classList.toggle('disabled', !ok);
}

function renderChat() {
  const recent = getMeta('recentChats', []);
  $('#recentList').innerHTML = recent.length
    ? recent.map((n) => `<li><button class="chip" data-chat="${n}">+${n}</button></li>`).join('')
    : `<li class="muted">${t('common.empty')}</li>`;
  updateChatPreview();
}

function addRecent(n) {
  const list = getMeta('recentChats', []).filter((x) => x !== n);
  list.unshift(n);
  setMeta('recentChats', list.slice(0, 6));
}

/* ----- Settings ----- */
function applyTheme(th) {
  document.documentElement.dataset.theme = th;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = th === 'light' ? '#f3f5ff' : '#0b0d17';
  setMeta('theme', th);
  renderSettings();
}

function renderSettings() {
  $('#themeBtn').textContent = document.documentElement.dataset.theme === 'light' ? t('set.themeLight') : t('set.themeDark');
  $('#fsBtn2').textContent = document.fullscreenElement ? t('set.exit') : t('set.open');

  const codeEl = $('#syncCode');
  if (document.activeElement !== codeEl) codeEl.value = getSyncCode();

  const ls = getMeta('lastSync', 0);
  $('#syncStatus').textContent = !isSyncReady() ? t('set.syncOff')
    : !getSyncCode() ? t('set.syncNoCode')
    : ls ? `${t('set.synced')} · ${new Date(ls).toLocaleTimeString(localeFor(), { hour: '2-digit', minute: '2-digit' })}`
    : t('set.syncReady');

  const perm = (typeof Notification !== 'undefined' ? Notification.permission : 'unsupported');
  $('#notifyBtn').hidden = perm === 'unsupported' || perm === 'granted';

  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
  $('#installBtn').hidden = !deferredPrompt;
  $('#installHint').textContent = t('set.installHint') + (ios && !deferredPrompt ? ' ' + t('set.installIos') : '');
}

async function doSync(manual) {
  if (!isSyncReady()) { if (manual) toast(t('set.syncOff')); return; }
  if (!getSyncCode()) { if (manual) toast(t('set.syncNoCode')); return; }
  const r = await syncNow();
  if (manual) toast(r.ok ? t('set.synced') : `${t('set.syncErr')}`);
  renderSettings();
}

function setLanguage(l) {
  setLang(l);
  $('#langSelect').value = l;
  $('#setLang').value = l;
  renderAll();
}

async function toggleFullscreen() {
  try {
    if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
    else await document.exitFullscreen();
  } catch {
    toast(t('set.fsUnsupported'));
  }
  renderSettings();
}

/* ---------- events ---------- */
function bindEvents() {
  bus.addEventListener('change', (e) => {
    requestRender();
    if (!e.detail?.remote) scheduleSync();
  });

  window.addEventListener('hashchange', route);
  window.addEventListener('online', () => { netUI(); doSync(false); });
  window.addEventListener('offline', netUI);

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    renderSettings();
  });
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    toast(t('set.installed'));
    renderSettings();
  });

  document.addEventListener('fullscreenchange', renderSettings);

  // global delegation
  document.addEventListener('click', (e) => {
    const del = e.target.closest('[data-del]');
    if (del) {
      const [table, id] = del.dataset.del.split(':');
      db.remove(table, id);
      toast(t('money.deleted'));
      return;
    }
    const go = e.target.closest('[data-go]');
    if (go) {
      if (go.dataset.type) {
        const r = document.querySelector(`input[name="txType"][value="${go.dataset.type}"]`);
        if (r) r.checked = true;
      }
      location.hash = '#' + go.dataset.go;
      setTimeout(() => document.getElementById(go.dataset.focus || '')?.focus({ preventScroll: true }), 380);
      return;
    }
    const chat = e.target.closest('[data-chat]');
    if (chat) {
      const n = chat.dataset.chat;
      const cc = [...$('#ccSelect').options].map((o) => o.value).sort((a, b) => b.length - a.length).find((c) => n.startsWith(c)) || '91';
      $('#ccSelect').value = cc;
      $('#chatPhone').value = n.slice(cc.length);
      updateChatPreview();
    }
  });

  document.addEventListener('change', (e) => {
    const t2 = e.target;
    if (t2.matches('[data-done]')) {
      const r = db.all('reminders').find((x) => x.id === t2.dataset.done);
      if (r) db.upsert('reminders', { ...r, done: t2.checked });
    } else if (t2.matches('[data-task]')) {
      const r = db.all('tasks').find((x) => x.id === t2.dataset.task);
      if (r) db.upsert('tasks', { ...r, done: t2.checked });
    }
  });

  $('#langSelect').addEventListener('change', (e) => setLanguage(e.target.value));
  $('#setLang').addEventListener('change', (e) => setLanguage(e.target.value));
  $('#themeBtn').addEventListener('click', () => applyTheme(document.documentElement.dataset.theme === 'light' ? 'dark' : 'light'));
  $('#fsBtn').addEventListener('click', toggleFullscreen);
  $('#fsBtn2').addEventListener('click', toggleFullscreen);

  $('#txMonth').addEventListener('change', (e) => { curMonth = e.target.value || monthOf(new Date()); renderMoney(); });
  $('#txForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const type = document.querySelector('input[name="txType"]:checked').value;
    const amount = parseFloat($('#txAmount').value);
    if (!(amount > 0)) { toast(t('common.invalid')); return; }
    db.upsert('tx', {
      id: uid(),
      type,
      amount,
      category: $('#txCat').value,
      date: $('#txDate').value || dayISO(),
      note: $('#txNote').value.trim(),
    });
    $('#txAmount').value = '';
    $('#txNote').value = '';
    toast(t('money.saved'));
  });

  $('#remForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const title = $('#remTitle').value.trim();
    const at = $('#remAt').value;
    if (!title || !at) { toast(t('common.invalid')); return; }
    db.upsert('reminders', { id: uid(), title, at, done: false, notified: false });
    $('#remTitle').value = '';
    $('#remAt').value = '';
    toast(t('rem.saved') || '✓');
    checkDue();
  });

  $('#notifyBtn').addEventListener('click', async () => {
    if (typeof Notification === 'undefined') return;
    const p = await Notification.requestPermission();
    toast(p === 'granted' ? t('rem.notifyOn') : t('rem.notifyDenied'));
    renderReminders();
    renderSettings();
  });

  $('#taskForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const title = $('#taskInput').value.trim();
    if (!title) return;
    db.upsert('tasks', { id: uid(), title, done: false });
    $('#taskInput').value = '';
  });

  $('#ccSelect').addEventListener('change', updateChatPreview);
  $('#chatPhone').addEventListener('input', updateChatPreview);
  $('#chatForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const n = chatNumber();
    if (!validNumber(n)) {
      $('#chatErr').textContent = t('chat.invalid');
      return;
    }
    $('#chatErr').textContent = '';
    addRecent(n);
    const msg = $('#chatMsg').value.trim() || t('chat.msgDefault');
    window.open(`https://wa.me/${n}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
    renderChat();
  });

  $('#installBtn').addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice.catch(() => {});
    deferredPrompt = null;
    renderSettings();
  });

  $('#syncForm').addEventListener('submit', (e) => {
    e.preventDefault();
    setSyncCode($('#syncCode').value);
    toast(t('set.syncSaved'));
    doSync(true);
  });
  $('#syncNowBtn').addEventListener('click', () => doSync(true));

  $('#exportBtn').addEventListener('click', () => {
    const data = {
      app: 'kaif-dashboard',
      version: 1,
      exportedAt: new Date().toISOString(),
      tx: db.list('tx'),
      reminders: db.list('reminders'),
      tasks: db.list('tasks'),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `kaif-backup-${dayISO()}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });
  $('#importFile').addEventListener('change', async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    try {
      db.importAll(JSON.parse(await f.text()));
      toast(t('set.importDone'));
    } catch {
      toast(t('set.importErr'));
    }
    e.target.value = '';
  });
  $('#clearBtn').addEventListener('click', () => {
    if (!confirm(t('set.clearConfirm'))) return;
    for (const k of ['tx', 'reminders', 'tasks']) db.list(k).forEach((r) => db.remove(k, r.id));
  });
}

function netUI() {
  const on = navigator.onLine;
  $('#netText').textContent = t(on ? 'net.online' : 'net.offline');
  $('#netDot').classList.toggle('off', !on);
}

/* ---------- init ---------- */
async function init() {
  const saved = getMeta('theme', 'dark');
  document.documentElement.dataset.theme = saved === 'light' ? 'light' : 'dark';
  applyI18n();
  $('#langSelect').value = getLang();
  $('#setLang').value = getLang();
  $('#txDate').value = dayISO();
  $('#txMonth').value = curMonth;
  $('#remAt').min = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);

  bindEvents();
  netUI();
  tickClock();
  setInterval(tickClock, 1000);
  setInterval(checkDue, 15000);
  setInterval(() => { if (getSyncCode()) doSync(false); }, 60000);
  checkDue();
  route();

  if ('serviceWorker' in navigator && navigator.serviceWorker) {
    navigator.serviceWorker.register('/sw.js').catch((err) => console.warn('SW failed', err));
  }

  await loadConfig();
  renderSettings();
  if (getSyncCode()) doSync(false);
}

init();
