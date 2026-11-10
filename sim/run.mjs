// Command-line run: node sim/run.mjs [runs]
// Prints each strategy at the default parameters, then a staff-time sweep.

import { defaults, monteCarlo, pairedDiff, STRATEGIES } from './model.js';

const runs = Number(process.argv[2] || 200);
const p = defaults();
const fmt = (x, d = 1) => x.toFixed(d).padStart(7);

console.log(`Hyllykartta simulation — ${runs} runs per cell, ${p.sections} sections, ${p.days} days measured`);
console.log('Parameters are placeholders unless marked sourced/verified in sim/model.js. Medians, with p10–p90 in brackets.\n');

console.log('Strategy'.padEnd(16), 'missed/wk'.padStart(20), 'waste €/wk'.padStart(20), 'recovered €/wk'.padStart(20), 'markdown €/wk'.padStart(20), 'min/day'.padStart(8), 'empty visits'.padStart(13), 'repeats/day'.padStart(12));
for (const s of STRATEGIES) {
  const r = monteCarlo(p, s.id, runs);
  const cell = (k, d = 1) => `${fmt(r[k].median, d)} [${r[k].p10.toFixed(d)}–${r[k].p90.toFixed(d)}]`;
  console.log(
    s.label.padEnd(16),
    cell('missedPerWeek').padStart(20),
    cell('wasteEuroPerWeek').padStart(20),
    cell('recoveredEuroPerWeek').padStart(20),
    cell('markdownEuroPerWeek').padStart(20),
    fmt(r.minutesPerDay.median).padStart(8),
    `${(r.emptyVisitShare.median * 100).toFixed(0)}%`.padStart(13),
    fmt(r.repeatVisitsPerDay.median).padStart(12),
  );
}

console.log('\nPaired difference in missed units/week (same seeds):');
for (const [a, b] of [['manualMap', 'route'], ['dataMap', 'manualMap'], ['dataMap', 'route']]) {
  const d = pairedDiff(p, a, b, 'missedPerWeek', runs);
  console.log(`  ${a} − ${b}: ${d.median.toFixed(1)} [${d.p10.toFixed(1)} … ${d.p90.toFixed(1)}]`);
}

console.log('\nPaired difference in weekly gross margin € (same seeds):');
for (const [a, b] of [['manualMap', 'route'], ['dataMap', 'route'], ['dataSmart', 'route'], ['dataSmart', 'dataMap']]) {
  const d = pairedDiff(p, a, b, 'marginEuroPerWeek', runs);
  console.log(`  ${a} − ${b}: ${d.median.toFixed(1)} [${d.p10.toFixed(1)} … ${d.p90.toFixed(1)}]`);
}

console.log('\nPaired difference in weekly margin after staff time € (same seeds):');
for (const [a, b] of [['manualMap', 'route'], ['dataMap', 'route'], ['dataSmart', 'route'], ['dataSmart', 'dataMap']]) {
  const d = pairedDiff(p, a, b, 'marginAfterStaffEuroPerWeek', runs);
  console.log(`  ${a} − ${b}: ${d.median.toFixed(1)} [${d.p10.toFixed(1)} … ${d.p90.toFixed(1)}]`);
}

console.log('\nLabelled but still wasted (units/week) and lost units/week:');
for (const s of STRATEGIES) {
  const r = monteCarlo(p, s.id, Math.min(runs, 100));
  console.log(`  ${s.label.padEnd(18)} labelled→waste ${r.labelledWastePerWeek.median.toFixed(1)} of ${r.labelsPerWeek.median.toFixed(0)} labelled · lost ${r.lostPerWeek.median.toFixed(1)} · waste rate ${(r.wasteRate.median * 100).toFixed(2)} %`);
}

console.log('\nStaff time sweep — median missed units/week:');
console.log('min/day'.padStart(8), ...STRATEGIES.map((s) => s.label.padStart(15)));
for (const minutes of [0, 5, 10, 15, 20, 30, 45, 60]) {
  const row = STRATEGIES.map((s) => fmt(monteCarlo({ ...p, staffMinutes: minutes }, s.id, Math.min(runs, 100)).missedPerWeek.median).padStart(15));
  console.log(String(minutes).padStart(8), ...row);
}

console.log('\n2D code coverage sweep (Map + 2D data, 10 min/day) — median missed units/week:');
for (const c of [0, 0.25, 0.5, 0.75, 1]) {
  const r = monteCarlo({ ...p, staffMinutes: 10, dataCoverage: c }, 'dataMap', Math.min(runs, 100));
  console.log(`  coverage ${String(c * 100).padStart(3)}%: ${fmt(r.missedPerWeek.median)}`);
}
