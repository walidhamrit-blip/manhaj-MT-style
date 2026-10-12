/**
 * Chargement des données nécessaires aux pages d'administration.
 * Réservé aux composants serveur (accès base de données).
 */
import { cookies } from 'next/headers';
import { ensureDatabase, hasRemoteDatabase, type DbClient, type Row } from '../db';
import { getSettings } from '../data';
import { ADMIN_LANG_COOKIE, type AdminLang } from './i18n';
import { getResource, type ResourceDef } from './resources';

export async function getAdminLang(): Promise<AdminLang> {
  try {
    const store = await cookies();
    return store.get(ADMIN_LANG_COOKIE)?.value === 'ar' ? 'ar' : 'fr';
  } catch {
    return 'fr';
  }
}

export type Counts = {
  products: number;
  categories: number;
  sections: number;
  banners: number;
  stores: number;
  benefits: number;
  brands: number;
  nav_links: number;
  media: number;
  texts: number;
  orders: number;
  newOrders: number;
  quotes: number;
  newQuotes: number;
  subscribers: number;
};

/** Compteurs affichés dans la barre latérale et le tableau de bord. */
export async function getCounts(db?: DbClient): Promise<Counts> {
  const client = db ?? (await ensureDatabase());
  const rows = await client.query<Row>(`
    select
      (select count(*) from products)::int     as products,
      (select count(*) from categories)::int   as categories,
      (select count(*) from sections)::int     as sections,
      (select count(*) from banners)::int      as banners,
      (select count(*) from stores)::int       as stores,
      (select count(*) from benefits)::int     as benefits,
      (select count(*) from brands)::int       as brands,
      (select count(*) from nav_links)::int    as nav_links,
      (select count(*) from media)::int        as media,
      (select count(*) from texts)::int        as texts,
      (select count(*) from orders)::int       as orders,
      (select count(*) from orders where status = 'new')::int as new_orders,
      (select count(*) from quotes)::int       as quotes,
      (select count(*) from quotes where status = 'new')::int as new_quotes,
      (select count(*) from subscribers)::int  as subscribers
  `);
  const row = rows[0] ?? {};
  const n = (key: string) => Number(row[key] ?? 0);
  return {
    products: n('products'),
    categories: n('categories'),
    sections: n('sections'),
    banners: n('banners'),
    stores: n('stores'),
    benefits: n('benefits'),
    brands: n('brands'),
    nav_links: n('nav_links'),
    media: n('media'),
    texts: n('texts'),
    orders: n('orders'),
    newOrders: n('new_orders'),
    quotes: n('quotes'),
    newQuotes: n('new_quotes'),
    subscribers: n('subscribers'),
  };
}

export type ReferenceOptions = Record<string, { value: string; label: string }[]>;

/** Options des champs « référence » (rayon, bandeau…) pour les formulaires. */
export async function getReferenceOptions(resource: ResourceDef, db?: DbClient): Promise<ReferenceOptions> {
  const client = db ?? (await ensureDatabase());
  const options: ReferenceOptions = {};

  const targets = new Set(
    resource.fields
      .filter((field) => field.type === 'reference' && field.reference)
      .map((field) => field.reference!.resource),
  );

  for (const targetKey of targets) {
    const target = getResource(targetKey);
    if (!target) continue;
    const columns = [target.pk, target.labelField, target.labelFieldEn].filter(Boolean) as string[];
    const rows = await client.query<Row>(
      `select ${[...new Set(columns)].join(', ')} from ${target.table} order by ${target.orderBy} limit 500`,
    );
    options[targetKey] = rows.map((row) => {
      const primary = String(row[target.labelField] ?? '');
      const secondary = target.labelFieldEn ? String(row[target.labelFieldEn] ?? '') : '';
      const label = primary && secondary ? `${primary} · ${secondary}` : primary || secondary || String(row[target.pk]);
      return { value: String(row[target.pk]), label };
    });
  }

  return options;
}

/** URLs de la bibliothèque d'images (pour le sélecteur visuel). */
export async function getMediaOptions(db?: DbClient): Promise<string[]> {
  const client = db ?? (await ensureDatabase());
  const rows = await client.query<Row>('select url from media order by id desc limit 60');
  return rows.map((row) => String(row.url));
}

export type RecentOrder = {
  id: number;
  reference: string;
  customerName: string;
  total: number;
  status: string;
  createdAt: string;
};

export async function getRecentOrders(limit = 5, db?: DbClient): Promise<RecentOrder[]> {
  const client = db ?? (await ensureDatabase());
  const rows = await client.query<Row>(
    `select id, reference, customer_name, total, status, created_at
       from orders order by created_at desc limit ${Math.max(1, Math.min(limit, 50))}`,
  );
  return rows.map((row) => ({
    id: Number(row.id),
    reference: String(row.reference),
    customerName: String(row.customer_name ?? ''),
    total: Number(row.total ?? 0),
    status: String(row.status ?? 'new'),
    createdAt: String(row.created_at ?? ''),
  }));
}

/** Informations affichées dans l'en-tête du tableau de bord. */
export async function getAdminContext(): Promise<{
  brandLatin: string;
  database: { remote: boolean; url: string };
}> {
  const settings = await getSettings().catch(() => ({}) as Record<string, string | number | boolean | string[]>);
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL || '';
  let host = '';
  try {
    host = url ? new URL(url).hostname : '';
  } catch {
    host = '';
  }
  return {
    brandLatin: String(settings['brand.latin'] ?? 'AL MANHAJ'),
    database: { remote: hasRemoteDatabase, url: host },
  };
}
