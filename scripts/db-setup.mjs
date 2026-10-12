/**
 * Vérification / réinitialisation de la base de données.
 *
 *   npm run db:setup     vérifie la connexion et la présence des tables
 *   npm run db:reset     supprime toutes les tables (le contenu initial est
 *                        réinstallé automatiquement à la prochaine visite)
 *
 * Le script utilise DATABASE_URL si elle est définie, sinon la base locale
 * PGlite (.pglite/manhaj) — exactement comme l'application.
 */
import { readFileSync, existsSync } from 'node:fs';

/* ── Chargement minimal de .env.local (aucune dépendance) ─────────── */
for (const file of ['.env.local', '.env']) {
  if (!existsSync(file)) continue;
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (process.env[key] !== undefined) continue;
    process.env[key] = rawValue.replace(/^["']|["']$/g, '');
  }
}

const TABLES = [
  'activity_log', 'order_items', 'orders', 'quotes', 'subscribers', 'media',
  'nav_links', 'brands', 'benefits', 'stores', 'banners', 'sections',
  'products', 'categories', 'texts', 'settings',
];

const reset = process.argv.includes('--reset');
const url = process.env.DATABASE_URL || process.env.POSTGRES_URL || '';

let client;
let label;

if (url) {
  const { neon } = await import('@neondatabase/serverless');
  const sql = neon(url);
  client = {
    query: async (text, params = []) => (await sql.query(text, params)) ?? [],
    exec: async (text) => { await sql.query(text, []); },
  };
  try {
    label = `Neon (${new URL(url).hostname})`;
  } catch {
    label = 'Neon';
  }
} else {
  const { PGlite } = await import('@electric-sql/pglite');
  const dir = process.env.PGLITE_DIR || '.pglite/manhaj';
  const pg = new PGlite(dir);
  await pg.waitReady;
  client = {
    query: async (text, params = []) => (await pg.query(text, params)).rows ?? [],
    exec: async (text) => { await pg.exec(text); },
  };
  label = `base locale PGlite (${dir})`;
}

console.log(`\nBase de données : ${label}\n`);

if (reset) {
  for (const table of TABLES) {
    await client.exec(`drop table if exists ${table} cascade`);
  }
  console.log('✓ Toutes les tables ont été supprimées.');
  console.log('  Relancez l’application (ou rechargez le site) : le schéma et le contenu');
  console.log('  initial seront réinstallés automatiquement.\n');
} else {
  try {
    const version = await client.query('select version() as version');
    console.log(`✓ Connexion réussie — ${String(version[0]?.version ?? '').slice(0, 60)}…`);
  } catch (error) {
    console.error(`✗ Connexion impossible : ${error.message}\n`);
    process.exit(1);
  }

  try {
    const rows = await client.query(
      `select table_name, (select count(*) from information_schema.columns c
                            where c.table_name = t.table_name) as columns
         from information_schema.tables t
        where table_schema = 'public' order by table_name`,
    );
    console.log(`\n${rows.length} table(s) présentes :`);
    for (const row of rows) console.log(`  • ${row.table_name}`);
    if (!rows.length) {
      console.log('  (aucune — elles seront créées au premier chargement du site)');
    }
    if (rows.length) {
      const counts = {};
      for (const table of ['products', 'categories', 'sections', 'banners', 'texts', 'orders', 'quotes', 'subscribers']) {
        try {
          const result = await client.query(`select count(*)::int as total from ${table}`);
          counts[table] = Number(result[0]?.total ?? 0);
        } catch {
          counts[table] = null;
        }
      }
      console.log('\nContenu :');
      for (const [table, total] of Object.entries(counts)) {
        console.log(`  • ${table.padEnd(12)} ${total === null ? '—' : total}`);
      }
    }
  } catch (error) {
    console.error(`✗ Lecture du schéma impossible : ${error.message}`);
    process.exit(1);
  }
  console.log('');
  if (!url) {
    console.log('Note : la base locale ne peut être lue par un seul programme à la fois.');
    console.log('Arrêtez le serveur de développement avant d’utiliser ce script.\n');
  }
}

/* PGlite conserve des descripteurs ouverts : on termine explicitement. */
process.exit(0);
