'use client';

/**
 * État global du site public : langue (AR/EN), panier, favoris, fenêtres
 * modales, notifications et recherche. Le contenu provient du serveur
 * (base de données) — seuls la langue, le panier et les favoris sont
 * mémorisés dans le navigateur.
 */
import {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode,
} from 'react';
import { formatMoney } from '@/lib/format';
import type { Banner, Lang, Product, SiteContent } from '@/lib/types';

export type CartLine = { id: number; qty: number };

type Toast = { id: number; message: string };

type StoreValue = {
  content: SiteContent;
  lang: Lang;
  dir: 'rtl' | 'ltr';
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
  /** Texte de l'interface depuis la base (ar/en). */
  t: (key: string, fallback?: string) => string;
  /** Nom / libellé bilingue d'une entité. */
  pick: (ar: string, en: string) => string;
  money: (value: number) => string;
  /* Panier */
  cart: CartLine[];
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  addToCart: (productId: number, qty?: number) => void;
  changeQty: (productId: number, delta: number) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
  cartItems: { product: Product; qty: number; lineTotal: number }[];
  cartCount: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
  /* Favoris */
  wishlist: number[];
  toggleWishlist: (productId: number) => void;
  /* Navigation */
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  megaOpen: boolean;
  setMegaOpen: (open: boolean) => void;
  /* Fenêtres */
  modal: { title: string; body: ReactNode } | null;
  openModal: (title: string, body: ReactNode) => void;
  closeModal: () => void;
  toasts: Toast[];
  notify: (message: string) => void;
  /* Actions catalogue */
  quickView: (productId: number) => void;
  showResults: (query: string, categorySlug?: string) => void;
  runLink: (kind: string, target: string) => void;
  runBanner: (banner: Banner) => void;
};

const StoreContext = createContext<StoreValue | null>(null);

const CART_KEY = 'manhajCart';
const WISH_KEY = 'manhajWish';
const LANG_KEY = 'manhajLang';

export function StoreProvider({ content, children }: { content: SiteContent; children: ReactNode }) {
  const defaultLang = (String(content.settings['ui.default_language'] ?? 'ar') === 'en' ? 'en' : 'ar') as Lang;
  const [lang, setLangState] = useState<Lang>(defaultLang);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [modal, setModal] = useState<{ title: string; body: ReactNode } | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);
  const hydrated = useRef(false);

  /* ── Restauration depuis le navigateur ─────────────────────────── */
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem(CART_KEY);
      if (storedCart) setCart(JSON.parse(storedCart));
      const storedWish = localStorage.getItem(WISH_KEY);
      if (storedWish) setWishlist(JSON.parse(storedWish));
      const storedLang = localStorage.getItem(LANG_KEY);
      if (storedLang === 'ar' || storedLang === 'en') setLangState(storedLang);
    } catch {
      /* stockage indisponible : on ignore */
    }
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch { /* ignore */ }
  }, [cart]);

  useEffect(() => {
    if (!hydrated.current) return;
    try {
      localStorage.setItem(WISH_KEY, JSON.stringify(wishlist));
    } catch { /* ignore */ }
  }, [wishlist]);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch { /* ignore */ }
  }, [lang]);

  /* ── Aides de traduction ──────────────────────────────────────── */
  const t = useCallback(
    (key: string, fallback = '') => {
      const entry = content.texts[key];
      if (!entry) return fallback || key;
      const value = lang === 'ar' ? entry.ar : entry.en;
      return value || entry.ar || entry.en || fallback;
    },
    [content.texts, lang],
  );

  const pick = useCallback((ar: string, en: string) => (lang === 'ar' ? ar || en : en || ar), [lang]);

  const currency = lang === 'ar'
    ? String(content.settings['shop.currency_ar'] ?? 'د.ل')
    : String(content.settings['shop.currency_en'] ?? 'LYD');

  const money = useCallback((value: number) => formatMoney(value, currency), [currency]);

  const notify = useCallback((message: string) => {
    toastId.current += 1;
    const id = toastId.current;
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((toast) => toast.id !== id)), 3000);
  }, []);

  /* ── Panier ───────────────────────────────────────────────────── */
  const addToCart = useCallback((productId: number, qty = 1) => {
    setCart((prev) => {
      const existing = prev.find((line) => line.id === productId);
      if (existing) return prev.map((line) => (line.id === productId ? { ...line, qty: line.qty + qty } : line));
      return [...prev, { id: productId, qty }];
    });
    notify(t('cart.added', 'Ajouté au panier'));
  }, [notify, t]);

  const changeQty = useCallback((productId: number, delta: number) => {
    setCart((prev) => prev
      .map((line) => (line.id === productId ? { ...line, qty: line.qty + delta } : line))
      .filter((line) => line.qty > 0));
  }, []);

  const removeFromCart = useCallback((productId: number) => {
    setCart((prev) => prev.filter((line) => line.id !== productId));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const cartItems = useMemo(() => cart
    .map((line) => {
      const product = content.products.find((p) => p.id === line.id);
      if (!product) return null;
      return { product, qty: line.qty, lineTotal: product.price * line.qty };
    })
    .filter((line): line is { product: Product; qty: number; lineTotal: number } => line !== null),
  [cart, content.products]);

  const cartCount = cartItems.reduce((sum, line) => sum + line.qty, 0);
  const subtotal = cartItems.reduce((sum, line) => sum + line.lineTotal, 0);
  const threshold = Number(content.settings['shop.free_delivery_threshold'] ?? 150);
  const configuredFee = Number(content.settings['shop.delivery_fee'] ?? 0);
  const deliveryFee = subtotal === 0 || subtotal >= threshold ? 0 : configuredFee;
  const total = subtotal + deliveryFee;

  /* ── Favoris ──────────────────────────────────────────────────── */
  const toggleWishlist = useCallback((productId: number) => {
    setWishlist((prev) => (prev.includes(productId)
      ? prev.filter((id) => id !== productId)
      : [...prev, productId]));
  }, []);

  const wishlistToast = useRef(false);
  useEffect(() => {
    if (!wishlistToast.current) {
      wishlistToast.current = true;
      return;
    }
    notify(t('wishlist.updated', 'Favoris mis à jour'));
  }, [wishlist, notify, t]);

  /* ── Fenêtres & navigation ────────────────────────────────────── */
  const openModal = useCallback((title: string, body: ReactNode) => setModal({ title, body }), []);
  const closeModal = useCallback(() => setModal(null), []);

  const quickView = useCallback((productId: number) => {
    const product = content.products.find((p) => p.id === productId);
    if (!product) return;
    setModal({
      title: t('catalog.details_title', 'Détails du produit'),
      body: (
        <div className="quick-grid">
          <div className="quick-image">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={product.imageUrl} alt={pick(product.nameAr, product.nameEn)} />
          </div>
          <div className="quick-details">
            <span className="brand">{product.brand}</span>
            <h3>{pick(product.nameAr, product.nameEn)}</h3>
            <div className="rating">★★★★★ <span>({product.rating})</span></div>
            <span className="price">{money(product.price)}</span>
            {product.oldPrice && product.oldPrice > product.price ? (
              <span className="old">{money(product.oldPrice)}</span>
            ) : null}
            <p>{pick(product.descAr, product.descEn) || t('catalog.details_body')}</p>
            <button className="btn" onClick={() => { addToCart(product.id); }}>
              <i className="fa-solid fa-cart-plus" /> {t('catalog.add_to_cart', 'Ajouter au panier')}
            </button>
          </div>
        </div>
      ),
    });
  }, [addToCart, content.products, money, pick, t]);

  const searchProducts = useCallback((query: string, categorySlug = ''): Product[] => {
    const trimmed = query.trim().toLowerCase();
    const terms = trimmed ? trimmed.split('|').map((part) => part.trim()).filter(Boolean) : [];
    return content.products.filter((product) => {
      if (categorySlug && product.categorySlug !== categorySlug) return false;
      if (!terms.length) return true;
      const haystack = `${product.nameAr} ${product.nameEn} ${product.brand} ${product.keywords} ${product.categoryNameAr} ${product.categoryNameEn}`.toLowerCase();
      // Chaque alternative (« قلم|pen ») est validée en exigeant tous ses mots.
      return terms.some((alternative) => alternative
        .split(/\s+/)
        .filter(Boolean)
        .every((word) => haystack.includes(word)));
    });
  }, [content.products]);

  const showResults = useCallback((query: string, categorySlug = '') => {
    const found = searchProducts(query, categorySlug);
    const category = content.categories.find((c) => c.slug === categorySlug);
    const title = category ? pick(category.nameAr, category.nameEn) : t('catalog.search_results', 'Résultats');
    openModal(
      title,
      found.length ? (
        <div className="results">
          {found.map((product) => (
            <article className="result" key={product.id}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={product.imageUrl} alt={pick(product.nameAr, product.nameEn)} />
              <div>
                <h4>{pick(product.nameAr, product.nameEn)}</h4>
                <strong>{money(product.price)}</strong>
                <button onClick={() => addToCart(product.id)}>{t('catalog.add_to_cart', 'Ajouter')}</button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty">
          <div>
            <i className="fa-solid fa-magnifying-glass" />
            {t('catalog.no_results', 'Aucun résultat')}
          </div>
        </div>
      ),
    );
  }, [addToCart, content.categories, money, openModal, pick, searchProducts, t]);

  /* ── Lien de menu / bouton de bandeau ─────────────────────────── */
  const runLink = useCallback((kind: string, target: string) => {
    setDrawerOpen(false);
    setMegaOpen(false);
    switch (kind) {
      case 'category':
        showResults('', target);
        break;
      case 'query':
        showResults(target);
        break;
      case 'action':
        if (target === 'language') {
          setLangState((prev) => (prev === 'ar' ? 'en' : 'ar'));
        }
        break;
      case 'url':
        if (target) window.open(target, '_blank', 'noopener');
        break;
      default: {
        const anchor = target === 'top' ? '' : target;
        const element = anchor ? document.getElementById(anchor) : document.body;
        if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        else window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [showResults]);

  const runBanner = useCallback((banner: Banner) => {
    if (banner.ctaKind === 'url') {
      if (banner.ctaHref) window.open(banner.ctaHref, '_blank', 'noopener');
      else {
        const anchor = document.getElementById(banner.ctaTarget);
        if (anchor) anchor.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }
    runLink(banner.ctaKind, banner.ctaTarget);
  }, [runLink]);

  const value: StoreValue = {
    content,
    lang,
    dir: lang === 'ar' ? 'rtl' : 'ltr',
    setLang: setLangState,
    toggleLang: () => setLangState((prev) => (prev === 'ar' ? 'en' : 'ar')),
    t,
    pick,
    money,
    cart,
    cartOpen,
    setCartOpen,
    addToCart,
    changeQty,
    removeFromCart,
    clearCart,
    cartItems,
    cartCount,
    subtotal,
    deliveryFee,
    total,
    wishlist,
    toggleWishlist,
    drawerOpen,
    setDrawerOpen,
    megaOpen,
    setMegaOpen,
    modal,
    openModal,
    closeModal,
    toasts,
    notify,
    quickView,
    showResults,
    runLink,
    runBanner,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore doit être utilisé dans <StoreProvider>');
  return context;
}
