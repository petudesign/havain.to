// Hyllykartta shelf simulation.
//
// One dairy shelf, day by day. Compares four ways of finding near-expiry
// products under the same demand and the same staff time:
//
//   route      Today's practice. Walk the shelf in order as far as time allows.
//              Without a shared record the next shift often starts over.
//   manualMap  The 2025 S-hävikki concept. Staff record the earliest date they
//              see in each section; the map prioritises from those records.
//   dataMap    The 2026 idea. Dates come from GS1 2D codes scanned at restocking
//              and at checkout, so the map knows each section's batches.
//   dataSmart  Same data, plus the section's sales rate. Only the units that
//              would not sell before their date get a label.
//
// This is a comparison between strategies under shared assumptions, not a
// prediction of real waste. Every parameter carries a status:
//   assumption  no source yet
//   sourced     a source exists in docs/research/report.md but is not verified
//   verified    Petteri has checked the source (docs/research/verification.md)
//   experience  Petteri's own shop-floor experience (docs/field-notes.md)
//   model       a modelling choice, not a fact about stores
// Research question IDs (D11 etc.) refer to docs/research/brief.md.
//
// Plain ES module, no dependencies. Runs in Node and in the browser.

export const PARAMS = {
  sections:            { value: 40,   unit: 'sections',     status: 'assumption', note: 'One dairy shelf run, one product per section.' },
  shelfLifeMin:        { value: 7,    unit: 'days',         status: 'experience', research: 'D11', note: 'Remaining shelf life when the batch reaches the shelf. No published data (D11). Calibrated with stockDays so fast sellers almost never reach the label window (field notes O1).' },
  shelfLifeMax:        { value: 14,   unit: 'days',         status: 'assumption', research: 'D11' },
  shortBatchShare:     { value: 0.05, unit: 'share',        status: 'experience', note: 'Deliveries that arrive with a shorter date than usual (field notes O1, exception). Share is a guess.' },
  shortBatchBy:        { value: 3,    unit: 'days',         status: 'assumption', note: 'How much shorter such a batch is.' },
  demandMin:           { value: 0.5,  unit: 'units/day',    status: 'assumption', research: 'D11', note: 'Average daily sales per section, drawn log-uniformly per product: many slow sellers, a few fast ones.' },
  demandMax:           { value: 10,   unit: 'units/day',    status: 'assumption', research: 'D11' },
  stockDays:           { value: 2,    unit: 'days',         status: 'experience', note: 'Shelf capacity as days of average demand. Restocked to capacity every morning. Calibrated with shelfLifeMin (field notes O1).' },
  minFacing:           { value: 6,    unit: 'units',        status: 'assumption', note: 'Smallest amount a section holds, whatever the demand. Slow sellers still fill a facing.' },
  misrotate:           { value: 0.1,  unit: 'probability',  status: 'experience', note: 'Restocking puts the new batch in front of older units (field notes O5). Probability is a guess.' },
  facingFix:           { value: 0.5,  unit: 'probability',  status: 'experience', note: 'Chance that a facing round between shifts puts the oldest units back in front (field notes O3). Facing time is not counted in staffMinutes.' },
  shrinkRate:          { value: 0.003, unit: 'per unit/day', status: 'assumption', note: 'Units that disappear from the shelf: theft, breakage, misplaced (field notes, hard part).' },
  shrinkRecorded:      { value: 0.5,  unit: 'share',        status: 'assumption', note: 'Share of lost units that get recorded. The rest stay in the system as ghost stock until someone looks at the shelf.' },
  replenish:           { value: 'topup', unit: 'rule',      status: 'model',      note: "'topup': fill the shelf every morning. 'case': add whole cases only when stock falls to the reorder point." },
  caseSize:            { value: 6,    unit: 'units',        status: 'assumption', note: "Case size for 'case' replenishment." },
  reorderDays:         { value: 1,    unit: 'days',         status: 'assumption', note: "'case' replenishment: reorder when stock covers this many days of demand." },
  backPick:            { value: 0.45, unit: 'share',        status: 'sourced',    research: 'D12', note: 'Picks that take a later date than the one in front. Dairy 45 %, all categories 29 % (Hübner, TUM 2022, field count). Figures from a search snippet; check the slides.' },
  warnDays:            { value: 2,    unit: 'days',         status: 'assumption', note: 'Label when this many days or fewer are left. Matches the 2025 colour logic.' },
  discount:            { value: 0.30, unit: 'share',        status: 'assumption', research: 'C9' },
  discountPick:        { value: 0.5,  unit: 'share',        status: 'assumption', research: 'D13', note: 'Regular customers who take a labelled unit when one is on the shelf.' },
  discountExtraDemand: { value: 0.4,  unit: 'x demand',     status: 'assumption', research: 'D13', note: 'Extra bargain demand for labelled units, as a multiple of base demand.' },
  price:               { value: 2.0,  unit: '€',            status: 'assumption', note: 'Average unit price.' },
  unitCost:            { value: 0.7,  unit: 'x price',      status: 'assumption', note: 'Purchase cost as a share of the shelf price. Every unit restocked is paid for, sold or not.' },
  staffCostPerHour:    { value: 20,   unit: '€/h',          status: 'assumption', note: 'Employer cost of one working hour. Used for margin after staff time. Needs a source.' },
  staffMinutes:        { value: 20,   unit: 'min/day',      status: 'assumption', research: 'D14', note: 'Time for date checks on this shelf per day, split over two shifts.' },
  shifts:              { value: 2,    unit: 'shifts/day',   status: 'assumption' },
  minPerCheck:         { value: 0.75, unit: 'min/section',  status: 'assumption', research: 'D14', note: 'Walk to a section and look through it.' },
  minPerLabel:         { value: 0.1,  unit: 'min/unit',     status: 'assumption', research: 'D14' },
  minPerRecord:        { value: 0.25, unit: 'min/section',  status: 'assumption', note: 'Manual map only: write down the earliest date seen.' },
  detectManual:        { value: 0.85, unit: 'probability',  status: 'assumption', research: 'D14', note: 'Chance of spotting a near-expiry batch when looking without guidance.' },
  detectGuided:        { value: 0.95, unit: 'probability',  status: 'assumption', note: 'Data map: staff know which product and date to look for.' },
  handoverMemory:      { value: 0.4,  unit: 'probability',  status: 'assumption', note: 'Route: chance the next shift continues where the last one stopped.' },
  recheckDays:         { value: 4,    unit: 'days',         status: 'assumption', note: 'Manual map: re-check a section after this many days even if its record looks fine.' },
  dataCoverage:        { value: 1.0,  unit: 'share',        status: 'assumption', research: 'A2–A3', note: 'Share of sections whose products carry a 2D code. Others fall back to manual records.' },
  fastSeller:          { value: 3,    unit: 'units/day',    status: 'model',      note: 'Sections selling at least this much count as fast sellers in the diagnostics.' },
  days:                { value: 28,   unit: 'days',         status: 'model',      note: 'Measured period.' },
  warmupDays:          { value: 14,   unit: 'days',         status: 'model',      note: 'Run before measuring so the shelf reaches a steady state.' },
};

export const STRATEGIES = [
  { id: 'route',     label: 'Route',          short: 'Today’s practice' },
  { id: 'manualMap', label: 'Manual map',     short: '2025 concept' },
  { id: 'dataMap',   label: 'Map + 2D data',  short: '2026 idea' },
  { id: 'dataSmart', label: 'Map + 2D + sales', short: 'Label only the excess' },
];

export function defaults() {
  const p = {};
  for (const [k, v] of Object.entries(PARAMS)) p[k] = v.value;
  return p;
}

// ---------- random numbers ----------

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function poisson(rng, lambda) {
  if (lambda <= 0) return 0;
  const L = Math.exp(-lambda);
  let k = 0, p = 1;
  do { k++; p *= rng(); } while (p > L);
  return k - 1;
}

const randInt = (rng, lo, hi) => lo + Math.floor(rng() * (hi - lo + 1));

// ---------- shelf ----------

// A section holds batches: { expiry, n, d, g }. expiry = last day it may be
// sold. n = units without a discount label, d = labelled units, g = ghost
// units: gone from the shelf but still in the stock records. Only the 2D data
// strategies read g; a person looking at the shelf sees the truth and clears it.
// s.misrotated = the newest batch sits in front of older ones.

function makeShelf(p, rng) {
  const sections = [];
  for (let i = 0; i < p.sections; i++) {
    const demand = p.demandMin * Math.pow(p.demandMax / p.demandMin, rng());
    sections.push({
      demand,
      shelfLife: randInt(rng, p.shelfLifeMin, p.shelfLifeMax),
      capacity: Math.max(p.minFacing, Math.ceil(demand * p.stockDays)),
      caseSize: p.caseSize,
      reorderAt: Math.max(1, Math.ceil(demand * p.reorderDays)),
      covered: rng() < p.dataCoverage,
      batches: [],
      record: null,      // manual map: { earliest, checkedOn }
    });
  }
  return sections;
}

const units = (s) => s.batches.reduce((a, b) => a + b.n + b.d, 0);
const labelled = (s) => s.batches.reduce((a, b) => a + b.d, 0);

function restock(s, day, p, rng) {
  let missing = s.capacity - units(s);
  if (p.replenish === 'case') {
    // Order whole cases only when the shelf runs low.
    const have = units(s);
    if (have > s.reorderAt) return 0;
    const cases = Math.max(1, Math.floor((s.capacity - have) / s.caseSize));
    missing = cases * s.caseSize;
  }
  if (missing <= 0) return 0;
  let life = s.shelfLife + randInt(rng, -1, 1);
  if (rng() < p.shortBatchShare) life -= p.shortBatchBy;
  const expiry = day + Math.max(1, life);
  if (s.batches.some((b) => b.n + b.d > 0 && b.expiry < expiry) && rng() < p.misrotate) s.misrotated = true;
  s.batches.push({ expiry, n: missing, d: 0, g: 0 });
  s.batches.sort((a, b) => a.expiry - b.expiry);
  return missing;
}

function takeOne(s, batch, preferLabelled) {
  if (preferLabelled ? batch.d > 0 : batch.n === 0) { batch.d--; return true; }
  batch.n--; return false;
}

// Sell during half a day. Returns { full, disc } units sold.
function sell(s, p, rng, frac) {
  let full = 0, disc = 0;
  const customers = poisson(rng, s.demand * frac);
  const bs = s.batches;
  for (let c = 0; c < customers; c++) {
    let first = null, last = null, withLabel = null;
    for (let j = 0; j < bs.length; j++) {
      const b = bs[j];
      if (b.n + b.d === 0) continue;
      if (!first) first = b;
      if (!withLabel && b.d > 0) withLabel = b;
      last = b;
    }
    if (!first) break;
    let wasDisc;
    if (withLabel && rng() < p.discountPick) wasDisc = takeOne(s, withLabel, true);
    else if (rng() < p.backPick || s.misrotated) wasDisc = takeOne(s, last, false);
    else wasDisc = takeOne(s, first, false);
    wasDisc ? disc++ : full++;
  }
  // Bargain hunters only take labelled units.
  let extra = labelled(s) > 0 ? poisson(rng, s.demand * p.discountExtraDemand * frac) : 0;
  for (const b of s.batches) {
    const k = Math.min(extra, b.d);
    b.d -= k; disc += k; extra -= k;
  }
  return { full, disc };
}

// Units that vanish: theft, breakage, misplaced. Some are recorded; the rest
// become ghost stock in the records.
function shrink(s, p, rng) {
  let lost = 0;
  for (const b of s.batches) {
    for (let k = b.n + b.d; k > 0; k--) {
      if (rng() >= p.shrinkRate) continue;
      if (b.n > 0) b.n--; else b.d--;
      lost++;
      if (rng() >= p.shrinkRecorded) b.g++;
    }
  }
  return lost;
}

// End of day: batches past their date are waste.
function expire(s, day) {
  let missed = 0, waste = 0;
  s.batches = s.batches.filter((b) => {
    if (b.expiry > day) return true;
    if (b.n + b.d === 0) return false;
    missed += b.n; waste += b.n + b.d;
    return false;
  });
  return { missed, waste };
}

// ---------- staff work ----------

// Look through a section and label what you spot. Returns minutes used, or
// -1 if there was no time to even start.
function visit(s, day, p, rng, budget, detect, m, extraMin = 0, limit = null) {
  const base = p.minPerCheck + extraMin;
  if (budget < base) return -1;
  let used = base, labelledNow = 0;
  s.misrotated = false;            // looking through a section puts the oldest in front
  for (const b of s.batches) b.g = 0; // and shows what is really there
  for (const b of s.batches) {
    if (b.n === 0 || b.expiry - day > p.warnDays) continue;
    if (rng() >= detect) continue;
    const want = limit ? Math.min(b.n, limit(b)) : b.n;
    if (want <= 0) continue;
    const canLabel = Math.min(want, Math.floor((budget - used) / p.minPerLabel));
    b.n -= canLabel; b.d += canLabel;
    used += canLabel * p.minPerLabel;
    labelledNow += canLabel;
    m.labels += canLabel;
    if (s.demand >= p.fastSeller) m.labelsFast += canLabel;
  }
  m.visits++;
  if (labelledNow === 0) m.emptyVisits++;
  if (s.lastVisit === day) m.repeatVisits++;
  s.lastVisit = day;
  return used;
}

// Manual record: earliest unlabelled date the person notices.
function writeRecord(s, day, p, rng) {
  let earliest = null;
  for (const b of s.batches) {
    if (b.n === 0) continue;
    if (rng() < p.detectManual) { earliest = b.expiry; break; }
  }
  s.record = { earliest, checkedOn: day };
}

function shiftRoute(shelf, day, p, rng, budget, state, m) {
  if (rng() >= p.handoverMemory) state.pos = 0;
  let left = budget;
  for (let k = 0; k < shelf.length; k++) {
    const i = (state.pos + k) % shelf.length;
    const used = visit(shelf[i], day, p, rng, left, p.detectManual, m);
    if (used < 0) { state.pos = i; return budget - left; }
    left -= used;
  }
  return budget - left;
}

function manualDue(s, day, p) {
  if (!s.record) return true;
  if (day - s.record.checkedOn >= p.recheckDays) return true;
  return s.record.earliest !== null && s.record.earliest - day <= p.warnDays;
}

function shiftManualMap(sections, day, p, rng, budget, m) {
  const due = sections
    .filter((s) => manualDue(s, day, p))
    .sort((a, b) => key(a) - key(b));
  function key(s) { return s.record?.earliest ?? (s.record ? s.record.checkedOn + p.recheckDays : -1e9); }
  let left = budget;
  for (const s of due) {
    const used = visit(s, day, p, rng, left, p.detectManual, m, p.minPerRecord);
    if (used < 0) break;
    writeRecord(s, day, p, rng);
    left -= used;
  }
  return budget - left;
}

function shiftDataMap(shelf, day, p, rng, budget, m) {
  const earliestOpen = (s) => {
    const b = s.batches.find((x) => x.n + x.g > 0);
    return b ? b.expiry : Infinity;
  };
  const due = shelf
    .filter((s) => s.covered && earliestOpen(s) - day <= p.warnDays)
    .sort((a, b) => earliestOpen(a) - earliestOpen(b));
  let left = budget;
  for (const s of due) {
    const used = visit(s, day, p, rng, left, p.detectGuided, m);
    if (used < 0) return budget;
    left -= used;
  }
  // Sections without 2D codes fall back to manual records.
  const uncovered = shelf.filter((s) => !s.covered);
  if (uncovered.length) left -= shiftManualMap(uncovered, day, p, rng, left, m);
  return budget - left;
}

// Units in this batch and older ones that are not expected to sell before
// the batch's date, minus labels already on them. Customers who reach to the
// back do not buy the older batches, so only the front-picking share counts.
// The true rates stand in for estimates from batch-level checkout data.
function excessFor(s, b, day, p) {
  let ahead = 0, labelledAhead = 0;
  for (const x of s.batches) {
    if (x.expiry > b.expiry) break;
    ahead += x.n + x.d + x.g; labelledAhead += x.d;
  }
  const expected = s.demand * (1 - p.backPick) * (b.expiry - day + 1);
  return Math.ceil(ahead - expected) - labelledAhead;
}

function shiftDataSmart(shelf, day, p, rng, budget, m) {
  const need = (s) => s.batches.some((b) => b.n + b.g > 0 && b.expiry - day <= p.warnDays && excessFor(s, b, day, p) > 0);
  const earliest = (s) => s.batches.find((b) => b.n + b.g > 0)?.expiry ?? Infinity;
  const due = shelf.filter((s) => s.covered && need(s)).sort((a, b) => earliest(a) - earliest(b));
  let left = budget;
  for (const s of due) {
    const used = visit(s, day, p, rng, left, p.detectGuided, m, 0, (b) => excessFor(s, b, day, p));
    if (used < 0) return budget;
    left -= used;
  }
  const uncovered = shelf.filter((s) => !s.covered);
  if (uncovered.length) left -= shiftManualMap(uncovered, day, p, rng, left, m);
  return budget - left;
}

// ---------- one run ----------

export function simulate(params, strategy, seed = 1) {
  const p = { ...defaults(), ...params };
  // Separate streams so demand stays as similar as possible across strategies.
  const shelfRng = mulberry32(seed * 7919 + 1);
  const demandRng = mulberry32(seed * 104729 + 2);
  const staffRng = mulberry32(seed * 1299709 + 3);
  const opsRng = mulberry32(seed * 15485863 + 4);

  const shelf = makeShelf(p, shelfRng);
  const routeState = { pos: 0 };
  const m = blankMetrics();
  const total = p.warmupDays + p.days;
  const perShift = p.staffMinutes / p.shifts;

  for (let day = 0; day < total; day++) {
    const measuring = day >= p.warmupDays;
    const tally = measuring ? m : blankMetrics();
    for (const s of shelf) {
      tally.bought += restock(s, day, p, shelfRng);
      // Diagnostic for the electronic shelf label idea: when a section has an
      // unlabelled batch in the label window, is it the only batch there?
      const stocked = s.batches.filter((b) => b.n + b.d > 0);
      if (stocked.some((b) => b.n > 0 && b.expiry - day <= p.warnDays)) {
        tally.windowSections++;
        if (stocked.length === 1) tally.windowSingleBatch++;
        else if (stocked.every((b) => b.expiry - day <= p.warnDays)) tally.windowAllNear++;
      }
      if (s.demand >= p.fastSeller) {
        tally.fastDays++;
        if (s.batches.some((b) => b.n + b.d > 0 && b.expiry - day <= p.warnDays)) tally.fastInWindow++;
      }
    }

    for (let sh = 0; sh < p.shifts; sh++) {
      let used = 0;
      if (strategy === 'route') used = shiftRoute(shelf, day, p, staffRng, perShift, routeState, tally);
      else if (strategy === 'manualMap') used = shiftManualMap(shelf, day, p, staffRng, perShift, tally);
      else if (strategy === 'dataMap') used = shiftDataMap(shelf, day, p, staffRng, perShift, tally);
      else if (strategy === 'dataSmart') used = shiftDataSmart(shelf, day, p, staffRng, perShift, tally);
      else throw new Error(`Unknown strategy: ${strategy}`);
      tally.minutes += used;

      for (const s of shelf) {
        const { full, disc } = sell(s, p, demandRng, 1 / p.shifts);
        tally.soldFull += full; tally.soldDisc += disc;
        tally.lost += shrink(s, p, opsRng);
        if (s.misrotated && opsRng() < p.facingFix) s.misrotated = false;
      }
    }
    for (const s of shelf) {
      const { missed, waste } = expire(s, day);
      tally.missed += missed; tally.waste += waste;
    }
  }

  const weeks = p.days / 7;
  const sold = m.soldFull + m.soldDisc;
  return {
    missedPerWeek: m.missed / weeks,
    wastePerWeek: m.waste / weeks,
    wasteEuroPerWeek: (m.waste * p.price) / weeks,
    recoveredEuroPerWeek: (m.soldDisc * p.price * (1 - p.discount)) / weeks,
    markdownEuroPerWeek: (m.soldDisc * p.price * p.discount) / weeks,
    revenueEuroPerWeek: ((m.soldFull + m.soldDisc * (1 - p.discount)) * p.price) / weeks,
    marginEuroPerWeek: ((m.soldFull + m.soldDisc * (1 - p.discount)) * p.price - m.bought * p.unitCost * p.price) / weeks,
    staffEuroPerWeek: (m.minutes / 60) * p.staffCostPerHour / weeks,
    marginAfterStaffEuroPerWeek: ((m.soldFull + m.soldDisc * (1 - p.discount)) * p.price - m.bought * p.unitCost * p.price - (m.minutes / 60) * p.staffCostPerHour) / weeks,
    labelledWastePerWeek: (m.waste - m.missed) / weeks,
    lostPerWeek: m.lost / weeks,
    minutesPerDay: m.minutes / p.days,
    visitsPerDay: m.visits / p.days,
    emptyVisitShare: m.visits ? m.emptyVisits / m.visits : 0,
    repeatVisitsPerDay: m.repeatVisits / p.days,
    wasteRate: m.waste / (sold + m.waste || 1),
    labelsPerWeek: m.labels / weeks,
    labelsFastShare: m.labels ? m.labelsFast / m.labels : 0,
    fastInWindowShare: m.fastDays ? m.fastInWindow / m.fastDays : 0,
    windowSingleBatchShare: m.windowSections ? m.windowSingleBatch / m.windowSections : 0,
    windowAllNearShare: m.windowSections ? m.windowAllNear / m.windowSections : 0,
  };
}

function blankMetrics() {
  return { windowSections: 0, windowSingleBatch: 0, windowAllNear: 0, lost: 0, labels: 0, labelsFast: 0, fastDays: 0, fastInWindow: 0, bought: 0, missed: 0, waste: 0, soldFull: 0, soldDisc: 0, minutes: 0, visits: 0, emptyVisits: 0, repeatVisits: 0 };
}

// ---------- many runs ----------

function quantile(sorted, q) {
  const i = (sorted.length - 1) * q;
  const lo = Math.floor(i), hi = Math.ceil(i);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (i - lo);
}

export function monteCarlo(params, strategy, runs = 200, seedBase = 1) {
  const results = [];
  for (let r = 0; r < runs; r++) results.push(simulate(params, strategy, seedBase + r));
  const summary = {};
  for (const k of Object.keys(results[0])) {
    const xs = results.map((x) => x[k]).sort((a, b) => a - b);
    summary[k] = {
      mean: xs.reduce((a, b) => a + b, 0) / xs.length,
      p10: quantile(xs, 0.1),
      median: quantile(xs, 0.5),
      p90: quantile(xs, 0.9),
    };
  }
  return summary;
}

// Paired comparison: same seeds for both strategies, so the difference
// reflects the strategy rather than luck in demand.
export function pairedDiff(params, a, b, metric, runs = 200, seedBase = 1) {
  const diffs = [];
  for (let r = 0; r < runs; r++) {
    diffs.push(simulate(params, a, seedBase + r)[metric] - simulate(params, b, seedBase + r)[metric]);
  }
  diffs.sort((x, y) => x - y);
  return { median: quantile(diffs, 0.5), p10: quantile(diffs, 0.1), p90: quantile(diffs, 0.9) };
}

// Sweep over staff minutes. For each point: per-strategy summaries, plus the
// paired difference to the route strategy on the same seeds.
export function sweep(params, minutesList, runs = 80, seedBase = 1) {
  const out = { summary: {}, vsRoute: {} };
  for (const s of STRATEGIES) { out.summary[s.id] = []; out.vsRoute[s.id] = []; }
  for (const minutes of minutesList) {
    const p = { ...params, staffMinutes: minutes };
    const raw = {};
    for (const s of STRATEGIES) {
      raw[s.id] = [];
      for (let r = 0; r < runs; r++) raw[s.id].push(simulate(p, s.id, seedBase + r));
    }
    for (const s of STRATEGIES) {
      out.summary[s.id].push(summarise(raw[s.id]));
      const diffs = raw[s.id].map((x, r) => {
        const d = {};
        for (const k of Object.keys(x)) d[k] = x[k] - raw.route[r][k];
        return d;
      });
      out.vsRoute[s.id].push(summarise(diffs));
    }
  }
  return out;
}

function summarise(results) {
  const summary = {};
  for (const k of Object.keys(results[0])) {
    const xs = results.map((x) => x[k]).sort((a, b) => a - b);
    summary[k] = { mean: xs.reduce((a, b) => a + b, 0) / xs.length, p10: quantile(xs, 0.1), median: quantile(xs, 0.5), p90: quantile(xs, 0.9) };
  }
  return summary;
}
