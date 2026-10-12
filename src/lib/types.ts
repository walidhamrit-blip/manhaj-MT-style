/** Types métier partagés entre le site, l'API et le panneau d'administration. */

export type Lang = 'ar' | 'en';

export type Category = {
  id: number;
  slug: string;
  nameAr: string;
  nameEn: string;
  icon: string;
  imageUrl: string;
  descriptionAr: string;
  descriptionEn: string;
  sort: number;
  active: boolean;
};

export type Product = {
  id: number;
  categoryId: number | null;
  categorySlug: string;
  categoryNameAr: string;
  categoryNameEn: string;
  brand: string;
  nameAr: string;
  nameEn: string;
  descAr: string;
  descEn: string;
  price: number;
  oldPrice: number | null;
  imageUrl: string;
  keywords: string;
  rating: number;
  stockAr: string;
  stockEn: string;
  active: boolean;
  sort: number;
};

export type Banner = {
  id: number;
  placement: 'hero' | 'offer' | 'promo' | 'sale';
  kickerAr: string;
  kickerEn: string;
  titleAr: string;
  titleEn: string;
  bodyAr: string;
  bodyEn: string;
  priceTextAr: string;
  priceTextEn: string;
  priceValue: number | null;
  ctaAr: string;
  ctaEn: string;
  ctaKind: 'category' | 'anchor' | 'query' | 'url';
  ctaTarget: string;
  ctaHref: string;
  icon: string;
  imageUrl: string;
  theme: string;
  sort: number;
  active: boolean;
};

export type Store = {
  id: number;
  nameAr: string;
  nameEn: string;
  phone: string;
  addressAr: string;
  addressEn: string;
  hoursAr: string;
  hoursEn: string;
  mapQuery: string;
  imageUrl: string;
  sort: number;
  active: boolean;
};

export type Benefit = {
  id: number;
  placement: 'hero' | 'footer';
  icon: string;
  titleAr: string;
  titleEn: string;
  subtitleAr: string;
  subtitleEn: string;
  sort: number;
  active: boolean;
};

export type Brand = {
  id: number;
  name: string;
  group: 'it' | 'stationery' | '';
  searchQuery: string;
  logoUrl: string;
  sort: number;
  active: boolean;
};

export type NavLink = {
  id: number;
  location: 'utility' | 'main' | 'drawer' | 'mega' | 'tiles' | 'footer';
  groupAr: string;
  groupEn: string;
  labelAr: string;
  labelEn: string;
  kind: 'anchor' | 'category' | 'query' | 'action' | 'url';
  target: string;
  icon: string;
  highlight: boolean;
  sort: number;
  active: boolean;
};

export type Section = {
  id: number;
  key: string;
  type: 'hero' | 'categories' | 'products' | 'deals' | 'promos' | 'sale' | 'brands' | 'service' | 'stores' | 'about';
  anchor: string;
  categoryId: number | null;
  bannerId: number | null;
  brandGroup: 'it' | 'stationery' | '';
  titleAr: string;
  titleEn: string;
  subtitleAr: string;
  subtitleEn: string;
  bodyAr: string;
  bodyEn: string;
  icon: string;
  theme: string;
  sort: number;
  active: boolean;
};

export type TextEntry = { ar: string; en: string; section: string; multiline: boolean; sort: number };

export type MediaItem = {
  id: number;
  url: string;
  label: string;
  altAr: string;
  altEn: string;
};

export type OrderItem = {
  id: number;
  orderId: number;
  productId: number | null;
  nameAr: string;
  nameEn: string;
  price: number;
  qty: number;
  lineTotal: number;
};

export type Order = {
  id: number;
  reference: string;
  customerName: string;
  phone: string;
  address: string;
  city: string;
  note: string;
  paymentMethod: string;
  subtotal: number;
  delivery: number;
  total: number;
  status: 'new' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  items?: OrderItem[];
};

export type Quote = {
  id: number;
  reference: string;
  contactName: string;
  company: string;
  phone: string;
  email: string;
  message: string;
  status: string;
  createdAt: string;
};

export type Subscriber = {
  id: number;
  email: string;
  status: string;
  createdAt: string;
};

/** Tout le contenu du site envoyé au navigateur. */
export type SiteContent = {
  settings: Record<string, string | number | boolean | string[]>;
  texts: Record<string, TextEntry>;
  categories: Category[];
  products: Product[];
  banners: Banner[];
  stores: Store[];
  benefits: Benefit[];
  brands: Brand[];
  navLinks: NavLink[];
  sections: Section[];
};
