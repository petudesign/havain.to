// Precomputes the page's results so it loads instantly, also on phones.
// Run after any change to sim/model.js:  node sim/precompute.mjs
import { writeFileSync } from 'node:fs';
import { defaults, sweep, PARAMS } from './model.js';

export const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45];
export const COVERAGE = [0, 0.25, 0.5, 0.75, 1];
const RUNS = 200;

const t0 = Date.now();
const results = {};
for (const c of COVERAGE) results[c] = sweep({ ...defaults(), dataCoverage: c }, MINUTES, RUNS);

const round = (x) => JSON.parse(JSON.stringify(x, (k, v) => (typeof v === 'number' ? Math.round(v * 100) / 100 : v)));
writeFileSync(new URL('./results.json', import.meta.url), JSON.stringify({
  generated: new Date().toISOString().slice(0, 10),
  runs: RUNS, minutes: MINUTES, coverage: COVERAGE,
  params: Object.fromEntries(Object.entries(PARAMS).map(([k, v]) => [k, v.value])),
  results: round(results),
}));
console.log(`Wrote sim/results.json in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
