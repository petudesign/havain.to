import { defaults, PARAMS, STRATEGIES } from './sim/model.js';

const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45]; // must match sim/precompute.mjs
const COLORS = ['--series-1', '--series-2', '--series-3', '--series-4'];

const METRICS = {
  marginEuroPerWeek: { title: 'Gross margin compared with today’s route', sub: '€ per shelf per week. Same shelf and same customers in every run, so the gap is the strategy’s effect. Above zero is better.', unit: '€', digits: 1, zero: true, paired: true },
  marginAfterStaffEuroPerWeek: { title: 'Margin after staff time, compared with today’s route', sub: '€ per shelf per week, with the minutes spent on date checks priced at 20 €/h (assumption). Same shelf and customers in every run. Above zero is better.', unit: '€', digits: 1, zero: true, paired: true },
  wasteEuroPerWeek: { title: 'Waste per week', sub: '€ of products thrown away, per shelf. Lower is better.', unit: '€', digits: 1, zero: true },
  missedPerWeek: { title: 'Missed units per week', sub: 'Units that reached their date without a discount label. Lower is better.', unit: '', digits: 1, zero: true },
  minutesPerDay: { title: 'Staff time used per day', sub: 'Minutes actually spent, out of the minutes available. Lower is better.', unit: 'min', digits: 1, zero: true },
};

const state = { metric: 'marginEuroPerWeek', minutes: 20, coverage: 1, results: null, cache: new Map() };

const $ = (id) => document.getElementById(id);
const svg = $('chart');
const tooltip = $('tooltip');
let data = null;

const color = (i) => getComputedStyle(document.documentElement).getPropertyValue(COLORS[i]).trim();
const fmt = (v, d) => v.toLocaleString('en-GB', { minimumFractionDigits: d, maximumFractionDigits: d });
const withUnit = (v, m) => (m.unit === '€' ? `${fmt(v, m.digits)} €` : m.unit ? `${fmt(v, m.digits)} ${m.unit}` : fmt(v, m.digits));

// ---------- data ----------

async function run() {
  if (!data) {
    $('busy').hidden = false;
    data = await fetch(new URL('./sim/results.json', import.meta.url)).then((r) => r.json());
    $('busy').hidden = true;
    $('run-note').textContent = `${data.runs} runs per point, computed ${data.generated}.`;
  }
  state.results = data.results[String(state.coverage)];
  render();
}

// ---------- chart ----------

const NS = 'http://www.w3.org/2000/svg';
function el(name, attrs = {}, parent = svg) {
  const node = document.createElementNS(NS, name);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  parent.appendChild(node);
  return node;
}

function niceTicks(lo, hi, count = 5) {
  const span = hi - lo || 1;
  const step0 = span / count;
  const mag = 10 ** Math.floor(Math.log10(step0));
  const step = [1, 2, 2.5, 5, 10].map((s) => s * mag).find((s) => s >= step0);
  const start = Math.floor(lo / step) * step;
  const ticks = [];
  for (let v = start; v <= hi + step * 0.5; v += step) ticks.push(+v.toFixed(10));
  return ticks;
}

let geometry = null;

function drawChart() {
  const m = METRICS[state.metric];
  const W = svg.clientWidth, H = svg.clientHeight;
  const narrow = W < 520;
  const pad = { top: 24, right: narrow ? 12 : 132, bottom: 28, left: 48 };
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.replaceChildren();

  const source = m.paired ? state.results.vsRoute : state.results.summary;
  const series = STRATEGIES.map((s, i) => ({
    ...s, i, values: source[s.id].map((r) => r[state.metric].median),
  }));
  const all = series.flatMap((s) => s.values);
  let lo = Math.min(...all), hi = Math.max(...all);
  if (m.zero) { lo = Math.min(0, lo); hi = Math.max(0, hi); }
  const ticks = niceTicks(lo, hi);
  lo = ticks[0]; hi = ticks[ticks.length - 1];
  if (hi === lo) hi = lo + 1;

  const x = (minutes) => pad.left + (minutes / MINUTES[MINUTES.length - 1]) * (W - pad.left - pad.right);
  const y = (v) => pad.top + (1 - (v - lo) / (hi - lo)) * (H - pad.top - pad.bottom);
  geometry = { x, y, pad, W, H, series, m };

  for (const t of ticks) {
    el('line', { x1: pad.left, x2: W - pad.right, y1: y(t), y2: y(t), stroke: t === 0 || t === lo ? 'var(--axis)' : 'var(--grid)', 'stroke-width': 1 });
    el('text', { x: pad.left - 8, y: y(t) + 4, 'text-anchor': 'end', class: 'tick' }).textContent = (m.paired && t > 0 ? '+' : '') + fmt(t, t % 1 ? 1 : 0);
  }
  for (const mn of MINUTES) {
    if (narrow && mn % 10) continue;
    el('text', { x: x(mn), y: H - 8, 'text-anchor': 'middle', class: 'tick' }).textContent = mn;
  }

  // Selected minutes marker.
  el('line', { x1: x(state.minutes), x2: x(state.minutes), y1: pad.top, y2: H - pad.bottom, stroke: 'var(--axis)', 'stroke-dasharray': '3 3' });

  for (const s of series) {
    const d = s.values.map((v, k) => `${k ? 'L' : 'M'}${x(MINUTES[k]).toFixed(1)},${y(v).toFixed(1)}`).join('');
    el('path', { d, fill: 'none', stroke: color(s.i), 'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' });
  }
  const k = MINUTES.indexOf(state.minutes);
  for (const s of series) {
    el('circle', { cx: x(state.minutes), cy: y(s.values[k]), r: 4.5, fill: color(s.i), stroke: 'var(--surface-1)', 'stroke-width': 2 });
  }

  // Direct labels at line ends, nudged apart.
  if (!narrow) {
    const last = MINUTES.length - 1;
    const labels = series.map((s) => ({ s, y: y(s.values[last]) })).sort((a, b) => a.y - b.y);
    for (let j = 1; j < labels.length; j++) labels[j].y = Math.max(labels[j].y, labels[j - 1].y + 15);
    const overflow = labels[labels.length - 1].y - (H - pad.bottom);
    if (overflow > 0) labels.forEach((l) => (l.y -= overflow));
    for (const l of labels) {
      el('text', { x: W - pad.right + 8, y: l.y + 4, class: 'end-label' }).textContent = l.s.label;
    }
  }

  // Hover layer.
  const hover = el('line', { y1: pad.top, y2: H - pad.bottom, stroke: 'var(--text-muted)', 'stroke-width': 1, visibility: 'hidden' });
  const hit = el('rect', { x: pad.left - 10, y: 0, width: W - pad.left - pad.right + 20, height: H, fill: 'transparent' });
  hit.addEventListener('pointermove', (e) => showTip(e, hover));
  hit.addEventListener('pointerleave', () => { tooltip.hidden = true; hover.setAttribute('visibility', 'hidden'); });
  hit.addEventListener('click', (e) => { const mn = nearestMinute(e); setMinutes(mn); });
}

function nearestMinute(e) {
  const rect = svg.getBoundingClientRect();
  const px = e.clientX - rect.left;
  let best = MINUTES[0];
  for (const mn of MINUTES) if (Math.abs(geometry.x(mn) - px) < Math.abs(geometry.x(best) - px)) best = mn;
  return best;
}

function showTip(e, hover) {
  const mn = nearestMinute(e);
  const k = MINUTES.indexOf(mn);
  const { x, series, m, W } = geometry;
  hover.setAttribute('x1', x(mn)); hover.setAttribute('x2', x(mn)); hover.setAttribute('visibility', 'visible');
  const sign = (v) => (m.paired && v > 0 ? '+' : '');
  tooltip.innerHTML = `<div class="t-head">${mn} min/day available</div>` + series.map((s) =>
    `<div class="t-row"><span><i style="background:${color(s.i)}"></i>${s.label}</span><b>${sign(s.values[k])}${withUnit(s.values[k], m)}</b></div>`).join('');
  tooltip.hidden = false;
  const rect = svg.getBoundingClientRect();
  const left = x(mn) + 14;
  tooltip.style.left = `${left + 200 > W ? x(mn) - 14 - tooltip.offsetWidth : left}px`;
  tooltip.style.top = `${Math.max(0, e.clientY - rect.top - 40)}px`;
}

// ---------- table ----------

function renderTable() {
  const k = MINUTES.indexOf(state.minutes);
  // [metric, digits, best direction, paired?]
  const cols = [
    ['marginEuroPerWeek', 1, 'max', true], ['marginAfterStaffEuroPerWeek', 1, 'max', true], ['markdownEuroPerWeek', 1, null],
    ['wasteEuroPerWeek', 1, 'min'], ['labelledWastePerWeek', 1, null], ['missedPerWeek', 1, 'min'], ['minutesPerDay', 1, 'min'],
  ];
  const pick = (sid, key, paired) => (paired ? state.results.vsRoute : state.results.summary)[sid][k][key];
  const best = {};
  for (const [key, , dir, paired] of cols) {
    if (!dir) continue;
    const vals = STRATEGIES.map((s) => pick(s.id, key, paired).median);
    best[key] = dir === 'max' ? Math.max(...vals) : Math.min(...vals);
  }
  const signed = (v, d) => (v > 0 ? '+' : v < 0 ? '−' : '') + fmt(Math.abs(v), d);
  $('table-min').textContent = state.minutes;
  $('results').tBodies[0].innerHTML = STRATEGIES.map((s, i) => {
    const cells = cols.map(([key, d, , paired]) => {
      const v = pick(s.id, key, paired);
      const isBest = best[key] !== undefined && v.median === best[key];
      if (paired && s.id === 'route') return `<td>0<small>baseline</small></td>`;
      const f = paired ? signed : fmt;
      return `<td class="${isBest ? 'best' : ''}">${f(v.median, d)}<small>${f(v.p10, d)} … ${f(v.p90, d)}</small></td>`;
    }).join('');
    return `<tr><td><span class="name"><i style="background:${color(i)}"></i>${s.label}</span><small>${s.short}</small></td>${cells}</tr>`;
  }).join('');
}

function renderParams() {
  const rows = Object.entries(PARAMS).map(([k, v]) =>
    `<tr><td>${k}</td><td>${v.value} ${v.unit}</td><td>${v.status}${v.research ? ` · ${v.research}` : ''}</td><td>${v.note ?? ''}</td></tr>`);
  $('params').tBodies[0].innerHTML = rows.join('');
  const counts = {};
  for (const v of Object.values(PARAMS)) counts[v.status] = (counts[v.status] || 0) + 1;
  $('param-count').textContent = `${rows.length}: ` + Object.entries(counts).map(([k, n]) => `${n} ${k}`).join(', ');
}

// ---------- controls ----------

function render() {
  if (!state.results) return;
  const m = METRICS[state.metric];
  $('chart-title').textContent = m.title;
  $('chart-sub').textContent = m.sub;
  drawChart();
  renderTable();
}

function setMinutes(mn) {
  state.minutes = mn;
  $('minutes').value = mn;
  $('minutes-out').textContent = `${mn} min/day`;
  render();
}

document.querySelectorAll('.seg button').forEach((b) => b.addEventListener('click', () => {
  document.querySelectorAll('.seg button').forEach((x) => x.setAttribute('aria-checked', String(x === b)));
  state.metric = b.dataset.metric;
  render();
}));
$('minutes').addEventListener('input', (e) => setMinutes(Number(e.target.value)));
$('coverage').addEventListener('input', (e) => {
  state.coverage = Number(e.target.value) / 100;
  $('coverage-out').textContent = `${e.target.value} %`;
  run();
});
new ResizeObserver(() => render()).observe(svg);
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', render);

renderParams();
run();
