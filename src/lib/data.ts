/**
 * Lecture du contenu du site.
 *
 * Toutes les données affichées (textes, images, prix, bandeaux, magasins…)
 * proviennent de la base : une modification faite dans l'administration est
 * donc immédiatement visible sur tous les appareils.
 */
import { ensureDatabase, type DbClient, type Row } from './db';
import { SETTINGS_DEFAULTS, SETTINGS_DEFS } from './db/seed-texts';
import type {
  Banner, Benefit, Brand, Category, NavLink, Product, Section, SiteContent, Store, TextEntry,
} from './types';

/* ── Conversions ─────────────────────────────────────────────────── */
const num = (v: unknown, fallback = 0): number => {
  if (v === null || v === undefined || v === '') return fallback;
  const parsed = Number(v);
  return Number.isFinite(parsed) ? parsed : fallback;
};
const numOrNull = (v: unknown): number | null => {
  if (v === null || v === undefined || v === '') return null;
  const parsed = Number(v);
  return Number.isFinite(parsed) ? parsed : null;
};
const str = (v: unknown): string => (v === null || v === undefined ? '' : String(v));
const bool = (v: unknown): boolean => v === true || v === 'true' || v === 1 || v === 't' || v === '1';

/* ── Réglages ────────────────────────────────────────────────────── */
export function parseSettingValue(value: unknown): string | number | boolean | string[] | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'object') return value as string[];
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value;
  return String(value);
}

export async function getSettings(db?: DbClient): Promise<Record<string, string | number | boolean | string[]>> {
  const client = db ?? (await ensureDatabase());
  const rows = await client.query<{ key: string; value: unknown }>('select key, value from settings');
  const out: Record<string, string | number | boolean | string[]> = { ...SETTINGS_DEFAULTS };
  for (const row of rows) {
    const parsed = parseSettingValue(row.value);
    if (parsed !== null) out[row.key] = parsed;
  }
  return out;
}

export async function getTexts(db?: DbClient): Promise<Record<string, TextEntry>> {
  const client = db ?? (await ensureDatabase());
  const rows = await client.query<Row>('select key, ar, en, section, multiline, sort from texts order by sort, key');
  const out: Record<string, TextEntry> = {};
  for (const r of rows) {
    out[str(r.key)] = {
      ar: str(r.ar),
      en: str(r.en),
      section: str(r.section) || 'general',
      multiline: bool(r.multiline),
      sort: num(r.sort),
    };
  }
  for (const def of SETTINGS_DEFS) {
    if (def.internal) continue;
    if (!out[def.key]) out[def.key] = { ar: '', en: '', section: 'general', multiline: false, sort: 0 };
  }
  return out;
}

/* ── Entités ─────────────────────────────────────────────────────── */
export async function getCategories(db?: DbClient): Promise<Category[]> {
  const client = db ?? (await ensureDatabase());
  const rows = await client.query<Row>(
    'select * from categories order by sort, id',
  );
  return rows.map((r) => ({
    id: num(r.id),
    slug: str(r.slug),
    nameAr: str(r.name_ar),
    nameEn: str(r.name_en),
    icon: str(r.icon),
    imageUrl: str(r.image_url),
    descriptionAr: str(r.description_ar),
    descriptionEn: str(r.description_en),
    sort: num(r.sort),
    active: bool(r.active),
  }));
}

export async function getProducts(db?: DbClient): Promise<Product[]> {
  const client = db ?? (await ensureDatabase());
  const rows = await client.query<Row>(
    `select p.*, c.slug as category_slug, c.name_ar as category_name_ar, c.name_en as category_name_en
       from products p
       left join categories c on c.id = p.category_id
      order by p.sort, p.id`,
  );
  return rows.map((r) => ({
    id: num(r.id),
    categoryId: numOrNull(r.category_id),
    categorySlug: str(r.category_slug),
    categoryNameAr: str(r.category_name_ar),
    categoryNameEn: str(r.category_name_en),
    brand: str(r.brand),
    nameAr: str(r.name_ar),
    nameEn: str(r.name_en),
    descAr: str(r.desc_ar),
    descEn: str(r.desc_en),
    price: num(r.price),
    oldPrice: numOrNull(r.old_price),
    imageUrl: str(r.image_url),
    keywords: str(r.keywords),
    rating: num(r.rating, 4.8),
    stockAr: str(r.stock_ar),
    stockEn: str(r.stock_en),
    active: bool(r.active),
    sort: num(r.sort),
  }));
}

export function mapBanner(r: Row): Banner {
  return {
    id: num(r.id),
    placement: str(r.placement) as Banner['placement'],
    kickerAr: str(r.kicker_ar),
    kickerEn: str(r.kicker_en),
    titleAr: str(r.title_ar),
    titleEn: str(r.title_en),
    bodyAr: str(r.body_ar),
    bodyEn: str(r.body_en),
    priceTextAr: str(r.price_text_ar),
    priceTextEn: str(r.price_text_en),
    priceValue: numOrNull(r.price_value),
    ctaAr: str(r.cta_ar),
    ctaEn: str(r.cta_en),
    ctaKind: (str(r.cta_kind) || 'category') as Banner['ctaKind'],
    ctaTarget: str(r.cta_target),
    ctaHref: str(r.cta_href),
    icon: str(r.icon),
    imageUrl: str(r.image_url),
    theme: str(r.theme),
    sort: num(r.sort),
    active: bool(r.active),
  };
}

export async function getBanners(db?: DbClient): Promise<Banner[]> {
  const client = db ?? (await ensureDatabase());
  const rows = await client.query<Row>('select * from banners order by placement, sort, id');
  return rows.map(mapBanner);
}

export async function getStores(db?: DbClient): Promise<Store[]> {
  const client = db ?? (await ensureDatabase());
  const rows = await client.query<Row>('select * from stores order by sort, id');
  return rows.map((r) => ({
    id: num(r.id),
    nameAr: str(r.name_ar),
    nameEn: str(r.name_en),
    phone: str(r.phone),
    addressAr: str(r.address_ar),
    addressEn: str(r.address_en),
    hoursAr: str(r.hours_ar),
    hoursEn: str(r.hours_en),
    mapQuery: str(r.map_query),
    imageUrl: str(r.image_url),
    sort: num(r.sort),
    active: bool(r.active),
  }));
}

export async function getBenefits(db?: DbClient): Promise<Benefit[]> {
  const client = db ?? (await ensureDatabase());
  const rows = await client.query<Row>('select * from benefits order by placement, sort, id');
  return rows.map((r) => ({
    id: num(r.id),
    placement: (str(r.placement) || 'hero') as Benefit['placement'],
    icon: str(r.icon),
    titleAr: str(r.title_ar),
    titleEn: str(r.title_en),
    subtitleAr: str(r.subtitle_ar),
    subtitleEn: str(r.subtitle_en),
    sort: num(r.sort),
    active: bool(r.active),
  }));
}

export async function getBrands(db?: DbClient): Promise<Brand[]> {
  const client = db ?? (await ensureDatabase());
  const rows = await client.query<Row>('select * from brands order by sort, id');
  return rows.map((r) => ({
    id: num(r.id),
    name: str(r.name),
    searchQuery: str(r.search_query),
    logoUrl: str(r.logo_url),
    sort: num(r.sort),
    active: bool(r.active),
  }));
}

export async function getNavLinks(db?: DbClient): Promise<NavLink[]> {
  const client = db ?? (await ensureDatabase());
  const rows = await client.query<Row>('select * from nav_links order by location, sort, id');
  return rows.map((r) => ({
    id: num(r.id),
    location: (str(r.location) || 'main') as NavLink['location'],
    groupAr: str(r.group_ar),
    groupEn: str(r.group_en),
    labelAr: str(r.label_ar),
    labelEn: str(r.label_en),
    kind: (str(r.kind) || 'anchor') as NavLink['kind'],
    target: str(r.target),
    icon: str(r.icon),
    highlight: bool(r.highlight),
    sort: num(r.sort),
    active: bool(r.active),
  }));
}

export function mapSection(r: Row): Section {
  return {
    id: num(r.id),
    key: str(r.key),
    type: (str(r.type) || 'products') as Section['type'],
    anchor: str(r.anchor),
    categoryId: numOrNull(r.category_id),
    bannerId: numOrNull(r.banner_id),
    titleAr: str(r.title_ar),
    titleEn: str(r.title_en),
    subtitleAr: str(r.subtitle_ar),
    subtitleEn: str(r.subtitle_en),
    bodyAr: str(r.body_ar),
    bodyEn: str(r.body_en),
    icon: str(r.icon),
    theme: str(r.theme),
    sort: num(r.sort),
    active: bool(r.active),
  };
}

export async function getSections(db?: DbClient): Promise<Section[]> {
  const client = db ?? (await ensureDatabase());
  const rows = await client.query<Row>('select * from sections order by sort, id');
  return rows.map(mapSection);
}

/* ── Chargement complet (page d'accueil) ─────────────────────────── */
export async function loadSiteContent(): Promise<SiteContent> {
  const db = await ensureDatabase();
  const [settings, texts, categories, products, banners, stores, benefits, brands, navLinks, sections] =
    await Promise.all([
      getSettings(db),
      getTexts(db),
      getCategories(db),
      getProducts(db),
      getBanners(db),
      getStores(db),
      getBenefits(db),
      getBrands(db),
      getNavLinks(db),
      getSections(db),
    ]);

  return {
    settings,
    texts,
    categories: categories.filter((c) => c.active),
    products: products.filter((p) => p.active),
    banners: banners.filter((b) => b.active),
    stores: stores.filter((s) => s.active),
    benefits: benefits.filter((b) => b.active),
    brands: brands.filter((b) => b.active),
    navLinks: navLinks.filter((n) => n.active),
    sections: sections.filter((s) => s.active),
  };
}
