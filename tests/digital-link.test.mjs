// node tests/digital-link.test.mjs
import assert from 'node:assert/strict';
import { parseDigitalLink, parseGs1Date, buildDigitalLink } from '../app/digital-link.js';
import { PRODUCTS, isValidGtin, checkDigit } from '../app/products.js';

// GS1 standard's own example GTIN (report E16).
assert.equal(isValidGtin('09520123456788'), true);
assert.equal(isValidGtin('09520123456789'), false);
assert.equal(checkDigit('0952012345678'), '8');
for (const p of PRODUCTS) assert.equal(isValidGtin(p.gtin), true, p.fi);

assert.equal(parseGs1Date('180426'), '2018-04-26');   // standard's example
assert.equal(parseGs1Date('260200'), '2026-02-28');   // DD=00 → last day
assert.equal(parseGs1Date('241300'), null);
assert.equal(parseGs1Date('260231'), null);

const ok = parseDigitalLink('https://esimerkki.fi/01/09520123456788/10/ERA42?17=261115');
assert.deepEqual(ok, { gtin: '09520123456788', batch: 'ERA42', expiry: '2026-11-15', dateType: 'use-by' });
assert.equal(parseDigitalLink('https://x.fi/01/09520123456788?15=261115').dateType, 'best-before');
assert.equal(parseDigitalLink('https://x.fi/01/09520123456789/10/A?17=261115').error, 'bad-check-digit');
assert.equal(parseDigitalLink('https://x.fi/01/09520123456788/10/A').error, 'no-date');
assert.equal(parseDigitalLink('https://x.fi/tuote/123').error, 'not-digital-link');
assert.equal(parseDigitalLink('ei linkki').error, 'not-a-link');

const p = PRODUCTS[0];
const link = buildDigitalLink('https://hyllykartta.petu.design', { gtin: p.gtin, batch: 'L 7', expiry: '2026-11-12' });
assert.equal(link, `https://hyllykartta.petu.design/01/${p.gtin}/10/L%207?17=261112`);
assert.deepEqual(parseDigitalLink(link), { gtin: p.gtin, batch: 'L 7', expiry: '2026-11-12', dateType: 'use-by' });

console.log('digital-link: all tests passed');
