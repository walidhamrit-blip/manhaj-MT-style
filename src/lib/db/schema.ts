/**
 * Schéma de la base de données (PostgreSQL / Neon).
 *
 * Toutes les instructions sont idempotentes : elles sont rejouées au premier
 * accès de l'application (et par `npm run db:setup`), donc aucun outil de
 * migration n'est nécessaire pour démarrer.
 */
export const SCHEMA_STATEMENTS: string[] = [
  /* ── Réglages généraux (clé / valeur JSON) ───────────────────────── */
  `create table if not exists settings (
     key         text primary key,
     value       jsonb not null default 'null'::jsonb,
     updated_at  timestamptz not null default now()
   )`,

  /* ── Textes de l'interface (dictionnaire bilingue) ───────────────── */
  `create table if not exists texts (
     key         text primary key,
     ar          text not null default '',
     en          text not null default '',
     section     text not null default 'general',
     multiline   boolean not null default false,
     sort        integer not null default 0,
     updated_at  timestamptz not null default now()
   )`,

  /* ── Sections de la page d'accueil ───────────────────────────────── */
  `create table if not exists sections (
     id            serial primary key,
     key           text not null unique,
     type          text not null default 'products',
     anchor        text not null default '',
     category_id   integer,
     banner_id     integer,
     title_ar      text not null default '',
     title_en      text not null default '',
     subtitle_ar   text not null default '',
     subtitle_en   text not null default '',
     body_ar       text not null default '',
     body_en       text not null default '',
     icon          text not null default '',
     theme         text not null default '',
     sort          integer not null default 0,
     active        boolean not null default true,
     created_at    timestamptz not null default now(),
     updated_at    timestamptz not null default now()
   )`,

  /* ── Catégories / rayons ─────────────────────────────────────────── */
  `create table if not exists categories (
     id              serial primary key,
     slug            text not null unique,
     name_ar         text not null default '',
     name_en         text not null default '',
     icon            text not null default 'fa-solid fa-pen',
     image_url       text not null default '',
     description_ar  text not null default '',
     description_en  text not null default '',
     sort            integer not null default 0,
     active          boolean not null default true,
     created_at      timestamptz not null default now(),
     updated_at      timestamptz not null default now()
   )`,

  /* ── Produits ────────────────────────────────────────────────────── */
  `create table if not exists products (
     id           serial primary key,
     category_id  integer references categories(id) on delete set null,
     brand        text not null default '',
     name_ar      text not null default '',
     name_en      text not null default '',
     desc_ar      text not null default '',
     desc_en      text not null default '',
     price        numeric(12,2) not null default 0,
     old_price    numeric(12,2),
     image_url    text not null default '',
     keywords     text not null default '',
     rating       numeric(3,2) not null default 4.8,
     stock_ar     text not null default 'متوفر',
     stock_en     text not null default 'IN STOCK',
     active       boolean not null default true,
     sort         integer not null default 0,
     created_at   timestamptz not null default now(),
     updated_at   timestamptz not null default now()
   )`,
  `create index if not exists products_category_idx on products (category_id)`,
  `create index if not exists products_active_idx on products (active)`,

  /* ── Bandeaux : héros, cartes d'offre, promos, bandeaux de vente ─── */
  `create table if not exists banners (
     id            serial primary key,
     placement     text not null default 'hero',
     kicker_ar     text not null default '',
     kicker_en     text not null default '',
     title_ar      text not null default '',
     title_en      text not null default '',
     body_ar       text not null default '',
     body_en       text not null default '',
     price_text_ar text not null default '',
     price_text_en text not null default '',
     price_value   numeric(12,2),
     cta_ar        text not null default '',
     cta_en        text not null default '',
     cta_kind      text not null default 'category',
     cta_target    text not null default '',
     cta_href      text not null default '',
     icon          text not null default '',
     image_url     text not null default '',
     theme         text not null default '',
     sort          integer not null default 0,
     active        boolean not null default true,
     created_at    timestamptz not null default now(),
     updated_at    timestamptz not null default now()
   )`,
  `create index if not exists banners_placement_idx on banners (placement)`,

  /* ── Magasins / agences ──────────────────────────────────────────── */
  `create table if not exists stores (
     id           serial primary key,
     name_ar      text not null default '',
     name_en      text not null default '',
     phone        text not null default '',
     address_ar   text not null default '',
     address_en   text not null default '',
     hours_ar     text not null default '',
     hours_en     text not null default '',
     map_query    text not null default '',
     image_url    text not null default '',
     sort         integer not null default 0,
     active       boolean not null default true,
     created_at   timestamptz not null default now(),
     updated_at   timestamptz not null default now()
   )`,

  /* ── Avantages (bandeau icônes) ──────────────────────────────────── */
  `create table if not exists benefits (
     id            serial primary key,
     placement     text not null default 'hero',
     icon          text not null default 'fa-solid fa-truck-fast',
     title_ar      text not null default '',
     title_en      text not null default '',
     subtitle_ar   text not null default '',
     subtitle_en   text not null default '',
     sort          integer not null default 0,
     active        boolean not null default true,
     created_at    timestamptz not null default now(),
     updated_at    timestamptz not null default now()
   )`,

  /* ── Marques ─────────────────────────────────────────────────────── */
  `create table if not exists brands (
     id            serial primary key,
     name          text not null default '',
     search_query  text not null default '',
     logo_url      text not null default '',
     sort          integer not null default 0,
     active        boolean not null default true,
     created_at    timestamptz not null default now(),
     updated_at    timestamptz not null default now()
   )`,

  /* ── Liens & raccourcis (menu principal, tiroir, mégamenu, tuiles, pied de page) ── */
  `create table if not exists nav_links (
     id          serial primary key,
     location    text not null default 'main',
     group_ar    text not null default '',
     group_en    text not null default '',
     label_ar    text not null default '',
     label_en    text not null default '',
     kind        text not null default 'anchor',
     target      text not null default '',
     icon        text not null default '',
     highlight   boolean not null default false,
     sort        integer not null default 0,
     active      boolean not null default true,
     created_at  timestamptz not null default now(),
     updated_at  timestamptz not null default now()
   )`,
  `create index if not exists nav_links_location_idx on nav_links (location)`,

  /* ── Bibliothèque d'images (URLs réutilisables) ──────────────────── */
  `create table if not exists media (
     id          serial primary key,
     url         text not null unique,
     label       text not null default '',
     alt_ar      text not null default '',
     alt_en      text not null default '',
     created_at  timestamptz not null default now()
   )`,

  /* ── Commandes ───────────────────────────────────────────────────── */
  `create table if not exists orders (
     id              serial primary key,
     reference       text not null unique,
     customer_name   text not null default '',
     phone           text not null default '',
     address         text not null default '',
     city            text not null default '',
     note            text not null default '',
     payment_method  text not null default '',
     subtotal        numeric(12,2) not null default 0,
     delivery        numeric(12,2) not null default 0,
     total           numeric(12,2) not null default 0,
     status          text not null default 'new',
     created_at      timestamptz not null default now(),
     updated_at      timestamptz not null default now()
   )`,
  `create index if not exists orders_created_idx on orders (created_at desc)`,
  `create table if not exists order_items (
     id          serial primary key,
     order_id    integer not null references orders(id) on delete cascade,
     product_id  integer,
     name_ar     text not null default '',
     name_en     text not null default '',
     price       numeric(12,2) not null default 0,
     qty         integer not null default 1,
     line_total  numeric(12,2) not null default 0
   )`,
  `create index if not exists order_items_order_idx on order_items (order_id)`,

  /* ── Demandes de devis ───────────────────────────────────────────── */
  `create table if not exists quotes (
     id            serial primary key,
     reference     text not null unique,
     contact_name  text not null default '',
     company       text not null default '',
     phone         text not null default '',
     email         text not null default '',
     message       text not null default '',
     status        text not null default 'new',
     created_at    timestamptz not null default now(),
     updated_at    timestamptz not null default now()
   )`,

  /* ── Abonnés à la newsletter ─────────────────────────────────────── */
  `create table if not exists subscribers (
     id          serial primary key,
     email       text not null unique,
     status      text not null default 'active',
     created_at  timestamptz not null default now()
   )`,

  /* ── Journal d'activité du panneau d'administration ──────────────── */
  `create table if not exists activity_log (
     id          serial primary key,
     action      text not null default '',
     resource    text not null default '',
     resource_id text not null default '',
     detail      text not null default '',
     created_at  timestamptz not null default now()
   )`,
];

/** Version du schéma — sert à rejouer les créations de tables après une mise à jour. */
export const SCHEMA_VERSION = '1';
