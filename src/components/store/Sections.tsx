'use client';

import { useState } from 'react';
import { useStore } from './context';
import Hero from './Hero';
import { ProductCarousel } from './ProductCard';
import type { Section } from '@/lib/types';

/* ── Titre de section ────────────────────────────────────────────── */
function Heading({ section }: { section: Section }) {
  const { pick } = useStore();
  const title = pick(section.titleAr, section.titleEn);
  const subtitle = pick(section.subtitleAr, section.subtitleEn);
  if (!title && !subtitle) return null;
  return (
    <div className="heading">
      <div>
        {title ? <h2>{title}</h2> : null}
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
    </div>
  );
}

/* ── Rayons (tuiles) ─────────────────────────────────────────────── */
function CategoriesSection({ section }: { section: Section }) {
  const { content, pick, runLink } = useStore();
  const tiles = content.navLinks.filter((link) => link.location === 'tiles');
  return (
    <section className="container section" id={section.anchor || undefined}>
      <Heading section={section} />
      <div className="category-grid">
        {tiles.map((tile) => (
          <button className="category" key={tile.id} onClick={() => runLink(tile.kind, tile.target)}>
            <span className="category-icon">
              <i className={tile.icon} />
            </span>
            <span>{pick(tile.labelAr, tile.labelEn)}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

/* ── Produits d'un rayon ─────────────────────────────────────────── */
function ProductsSection({ section }: { section: Section }) {
  const { content, pick, t, showResults } = useStore();
  const perSection = Number(content.settings['shop.products_per_section'] ?? 10);
  const products = content.products
    .filter((product) => (section.categoryId ? product.categoryId === section.categoryId : false))
    .slice(0, perSection);
  if (!products.length) return null;
  const title = pick(section.titleAr, section.titleEn);
  const category = content.categories.find((cat) => cat.id === section.categoryId);

  return (
    <section className="container product-section" id={section.anchor || undefined}>
      <div className={`product-bar${section.theme ? ` ${section.theme}` : ''}`}>
        <h2>{title}</h2>
        <button className="view-all" onClick={() => showResults('', category?.slug ?? '')}>
          <span>{t('catalog.view_all', 'VOIR TOUT')}</span> <i className="fa-solid fa-arrow-left" />
        </button>
      </div>
      <ProductCarousel products={products} />
    </section>
  );
}

/* ── Meilleures offres (remises automatiques) ────────────────────── */
function DealsSection({ section }: { section: Section }) {
  const { content, pick, t, showResults } = useStore();
  const minDiscount = Number(content.settings['shop.deals_min_discount'] ?? 5);
  const limit = Number(content.settings['shop.deals_limit'] ?? 10);
  const products = content.products
    .filter((product) => product.oldPrice && product.oldPrice - product.price >= minDiscount)
    .slice(0, limit);
  if (!products.length) return null;

  return (
    <section className="container product-section" id={section.anchor || undefined}>
      <div className="heading">
        <div>
          <h2>{pick(section.titleAr, section.titleEn)}</h2>
          {pick(section.subtitleAr, section.subtitleEn) ? <p>{pick(section.subtitleAr, section.subtitleEn)}</p> : null}
        </div>
        <button className="view-all" onClick={() => showResults('')}>
          <span>{t('catalog.view_all', 'VOIR TOUT')}</span>
        </button>
      </div>
      <ProductCarousel products={products} />
    </section>
  );
}

/* ── Promotions (deux cartes) ────────────────────────────────────── */
function PromosSection() {
  const { content, pick, runBanner } = useStore();
  const promos = content.banners.filter((banner) => banner.placement === 'promo');
  if (!promos.length) return null;
  return (
    <section className="container promo-grid">
      {promos.slice(0, 2).map((banner) => (
        <article
          key={banner.id}
          className={`promo${banner.theme ? ` ${banner.theme}` : ''}`}
          style={{ backgroundImage: `url('${banner.imageUrl}')` }}
        >
          <div className="promo-content">
            <h3>{pick(banner.titleAr, banner.titleEn)}</h3>
            <p>{pick(banner.bodyAr, banner.bodyEn)}</p>
            <span className="promo-price">{pick(banner.priceTextAr, banner.priceTextEn)}</span>
            {pick(banner.ctaAr, banner.ctaEn) ? (
              <button className="btn outline" onClick={() => runBanner(banner)}>
                {pick(banner.ctaAr, banner.ctaEn)}
              </button>
            ) : null}
          </div>
        </article>
      ))}
    </section>
  );
}

/* ── Bandeau de vente ────────────────────────────────────────────── */
function SaleSection({ section }: { section: Section }) {
  const { content, pick, runBanner, money } = useStore();
  const banner = content.banners.find((item) => item.id === section.bannerId)
    ?? content.banners.filter((item) => item.placement === 'sale')[0];
  if (!banner) return null;

  return (
    <section
      className={`container sale-banner${banner.theme ? ` ${banner.theme}` : ''}`}
      id={section.anchor || undefined}
      style={{ backgroundImage: `url('${banner.imageUrl}')` }}
    >
      <div className="banner-content">
        <small>{pick(banner.kickerAr, banner.kickerEn)}</small>
        <h2>{pick(banner.titleAr, banner.titleEn)}</h2>
        <p>{pick(banner.bodyAr, banner.bodyEn)}</p>
        <div className="banner-discount">
          {banner.priceValue !== null ? money(banner.priceValue) : pick(banner.priceTextAr, banner.priceTextEn)}
        </div>
        {pick(banner.ctaAr, banner.ctaEn) ? (
          <button className="btn" onClick={() => runBanner(banner)}>
            {pick(banner.ctaAr, banner.ctaEn)}
          </button>
        ) : null}
      </div>
    </section>
  );
}

/* ── Marques ─────────────────────────────────────────────────────── */
function BrandsSection({ section }: { section: Section }) {
  const { content, showResults } = useStore();
  const group = section.brandGroup;
  const brands = group
    ? content.brands.filter((b) => b.group === group)
    : content.brands;
  if (!brands.length) return null;

  const theme = section.theme || 'light';
  return (
    <section className={`container brands brands-${theme}`}>
      <Heading section={section} />
      <div className={`brand-row brand-row-${theme}`}>
        {brands.map((brand) => (
          <button
            className={`brand-btn brand-btn-${theme}`}
            key={brand.id}
            onClick={() => showResults(brand.searchQuery || brand.name)}
            title={brand.name}
          >
            {brand.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={brand.logoUrl} alt={brand.name} />
            ) : brand.name}
          </button>
        ))}
      </div>
    </section>
  );
}

/* ── Devis / fournitures ─────────────────────────────────────────── */
function ServiceSection({ section }: { section: Section }) {
  const { t, content, openModal, notify } = useStore();
  const [sending, setSending] = useState(false);
  const whatsapp = String(content.settings['contact.whatsapp'] ?? '');

  const openQuote = () => {
    openModal(
      t('quote.form_title', 'Demander un devis'),
      <form
        className="form-grid"
        onSubmit={async (event) => {
          event.preventDefault();
          if (sending) return;
          setSending(true);
          const data = Object.fromEntries(new FormData(event.currentTarget)) as Record<string, string>;
          try {
            const response = await fetch('/api/quotes', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error('failed');
            notify(t('quote.thanks', 'Merci, nous vous contactons bientôt'));
          } catch {
            notify(t('checkout.failed', 'Échec de l’envoi'));
          } finally {
            setSending(false);
          }
        }}
      >
        <div className="field">
          <label>{t('quote.form_name', 'Votre nom')}</label>
          <input name="contactName" required />
        </div>
        <div className="field">
          <label>{t('quote.form_company', 'Société ou école')}</label>
          <input name="company" />
        </div>
        <div className="field">
          <label>{t('quote.form_phone', 'Téléphone')}</label>
          <input name="phone" required />
        </div>
        <div className="field">
          <label>{t('quote.form_email', 'E-mail')}</label>
          <input name="email" type="email" />
        </div>
        <div className="field full">
          <label>{t('quote.form_message', 'Détails de la demande')}</label>
          <textarea name="message" rows={5} style={{ padding: 8, border: '1px solid #cfd6da' }} />
        </div>
        <div className="field full">
          <button className="submit" disabled={sending}>{t('quote.form_submit', 'ENVOYER')}</button>
        </div>
      </form>,
    );
  };

  return (
    <section className="container service" id={section.anchor || 'business'}>
      <div className="service-main">
        <i className={section.icon || 'fa-solid fa-school'} />
        <div>
          <h2>{t('service.title')}</h2>
          <p>{t('service.body')}</p>
        </div>
      </div>
      <div className="service-contact">
        <div>
          <h2>{t('quote.title')}</h2>
          <p>{t('quote.body')}</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn" onClick={openQuote}>
            <i className="fa-solid fa-file-invoice" />
            <span>{t('quote.button', 'Demander un devis')}</span>
          </button>
          {whatsapp ? (
            <a
              className="btn outline"
              style={{ background: '#25d366', borderColor: '#25d366' }}
              href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(t('quote.whatsapp'))}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fa-brands fa-whatsapp" />
              WhatsApp
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}

/* ── Magasins ────────────────────────────────────────────────────── */
function StoresSection({ section }: { section: Section }) {
  const { content, pick, t } = useStore();
  if (!content.stores.length) return null;
  const openMap = (query: string) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`, '_blank');
  };
  return (
    <section className="container stores" id={section.anchor || 'stores'}>
      <Heading section={section} />
      <div className="store-grid">
        {content.stores.map((store) => (
          <article className="store" key={store.id}>
            {store.imageUrl ? (
              <div className="store-image">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={store.imageUrl} alt={pick(store.nameAr, store.nameEn)} />
              </div>
            ) : null}
            <h3>{pick(store.nameAr, store.nameEn)}</h3>
            {store.phone ? (
              <p>
                <i className="fa-solid fa-phone" />
                {store.phone}
              </p>
            ) : null}
            <p>
              <i className="fa-solid fa-location-dot" />
              <span>{pick(store.addressAr, store.addressEn)}</span>
            </p>
            <p>
              <i className="fa-regular fa-clock" />
              <span>{pick(store.hoursAr, store.hoursEn)}</span>
            </p>
            <button className="map-btn" onClick={() => openMap(store.mapQuery || store.nameEn || store.nameAr)}>
              {t('common.map', 'OUVRIR LA CARTE')}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ── À propos ────────────────────────────────────────────────────── */
function AboutSection({ section }: { section: Section }) {
  const { pick } = useStore();
  return (
    <section className="container about" id={section.anchor || 'about'}>
      <p>{pick(section.bodyAr, section.bodyEn)}</p>
      {pick(section.subtitleAr, section.subtitleEn) ? (
        <p>
          <strong>{pick(section.subtitleAr, section.subtitleEn)}</strong>
        </p>
      ) : null}
    </section>
  );
}

/* ── Aiguillage ──────────────────────────────────────────────────── */
export default function SectionBlock({ section }: { section: Section }) {
  switch (section.type) {
    case 'hero':
      return <Hero section={section} />;
    case 'categories':
      return <CategoriesSection section={section} />;
    case 'products':
      return <ProductsSection section={section} />;
    case 'deals':
      return <DealsSection section={section} />;
    case 'promos':
      return <PromosSection />;
    case 'sale':
      return <SaleSection section={section} />;
    case 'brands':
      return <BrandsSection section={section} />;
    case 'service':
      return <ServiceSection section={section} />;
    case 'stores':
      return <StoresSection section={section} />;
    case 'about':
      return <AboutSection section={section} />;
    default:
      return null;
  }
}
