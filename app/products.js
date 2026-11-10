// Demo products. Fictional, generic products on one dairy shelf.
// GTINs use the GS1 prefix 952, which GS1 reserves for examples and demos
// (research report E17), so no real product's code is used.

export function checkDigit(digits) {
  // GS1 mod-10: weights 3,1,3,1… from the right, excluding the check digit.
  let sum = 0;
  for (let i = digits.length - 1, w = 3; i >= 0; i--, w = 4 - w) sum += Number(digits[i]) * w;
  return String((10 - (sum % 10)) % 10);
}

export function isValidGtin(gtin) {
  return /^\d{8,14}$/.test(gtin) && checkDigit(gtin.slice(0, -1)) === gtin.slice(-1);
}

const gtin13 = (n) => {
  const body = `952000000${String(n).padStart(3, '0')}`;
  return body + checkDigit(body);
};

// shelfLife: typical days left on arrival. section: place on the shelf.
const RAW = [
  { n: 1, fi: 'Kevytmaito 1 l',            en: 'Semi-skimmed milk 1 l',     section: 'A1', shelfLife: 10, caseSize: 12, kind: 'carton' },
  { n: 2, fi: 'Maustamaton jogurtti 150 g', en: 'Natural yoghurt 150 g',     section: 'A2', shelfLife: 21, caseSize: 8,  kind: 'pot' },
  { n: 3, fi: 'Mansikkajogurtti 150 g',     en: 'Strawberry yoghurt 150 g',  section: 'A3', shelfLife: 21, caseSize: 8,  kind: 'pot' },
  { n: 4, fi: 'Kermaviili 200 g',           en: 'Sour cream 200 g',          section: 'A4', shelfLife: 18, caseSize: 6,  kind: 'pot' },
  { n: 5, fi: 'Vaniljavanukas 4 × 125 g',   en: 'Vanilla pudding 4 × 125 g', section: 'B1', shelfLife: 25, caseSize: 6,  kind: 'pack' },
  { n: 6, fi: 'Maitorahka 250 g',           en: 'Quark 250 g',               section: 'B2', shelfLife: 20, caseSize: 6,  kind: 'pot' },
  { n: 7, fi: 'Voi 500 g',                  en: 'Butter 500 g',              section: 'B3', shelfLife: 60, caseSize: 10, kind: 'block' },
  { n: 8, fi: 'Ruokakerma 2 dl',            en: 'Cooking cream 2 dl',        section: 'B4', shelfLife: 30, caseSize: 10, kind: 'carton' },
];

export const PRODUCTS = RAW.map((p) => ({ ...p, gtin: '0' + gtin13(p.n) })); // GTIN-14 for Digital Link

export const SECTIONS = ['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3', 'B4'];

export const productByGtin = (gtin) => PRODUCTS.find((p) => p.gtin === gtin.padStart(14, '0'));
