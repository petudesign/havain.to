// Demo store for the Havain maintenance centre.
// A fictional dairy and chilled department. Everything here is simulated:
// in the product, fixtures and slots come from phone captures (vision), and
// batches from 2D-code and receiving scans.
//
// Facts carry a state, as in the platform data model:
//   observed  seen in a capture or scanned, with evidence
//   inferred  derived from other facts (e.g. a batch is probably in this slot)
//   verified  confirmed by a person or an authoritative scan

const DAY = 86400000;
const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const TODAY = startOfDay(new Date());
export const daysFrom = (n) => new Date(TODAY.getTime() + n * DAY);
export const hoursAgo = (h) => new Date(Date.now() - h * 3600000);

function gtin(n) {
  const body = `0952000001${String(n).padStart(3, '0')}`;
  let sum = 0;
  for (let i = body.length - 1, w = 3; i >= 0; i--, w = 4 - w) sum += Number(body[i]) * w;
  return body + ((10 - (sum % 10)) % 10);
}

// kind decides how the product is drawn on the shelf front.
const P = (n, name, kind, c1, c2, price) => ({ id: `p${n}`, gtin: gtin(n), name, kind, c1, c2, price });

export const PRODUCTS = Object.fromEntries([
  P(1, 'Semi-skimmed milk 1 l', 'carton', '#2f6fd1', '#e9eef7', '1,29'),
  P(2, 'Skimmed milk 1 l', 'carton', '#e9eef7', '#2f6fd1', '1,25'),
  P(3, 'Whole milk 1 l', 'carton', '#d23f3f', '#f7e9e9', '1,49'),
  P(4, 'Lactose-free milk 1 l', 'carton', '#e9eef7', '#2c9a5c', '1,69'),
  P(5, 'Buttermilk 1 l', 'carton', '#f2c94c', '#e9eef7', '1,15'),
  P(6, 'Oat drink 1 l', 'carton', '#c9a77c', '#f3ece2', '1,99'),
  P(10, 'Natural yoghurt 150 g', 'pot', '#f3f0ea', '#2f6fd1', '0,89'),
  P(11, 'Strawberry yoghurt 150 g', 'pot', '#f6d7de', '#d23f3f', '0,99'),
  P(12, 'Raspberry yoghurt 150 g', 'pot', '#f3cfe3', '#a8327a', '0,99'),
  P(13, 'Blueberry yoghurt 150 g', 'pot', '#dcdcf3', '#3b3b9e', '0,99'),
  P(14, 'Greek-style yoghurt 400 g', 'tub', '#f5f5f5', '#1d4f86', '2,39'),
  P(15, 'Vanilla yoghurt 1 kg', 'tub', '#fff3d6', '#c98500', '2,89'),
  P(20, 'Quark 250 g', 'tub', '#e8f1e3', '#2c9a5c', '1,09'),
  P(21, 'Vanilla quark 200 g', 'pot', '#fff3d6', '#c98500', '1,15'),
  P(22, 'Berry quark 200 g', 'pot', '#f6d7de', '#7d2847', '1,15'),
  P(23, 'Cottage cheese 200 g', 'tub', '#eaf2fb', '#2f6fd1', '1,59'),
  P(30, 'Cooking cream 2 dl', 'small', '#f3efe6', '#7a4b12', '0,99'),
  P(31, 'Whipping cream 2 dl', 'small', '#eaf2fb', '#1d4f86', '1,39'),
  P(32, 'Sour cream 200 g', 'pot', '#f5f5f5', '#2c9a5c', '0,95'),
  P(33, 'Crème fraîche 200 g', 'pot', '#f5f5f5', '#a8327a', '1,49'),
  P(40, 'Vanilla pudding 4 × 125 g', 'pack', '#f7d36b', '#7a4b12', '2,49'),
  P(41, 'Chocolate pudding 4 × 125 g', 'pack', '#7a4b2a', '#f3e2c9', '2,49'),
  P(42, 'Strawberry pudding 4 × 125 g', 'pack', '#e7b4c9', '#7d2847', '2,49'),
  P(43, 'Rice pudding 4 × 150 g', 'pack', '#c9e2f5', '#1d4f86', '2,69'),
  P(50, 'Butter 500 g', 'block', '#f2c94c', '#2c6e3f', '4,19'),
  P(51, 'Spread 400 g', 'tub', '#fff3d6', '#2c9a5c', '2,79'),
  P(52, 'Margarine 600 g', 'tub', '#fbe9a8', '#c98500', '2,49'),
  P(60, 'Edam 400 g', 'block', '#f4b860', '#c0392b', '4,89'),
  P(61, 'Emmental 300 g', 'block', '#f6dfa0', '#2f6fd1', '4,49'),
  P(62, 'Feta 200 g', 'block', '#f5f5f5', '#1d4f86', '2,99'),
  P(63, 'Cheese slices 150 g', 'small', '#f4b860', '#2c9a5c', '2,29'),
  P(70, 'Orange juice 1 l', 'carton', '#f39c12', '#fff3d6', '2,49'),
  P(71, 'Apple juice 1 l', 'carton', '#7fbf3f', '#f3f7e9', '2,29'),
  P(72, 'Multifruit juice 1 l', 'carton', '#e74c3c', '#fff3d6', '2,59'),
].map((p) => [p.id, p]));

// A slot: product above a shelf-edge label, with what the latest capture saw.
// issue: null | 'near' | 'remove' | 'gap' | 'facing' | 'mismatch' | 'unknown'
const S = (product, facings, extra = {}) => ({ product, facings, issue: null, batches: null, ...extra });

// Batches with dates. In the product these come from receiving and 2D scans;
// their position on the shelf is inferred until someone scans them there.
const B = (lot, days, qty, state, note) => ({ lot, expiry: daysFrom(days), qty, state, note });

// Floor plan coordinates are in centimetres on a 1400 × 800 department plan.
export const FIXTURES = [
  {
    id: 'A1', name: 'Milk', kind: 'Multideck cooler', plan: { x: 60, y: 40, w: 300, h: 110 }, captured: hoursAgo(2),
    levels: [
      [S('p1', 4), S('p2', 3), S('p3', 3), S('p4', 4)],
      [S('p5', 2), S('p6', 3), S('p1', 3, { issue: 'remove', batches: [B('L2405', -1, 3, 'verified', 'Scanned at the shelf 18:42')] }), S('p3', 3)],
      [S('p4', 3), S('p2', 3), S('p6', 3), S('p5', 2)],
    ],
  },
  {
    id: 'A2', name: 'Yoghurt', kind: 'Multideck cooler', plan: { x: 380, y: 40, w: 300, h: 110 }, captured: hoursAgo(2),
    levels: [
      [S('p10', 5, { issue: 'near', batches: [B('L2411', 2, 6, 'inferred', 'Received Tue; shelf position inferred from the capture'), B('L2418', 9, 10, 'observed')] }), S('p11', 4), S('p13', 4), S('p11', 3, { issue: 'mismatch', seen: 'p12', confidence: 0.58 })],
      [S('p14', 3), S('p15', 3), S('p12', 4), S('p13', 3)],
      [S('p10', 4), S('p14', 3), S('p15', 2), S('p12', 3)],
    ],
  },
  {
    id: 'A3', name: 'Quark and cottage cheese', kind: 'Multideck cooler', plan: { x: 700, y: 40, w: 300, h: 110 }, captured: hoursAgo(26),
    levels: [
      [S('p20', 4), S('p21', 4), S('p22', 4), S('p23', 3)],
      [S('p21', 3), S('p20', 3, { issue: 'gap', confidence: 0.93 }), S('p23', 3), S('p22', 3)],
      [S('p23', 3), S('p22', 3), S('p20', 4, { issue: 'near', batches: [B('R12', 1, 4, 'inferred', 'Received Mon; shelf position inferred')] }), S('p21', 3)],
    ],
  },
  {
    id: 'A4', name: 'Cream and sour milk', kind: 'Multideck cooler', plan: { x: 1020, y: 40, w: 300, h: 110 }, captured: hoursAgo(50),
    levels: [
      [S('p30', 5), S('p31', 5), S('p32', 4), S('p33', 4)],
      [S('p32', 4), S('p33', 3), S('p30', 4), S('p31', 4)],
      [S('p31', 4), S('p30', 5), S('p33', 3), S('p32', 4)],
    ],
  },
  {
    id: 'B1', name: 'Puddings', kind: 'Gondola, chilled', plan: { x: 380, y: 270, w: 290, h: 100 }, captured: hoursAgo(26),
    levels: [
      [S('p40', 3), S('p42', 3, { issue: 'facing', confidence: 0.81 }), S('p43', 3)],
      [S('p41', 3), S('p40', 3), S('p42', 2)],
      [S('p43', 3), S('p41', 3), S('p40', 3, { issue: 'near', batches: [B('V305', 2, 4, 'inferred', 'Received last Thu; shelf position inferred')] })],
    ],
  },
  {
    id: 'B2', name: 'Butter and spreads', kind: 'Gondola, chilled', plan: { x: 700, y: 270, w: 290, h: 100 }, captured: hoursAgo(74),
    levels: [
      [S('p50', 4), S('p51', 3), S('p52', 3)],
      [S('p51', 3), S('p52', 3), S('p50', 4)],
      [S('p52', 3), S('p50', 4), S('p51', 3, { issue: 'unknown', confidence: 0.41 })],
    ],
  },
  {
    id: 'B3', name: 'Cheese', kind: 'Gondola, chilled', plan: { x: 380, y: 400, w: 610, h: 100 }, captured: hoursAgo(50),
    levels: [
      [S('p60', 3), S('p61', 3), S('p62', 3), S('p63', 4), S('p60', 3), S('p61', 3)],
      [S('p63', 4), S('p62', 3), S('p60', 3), S('p61', 3), S('p63', 4), S('p62', 3)],
      [S('p61', 3), S('p60', 3), S('p63', 4), S('p62', 3), S('p61', 3), S('p60', 3)],
    ],
  },
  {
    id: 'C1', name: 'Juices', kind: 'Multideck cooler', plan: { x: 1030, y: 270, w: 290, h: 100 }, captured: hoursAgo(24 * 9),
    levels: [
      [S('p70', 4), S('p71', 4), S('p72', 4)],
      [S('p71', 4), S('p72', 4), S('p70', 4)],
      [S('p72', 3), S('p70', 4), S('p71', 4)],
    ],
  },
];

// Give every slot an id and a default batch, so the detail panel always has data.
let lotSeq = 100;
for (const f of FIXTURES) {
  f.levels.forEach((level, li) => level.forEach((slot, si) => {
    slot.id = `${f.id}-${li + 1}-${si + 1}`;
    slot.fixture = f.id;
    slot.level = li + 1;
    if (!slot.batches) slot.batches = [B(`L${++lotSeq}`, 6 + ((li * 3 + si * 5) % 12), slot.facings * 3, 'inferred', 'Shelf position inferred from the capture')];
  }));
}

export const STALE_DAYS = 7;

export const ISSUE = {
  remove:   { label: 'Past date',      action: 'Take off the shelf',      order: 0 },
  near:     { label: 'Near date',      action: 'Put on a discount label', order: 1 },
  gap:      { label: 'Gap',            action: 'Refill from the back room', order: 2 },
  mismatch: { label: 'Check product',  action: 'Review: label and shelf disagree', order: 3 },
  unknown:  { label: 'New product',    action: 'Review: not in the catalogue', order: 4 },
  facing:   { label: 'Needs facing',   action: 'Face the section',        order: 5 },
  stale:    { label: 'Not captured',   action: 'Capture this fixture',    order: 6 },
};

export const REVIEWS = [
  { id: 'r1', slot: 'A2-1-4', kind: 'mismatch', text: 'The label says Strawberry yoghurt 150 g. The shelf looks like Raspberry yoghurt 150 g.', confidence: 0.58 },
  { id: 'r2', slot: 'B2-3-3', kind: 'unknown', text: 'A product above the Spread 400 g label does not match anything in the catalogue.', confidence: 0.41 },
  { id: 'r3', slot: 'B1-1-2', kind: 'facing', text: 'Packs look tilted and pushed back. Is the section messy, or is this a different pack design?', confidence: 0.81 },
];

export const CAPTURES = FIXTURES.map((f) => ({ fixture: f.id, at: f.captured, by: f.captured > hoursAgo(30) ? 'Evening shift' : 'Morning shift', frames: 60 + (f.id.charCodeAt(1) * 7) % 50 }));
