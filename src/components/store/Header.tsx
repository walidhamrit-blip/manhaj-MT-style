'use client';

import { useEffect, useMemo, useState } from 'react';
import { useStore } from './context';
import type { NavLink } from '@/lib/types';

/** Regroupe les liens par colonne (mégamenu, pied de page). */
function groupLinks(links: NavLink[], lang: 'ar' | 'en') {
  const groups: { label: string; links: NavLink[] }[] = [];
  for (const link of links) {
    const label = lang === 'ar' ? link.groupAr || link.groupEn : link.groupEn || link.groupAr;
    const existing = groups.find((group) => group.label === label);
    if (existing) existing.links.push(link);
    else groups.push({ label, links: [link] });
  }
  return groups;
}

function Countdown() {
  const [time, setTime] = useState<{ h: string; m: string; s: string } | null>(null);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      const seconds = Math.max(0, Math.floor((end.getTime() - now.getTime()) / 1000));
      setTime({
        h: String(Math.floor(seconds / 3600)).padStart(2, '0'),
        m: String(Math.floor((seconds % 3600) / 60)).padStart(2, '0'),
        s: String(seconds % 60).padStart(2, '0'),
      });
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="countdown">
      <b>{time?.h ?? '00'}</b>
      <b>{time?.m ?? '00'}</b>
      <b>{time?.s ?? '00'}</b>
    </div>
  );
}

export default function Header() {
  const {
    content, lang, t, pick, money, cartCount, wishlist, setCartOpen, setDrawerOpen, drawerOpen,
    megaOpen, setMegaOpen, runLink, showResults, quickView, openModal, notify, toggleLang,
  } = useStore();

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');

  const utilityLinks = content.navLinks.filter((l) => l.location === 'utility');
  const mainLinks = content.navLinks.filter((l) => l.location === 'main');
  const drawerLinks = content.navLinks.filter((l) => l.location === 'drawer');
  const tileLinks = content.navLinks.filter((l) => l.location === 'tiles');
  const megaLinks = content.navLinks.filter((l) => l.location === 'mega');
  const megaGroups = useMemo(() => groupLinks(megaLinks, lang), [megaLinks, lang]);

  const suggestions = useMemo(() => {
    if (!query.trim()) return [];
    const haystack = content.products;
    const terms = query.trim().toLowerCase().split('|').map((s) => s.trim()).filter(Boolean);
    return haystack
      .filter((product) => {
        if (category && product.categorySlug !== category) return false;
        const text = `${product.nameAr} ${product.nameEn} ${product.brand} ${product.keywords}`.toLowerCase();
        return terms.some((alternative) => alternative
          .split(/\s+/)
          .filter(Boolean)
          .every((word) => text.includes(word)));
      })
      .slice(0, 5);
  }, [category, content.products, query]);

  const phone = String(content.settings['contact.phone'] ?? '');
  const brandLatin = String(content.settings['brand.latin'] ?? 'AL MANHAJ');
  const showCountdown = Boolean(content.settings['ui.countdown']);
  const freeDelivery = Number(content.settings['shop.free_delivery_threshold'] ?? 150);

  const openAccount = () => {
    openModal(
      t('account.title', 'Connexion'),
      <form
        className="form-grid"
        onSubmit={(event) => {
          event.preventDefault();
          notify(t('account.success', 'Connexion réussie'));
        }}
      >
        <div className="field full">
          <label>{t('account.identifier', 'E-mail ou téléphone')}</label>
          <input required />
        </div>
        <div className="field full">
          <label>{t('account.password', 'Mot de passe')}</label>
          <input type="password" required />
        </div>
        <div className="field full">
          <button className="submit">{t('account.submit', 'SE CONNECTER')}</button>
        </div>
      </form>,
    );
  };

  const openWishlist = () => {
    const items = content.products.filter((product) => wishlist.includes(product.id));
    openModal(
      t('wishlist.title', 'Favoris'),
      items.length ? (
        <div className="results">
          {items.map((product) => (
            <article className="result" key={product.id}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={product.imageUrl} alt={pick(product.nameAr, product.nameEn)} />
              <div>
                <h4>{pick(product.nameAr, product.nameEn)}</h4>
                <strong>{money(product.price)}</strong>
                <button onClick={() => quickView(product.id)}>{t('catalog.quick_view', 'Aperçu')}</button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty">
          <div>
            <i className="fa-regular fa-heart" />
            {t('wishlist.empty', 'Aucun favori')}
          </div>
        </div>
      ),
    );
  };

  const openTrack = () => {
    openModal(
      t('track.title', 'Suivre ma commande'),
      <form
        className="form-grid"
        onSubmit={async (event) => {
          event.preventDefault();
          const form = event.currentTarget;
          const reference = String(new FormData(form).get('reference') ?? '').trim();
          try {
            const response = await fetch(`/api/track?reference=${encodeURIComponent(reference)}`);
            const data = await response.json();
            const statusKey = `track.status_${data.status ?? 'new'}`;
            notify(data.found
              ? `${t('track.found', 'Statut')}: ${t(statusKey, data.status ?? '')}`
              : t('track.not_found', 'Commande introuvable'));
          } catch {
            notify(t('track.not_found', 'Commande introuvable'));
          }
        }}
      >
        <div className="field full">
          <label>{t('track.number', 'Numéro de commande')}</label>
          <input name="reference" required placeholder="AM-0000" />
        </div>
        <div className="field full">
          <button className="submit">{t('track.submit', 'SUIVRE')}</button>
        </div>
      </form>,
    );
  };

  return (
    <>
      {/* Bandeau supérieur */}
      <div className="top-offer">
        <div className="container">
          <i className="fa-solid fa-truck-fast" />
          <span>{t('topbar.delivery')}</span>
          <strong>{money(freeDelivery)}</strong>
          {showCountdown ? <Countdown /> : null}
        </div>
      </div>

      {/* Barre utilitaire */}
      {utilityLinks.length ? (
        <div className="utility">
          <div className="container utility-inner">
            <div className="utility-links">
              {utilityLinks.map((link) => (
                <button key={link.id} onClick={() => runLink(link.kind, link.target)}>
                  <i className={link.icon} />
                  <span>{pick(link.labelAr, link.labelEn)}</span>
                </button>
              ))}
            </div>
            <div className="utility-contact">
              {phone ? (
                <a href={`tel:${phone.replace(/\s+/g, '')}`}>
                  <i className="fa-solid fa-phone" />
                  {phone}
                </a>
              ) : null}
              <button className="language" onClick={toggleLang}>
                <i className="fa-solid fa-globe" />
                <span className="language-label">{t('header.language', 'English')}</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="header-stack">
        <header className="main-header">
          <div className="container header-inner">
            <button className="menu-btn" aria-label="Menu" onClick={() => setDrawerOpen(true)}>
              <i className="fa-solid fa-bars" />
            </button>

            <a
              className="logo"
              href="#top"
              onClick={(event) => {
                event.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              <i className="fa-solid fa-pencil" />
              <span>
                <span className="logo-main">{brandLatin}</span>
                <span className="logo-sub">{t('header.brand_sub')}</span>
              </span>
            </a>

            <div className="search-wrap">
              <form
                className="search-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  setQuery('');
                  showResults(query, category);
                }}
              >
                <select value={category} onChange={(event) => setCategory(event.target.value)}>
                  <option value="">{t('header.search_all', 'Toutes catégories')}</option>
                  {content.categories.map((cat) => (
                    <option key={cat.id} value={cat.slug}>
                      {pick(cat.nameAr, cat.nameEn)}
                    </option>
                  ))}
                </select>
                <input
                  type="search"
                  autoComplete="off"
                  aria-label="Search"
                  placeholder={t('header.search_placeholder', 'Rechercher…')}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
                <button aria-label="Search">
                  <i className="fa-solid fa-magnifying-glass" />
                </button>
              </form>
              <div className={`suggestions${query.trim() ? ' active' : ''}`}>
                {suggestions.map((product) => (
                  <button className="suggestion" key={product.id} onClick={() => quickView(product.id)}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={product.imageUrl} alt="" />
                    <span>{pick(product.nameAr, product.nameEn)}</span>
                    <b>{money(product.price)}</b>
                  </button>
                ))}
              </div>
            </div>

            <div className="actions">
              <button className="head-action" onClick={openAccount}>
                <i className="fa-regular fa-user" />
                <span>{t('header.account', 'Compte')}</span>
              </button>
              <button className="head-action" onClick={openWishlist}>
                <i className="fa-regular fa-heart" />
                <span>{t('header.wishlist', 'Favoris')}</span>
                <span className="badge">{wishlist.length}</span>
              </button>
              <button className="head-action" onClick={() => setCartOpen(true)}>
                <i className="fa-solid fa-cart-shopping" />
                <span>{t('header.cart', 'Panier')}</span>
                <span className="badge">{cartCount}</span>
              </button>
            </div>
          </div>
        </header>

        {mainLinks.length ? (
          <nav className="category-nav">
            <div className="container nav-inner">
              <button className="departments" onClick={() => setMegaOpen(!megaOpen)}>
                <i className="fa-solid fa-bars" />
                <span>{t('header.all_departments', 'TOUS LES RAYONS')}</span>
                <i className="fa-solid fa-chevron-down" />
              </button>
              <div className="main-nav">
                {mainLinks.map((link) => (
                  <a
                    key={link.id}
                    href={`#${link.target}`}
                    className={link.highlight ? 'sale' : undefined}
                    onClick={(event) => {
                      event.preventDefault();
                      runLink(link.kind, link.target);
                    }}
                  >
                    {pick(link.labelAr, link.labelEn)}
                  </a>
                ))}
              </div>
              <div className={`mega${megaOpen ? ' active' : ''}`}>
                {megaGroups.map((group) => (
                  <div className="mega-group" key={group.label}>
                    <h4>{group.label}</h4>
                    {group.links.map((link) => (
                      <button key={link.id} onClick={() => runLink(link.kind, link.target)}>
                        {pick(link.labelAr, link.labelEn)}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </nav>
        ) : null}
      </div>

      {/* Menu latéral (mobile) */}
      <aside className={`drawer${drawerOpen ? ' open' : ''}`}>
        <div className="drawer-head">
          <strong>{brandLatin}</strong>
          <button className="close" aria-label="Fermer" onClick={() => setDrawerOpen(false)}>
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="drawer-links">
          {drawerLinks.map((link) => (
            <button key={link.id} onClick={() => runLink(link.kind, link.target)}>
              <i className={link.icon} />
              <span>{pick(link.labelAr, link.labelEn)}</span>
            </button>
          ))}
          {tileLinks.length ? (
            <div className="drawer-links" style={{ borderTop: '1px solid #edf0f2' }}>
              {tileLinks.slice(0, 4).map((link) => (
                <button key={link.id} onClick={() => runLink(link.kind, link.target)}>
                  <i className={link.icon} />
                  <span>{pick(link.labelAr, link.labelEn)}</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </aside>

    </>
  );
}
