import { FIXTURES, PRODUCTS, ISSUE, REVIEWS, CAPTURES, TODAY, STALE_DAYS } from './data.js';
import { renderElevation, layout } from './shelf.js';

const $ = (s) => document.querySelector(s);
const main = $('#main');
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

const state = { fixture: 'A2', slot: 'A2-1-1', reviews: REVIEWS.map((r) => ({ ...r })), tasks: new Set() };

const SLOTS = {};
for (const f of FIXTURES) for (const lvl of f.levels) for (const s of lvl) SLOTS[s.id] = s;
const fixtureById = (id) => FIXTURES.find((f) => f.id === id);

// ---------- formatting ----------

function ago(date) {
  const h = Math.round((Date.now() - date.getTime()) / 3600000);
  if (h < 1) return 'just now';
  if (h < 24) return `${h} h ago`;
  return `${Math.round(h / 24)} d ago`;
}
const fmtDate = (d) => d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
const daysLeft = (d) => Math.round((d - TODAY) / 86400000);
function leftText(d) {
  const n = daysLeft(d);
  if (n < 0) return `${-n} d past`;
  if (n === 0) return 'today';
  if (n === 1) return 'tomorrow';
  return `in ${n} d`;
}

const ICON = {
  remove: '<path d="M6 6l12 12M18 6L6 18"/>',
  near: '<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>',
  gap: '<rect x="5" y="5" width="14" height="14" rx="2" stroke-dasharray="3 3"/>',
  mismatch: '<path d="M5 9h14M5 15h14M15 5L9 19"/>',
  unknown: '<path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7M12 17h.01"/>',
  facing: '<path d="M4 12h12M12 8l4 4-4 4M20 5v14"/>',
  stale: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><path d="M4 4l16 16"/>',
  ok: '<path d="M5 12.5l4.5 4.5L19 7"/>',
  observed: '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z"/><circle cx="12" cy="12" r="2.5"/>',
  inferred: '<circle cx="12" cy="12" r="8" stroke-dasharray="3 3"/>',
  verified: '<path d="M12 3l7 3v5c0 5-3.5 8-7 10-3.5-2-7-5-7-10V6z"/><path d="M9 12l2 2 4-4"/>',
};
const icon = (k) => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICON[k]}</svg>`;
const STATE_TEXT = { observed: 'Observed', inferred: 'Inferred', verified: 'Verified' };
const stateBadge = (s) => `<span class="state ${s}">${icon(s)}${STATE_TEXT[s]}</span>`;

// ---------- derived data ----------

const isStale = (f) => (Date.now() - f.captured.getTime()) / 86400000 > STALE_DAYS;

function fixtureStatus(f) {
  if (isStale(f)) return 'stale';
  let best = null;
  for (const lvl of f.levels) for (const s of lvl) {
    if (s.issue && (!best || ISSUE[s.issue].order < ISSUE[best].order)) best = s.issue;
  }
  return best ?? 'ok';
}

function alerts() {
  const out = [];
  for (const f of FIXTURES) {
    if (isStale(f)) { out.push({ kind: 'stale', fixture: f, at: f.captured }); continue; }
    for (const lvl of f.levels) for (const s of lvl) if (s.issue) out.push({ kind: s.issue, fixture: f, slot: s, at: f.captured });
  }
  return out.sort((a, b) => ISSUE[a.kind].order - ISSUE[b.kind].order || b.at - a.at);
}

function otherLocations(slot) {
  return Object.values(SLOTS).filter((s) => s.product === slot.product && s.id !== slot.id).map((s) => `${s.fixture} level ${s.level}`);
}

// ---------- map view ----------

function planSvg() {
  const parts = [`<svg class="plan" viewBox="0 0 1380 530" role="group" aria-label="Department map">`,
    `<rect class="floor" x="20" y="10" width="1340" height="510" rx="14"/>`,
    `<text class="zone-text" x="1320" y="500" text-anchor="end">Entrance ↓</text>`,
    `<text class="zone-text" x="1340" y="214" text-anchor="end">Back room →</text>`];
  for (const f of FIXTURES) {
    const { x, y, w, h } = f.plan;
    const st = fixtureStatus(f);
    const word = st === 'ok' ? 'OK' : ISSUE[st].label;
    const chipW = word.length * 9 + 40;
    parts.push(`<g class="fx st-${st}${state.fixture === f.id ? ' is-selected' : ''}" data-fixture="${f.id}" tabindex="0" role="button" aria-label="${f.id} ${esc(f.name)}: ${word}, captured ${ago(f.captured)}">
      <rect class="body" x="${x}" y="${y}" width="${w}" height="${h}" rx="10"/>
      <rect class="strip" x="${x}" y="${y}" width="${w}" height="7" rx="3"/>
      <text class="fx-id" x="${x + 14}" y="${y + 36}">${f.id}</text>
      <text class="fx-name" x="${x + 52}" y="${y + 35}">${esc(f.name)}</text>
      <g class="chip" transform="translate(${x + 14} ${y + h - 38})"><rect width="${chipW}" height="26"/>
        <g transform="translate(7 5) scale(.68)" fill="none" stroke="#0b0d10" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">${ICON[st]}</g>
        <text x="27" y="18">${word}</text></g>
      <text class="fx-age" x="${x + w - 14}" y="${y + h - 19}" text-anchor="end">${ago(f.captured)}</text>
    </g>`);
  }
  parts.push('</svg>');
  return parts.join('');
}

function summary() {
  const al = alerts();
  const count = (k) => al.filter((a) => k.includes(a.kind)).length;
  const fresh = FIXTURES.filter((f) => !isStale(f)).length;
  return `<div class="summary">
    <div class="stat"><b>${count(['near', 'remove'])}</b><span>near or past date</span></div>
    <div class="stat"><b>${count(['gap'])}</b><span>gaps</span></div>
    <div class="stat"><b>${state.reviews.length}</b><span>to review</span></div>
    <div class="stat"><b>${fresh}/${FIXTURES.length}</b><span>fixtures captured this week</span></div>
  </div>`;
}

function elevationCard() {
  const f = fixtureById(state.fixture);
  const labels = f.levels.flat().length;
  const cap = CAPTURES.find((c) => c.fixture === f.id);
  return `<section class="card" aria-labelledby="elev-h">
    <div class="card-head"><h2 id="elev-h">${f.id} · ${esc(f.name)}</h2><span class="meta">${esc(f.kind)} · captured ${ago(f.captured)} by ${esc(cap.by)} · ${labels} labels read</span></div>
    ${renderElevation(f, { selected: state.slot, stale: isStale(f) })}
    <div class="legend">
      <span class="st-ok"><i></i>Label read</span>
      <span style="--c: var(--c-product)"><i></i>Products seen</span>
      <span class="st-near"><i></i>Near date</span>
      <span class="st-remove"><i></i>Past date</span>
      <span class="st-gap"><i class="dash"></i>Gap</span>
      <span class="st-facing"><i class="dash"></i>Needs facing</span>
      <span class="st-mismatch"><i class="dash"></i>Check product</span>
    </div>
    <p class="note">Demo: products are drawn. In Havain this view is stitched from a phone capture of the shelf.</p>
  </section>`;
}

function detailCard() {
  const s = SLOTS[state.slot];
  if (!s || s.fixture !== state.fixture) return `<section class="card detail"><p class="empty">Select a place on the shelf to see its product, batches and history.</p></section>`;
  const f = fixtureById(s.fixture);
  const p = PRODUCTS[s.product];
  const issue = s.issue && !isStale(f) ? s.issue : null;
  const others = otherLocations(s);
  const conf = s.confidence ?? 0.9 + ((s.id.length * 7) % 9) / 100;
  const sent = state.tasks.has(s.id);
  let labelText = 'Read from the label barcode';
  if (s.issue === 'mismatch') labelText = `Label: ${PRODUCTS[s.product].name}. Shelf looks like ${PRODUCTS[s.seen].name}`;
  if (s.issue === 'unknown') labelText = 'Label read; product above it not recognised';
  const batches = s.batches.map((b) => `<li class="batch"><div class="row"><span><b>${esc(b.lot)}</b> · ${fmtDate(b.expiry)} · ${leftText(b.expiry)}</span>${stateBadge(b.state)}</div>
    <div class="why">${b.qty} received${b.note ? ` · ${esc(b.note)}` : ''}</div></li>`).join('');
  const action = issue
    ? (issue === 'mismatch' || issue === 'unknown'
      ? `<a class="btn primary" href="#review">Open in review</a>`
      : sent ? `<button class="btn" disabled>Task sent to the shift’s phones</button>`
        : `<button class="btn primary" data-task="${s.id}">${esc(ISSUE[issue].action)}: send task</button>`)
    : '';
  return `<section class="card detail" aria-labelledby="det-h">
    <h3 id="det-h">${esc(p.name)}</h3>
    <div class="sub">${f.id} · level ${s.level} · GTIN ${p.gtin}</div>
    ${issue ? `<div class="issue-line st-${issue}"><span class="ico">${icon(issue)}</span><span><b>${ISSUE[issue].label}.</b> ${esc(ISSUE[issue].action)}.</span></div>` : ''}
    <dl class="kv">
      <dt>Label</dt><dd>${esc(labelText)}</dd>
      <dt>On the shelf</dt><dd>${s.issue === 'gap' ? 'Nothing seen above the label' : `${s.facings} facings seen`} ${stateBadge('observed')} <span class="muted">· confidence ${conf.toFixed(2)}</span></dd>
      <dt>Last capture</dt><dd>${ago(f.captured)}</dd>
      <dt>Also at</dt><dd>${others.length ? esc(others.join(', ')) : '–'}</dd>
    </dl>
    <h4 class="card-head" style="margin:0 0 8px"><span>Batches</span><span class="meta">from receiving and 2D scans</span></h4>
    <ul class="batches">${batches}</ul>
    <div class="actions">${action}</div>
  </section>`;
}

function alertsCard() {
  const items = alerts().map((a) => {
    const target = a.slot ? a.slot.id : '';
    const what = a.slot ? PRODUCTS[a.slot.product].name : `${a.fixture.name}, last capture ${ago(a.fixture.captured)}`;
    const where = a.slot ? `${a.fixture.id} · level ${a.slot.level}` : a.fixture.id;
    const st = a.slot?.batches && (a.kind === 'near' || a.kind === 'remove') ? a.slot.batches[0].state : (a.slot ? 'observed' : null);
    const sel = target && target === state.slot ? ' is-selected' : '';
    return `<li class="alert st-${a.kind}${sel}" tabindex="0" data-fixture="${a.fixture.id}" data-slot="${target}">
      <span class="ico">${icon(a.kind)}</span>
      <span><b>${ISSUE[a.kind].label}</b><span class="what">${esc(what)}</span><br><span class="where">${where}${st ? ` · ${STATE_TEXT[st].toLowerCase()}` : ''}</span></span>
      <time>${ago(a.at)}</time></li>`;
  }).join('');
  return `<section class="card" aria-labelledby="al-h"><div class="card-head"><h2 id="al-h">Alerts</h2><span class="meta">${alerts().length} open</span></div><ul class="alerts">${items}</ul></section>`;
}

function renderMap() {
  main.innerHTML = `<div class="grid">
    <div class="col">
      ${summary()}
      <section class="card" aria-labelledby="map-h"><div class="card-head"><h2 id="map-h">Dairy and chilled</h2><span class="meta">Each fixture shows its most urgent status and when it was last captured</span></div>${planSvg()}</section>
      ${elevationCard()}
    </div>
    <div class="col">${detailCard()}${alertsCard()}</div>
  </div>`;
  bindMap();
}

function bindMap() {
  main.querySelectorAll('.fx').forEach((g) => activate(g, () => {
    state.fixture = g.dataset.fixture;
    const first = fixtureById(state.fixture).levels.flat().find((s) => s.issue) ?? fixtureById(state.fixture).levels[0][0];
    state.slot = first.id;
    renderMap();
  }));
  main.querySelectorAll('.slot').forEach((g) => activate(g, () => { state.slot = g.dataset.slot; renderMap(); }));
  main.querySelectorAll('.alert').forEach((li) => activate(li, () => {
    state.fixture = li.dataset.fixture;
    if (li.dataset.slot) state.slot = li.dataset.slot;
    renderMap();
  }));
  main.querySelectorAll('[data-task]').forEach((b) => b.addEventListener('click', () => {
    state.tasks.add(b.dataset.task);
    const s = SLOTS[b.dataset.task];
    toast(`Task sent: ${ISSUE[s.issue].action}, ${PRODUCTS[s.product].name}, ${s.fixture} level ${s.level}`);
    renderMap();
  }));
}

function activate(el, fn) {
  el.addEventListener('click', fn);
  el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); } });
}

// ---------- review view ----------

function crop(slotId) {
  const s = SLOTS[slotId];
  const f = fixtureById(s.fixture);
  const box = layout(f).flat().find((b) => b.slot.id === slotId);
  const svg = renderElevation(f, { selected: slotId });
  const w = Math.max(box.w + 160, 520), h = w * 9 / 16;
  const x = Math.min(Math.max(0, box.x + box.w / 2 - w / 2), 1200 - w);
  const vb = `${x} ${box.base + 60 - h} ${w} ${h}`;
  return svg.replace(/viewBox="[^"]*"/, `viewBox="${vb}" preserveAspectRatio="xMidYMid slice"`);
}

const ANSWERS = {
  mismatch: [['label', 'Label is right'], ['shelf', 'Shelf is right: move the label'], ['skip', 'Can’t tell from this']],
  unknown: [['new', 'New product: add to catalogue'], ['same', 'It is the labelled product'], ['skip', 'Can’t tell from this']],
  facing: [['yes', 'Yes, needs facing'], ['design', 'No, new pack design'], ['skip', 'Can’t tell from this']],
};

function renderReview() {
  if (!state.reviews.length) {
    main.innerHTML = `<section class="card"><div class="card-head"><h2>Review</h2></div><p class="empty">Nothing to review. Every answer here becomes a verified fact and a new reference image for recognition.</p></section>`;
    return;
  }
  main.innerHTML = `<div class="card-head" style="margin-bottom:16px"><h2>Review <span class="meta">· what vision was unsure about</span></h2><span class="meta">Each answer becomes a verified fact and a new reference image</span></div>
    <div class="reviews">${state.reviews.map((r) => {
      const s = SLOTS[r.slot];
      return `<section class="card review st-${r.kind}">
        <div class="crop">${crop(r.slot)}</div>
        <div class="issue-line st-${r.kind}"><span class="ico">${icon(r.kind)}</span><span><b>${ISSUE[r.kind].label}</b> · ${s.fixture} level ${s.level}</span></div>
        <p>${esc(r.text)}</p>
        <div class="conf">Vision confidence ${r.confidence.toFixed(2)} · captured ${ago(fixtureById(s.fixture).captured)}</div>
        <div class="actions">${ANSWERS[r.kind].map(([k, t], i) => `<button class="btn${i === 0 ? ' primary' : ''}" data-review="${r.id}" data-answer="${k}">${esc(t)}</button>`).join('')}</div>
      </section>`;
    }).join('')}</div>`;
  main.querySelectorAll('[data-review]').forEach((b) => b.addEventListener('click', () => {
    const r = state.reviews.find((x) => x.id === b.dataset.review);
    const s = SLOTS[r.slot];
    const a = b.dataset.answer;
    if (a === 'skip') { toast('Kept for the next capture'); return; }
    if (r.kind === 'mismatch') { if (a === 'shelf') s.product = s.seen; s.issue = null; }
    if (r.kind === 'unknown') s.issue = null;
    if (r.kind === 'facing' && a === 'design') s.issue = null;
    state.reviews = state.reviews.filter((x) => x !== r);
    toast('Saved as verified. The image goes to the reference gallery.');
    updateBadge();
    renderReview();
  }));
}

// ---------- captures view ----------

function renderCaptures() {
  const rows = FIXTURES.map((f) => {
    const c = CAPTURES.find((x) => x.fixture === f.id);
    const st = fixtureStatus(f);
    return `<tr><td><b>${f.id}</b> ${esc(f.name)}</td><td>${esc(f.kind)}</td><td>${ago(f.captured)}</td><td>${esc(c.by)}</td><td>${c.frames}</td>
      <td><span class="st st-${st}">${icon(st)}${st === 'ok' ? 'OK' : ISSUE[st].label}</span></td>
      <td><button class="btn" data-capture="${f.id}">Ask for a capture</button></td></tr>`;
  }).join('');
  main.innerHTML = `<section class="card"><div class="card-head"><h2>Captures</h2><span class="meta">Fixtures are captured with a guided phone sweep, about a minute each</span></div>
    <table><thead><tr><th>Fixture</th><th>Type</th><th>Last capture</th><th>By</th><th>Keyframes</th><th>Status</th><th></th></tr></thead><tbody>${rows}</tbody></table></section>`;
  main.querySelectorAll('[data-capture]').forEach((b) => b.addEventListener('click', () => {
    toast(`Capture of ${b.dataset.capture} requested. It shows on the shift’s phones.`);
    b.disabled = true; b.textContent = 'Requested';
  }));
}

// ---------- shell ----------

let toastTimer;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg; t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.hidden = true; }, 3500);
}

function updateBadge() { $('#review-count').textContent = state.reviews.length || ''; }

function route() {
  const view = (location.hash.slice(1) || 'map');
  document.querySelectorAll('.side a').forEach((a) => { if (a.dataset.view === view) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
  if (view === 'review') renderReview();
  else if (view === 'captures') renderCaptures();
  else renderMap();
}

$('#today').textContent = TODAY.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
updateBadge();
window.addEventListener('hashchange', () => { route(); main.focus({ preventScroll: true }); });
route();
