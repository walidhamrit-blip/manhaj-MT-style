/**
 * Contrôle post-déploiement des rubans de marques sur le site en production.
 *
 * Exécuté dans GitHub Actions (le sandbox de développement n'a pas de
 * navigateur) : Chrome est fourni par le runner.
 *
 * 1. Chaque marque doit apparaître une seule fois (liste doublée ×2 pour le
 *    marquee, donc 2 boutons par nom et par ruban).
 * 2. Les rubans doivent rester remplis pendant tout le cycle d'animation, en
 *    arabe (RTL) comme en anglais (LTR) : pour chaque position testée, on
 *    vérifie qu'aucun trou plus large que l'espacement normal (12 px) n'existe
 *    dans le cadre visible.
 * 3. Contrôle de sensibilité : en rétablissant l'ancienne animation RTL
 *    (images clés LTR), le test doit détecter le ruban qui se vide.
 */
import { existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import puppeteer from 'puppeteer-core';

const URL = process.env.SITE_URL || 'https://manhaj-mt-style.vercel.app/';
const PHASES = [0, 0.05, 0.1, 0.25, 0.5, 0.75, 0.9, 0.99];
const MAX_HOLE = 25; // espace normal entre deux vignettes : 12 px (+ arrondis)

let failures = 0;
const check = (label, ok, detail = '') => {
  console.log(`${ok ? '✓' : '✗'} ${label}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failures += 1;
};

function chromePath() {
  const candidates = [
    process.env.CHROME_PATH,
    '/usr/bin/google-chrome-stable',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
  ].filter(Boolean);
  for (const candidate of candidates) if (existsSync(candidate)) return candidate;
  const dir = '/tmp/chrome-browsers';
  execFileSync('npx', ['--yes', '@puppeteer/browsers', 'install', 'chrome@stable', `--path=${dir}`], {
    stdio: 'inherit',
  });
  const found = execFileSync('find', [dir, '-name', 'chrome', '-type', 'f']).toString().trim().split('\n')[0];
  return found;
}

const browser = await puppeteer.launch({
  executablePath: chromePath(),
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--font-render-hinting=none'],
});

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  const response = await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  check('page de production accessible', Boolean(response) && response.status() === 200, `HTTP ${response?.status()}`);
  await page.waitForSelector('.brand-track', { timeout: 30000 });
  await new Promise((resolve) => setTimeout(resolve, 2500));

  /* ── 1. Contenu : une seule fois chaque marque ─────────────────── */
  const content = await page.evaluate(() => {
    const sections = [...document.querySelectorAll('.brands')].map((section) => {
      const buttons = [...section.querySelectorAll('.brand-btn')];
      const titles = buttons.map((b) => b.getAttribute('title'));
      const counts = {};
      for (const title of titles) counts[title] = (counts[title] ?? 0) + 1;
      return {
        theme: [...section.classList].find((c) => c.startsWith('brands-')),
        buttons: buttons.length,
        unique: new Set(titles).size,
        repeated: Object.entries(counts).filter(([, n]) => n !== 2),
      };
    });
    return {
      htmlDir: document.documentElement.dir,
      lang: document.documentElement.lang,
      sections,
      stylesheets: [...document.querySelectorAll('link[rel=stylesheet]')].map((l) => l.href),
    };
  });

  check(`page en arabe (dir=${content.htmlDir})`, content.htmlDir === 'rtl' && content.lang === 'ar');
  let totalUnique = 0;
  for (const section of content.sections) {
    totalUnique += section.unique;
    check(
      `${section.theme} : ${section.unique} marques, une seule fois chacune`,
      section.repeated.length === 0 && section.buttons === section.unique * 2,
      `${section.buttons} boutons${section.repeated.length ? ` — répétitions anormales : ${JSON.stringify(section.repeated)}` : ''}`,
    );
  }
  check('60 marques au total', totalUnique === 60, `total=${totalUnique}`);

  /* ── 2. CSS servi ──────────────────────────────────────────────── */
  const css = await page.evaluate(async () => {
    const hrefs = [...document.querySelectorAll('link[rel=stylesheet]')]
      .map((l) => l.href)
      .filter((h) => h.includes('/_next/static/css/'));
    const texts = await Promise.all(hrefs.map((h) => fetch(h).then((r) => r.text())));
    return texts.join('\n');
  });
  check('CSS : animation RTL dédiée servie', css.includes('animation-name:brand-scroll-rtl') && css.includes('@keyframes brand-scroll-rtl'));
  check('CSS : ancienne règle « reverse » retirée', !css.includes('animation-direction:reverse'));

  /* ── 3. Géométrie : le ruban reste rempli tout le cycle ────────── */
  const sample = async (direction, restoreOld = false) =>
    page.evaluate(
      async ({ direction, phases, restoreOld }) => {
        document.documentElement.dir = direction;
        if (restoreOld) {
          const style = document.createElement('style');
          style.id = 'old-rtl-behaviour';
          style.textContent = 'html[dir=rtl] .brand-row-marquee{animation-name:brand-scroll}';
          document.head.append(style);
        } else {
          document.getElementById('old-rtl-behaviour')?.remove();
        }
        await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

        const tracks = [...document.querySelectorAll('.brand-track')];
        const animations = document.getAnimations().filter((a) => String(a.animationName ?? '').startsWith('brand-scroll'));
        animations.forEach((a) => a.pause());

        const coverage = (track) => {
          const box = track.getBoundingClientRect();
          const rects = [...track.querySelectorAll('.brand-btn')]
            .map((b) => b.getBoundingClientRect())
            .filter((r) => r.right > box.left + 1 && r.left < box.right - 1)
            .map((r) => [Math.max(r.left, box.left), Math.min(r.right, box.right)])
            .sort((a, b) => a[0] - b[0]);
          let cursor = box.left;
          let maxHole = 0;
          let covered = 0;
          for (const [left, right] of rects) {
            if (left > cursor) maxHole = Math.max(maxHole, left - cursor);
            covered += Math.max(0, right - Math.max(left, cursor));
            cursor = Math.max(cursor, right);
          }
          maxHole = Math.max(maxHole, box.right - cursor);
          return { width: box.width, maxHole, covered };
        };

        const results = [];
        for (const phase of phases) {
          for (const animation of animations) {
            const duration = animation.effect.getTiming().duration;
            animation.currentTime = phase * Number(duration);
          }
          await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
          results.push({
            phase,
            tracks: tracks.map((track) => {
              const c = coverage(track);
              return { maxHole: Math.round(c.maxHole), width: Math.round(c.width), covered: Math.round(c.covered) };
            }),
          });
        }
        animations.forEach((a) => a.play());
        return results;
      },
      { direction, phases: PHASES, restoreOld },
    );

  const report = (label, results) => {
    const worst = Math.max(...results.flatMap((r) => r.tracks.map((t) => t.maxHole)));
    const details = results.map((r) => `${Math.round(r.phase * 100)}%:${r.tracks.map((t) => t.maxHole).join('/')}`).join(' ');
    check(`${label} : rubans continus sur tout le cycle`, worst <= MAX_HOLE, `plus grand trou ${worst} px — ${details}`);
    return worst;
  };

  const rtl = await sample('rtl');
  report('arabe', rtl);

  const ltr = await sample('ltr');
  report('anglais', ltr);

  /* ── 4. Sensibilité du test : l'ancien CSS doit être détecté ───── */
  const broken = await sample('rtl', true);
  const brokenWorst = Math.max(...broken.flatMap((r) => r.tracks.map((t) => t.maxHole)));
  check(
    'contrôle : l’ancienne animation RTL est bien détectée comme cassée',
    brokenWorst > 200,
    `trou maximal ${brokenWorst} px`,
  );
  await page.evaluate(() => document.getElementById('old-rtl-behaviour')?.remove());
} finally {
  await browser.close();
}

console.log(failures ? `\n${failures} vérification(s) en échec` : '\nToutes les vérifications de production passent');
process.exit(failures ? 1 : 0);
