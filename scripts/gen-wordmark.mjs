/**
 * Generate minimal text-SVG wordmarks for brands not available in simple-icons.
 * All SVGs use fill="#000" so the CSS filter brightness(0) invert(1) on the
 * blue ribbon reliably turns them white, while on the light ribbon they stay
 * dark.
 */
import { writeFileSync } from 'fs';
import { join } from 'path';

const OUT_DIR = join(process.cwd(), 'public', 'brands');

/**
 * Each entry:
 *   slug  — filename (without .svg)
 *   text  — displayed brand name
 *   opts  — { weight, size, letterSpacing, italic, style }
 */
const BRANDS = [
  // ── Imprimantes & tech manquantes ──────────────────────────────
  { slug: 'canon',           text: 'Canon',           opts: { weight: 500, size: 56 } },
  { slug: 'brother',         text: 'brother',         opts: { weight: 900, size: 52 } },
  { slug: 'xerox',           text: 'XEROX',           opts: { weight: 900, size: 58 } },
  { slug: 'ricoh',           text: 'RICOH',           opts: { weight: 800, size: 56 } },
  { slug: 'lexmark',         text: 'Lexmark',         opts: { weight: 700, size: 46 } },
  { slug: 'logitech',        text: 'logitech',        opts: { weight: 700, size: 46 } },
  { slug: 'microsoft',       text: 'Microsoft',       opts: { weight: 600, size: 44 } },
  { slug: 'toshiba',         text: 'TOSHIBA',         opts: { weight: 900, size: 50 } },
  { slug: 'sony',            text: 'SONY',            opts: { weight: 900, size: 48, letterSpacing: 2 } },
  { slug: 'viewsonic',       text: 'ViewSonic',       opts: { weight: 700, size: 42 } },
  { slug: 'benq',            text: 'BenQ',            opts: { weight: 900, size: 60 } },
  { slug: 'tp-link',         text: 'TP-Link',         opts: { weight: 700, size: 46 } },
  { slug: 'sandisk',         text: 'SanDisk',         opts: { weight: 800, size: 46 } },
  { slug: 'transcend',       text: 'Transcend',       opts: { weight: 700, size: 42, italic: true } },
  { slug: 'western-digital', text: 'WD',              opts: { weight: 900, size: 72 } },

  // ── Papeterie / scolaire ───────────────────────────────────────
  { slug: 'bic',              text: 'BIC',              opts: { weight: 900, size: 72 } },
  { slug: 'faber-castell',    text: 'FABER-CASTELL',    opts: { weight: 800, size: 32 } },
  { slug: 'maped',            text: 'MAPED',            opts: { weight: 900, size: 52 } },
  { slug: 'stabilo',          text: 'STABILO',          opts: { weight: 900, size: 44 } },
  { slug: 'pilot',            text: 'PILOT',            opts: { weight: 900, size: 54 } },
  { slug: 'casio',            text: 'CASIO',            opts: { weight: 900, size: 48 } },
  { slug: 'jansport',         text: 'JANSPORT',         opts: { weight: 900, size: 38, letterSpacing: -1 } },
  { slug: 'crayola',          text: 'CRAYOLA',          opts: { weight: 900, size: 42 } },
  { slug: 'pelikan',          text: 'Pelikan',          opts: { weight: 800, size: 46, italic: true, serif: true } },
  { slug: 'pentel',           text: 'Pentel',           opts: { weight: 700, size: 50 } },
  { slug: 'staedtler',        text: 'STAEDTLER',        opts: { weight: 900, size: 36 } },
  { slug: 'sharpie',          text: 'SHARPIE',          opts: { weight: 900, size: 46 } },
  { slug: 'moleskine',        text: 'Moleskine',        opts: { weight: 500, size: 42, italic: true, serif: true } },
  { slug: 'post-it',          text: 'Post-it',          opts: { weight: 700, size: 44 } },
  { slug: 'oxford',           text: 'OXFORD',           opts: { weight: 900, size: 46 } },
  { slug: 'double-a',         text: 'Double A',         opts: { weight: 700, size: 44 } },
  { slug: 'leitz',            text: 'LEITZ',            opts: { weight: 900, size: 50 } },
  { slug: 'deli',             text: 'DELI',             opts: { weight: 900, size: 60 } },
  { slug: 'giotto',           text: 'GIOTTO',           opts: { weight: 900, size: 48 } },
  { slug: 'reeves',           text: 'REEVES',           opts: { weight: 700, size: 52, italic: true, serif: true } },
  { slug: 'canson',           text: 'CANSON',           opts: { weight: 700, size: 48 } },
  { slug: 'milan',            text: 'MILAN',            opts: { weight: 900, size: 54 } },
  { slug: 'al-manhaj',        text: 'المنهج',           opts: { weight: 900, size: 48 } },
];

function makeSvg(text, {
  weight = 700,
  size = 48,
  letterSpacing = 0,
  italic = false,
  serif = false,
} = {}) {
  const family = serif
    ? 'Georgia, Times New Roman, serif'
    : 'Inter, Helvetica Neue, Arial, sans-serif';
  const parts = [
    `font-weight:${weight}`,
    `font-size:${size}px`,
    `font-family:${family}`,
    `letter-spacing:${letterSpacing}px`,
  ];
  if (italic) parts.push('font-style:italic');
  const style = parts.join(';') + ';';
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 80" preserveAspectRatio="xMidYMid meet">
  <text x="100" y="54" text-anchor="middle" dominant-baseline="middle"
        fill="#000"
        style="${style}">${text}</text>
</svg>
`;
}

for (const { slug, text, opts } of BRANDS) {
  const svg = makeSvg(text, opts);
  writeFileSync(join(OUT_DIR, `${slug}.svg`), svg, 'utf8');
}

console.log(`Generated ${BRANDS.length} wordmark SVGs in ${OUT_DIR}`);
