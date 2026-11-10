// The batch table: every batch received in the store, with its date and place.
// Kept in localStorage for the prototype. A real system would sit on the
// store's own stock data.

import { PRODUCTS, productByGtin } from './products.js';

const KEY = 'hyllykartta-v1';
const WARN_DAYS = 2;  // label when this many days or fewer are left (same as the simulation)
const SOON_DAYS = 4;  // "check soon" on the shelf map

// ---------- dates (local calendar days) ----------

export const isoDate = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const parse = (iso) => { const [y, m, d] = iso.split('-').map(Number); return Date.UTC(y, m - 1, d); };
export const daysBetween = (a, b) => Math.round((parse(b) - parse(a)) / 86400000);
export const addDays = (iso, n) => { const t = new Date(parse(iso) + n * 86400000); return `${t.getUTCFullYear()}-${String(t.getUTCMonth() + 1).padStart(2, '0')}-${String(t.getUTCDate()).padStart(2, '0')}`; };

// ---------- state ----------

const blank = () => ({ batches: [], dayOffset: 0, lang: 'fi', role: 'all', seq: 0 });

let state = load();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...blank(), ...JSON.parse(raw) };
  } catch { /* storage blocked: run in memory */ }
  return blank();
}

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
}

export const get = () => state;
export const today = () => addDays(isoDate(new Date()), state.dayOffset);

export function set(patch) { state = { ...state, ...patch }; save(); }

export function reset() { state = { ...blank(), lang: state.lang }; save(); }

// ---------- batches ----------

// status: 'active' | 'labelled' | 'removed' | 'notfound'
export function findBatch(gtin, batch) {
  return state.batches.find((b) => b.gtin === gtin && b.batch === batch && b.status !== 'removed' && b.status !== 'notfound');
}

export function receive({ gtin, batch, expiry, qty }) {
  const product = productByGtin(gtin);
  const b = {
    id: `b${++state.seq}`, gtin, batch, expiry, qty,
    section: product?.section ?? '?', received: today(), status: 'active', labelled: 0, history: [],
  };
  state.batches.push(b);
  save();
  return b;
}

export function update(id, patch, note) {
  const b = state.batches.find((x) => x.id === id);
  if (!b) return null;
  const before = { status: b.status, labelled: b.labelled };
  Object.assign(b, patch);
  b.history.push({ on: today(), note });
  save();
  return before;
}

export function restore(id, before) {
  const b = state.batches.find((x) => x.id === id);
  if (!b) return;
  Object.assign(b, before);
  b.history.pop();
  save();
}

// A demo shelf whose dates are relative to today, so there is always work.
export function seedDemo() {
  const t = today();
  const plan = [
    [0, 'L2411', -1, 4], [0, 'L2412', 6, 12],
    [1, 'J118', 2, 5], [1, 'J121', 15, 8],
    [2, 'J120', 9, 8],
    [3, 'K77', 1, 3], [3, 'K79', 12, 6],
    [4, 'V305', 3, 4],
    [5, 'R12', 2, 2], [5, 'R14', 14, 6],
    [6, 'V9001', 40, 10],
    [7, 'RK33', 5, 7],
  ];
  state.batches = [];
  for (const [i, batch, days, qty] of plan) {
    receive({ gtin: PRODUCTS[i].gtin, batch, expiry: addDays(t, days), qty });
  }
  // Pretend they arrived on earlier days.
  for (const b of state.batches) b.received = addDays(b.expiry, -productByGtin(b.gtin).shelfLife);
  save();
}

// ---------- tasks ----------

// A task is a prompt to look at the shelf (design principle P4), never a claim
// about how many units are there.
export function tasks() {
  const t = today();
  const out = [];
  for (const b of state.batches) {
    if (b.status !== 'active' && b.status !== 'labelled') continue;
    const left = daysBetween(t, b.expiry);
    if (left < 0) out.push({ type: 'remove', batch: b, left });
    else if (b.status === 'active' && left <= WARN_DAYS) out.push({ type: 'label', batch: b, left });
  }
  out.sort((a, b) => (a.type === b.type ? a.left - b.left : a.type === 'remove' ? -1 : 1));
  return state.role === 'label' ? out.filter((x) => x.type === 'label') : out;
}

export function nextUpcoming() {
  const t = today();
  return state.batches
    .filter((b) => b.status === 'active' && daysBetween(t, b.expiry) > WARN_DAYS)
    .sort((a, b) => a.expiry.localeCompare(b.expiry))[0] ?? null;
}

// Shelf map: one status per section, the most urgent batch wins.
export function sectionStatus(section) {
  const t = today();
  const rank = { remove: 0, label: 1, soon: 2, ok: 3, empty: 4 };
  let status = 'empty', soonest = null;
  for (const b of state.batches) {
    if (b.section !== section || (b.status !== 'active' && b.status !== 'labelled')) continue;
    const left = daysBetween(t, b.expiry);
    let s = 'ok';
    if (left < 0) s = 'remove';
    else if (b.status === 'active' && left <= WARN_DAYS) s = 'label';
    else if (left <= SOON_DAYS) s = 'soon';
    if (rank[s] < rank[status]) status = s;
    if (!soonest || b.expiry < soonest.expiry) soonest = b;
  }
  return { status, soonest };
}

export { WARN_DAYS };
