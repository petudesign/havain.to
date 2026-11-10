// GS1 Digital Link parsing and building (URI syntax, research report E16).
//   https://{any domain}/01/{GTIN-14}[/10/{batch}]?17={YYMMDD}
// AI 17 = expiry date ("use by"), AI 15 = best before. Both are 6 digits;
// DD = 00 means the last day of that month.

import { isValidGtin } from './products.js';

export function parseGs1Date(yymmdd) {
  if (!/^\d{6}$/.test(yymmdd)) return null;
  const yy = Number(yymmdd.slice(0, 2)), mm = Number(yymmdd.slice(2, 4)), dd = Number(yymmdd.slice(4, 6));
  if (mm < 1 || mm > 12) return null;
  const year = 2000 + yy; // Fine for dates printed on food in this century.
  const last = new Date(year, mm, 0).getDate();
  const day = dd === 0 ? last : dd;
  if (day > last) return null;
  return `${year}-${String(mm).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function toGs1Date(iso) {
  const [y, m, d] = iso.split('-');
  return y.slice(2) + m + d;
}

// Returns { gtin, batch, expiry, dateType } or { error }.
export function parseDigitalLink(href) {
  let url;
  try { url = new URL(href); } catch { return { error: 'not-a-link' }; }
  const m = url.pathname.match(/\/01\/(\d{8,14})(?:\/10\/([^/]{1,20}))?(?:\/21\/[^/]{1,20})?\/?$/);
  if (!m) return { error: 'not-digital-link' };
  const gtin = m[1].padStart(14, '0');
  if (!isValidGtin(gtin)) return { error: 'bad-check-digit' };
  const batch = m[2] ? decodeURIComponent(m[2]) : null;
  const raw17 = url.searchParams.get('17');
  const raw15 = url.searchParams.get('15');
  const raw = raw17 ?? raw15;
  if (!raw) return { error: 'no-date', gtin, batch };
  const expiry = parseGs1Date(raw);
  if (!expiry) return { error: 'bad-date', gtin, batch };
  return { gtin, batch, expiry, dateType: raw17 ? 'use-by' : 'best-before' };
}

export function buildDigitalLink(origin, { gtin, batch, expiry }) {
  const path = `/01/${gtin}` + (batch ? `/10/${encodeURIComponent(batch)}` : '');
  return `${origin}${path}?17=${toGs1Date(expiry)}`;
}
