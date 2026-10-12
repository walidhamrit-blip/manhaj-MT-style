/**
 * Génère src/lib/db/seed-catalog.ts à partir du contenu extrait du site d'origine.
 *   node scripts/gen-catalog-seed.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';

const { products } = JSON.parse(readFileSync(new URL('../.migration/extracted.json', import.meta.url), 'utf8'));

const q = (s) => `'${String(s).replace(/'/g, "''")}'`;

const rows = products.map((p, i) => {
  const fields = [
    `categorySlug: ${q(p.cat)}`,
    `brand: ${q(p.brand)}`,
    `nameAr: ${q(p.ar)}`,
    `nameEn: ${q(p.en)}`,
    `price: ${p.price}`,
    `oldPrice: ${p.old}`,
    `imageUrl: ${q(p.img)}`,
    `keywords: ${q(p.keys)}`,
    `sort: ${(i + 1) * 10}`,
  ];
  return `  { ${fields.join(', ')} },`;
}).join('\n');

const file = `/**
 * Catalogue initial (30 produits) repris du site d'origine.
 * Ce contenu est ensuite géré depuis le panneau d'administration → Produits.
 * Fichier généré par scripts/gen-catalog-seed.mjs — modifiable sans risque.
 */
export type SeedProduct = {
  categorySlug: string;
  brand: string;
  nameAr: string;
  nameEn: string;
  price: number;
  oldPrice: number | null;
  imageUrl: string;
  keywords: string;
  sort: number;
};

export const SEED_PRODUCTS: SeedProduct[] = [
${rows}
];
`;

writeFileSync(new URL('../src/lib/db/seed-catalog.ts', import.meta.url), file);
console.log(`seed-catalog.ts : ${products.length} produits`);
