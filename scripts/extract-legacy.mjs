/**
 * Extraction du contenu de l'ancien site statique (legacy/index.html).
 * Sert uniquement d'aide à la migration : le résultat a été reporté dans
 * src/lib/db/seed.ts (contenu éditable depuis le panneau d'administration).
 *
 *   node scripts/extract-legacy.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const html = readFileSync(new URL('../legacy/index.html', import.meta.url), 'utf8');

/* ---------- 1. Produits (tableau JS du legacy) ---------- */
const products = [];
{
  const start = html.indexOf('const products=[');
  const end = html.indexOf('\n];', start);
  const body = html.slice(start + 'const products=['.length, end);
  for (const line of body.split('\n')) {
    const t = line.trim().replace(/,$/, '');
    if (!t.startsWith('{')) continue;
    const obj = {};
    for (const m of t.matchAll(/(\w+):"((?:[^"\\]|\\.)*)"/g)) obj[m[1]] = m[2].replace(/\\"/g, '"');
    for (const m of t.matchAll(/(\w+):([\d.]+)/g)) obj[m[1]] = Number(m[2]);
    if (obj.id) products.push(obj);
  }
}

/* ---------- 2. Paires de traduction data-ar / data-en ---------- */
const pairs = [];
const seen = new Set();
for (const m of html.matchAll(/<(\w+)([^>]*?)>/g)) {
  const [, tag, attrs] = m;
  const ar = /data-ar="((?:[^"\\]|\\.)*)"/.exec(attrs)?.[1];
  const en = /data-en="((?:[^"\\]|\\.)*)"/.exec(attrs)?.[1];
  if (!ar && !en) continue;
  const key = `${ar}|${en}`;
  if (seen.has(key)) continue;
  seen.add(key);
  pairs.push({ tag, ar: ar ?? '', en: en ?? '' });
}
for (const m of html.matchAll(/data-ph-ar="((?:[^"\\]|\\.)*)"\s+data-ph-en="((?:[^"\\]|\\.)*)"/g)) {
  const key = `ph:${m[1]}|${m[2]}`;
  if (seen.has(key)) continue;
  seen.add(key);
  pairs.push({ tag: 'placeholder', ar: m[1], en: m[2] });
}

/* ---------- 3. Images utilisées ---------- */
const images = [...new Set([...html.matchAll(/https:\/\/images\.unsplash\.com\/[^'")\s]+/g)].map((m) => m[0]))];

/* ---------- 4. Bandeaux (hero, offers, promos, sale) ---------- */
const sections = {};
for (const tag of ['slide', 'offer-card', 'promo', 'sale-banner']) {
  sections[tag] = [...html.matchAll(new RegExp(`<section[^>]*class="[^"]*${tag}|<article[^>]*class="[^"]*${tag}`, 'g'))].length;
}

const out = { products, pairs, images, counts: sections };
mkdirSync(new URL('../.migration', import.meta.url), { recursive: true });
writeFileSync(new URL('../.migration/extracted.json', import.meta.url), JSON.stringify(out, null, 2));

console.log(`produits : ${products.length}`);
console.log(`paires de traduction : ${pairs.length}`);
console.log(`images : ${images.length}`);
console.log('→ .migration/extracted.json');
