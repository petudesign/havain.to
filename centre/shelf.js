// Draws a fixture's front view (elevation) from its slots, with vision overlays.
// In the product this view is stitched from capture keyframes on the shelf
// plane; in the demo the products are drawn shapes.

import { PRODUCTS, ISSUE } from './data.js';

const W = 1200, LEVEL_H = 210, EDGE_H = 40, PAD_X = 24;
const UNIT = { carton: 70, pot: 58, tub: 82, small: 52, pack: 112, block: 92 };
const HEIGHT = { carton: 150, pot: 100, tub: 92, small: 78, pack: 86, block: 62 };

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

function unit(kind, x, base, w, h, c1, c2, tilt = 0) {
  const top = base - h;
  const cx = x + w / 2, cy = base - h / 2;
  const t = tilt ? ` transform="rotate(${tilt} ${cx} ${cy})"` : '';
  if (kind === 'carton') {
    return `<g${t} filter="url(#sh)"><path d="M${x} ${top + 22} L${cx} ${top} L${x + w} ${top + 22} V${base} H${x} Z" fill="${c1}"/>
      <rect x="${x}" y="${top + h * 0.42}" width="${w}" height="${h * 0.3}" fill="${c2}"/>
      <circle cx="${cx}" cy="${top + h * 0.57}" r="${w * 0.15}" fill="#fff" fill-opacity=".85"/>
      <rect x="${x}" y="${top + 22}" width="${w}" height="${h - 22}" fill="url(#gloss)"/></g>`;
  }
  if (kind === 'pot' || kind === 'tub') {
    const inset = kind === 'pot' ? 9 : 6;
    return `<g${t} filter="url(#sh)"><path d="M${x + 3} ${top + 10} L${x + w - 3} ${top + 10} L${x + w - inset} ${base} L${x + inset} ${base} Z" fill="${c1}"/>
      <rect x="${x}" y="${top}" width="${w}" height="13" rx="5" fill="${c2}"/>
      <rect x="${x + w * 0.22}" y="${top + h * 0.42}" width="${w * 0.56}" height="${h * 0.26}" rx="4" fill="${c2}" fill-opacity=".85"/>
      <path d="M${x + 3} ${top + 10} L${x + w - 3} ${top + 10} L${x + w - inset} ${base} L${x + inset} ${base} Z" fill="url(#gloss)"/></g>`;
  }
  // pack, block, small: boxes
  return `<g${t} filter="url(#sh)"><rect x="${x}" y="${top}" width="${w}" height="${h}" rx="4" fill="${c1}"/>
    <rect x="${x + 8}" y="${top + 10}" width="${w * 0.55}" height="${h * 0.22}" rx="3" fill="${c2}"/>
    <circle cx="${x + w * 0.74}" cy="${top + h * 0.62}" r="${h * 0.2}" fill="#fff" fill-opacity=".7"/>
    <rect x="${x}" y="${top}" width="${w}" height="${h}" fill="url(#gloss)"/></g>`;
}

function barcode(x, y, h, seed) {
  let s = '', bx = x, r = seed;
  for (let i = 0; i < 13; i++) {
    r = (r * 9301 + 49297) % 233280;
    const bw = 1 + (r % 3);
    s += `<rect x="${bx}" y="${y}" width="${bw}" height="${h}" fill="#16191d"/>`;
    bx += bw + 1 + (r % 2);
  }
  return s;
}

// Layout: slots placed left to right on each level, scaled to fit the width.
export function layout(fixture) {
  return fixture.levels.map((level, li) => {
    const widths = level.map((s) => UNIT[PRODUCTS[s.product].kind] * s.facings + 14);
    const total = widths.reduce((a, b) => a + b, 0) + (level.length - 1) * 18;
    const scale = Math.min(1.25, (W - PAD_X * 2) / total);
    let x = PAD_X + ((W - PAD_X * 2) - total * scale) / 2;
    const base = 26 + (li + 1) * LEVEL_H;
    return level.map((slot, si) => {
      const w = widths[si] * scale;
      const box = { slot, x, w, base, scale };
      x += w + 18 * scale;
      return box;
    });
  });
}

export function renderElevation(fixture, { selected, stale } = {}) {
  const rows = layout(fixture);
  const H = 26 + fixture.levels.length * LEVEL_H + EDGE_H + 30;
  const out = [];
  out.push(`<svg viewBox="0 0 ${W} ${H}" class="elevation" role="group" aria-label="Front view of ${esc(fixture.id)} ${esc(fixture.name)}">`);
  out.push(`<defs>
    <linearGradient id="bgc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b323b"/><stop offset="1" stop-color="#1b2027"/></linearGradient>
    <linearGradient id="edge" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9dde2"/><stop offset="1" stop-color="#a9b0b8"/></linearGradient>
    <linearGradient id="gloss" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".35" stop-color="#fff" stop-opacity=".16"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <filter id="sh" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#000" flood-opacity=".45"/></filter>
  </defs>`);
  out.push(`<rect x="0" y="0" width="${W}" height="${H}" rx="12" fill="url(#bgc)"/>`);

  rows.forEach((row) => {
    const base = row[0].base;
    out.push(`<rect x="0" y="${base}" width="${W}" height="${EDGE_H}" fill="url(#edge)"/>`);
    out.push(`<rect x="0" y="${base + EDGE_H}" width="${W}" height="10" fill="#0b0d10" opacity=".5"/>`);
    for (const { slot, x, w, scale } of row) {
      const p = PRODUCTS[slot.issue === 'mismatch' ? slot.seen : slot.product];
      const uw = UNIT[p.kind] * scale, uh = HEIGHT[p.kind] * Math.min(1, scale + 0.1);
      const n = slot.issue === 'gap' ? 0 : slot.facings;
      let ux = x + 7 * scale;
      for (let i = 0; i < n; i++) {
        const tilt = slot.issue === 'facing' ? [-7, 5, 9, -4][i % 4] : 0;
        const dy = slot.issue === 'facing' ? (i % 2 ? -4 : 3) : 0;
        out.push(unit(p.kind, ux + (tilt ? 3 : 0), base - 2 + dy, uw - 6 * scale, uh, p.c1, p.c2, tilt));
        ux += uw;
      }
      // shelf-edge label for the slot's product
      const lw = Math.min(124, w - 8), lx = x + (w - lw) / 2;
      const lp = PRODUCTS[slot.product];
      out.push(`<rect x="${lx}" y="${base + 6}" width="${lw}" height="${EDGE_H - 12}" rx="3" fill="#f4f5f2"/>
        <text x="${lx + 7}" y="${base + 27}" font-size="15" font-weight="700" fill="#16191d">${lp.price}</text>
        ${barcode(lx + lw - 44, base + 11, EDGE_H - 22, lp.gtin.charCodeAt(12) * 31 + lw)}`);
    }
  });

  // Overlays: labels (identity), slots (presence), issues.
  rows.forEach((row) => {
    for (const { slot, x, w, base } of row) {
      const shown = PRODUCTS[slot.issue === 'mismatch' ? slot.seen : slot.product];
      const top = base - (slot.issue === 'gap' ? 150 : HEIGHT[shown.kind] + 14);
      const h = base - top;
      const lw = Math.min(124, w - 8), lx = x + (w - lw) / 2;
      const labelCol = slot.issue === 'mismatch' || slot.issue === 'unknown' ? 'var(--c-mismatch)' : 'var(--c-ok)';
      out.push(`<rect x="${lx - 4}" y="${base + 3}" width="${lw + 8}" height="${EDGE_H - 6}" rx="5" fill="none" style="stroke:${labelCol}" stroke-width="2.5"/>`);
      const issue = stale ? null : slot.issue;
      const cls = issue ? `slot issue-${issue}` : 'slot';
      const sel = selected === slot.id ? ' is-selected' : '';
      out.push(`<g class="${cls}${sel}" data-slot="${slot.id}" tabindex="0" role="button" aria-label="${esc(PRODUCTS[slot.product].name)}${issue ? `, ${ISSUE[issue].label}` : ''}">
        <rect class="slot-hit" x="${x}" y="${top}" width="${w}" height="${h + EDGE_H}" rx="7"/>
        <rect class="slot-box" x="${x}" y="${top}" width="${w}" height="${h}" rx="7"/>
        ${issue ? `<g class="slot-tag" transform="translate(${x + 6} ${top + 6})"><rect width="${ISSUE[issue].label.length * 9.4 + 18}" height="28" rx="6"/><text x="9" y="19" font-size="16" font-weight="700">${esc(ISSUE[issue].label)}</text></g>` : ''}
      </g>`);
    }
  });
  if (stale) {
    out.push(`<rect x="0" y="0" width="${W}" height="${H}" rx="12" fill="#0b0d10" fill-opacity=".55"/>
      <text x="${W / 2}" y="${H / 2}" text-anchor="middle" font-size="26" font-weight="700" fill="#e6e9ed">Not captured in over a week. The view below may be out of date.</text>`);
  }
  out.push('</svg>');
  return out.join('');
}
