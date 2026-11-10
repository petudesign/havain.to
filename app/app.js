import * as store from './store.js';
import { PRODUCTS, SECTIONS, productByGtin } from './products.js';
import { parseDigitalLink, buildDigitalLink } from './digital-link.js';
import { TEXT, fill } from './i18n.js';

const $ = (sel) => document.querySelector(sel);
const view = $('#view');
const ui = { taskIndex: 0, scan: null, confirmedId: null, toastTimer: null };

const T = () => TEXT[store.get().lang];
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const productName = (gtin) => { const p = productByGtin(gtin); return p ? p[store.get().lang] : gtin; };
const locale = () => (store.get().lang === 'fi' ? 'fi-FI' : 'en-GB');
function fmtDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(locale(), { weekday: 'short', day: 'numeric', month: 'numeric' });
}
function leftText(left) {
  const t = T().left;
  if (left < 0) return fill(t.past, { n: -left });
  if (left === 0) return t.today;
  if (left === 1) return t.tomorrow;
  return fill(t.days, { n: left });
}

const ICON = {
  remove: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M8.5 8.5l7 7M15.5 8.5l-7 7"/></svg>',
  label: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8" r="1.5"/></svg>',
  soon: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  ok: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M8 12.5l3 3 5-6"/></svg>',
  empty: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 12h10"/></svg>',
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7"/></svg>',
};

// ---------- shell ----------

function renderShell(active) {
  const t = T();
  document.documentElement.lang = store.get().lang;
  document.querySelectorAll('.tabs a').forEach((a) => {
    a.querySelector('span').textContent = t.nav[a.dataset.tab];
    if (a.dataset.tab === active) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
  const off = store.get().dayOffset;
  $('#day-chip').textContent = `${t.demoDay}: ${fmtDate(store.today())}` + (off ? ` (+${off})` : '');
}

function toast(message, undo) {
  const el = $('#toast');
  clearTimeout(ui.toastTimer);
  el.innerHTML = `<span>${esc(message)}</span>` + (undo ? `<button type="button">${esc(T().undo)}</button>` : '');
  el.hidden = false;
  if (undo) el.querySelector('button').addEventListener('click', () => { undo(); el.hidden = true; route(); });
  ui.toastTimer = setTimeout(() => { el.hidden = true; }, 7000);
}

// ---------- tasks ----------

function miniShelf(section) {
  const t = T();
  const rows = ['A', 'B'];
  return `<div class="mini" aria-hidden="true">${rows.map((r) => `<div class="mini-row">${SECTIONS.filter((s) => s[0] === r).map((s) =>
    `<span class="${s === section ? 'is-target' : ''}">${s === section ? esc(t.here) : s}</span>`).join('')}</div>`).join('')}</div>`;
}

function renderTasks() {
  const t = T();
  const list = store.tasks();
  if (ui.taskIndex >= list.length) ui.taskIndex = 0;
  if (!store.get().batches.length) {
    view.innerHTML = `<section class="empty-state"><p>${esc(t.empty)}</p><button class="btn primary" data-act="demo">${esc(t.loadDemo)}</button></section>`;
    return;
  }
  if (!list.length) {
    const up = store.nextUpcoming();
    view.innerHTML = `<section class="empty-state">${ICON.ok}<h1>${esc(t.none)}</h1>${up ? `<p>${esc(fill(t.next, { p: productName(up.gtin), date: fmtDate(up.expiry) }))}</p>` : ''}</section>`;
    return;
  }
  const task = list[ui.taskIndex];
  const b = task.batch;
  const confirmed = ui.confirmedId === b.id;
  const steps = t.steps[task.type].map((s) => `<li>${esc(fill(s, { date: fmtDate(b.expiry) }))}</li>`).join('');
  view.innerHTML = `
    <p class="progress">${esc(fill(t.progress, { i: ui.taskIndex + 1, n: list.length }))}</p>
    <article class="task task-${task.type}" aria-labelledby="task-title">
      ${confirmed ? `<p class="confirm">${ICON.check}${esc(t.scannedRight)}</p>` : ''}
      <p class="task-kind">${ICON[task.type]}<span id="task-title">${esc(t.title[task.type])}</span></p>
      <h1 class="product">${esc(productName(b.gtin))}</h1>
      <dl class="facts">
        <div><dt>${esc(t.date)}</dt><dd>${esc(fmtDate(b.expiry))} <span class="muted">· ${esc(leftText(task.left))}</span></dd></div>
        <div><dt>${esc(t.where)}</dt><dd>${esc(fill(t.shelfPlace, { s: b.section }))}</dd></div>
        <div><dt>${esc(t.batch)}</dt><dd>${esc(b.batch)}</dd></div>
      </dl>
      ${miniShelf(b.section)}
      <ol class="steps">${steps}</ol>
      <div class="count">
        <span id="count-label">${esc(t.count[task.type])}</span>
        <div class="stepper" role="group" aria-labelledby="count-label">
          <button type="button" class="btn" data-act="minus" aria-label="${esc(t.less)}">−</button>
          <output id="count" aria-live="polite">${b.qty}</output>
          <button type="button" class="btn" data-act="plus" aria-label="${esc(t.more)}">+</button>
        </div>
      </div>
      <button type="button" class="btn primary big" data-act="done">${esc(t.done)}</button>
      <button type="button" class="btn quiet" data-act="notfound">${esc(t.notFound)}</button>
    </article>`;

  const out = $('#count');
  view.querySelector('[data-act=minus]').onclick = () => { out.textContent = Math.max(0, Number(out.textContent) - 1); };
  view.querySelector('[data-act=plus]').onclick = () => { out.textContent = Number(out.textContent) + 1; };
  view.querySelector('[data-act=done]').onclick = () => {
    const n = Number(out.textContent);
    const patch = task.type === 'label' ? { status: 'labelled', labelled: n } : { status: 'removed' };
    const before = store.update(b.id, patch, `${task.type}:${n}`);
    ui.confirmedId = null;
    route();
    toast(t.toast.done, () => store.restore(b.id, before));
  };
  view.querySelector('[data-act=notfound]').onclick = () => {
    // Design principle P4: "not there" is a valid answer that corrects the record.
    const before = store.update(b.id, { status: 'notfound' }, 'notfound');
    ui.confirmedId = null;
    route();
    toast(t.toast.notFound, () => store.restore(b.id, before));
  };
}

// ---------- shelf map ----------

function renderShelf() {
  const t = T();
  const rows = ['A', 'B'].map((r) => {
    const items = SECTIONS.filter((s) => s[0] === r).map((s) => {
      const { status, soonest } = store.sectionStatus(s);
      const product = PRODUCTS.find((p) => p.section === s);
      return `<li class="sec sec-${status}">
        <span class="sec-id">${s}</span>
        <span class="sec-main"><span class="sec-name">${esc(product ? product[store.get().lang] : '')}</span>
        <span class="sec-date">${soonest ? esc(fill(t.soonest, { date: fmtDate(soonest.expiry) })) : ''}</span></span>
        <span class="sec-status">${ICON[status]}${esc(t.status[status])}</span>
      </li>`;
    }).join('');
    return `<h2 class="row-title">${esc(fill(t.row, { r }))}</h2><ul class="secs">${items}</ul>`;
  }).join('');
  view.innerHTML = `<h1 class="page-title">${esc(t.shelfTitle)}</h1><p class="help">${esc(t.shelfHelp)}</p>${rows}`;
}

// ---------- scan ----------

function handleScan(href) {
  const parsed = parseDigitalLink(href);
  ui.scan = parsed;
  if (parsed.error) return;
  if (!productByGtin(parsed.gtin)) { ui.scan = { error: 'unknown' }; return; }
  const existing = store.findBatch(parsed.gtin, parsed.batch);
  if (existing) {
    const list = store.tasks();
    const i = list.findIndex((x) => x.batch.id === existing.id);
    if (i >= 0) { ui.taskIndex = i; ui.confirmedId = existing.id; ui.scan = null; location.hash = '#tasks'; return 'task'; }
    ui.scan = { ...parsed, existing };
  }
}

function renderScan() {
  const t = T();
  const s = ui.scan;
  if (s && s.error) {
    view.innerHTML = `<section class="card error" role="alert"><p>${esc(t.errors[s.error] ?? t.errors['not-a-link'])}</p></section>${scanHelp()}`;
  } else if (s && s.existing) {
    const b = s.existing;
    view.innerHTML = `<section class="card"><p class="task-kind">${ICON.ok}<span>${esc(t.known)}</span></p>
      <h1 class="product">${esc(productName(b.gtin))}</h1>
      <dl class="facts"><div><dt>${esc(t.date)}</dt><dd>${esc(fmtDate(b.expiry))}</dd></div><div><dt>${esc(t.where)}</dt><dd>${esc(fill(t.shelfPlace, { s: b.section }))}</dd></div></dl>
      <p>${esc(t.noTask)}</p></section>${scanHelp()}`;
  } else if (s) {
    const p = productByGtin(s.gtin);
    view.innerHTML = `<section class="card"><p class="task-kind">${ICON.label}<span>${esc(t.newBatch)}</span></p>
      <h1 class="product">${esc(p[store.get().lang])}</h1>
      <dl class="facts">
        <div><dt>${esc(t.date)}</dt><dd>${esc(fmtDate(s.expiry))} <span class="muted">· ${esc(leftText(store.daysBetween(store.today(), s.expiry)))}</span></dd></div>
        <div><dt>${esc(t.where)}</dt><dd>${esc(fill(t.shelfPlace, { s: p.section }))}</dd></div>
        <div><dt>${esc(t.batch)}</dt><dd>${esc(s.batch ?? '–')}</dd></div>
      </dl>
      ${miniShelf(p.section)}
      <div class="count"><span id="qty-label">${esc(t.qty)}</span>
        <div class="stepper" role="group" aria-labelledby="qty-label">
          <button type="button" class="btn" data-act="minus" aria-label="${esc(t.less)}">−</button>
          <output id="qty">${p.caseSize}</output>
          <button type="button" class="btn" data-act="plus" aria-label="${esc(t.more)}">+</button>
        </div></div>
      <button type="button" class="btn primary big" data-act="save">${esc(t.save)}</button></section>`;
    const out = $('#qty');
    view.querySelector('[data-act=minus]').onclick = () => { out.textContent = Math.max(1, Number(out.textContent) - 1); };
    view.querySelector('[data-act=plus]').onclick = () => { out.textContent = Number(out.textContent) + 1; };
    view.querySelector('[data-act=save]').onclick = () => {
      const b = store.receive({ gtin: s.gtin, batch: s.batch ?? `B${Date.now() % 10000}`, expiry: s.expiry, qty: Number(out.textContent) });
      ui.scan = null;
      location.hash = '#shelf';
      toast(fill(t.toast.saved, { s: b.section }), () => store.update(b.id, { status: 'removed' }, 'undo receive'));
    };
  } else {
    view.innerHTML = scanHelp();
  }
  view.querySelectorAll('[data-demo]').forEach((btn) => btn.addEventListener('click', () => {
    if (handleScan(btn.dataset.demo) !== 'task') route();
  }));
}

function scanHelp() {
  const t = T();
  const demoDays = [1, 2, 9, 14];
  const demos = PRODUCTS.slice(0, 4).map((p, i) => {
    const expiry = store.addDays(store.today(), demoDays[i]);
    const href = buildDigitalLink(location.origin, { gtin: p.gtin, batch: `D${i + 1}${expiry.slice(8)}`, expiry });
    return `<li><button type="button" class="btn row-btn" data-demo="${esc(href)}"><span>${esc(p[store.get().lang])}</span><span class="muted">${esc(fill(t.scanDemoDays, { n: demoDays[i] }))}</span></button></li>`;
  }).join('');
  return `<h1 class="page-title">${esc(t.scanTitle)}</h1>
    <ol class="steps big-steps">${t.scanHow.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>
    <p class="help">${esc(t.scanDemo)}</p><ul class="demo-list">${demos}</ul>`;
}

// ---------- settings ----------

function renderSettings() {
  const t = T();
  const st = store.get();
  view.innerHTML = `<h1 class="page-title">${esc(t.settingsTitle)}</h1>
    <section class="card"><h2>${esc(t.demoDay)}: ${esc(fmtDate(store.today()))}</h2><p class="help">${esc(t.dayHelp)}</p>
      <div class="btn-row"><button type="button" class="btn" data-act="next-day">${esc(t.nextDay)}</button>
      <button type="button" class="btn quiet" data-act="reset-day" ${st.dayOffset ? '' : 'disabled'}>${esc(t.resetDay)}</button></div></section>
    <section class="card"><h2 id="role-h">${esc(t.role)}</h2><p class="help">${esc(t.roleHelp)}</p>
      <div class="choice" role="radiogroup" aria-labelledby="role-h">
        <label><input type="radio" name="role" value="all" ${st.role === 'all' ? 'checked' : ''}> ${esc(t.roleAll)}</label>
        <label><input type="radio" name="role" value="label" ${st.role === 'label' ? 'checked' : ''}> ${esc(t.roleLabel)}</label></div></section>
    <section class="card"><h2 id="lang-h">${esc(t.lang)}</h2>
      <div class="choice" role="radiogroup" aria-labelledby="lang-h">
        <label><input type="radio" name="lang" value="fi" ${st.lang === 'fi' ? 'checked' : ''}> Suomi</label>
        <label><input type="radio" name="lang" value="en" ${st.lang === 'en' ? 'checked' : ''}> English</label></div></section>
    <section class="card"><div class="btn-col">
      <button type="button" class="btn" data-act="demo">${esc(t.loadDemo)}</button>
      <a class="btn" href="/app/qr.html">${esc(t.qr)}</a>
      <button type="button" class="btn quiet danger" data-act="clear">${esc(t.clear)}</button></div>
      <p class="help">${esc(t.about)}</p></section>`;
  view.querySelector('[data-act=next-day]').onclick = () => { store.set({ dayOffset: st.dayOffset + 1 }); ui.taskIndex = 0; route(); };
  view.querySelector('[data-act=reset-day]').onclick = () => { store.set({ dayOffset: 0 }); route(); };
  view.querySelector('[data-act=clear]').onclick = () => { store.reset(); ui.taskIndex = 0; route(); };
  view.querySelectorAll('input[name=role]').forEach((r) => r.onchange = () => { store.set({ role: r.value }); ui.taskIndex = 0; route(); });
  view.querySelectorAll('input[name=lang]').forEach((r) => r.onchange = () => { store.set({ lang: r.value }); route(); });
}

// ---------- routing ----------

function route() {
  const tab = (location.hash.slice(1) || 'tasks');
  const known = ['tasks', 'shelf', 'scan', 'settings'];
  const active = known.includes(tab) ? tab : 'tasks';
  renderShell(active);
  if (active === 'tasks') renderTasks();
  else if (active === 'shelf') renderShelf();
  else if (active === 'scan') renderScan();
  else renderSettings();
  view.querySelectorAll('[data-act=demo]').forEach((b) => b.onclick = () => { store.seedDemo(); ui.taskIndex = 0; location.hash = '#tasks'; route(); });
}

document.querySelector('.tabs a[data-tab=scan]').addEventListener('click', () => { ui.scan = null; if (location.hash === '#scan') route(); });

window.addEventListener('hashchange', () => { if (location.hash !== '#scan') ui.scan = null; route(); view.focus({ preventScroll: true }); window.scrollTo(0, 0); });

// A Digital Link address (/01/...) opened from the phone's camera lands here.
if (/\/01\/\d/.test(location.pathname)) {
  const result = handleScan(location.href);
  history.replaceState(null, '', result === 'task' ? '/app/#tasks' : '/app/#scan');
}
route();
