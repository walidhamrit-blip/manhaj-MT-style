/**
 * Couche d'accès à la base de données.
 *
 * • En production (Vercel) : Neon PostgreSQL via `@neondatabase/serverless`
 *   (requêtes HTTP, compatibles avec les fonctions serverless).
 * • En développement local, si `DATABASE_URL` n'est pas défini : PGlite
 *   (PostgreSQL compilé en WebAssembly) démarre automatiquement dans
 *   `.pglite/`. Aucune installation de PostgreSQL n'est nécessaire.
 *
 * Le schéma et le contenu initial sont installés automatiquement au premier
 * accès (`ensureDatabase()`), ce qui évite toute étape de migration manuelle.
 */
import { BRAND_UNIQUE_INDEX_NAME, BRAND_UNIQUE_INDEX_STATEMENTS, SCHEMA_STATEMENTS, SCHEMA_VERSION } from './schema';
import { SEED_PRODUCTS } from './seed-catalog';
import { SEED_TEXTS, SETTINGS_DEFS, SETTINGS_DEFAULTS } from './seed-texts';
import {
  SEED_BANNERS, SEED_BENEFITS, SEED_BRANDS, SEED_CATEGORIES, SEED_MEDIA,
  SEED_NAV_LINKS, SEED_SECTIONS, SEED_STORES,
} from './seed-site';

export type Row = Record<string, unknown>;

export type DbClient = {
  /** Exécute une requête paramétrée (`$1`, `$2`, ...) et retourne les lignes. */
  query<T extends Row = Row>(text: string, params?: unknown[]): Promise<T[]>;
  /** Exécute une requête sans paramètres ni résultat exploité. */
  exec(text: string): Promise<void>;
  driver: 'neon' | 'pglite';
};

const DATABASE_URL =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL_UNPOOLED ||
  process.env.POSTGRES_PRISMA_URL ||
  '';

function describeUrl(url: string): string {
  try {
    const u = new URL(url);
    return `${u.hostname}${u.pathname}`;
  } catch {
    return 'URL invalide';
  }
}

/* ────────────────────────────────────────────────────────────────────
 *  Connexion
 * ──────────────────────────────────────────────────────────────────── */

/**
 * Les instances sont conservées sur `globalThis` : Next.js compile chaque route
 * séparément, ce qui crée plusieurs copies de ce module dans le même processus.
 * Sans ce registre global, chaque route ouvrirait sa propre connexion — et en
 * mode local, plusieurs instances PGlite sur le même dossier se marcheraient
 * dessus (lectures obsolètes, corruption du dossier).
 */
type Registry = {
  client?: Promise<DbClient>;
  ready?: Promise<DbClient>;
};

const registryKey = Symbol.for('manhaj.database.registry');
const globalRegistry = globalThis as unknown as Record<symbol, Registry | undefined>;
const registry: Registry = globalRegistry[registryKey] ?? (globalRegistry[registryKey] = {});

async function createNeonClient(url: string): Promise<DbClient> {
  const { neon } = await import('@neondatabase/serverless');
  const sql = neon(url);
  return {
    driver: 'neon',
    async query<T extends Row = Row>(text: string, params: unknown[] = []): Promise<T[]> {
      const rows = (await sql.query(text, params)) as unknown;
      return (Array.isArray(rows) ? rows : []) as T[];
    },
    async exec(text: string): Promise<void> {
      await sql.query(text, []);
    },
  };
}

async function createPgliteClient(): Promise<DbClient> {
  const { PGlite } = await import('@electric-sql/pglite');
  const dataDir = process.env.PGLITE_DIR || '.pglite/manhaj';
  /* PGlite ne crée pas les dossiers parents : on s'en assure avant l'ouverture. */
  try {
    const { mkdirSync } = await import('node:fs');
    const { dirname, resolve } = await import('node:path');
    mkdirSync(dirname(resolve(dataDir)), { recursive: true });
  } catch {
    /* environnement sans système de fichiers : on laisse PGlite gérer */
  }
  const pg = new PGlite(dataDir);
  try {
    await pg.waitReady;
  } catch (error) {
    /* La base locale peut être corrompue si le serveur a été tué brutalement :
       le dossier peut alors être supprimé sans risque (données de test). */
    throw new Error(
      `Impossible d'ouvrir la base locale PGlite (${dataDir}). ` +
      'Supprimez le dossier .pglite puis relancez « npm run dev ». ' +
      `Détail : ${error instanceof Error ? error.message : String(error)}`,
    );
  }
  console.warn(
    `[manhaj] DATABASE_URL absente → base locale PGlite (${dataDir}). ` +
    'Renseignez DATABASE_URL (Neon) pour la production.',
  );
  return {
    driver: 'pglite',
    async query<T extends Row = Row>(text: string, params: unknown[] = []): Promise<T[]> {
      const res = await pg.query<T>(text, params);
      return (res.rows ?? []) as T[];
    },
    async exec(text: string): Promise<void> {
      await pg.exec(text);
    },
  };
}

/** Retourne le client unique (mis en cache pour toute la durée du processus). */
export function getDb(): Promise<DbClient> {
  if (!registry.client) {
    registry.client = (async () => {
      if (DATABASE_URL) {
        console.log(`[manhaj] base de données Neon : ${describeUrl(DATABASE_URL)}`);
        return createNeonClient(DATABASE_URL);
      }
      return createPgliteClient();
    })().catch((err) => {
      registry.client = undefined;
      throw err;
    });
  }
  return registry.client;
}

/** Indique si la base distante (Neon) est configurée. */
export const hasRemoteDatabase = Boolean(DATABASE_URL);

/* ────────────────────────────────────────────────────────────────────
 *  Installation automatique du schéma et du contenu initial
 * ──────────────────────────────────────────────────────────────────── */

/** Garantit que le schéma existe et que le contenu initial est présent. */
export function ensureDatabase(): Promise<DbClient> {
  if (!registry.ready) {
    registry.ready = (async () => {
      const db = await getDb();
      if (!(await isInstalled(db))) {
        await install(db);
      } else {
        await migrateBrandRibbons(db);
      }
      return db;
    })().catch((err) => {
      registry.ready = undefined;
      throw err;
    });
  }
  return registry.ready;
}

async function isInstalled(db: DbClient): Promise<boolean> {
  try {
    const rows = await db.query<{ value: unknown }>(
      `select value from settings where key = 'app.seeded' limit 1`,
    );
    if (!rows.length) return false;
    const value = rows[0].value;
    const parsed = typeof value === 'string' ? value : JSON.stringify(value);
    return String(parsed).includes(String(SCHEMA_VERSION));
  } catch {
    return false;
  }
}

async function install(db: DbClient): Promise<void> {
  console.log('[manhaj] installation du schéma et du contenu initial…');

  for (const statement of SCHEMA_STATEMENTS) {
    await db.exec(statement);
  }

  /* Réglages : uniquement les clés manquantes (les valeurs existantes sont conservées). */
  for (const def of SETTINGS_DEFS) {
    await db.query(
      `insert into settings (key, value) values ($1, $2::jsonb)
       on conflict (key) do nothing`,
      [def.key, JSON.stringify(def.default)],
    );
  }

  /* Textes : ajout des clés manquantes, sans écraser une traduction modifiée. */
  let textSort = 0;
  for (const t of SEED_TEXTS) {
    textSort += 10;
    await db.query(
      `insert into texts (key, ar, en, section, multiline, sort)
       values ($1, $2, $3, $4, $5, $6)
       on conflict (key) do nothing`,
      [t.key, t.ar, t.en, t.section, Boolean(t.multiline), textSort],
    );
  }

  /* Le catalogue n'est installé qu'une seule fois : on repart d'une table vide. */
  await db.exec('delete from products');
  await db.exec('delete from banners');
  await db.exec('delete from stores');
  await db.exec('delete from benefits');
  await db.exec('delete from brands');
  await db.exec('delete from nav_links');
  await db.exec('delete from sections');

  /* Catégories */
  for (const c of SEED_CATEGORIES) {
    await db.query(
      `insert into categories (slug, name_ar, name_en, icon, description_ar, description_en, sort)
       values ($1, $2, $3, $4, $5, $6, $7)
       on conflict (slug) do update set name_ar = excluded.name_ar, name_en = excluded.name_en,
         icon = excluded.icon, sort = excluded.sort`,
      [c.slug, c.nameAr, c.nameEn, c.icon, c.descriptionAr ?? '', c.descriptionEn ?? '', c.sort],
    );
  }

  const categoryRows = await db.query<{ id: number; slug: string }>('select id, slug from categories');
  const categoryId = new Map(categoryRows.map((r) => [r.slug, Number(r.id)]));

  /* Produits */
  for (const p of SEED_PRODUCTS) {
    await db.query(
      `insert into products
         (category_id, brand, name_ar, name_en, price, old_price, image_url, keywords, rating, active, sort)
       values ($1, $2, $3, $4, $5, $6, $7, $8, 4.8, true, $9)`,
      [
        categoryId.get(p.categorySlug) ?? null, p.brand, p.nameAr, p.nameEn,
        p.price, p.oldPrice, p.imageUrl, p.keywords, p.sort,
      ],
    );
  }

  /* Bandeaux */
  for (const b of SEED_BANNERS) {
    await db.query(
      `insert into banners
         (placement, kicker_ar, kicker_en, title_ar, title_en, body_ar, body_en,
          price_text_ar, price_text_en, price_value, cta_ar, cta_en, cta_kind, cta_target,
          icon, image_url, theme, sort)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)`,
      [
        b.placement, b.kickerAr ?? '', b.kickerEn ?? '', b.titleAr ?? '', b.titleEn ?? '',
        b.bodyAr ?? '', b.bodyEn ?? '', b.priceTextAr ?? '', b.priceTextEn ?? '',
        b.priceValue ?? null, b.ctaAr ?? '', b.ctaEn ?? '', b.ctaKind ?? 'category',
        b.ctaTarget ?? '', b.icon ?? '', b.imageUrl ?? '', b.theme ?? '', b.sort,
      ],
    );
  }

  /* Magasins */
  for (const s of SEED_STORES) {
    await db.query(
      `insert into stores (name_ar, name_en, phone, address_ar, address_en, hours_ar, hours_en, map_query, image_url, sort)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [s.nameAr, s.nameEn, s.phone, s.addressAr, s.addressEn, s.hoursAr, s.hoursEn, s.mapQuery, s.imageUrl, s.sort],
    );
  }

  /* Avantages */
  for (const b of SEED_BENEFITS) {
    await db.query(
      `insert into benefits (placement, icon, title_ar, title_en, subtitle_ar, subtitle_en, sort)
       values ($1,$2,$3,$4,$5,$6,$7)`,
      [b.placement, b.icon, b.titleAr, b.titleEn, b.subtitleAr ?? '', b.subtitleEn ?? '', b.sort],
    );
  }

  /* Marques (rubans bleu & clair) : index d'unicité d'abord, puis upsert. */
  await ensureBrandUniqueIndex(db);
  await seedBrands(db);

  /* Liens de navigation */
  for (const l of SEED_NAV_LINKS) {
    await db.query(
      `insert into nav_links (location, group_ar, group_en, label_ar, label_en, kind, target, icon, highlight, sort)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [
        l.location, l.groupAr ?? '', l.groupEn ?? '', l.labelAr, l.labelEn,
        l.kind, l.target, l.icon ?? '', Boolean(l.highlight), l.sort,
      ],
    );
  }

  /* Bibliothèque d'images */
  for (const m of SEED_MEDIA) {
    await db.query(
      `insert into media (url, label) values ($1,$2)
       on conflict (url) do nothing`,
      [m.url, m.label],
    );
  }

  /* Sections de la page d'accueil (résolution des références) */
  const bannerRows = await db.query<{ id: number; placement: string }>(
    'select id, placement from banners order by placement, sort, id',
  );
  const bannersByPlacement = new Map<string, number[]>();
  for (const row of bannerRows) {
    const list = bannersByPlacement.get(row.placement) ?? [];
    list.push(Number(row.id));
    bannersByPlacement.set(row.placement, list);
  }

  for (const s of SEED_SECTIONS) {
    let bannerId: number | null = null;
    if (s.bannerRef) {
      const list = bannersByPlacement.get(s.bannerRef.placement) ?? [];
      bannerId = list[s.bannerRef.index] ?? null;
    }
    await db.query(
      `insert into sections
         (key, type, anchor, category_id, banner_id, brand_group, title_ar, title_en, subtitle_ar, subtitle_en,
          body_ar, body_en, icon, theme, sort, active)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,true)
       on conflict (key) do nothing`,
      [
        s.key, s.type, s.anchor ?? '', s.categorySlug ? categoryId.get(s.categorySlug) ?? null : null,
        bannerId, s.brandGroup ?? '', s.titleAr ?? '', s.titleEn ?? '', s.subtitleAr ?? '', s.subtitleEn ?? '',
        s.bodyAr ?? '', s.bodyEn ?? '', s.icon ?? '', s.theme ?? '', s.sort,
      ],
    );
  }

  /* Marqueur d'installation */
  await db.query(
    `insert into settings (key, value) values ('app.seeded', $1::jsonb)
     on conflict (key) do update set value = excluded.value, updated_at = now()`,
    [JSON.stringify(SCHEMA_VERSION)],
  );
  await db.query(
    `insert into settings (key, value) values ('app.seeded_at', $1::jsonb)
     on conflict (key) do update set value = excluded.value, updated_at = now()`,
    [JSON.stringify(new Date().toISOString())],
  );
  await setBrandRibbonsVersion(db);

  console.log('[manhaj] base de données prête.');
}

/* ────────────────────────────────────────────────────────────────────
 *  Rubans de marques (accueil)
 *
 *  Migration CIBLÉE : elle ajoute les colonnes manquantes (instructions de
 *  schéma idempotentes), puis ne touche qu'aux marques et aux deux sections
 *  « brands-it » / « brands-stationery ». Elle ne réinstalle PAS le catalogue
 *  (produits, bannières, magasins, avantages, navigation), contrairement à
 *  un bump de SCHEMA_VERSION qui efface et reseme toutes ces tables.
 * ──────────────────────────────────────────────────────────────────── */

/** Version du contenu des rubans de marques. Incrémenter pour rejouer la migration. */
export const BRAND_RIBBONS_VERSION = '3';

/**
 * Supprime les marques dupliquées (même nom dans le même ruban) en conservant
 * la plus ancienne (le plus petit `id`). Renvoie le nombre de lignes retirées.
 *
 * À exécuter avant {@link ensureBrandUniqueIndex} : une base de production peut
 * déjà contenir des doublons (anciennes versions qui effaçaient puis
 * réinséraient la liste à chaque démarrage).
 */
async function dedupeBrands(db: DbClient): Promise<number> {
  const rows = await db.query<{ removed: number | string }>(
    `with removed as (
       delete from brands duplicate
        using brands kept
        where duplicate.name = kept.name
          and duplicate."group" = kept."group"
          and duplicate.id > kept.id
       returning 1
     )
     select count(*)::int as removed from removed`,
  );
  return Number(rows[0]?.removed ?? 0);
}

/**
 * Crée l'index d'unicité (nom, ruban) si nécessaire.
 *
 * Sur Vercel, plusieurs instances démarrent en parallèle : si une autre
 * instance vient de créer l'index, `create index` échoue — ce n'est pas une
 * erreur, on vérifie simplement que l'index existe bien.
 */
async function ensureBrandUniqueIndex(db: DbClient): Promise<void> {
  for (const statement of BRAND_UNIQUE_INDEX_STATEMENTS) {
    try {
      await db.exec(statement);
    } catch (error) {
      const rows = await db.query(
        'select 1 from pg_indexes where indexname = $1 limit 1',
        [BRAND_UNIQUE_INDEX_NAME],
      );
      if (!rows.length) throw error;
      console.log('[manhaj] index d’unicité des marques déjà créé par une autre instance.');
    }
  }
}

/**
 * Insère les marques manquantes et met à jour les existantes (recherche, logo,
 * ordre) sans jamais vider la table : « on conflict (name, "group") » s'appuie
 * sur l'index unique, donc deux démarrages simultanés ne peuvent pas créer de
 * doublon. La colonne `active` est laissée telle quelle : un ruban désactivé
 * depuis l'administration le reste.
 */
async function seedBrands(db: DbClient): Promise<void> {
  for (const b of SEED_BRANDS) {
    const logoUrl = b.logoFile ? `/brands/${b.logoFile}.svg` : '';
    await db.query(
      `insert into brands (name, "group", search_query, logo_url, sort)
       values ($1, $2, $3, $4, $5)
       on conflict (name, "group") do update set
         search_query = excluded.search_query,
         logo_url     = excluded.logo_url,
         sort         = excluded.sort,
         updated_at   = now()`,
      [b.name, b.group || '', b.searchQuery ?? b.name, logoUrl, b.sort],
    );
  }

  /* Les marques qui ne font plus partie de la liste sont retirées seulement
     une fois les nouvelles en place : une interruption ne vide jamais le
     ruban (le client HTTP Neon n'offre pas de transaction). */
  await pruneBrands(db);

  for (const s of SEED_SECTIONS.filter((x) => x.type === 'brands')) {
    await db.query(
      `insert into sections
         (key, type, anchor, category_id, banner_id, brand_group, title_ar, title_en, subtitle_ar, subtitle_en,
          body_ar, body_en, icon, theme, sort, active)
       values ($1,$2,$3,null,null,$4,$5,$6,$7,$8,'','','',$9,$10,true)
       on conflict (key) do update set brand_group = excluded.brand_group, theme = excluded.theme`,
      [
        s.key, s.type, s.anchor ?? '', s.brandGroup ?? '', s.titleAr ?? '', s.titleEn ?? '',
        s.subtitleAr ?? '', s.subtitleEn ?? '', s.theme ?? '', s.sort,
      ],
    );
  }
}

/**
 * Retire les lignes qui ne correspondent plus à la liste de référence
 * (nom + ruban) : anciennes marques d'une liste précédente, ou doublons
 * résiduels d'un autre ruban. Résultat : les rubans contiennent exactement la
 * liste de référence, une fois chaque marque.
 */
async function pruneBrands(db: DbClient): Promise<void> {
  const values: string[] = [];
  const params: unknown[] = [];
  for (const b of SEED_BRANDS) {
    params.push(b.name, b.group || '');
    values.push(`($${params.length - 1}::text, $${params.length}::text)`);
  }
  if (!values.length) return;
  await db.query(
    `delete from brands obsolete
      where not exists (
        select 1 from (values ${values.join(', ')}) as kept(name, brand_group)
         where kept.name = obsolete.name and kept.brand_group = obsolete."group"
      )`,
    params,
  );
}

async function setBrandRibbonsVersion(db: DbClient): Promise<void> {
  await db.query(
    `insert into settings (key, value) values ('app.brands_version', $1::jsonb)
     on conflict (key) do update set value = excluded.value, updated_at = now()`,
    [JSON.stringify(BRAND_RIBBONS_VERSION)],
  );
}

/** Applique le nouveau contenu des rubans une seule fois sur une base déjà installée. */
async function migrateBrandRibbons(db: DbClient): Promise<void> {
  let current = '';
  try {
    const rows = await db.query<{ value: unknown }>(
      `select value from settings where key = 'app.brands_version' limit 1`,
    );
    current = rows.length ? String(typeof rows[0].value === 'string' ? rows[0].value : JSON.stringify(rows[0].value)) : '';
  } catch {
    current = '';
  }
  if (current.includes(BRAND_RIBBONS_VERSION)) return;

  console.log('[manhaj] mise à jour des rubans de marques…');

  /* 1. Les colonnes ajoutées après la première installation (brands.group,
     sections.brand_group) n'existent pas encore sur une base ancienne. Les
     instructions du schéma sont idempotentes (create/add ... if not exists),
     donc on les rejoue ici avant de toucher aux marques. */
  for (const statement of SCHEMA_STATEMENTS) {
    await db.exec(statement);
  }

  /* 2. Doublons hérités : retirés avant de poser la contrainte d'unicité, qui
     refuserait de se créer sur une table déjà dupliquée. */
  const removed = await dedupeBrands(db);

  /* 3. Unicité (nom, ruban) : c'est elle qui rend l'insertion ci-dessous sûre
     même si plusieurs instances démarrent en même temps. */
  await ensureBrandUniqueIndex(db);

  /* 4. Contenu : mise à jour ligne par ligne (jamais de table vidée). */
  await seedBrands(db);
  await setBrandRibbonsVersion(db);

  console.log(
    `[manhaj] rubans de marques à jour${removed ? ` (${removed} doublon(s) supprimé(s))` : ''}.`,
  );
}

/**
 * Réinitialise complètement la base (utilisé par `npm run db:reset`).
 * Les tables sont supprimées puis recréées au prochain accès.
 */
export async function resetDatabase(): Promise<void> {
  const db = await getDb();
  const tables = [
    'activity_log', 'order_items', 'orders', 'quotes', 'subscribers', 'media',
    'nav_links', 'brands', 'benefits', 'stores', 'banners', 'sections',
    'products', 'categories', 'texts', 'settings',
  ];
  for (const table of tables) {
    await db.exec(`drop table if exists ${table} cascade`);
  }
  registry.ready = undefined;
  await ensureDatabase();
}

/** Valeur par défaut d'un réglage (utile si la base est vide). */
export function settingDefault(key: string) {
  return SETTINGS_DEFAULTS[key];
}
