/**
 * Dictionnaire des textes de l'interface (arabe / anglais) et réglages du site.
 *
 * Ce fichier contient les valeurs *initiales* : après la première installation,
 * tout est modifiable depuis le panneau d'administration (Textes & Réglages).
 */

export type SeedText = {
  key: string;
  ar: string;
  en: string;
  section: string;
  multiline?: boolean;
};

/** Regroupement des textes dans l'administration : clé → [libellé FR, libellé AR]. */
export const TEXT_SECTIONS: Record<string, [string, string]> = {
  topbar: ['Bandeau supérieur', 'الشريط العلوي'],
  header: ['En-tête', 'الترويسة'],
  catalog: ['Catalogue & recherche', 'الكتالوج والبحث'],
  cart: ['Panier', 'السلة'],
  checkout: ['Commande', 'إتمام الطلب'],
  account: ['Compte client', 'حساب العميل'],
  wishlist: ['Favoris', 'المفضلة'],
  track: ['Suivi de commande', 'تتبع الطلب'],
  service: ['Devis & fournitures', 'عروض الأسعار والتوريد'],
  footer: ['Pied de page', 'التذييل'],
  common: ['Divers', 'عام'],
};

export const SEED_TEXTS: SeedText[] = [
  /* ── Bandeau supérieur ─────────────────────────────────────────── */
  { key: 'topbar.delivery', section: 'topbar', ar: 'توصيل مجاني داخل طرابلس للطلبات فوق', en: 'Free delivery in Tripoli on orders over' },

  /* ── En-tête ────────────────────────────────────────────────────── */
  { key: 'header.brand_sub', section: 'header', ar: 'شركة المنهج للقرطاسية', en: 'STATIONERY & SCHOOL SUPPLIES' },
  { key: 'header.search_all', section: 'header', ar: 'كل الأقسام', en: 'All categories' },
  { key: 'header.search_placeholder', section: 'header', ar: 'ابحث عن دفتر، قلم، حقيبة مدرسية...', en: 'Search notebooks, pens, school bags...' },
  { key: 'header.account', section: 'header', ar: 'حسابي', en: 'Account' },
  { key: 'header.wishlist', section: 'header', ar: 'المفضلة', en: 'Wishlist' },
  { key: 'header.cart', section: 'header', ar: 'السلة', en: 'Cart' },
  { key: 'header.all_departments', section: 'header', ar: 'جميع الأقسام', en: 'ALL DEPARTMENTS' },
  { key: 'header.language', section: 'header', ar: 'English', en: 'العربية' },

  /* ── Catalogue & recherche ─────────────────────────────────────── */
  { key: 'catalog.search_results', section: 'catalog', ar: 'نتائج البحث', en: 'Search Results' },
  { key: 'catalog.no_results', section: 'catalog', ar: 'لا توجد نتائج مطابقة', en: 'No matching results' },
  { key: 'catalog.in_stock', section: 'catalog', ar: 'متوفر', en: 'IN STOCK' },
  { key: 'catalog.out_of_stock', section: 'catalog', ar: 'غير متوفر', en: 'OUT OF STOCK' },
  { key: 'catalog.quick_view', section: 'catalog', ar: 'عرض سريع', en: 'QUICK VIEW' },
  { key: 'catalog.add_to_cart', section: 'catalog', ar: 'أضف للسلة', en: 'ADD TO CART' },
  { key: 'catalog.view_all', section: 'catalog', ar: 'عرض الكل', en: 'VIEW ALL' },
  { key: 'catalog.view_more', section: 'catalog', ar: 'عرض المزيد', en: 'VIEW MORE' },
  { key: 'catalog.from', section: 'catalog', ar: 'ابتداءً من', en: 'Starting from' },
  { key: 'catalog.details_title', section: 'catalog', ar: 'تفاصيل المنتج', en: 'Product Details' },
  {
    key: 'catalog.details_body',
    section: 'catalog',
    multiline: true,
    ar: 'منتج أصلي عالي الجودة، مناسب للاستخدام المدرسي والمكتبي اليومي. متوفر الآن مع خدمة التوصيل داخل طرابلس.',
    en: 'A genuine, high-quality product ideal for everyday school and office use. Available now with delivery across Tripoli.',
  },

  /* ── Panier ────────────────────────────────────────────────────── */
  { key: 'cart.title', section: 'cart', ar: 'سلة التسوق', en: 'Shopping Cart' },
  { key: 'cart.empty_title', section: 'cart', ar: 'سلتك فارغة', en: 'Your cart is empty' },
  { key: 'cart.empty_hint', section: 'cart', ar: 'ابدأ بإضافة لوازمك المفضلة', en: 'Start adding your favourite supplies' },
  { key: 'cart.total', section: 'cart', ar: 'الإجمالي', en: 'Total' },
  { key: 'cart.subtotal', section: 'cart', ar: 'المجموع الفرعي', en: 'Subtotal' },
  { key: 'cart.delivery', section: 'cart', ar: 'التوصيل', en: 'Delivery' },
  { key: 'cart.free', section: 'cart', ar: 'مجاني', en: 'Free' },
  { key: 'cart.checkout', section: 'cart', ar: 'إتمام الطلب', en: 'CHECKOUT' },
  { key: 'cart.added', section: 'cart', ar: 'تمت إضافة المنتج إلى السلة', en: 'Product added to cart' },
  { key: 'cart.empty_toast', section: 'cart', ar: 'السلة فارغة', en: 'Your cart is empty' },

  /* ── Commande ──────────────────────────────────────────────────── */
  { key: 'checkout.title', section: 'checkout', ar: 'إتمام الطلب', en: 'Checkout' },
  { key: 'checkout.name', section: 'checkout', ar: 'الاسم الكامل', en: 'Full name' },
  { key: 'checkout.phone', section: 'checkout', ar: 'رقم الهاتف', en: 'Phone number' },
  { key: 'checkout.address', section: 'checkout', ar: 'عنوان التوصيل', en: 'Delivery address' },
  { key: 'checkout.city', section: 'checkout', ar: 'المدينة', en: 'City' },
  { key: 'checkout.city_default', section: 'checkout', ar: 'طرابلس', en: 'Tripoli' },
  { key: 'checkout.note', section: 'checkout', ar: 'ملاحظات إضافية (اختياري)', en: 'Extra notes (optional)' },
  { key: 'checkout.payment', section: 'checkout', ar: 'طريقة الدفع', en: 'Payment method' },
  { key: 'checkout.cod', section: 'checkout', ar: 'الدفع عند الاستلام', en: 'Cash on delivery' },
  { key: 'checkout.card', section: 'checkout', ar: 'بطاقة مصرفية', en: 'Bank card' },
  { key: 'checkout.submit', section: 'checkout', ar: 'تأكيد الطلب', en: 'CONFIRM ORDER' },
  { key: 'checkout.success_title', section: 'checkout', ar: 'تم استلام طلبك بنجاح', en: 'Order received successfully' },
  { key: 'checkout.success_body', section: 'checkout', ar: 'سنتواصل معك قريباً لتأكيد التوصيل.', en: 'We will contact you shortly to confirm delivery.' },
  { key: 'checkout.failed', section: 'checkout', ar: 'تعذّر إرسال الطلب، حاول مرة أخرى.', en: 'Could not send the order, please try again.' },

  /* ── Compte client ─────────────────────────────────────────────── */
  { key: 'account.title', section: 'account', ar: 'تسجيل الدخول', en: 'Account Login' },
  { key: 'account.identifier', section: 'account', ar: 'البريد الإلكتروني أو رقم الهاتف', en: 'Email or phone number' },
  { key: 'account.password', section: 'account', ar: 'كلمة المرور', en: 'Password' },
  { key: 'account.submit', section: 'account', ar: 'تسجيل الدخول', en: 'SIGN IN' },
  { key: 'account.success', section: 'account', ar: 'تم تسجيل الدخول بنجاح', en: 'Signed in successfully' },

  /* ── Favoris ───────────────────────────────────────────────────── */
  { key: 'wishlist.title', section: 'wishlist', ar: 'قائمة المفضلة', en: 'Wishlist' },
  { key: 'wishlist.empty', section: 'wishlist', ar: 'لا توجد منتجات مفضلة بعد', en: 'No favourite products yet' },
  { key: 'wishlist.updated', section: 'wishlist', ar: 'تم تحديث المفضلة', en: 'Wishlist updated' },
  { key: 'compare.updated', section: 'wishlist', ar: 'تم تحديث قائمة المقارنة', en: 'Comparison list updated' },

  /* ── Suivi de commande ─────────────────────────────────────────── */
  { key: 'track.title', section: 'track', ar: 'تتبع طلبك', en: 'Track Your Order' },
  { key: 'track.number', section: 'track', ar: 'رقم الطلب', en: 'Order number' },
  { key: 'track.submit', section: 'track', ar: 'تتبع الطلب', en: 'TRACK ORDER' },
  { key: 'track.found', section: 'track', ar: 'حالة طلبك', en: 'Your order status' },
  { key: 'track.not_found', section: 'track', ar: 'لم نجد طلباً بهذا الرقم', en: 'No order found with this number' },
  { key: 'track.status_new', section: 'track', ar: 'جديد', en: 'New' },
  { key: 'track.status_confirmed', section: 'track', ar: 'مؤكد', en: 'Confirmed' },
  { key: 'track.status_shipped', section: 'track', ar: 'في الطريق', en: 'On the way' },
  { key: 'track.status_delivered', section: 'track', ar: 'تم التوصيل', en: 'Delivered' },
  { key: 'track.status_cancelled', section: 'track', ar: 'ملغى', en: 'Cancelled' },

  /* ── Devis & fournitures ───────────────────────────────────────── */
  { key: 'service.title', section: 'service', ar: 'توريد المدارس والشركات', en: 'School & Business Supply' },
  {
    key: 'service.body',
    section: 'service',
    multiline: true,
    ar: 'قوائم مدرسية، قرطاسية مكتبية وأسعار خاصة للطلبات الكبيرة.',
    en: 'School lists, office stationery and special pricing for bulk orders.',
  },
  { key: 'quote.title', section: 'service', ar: 'تحتاج عرض سعر؟', en: 'Need A Quote?' },
  { key: 'quote.body', section: 'service', ar: 'أرسل قائمتك وسنجهز لك أفضل عرض.', en: 'Send your list and we will prepare our best offer.' },
  { key: 'quote.button', section: 'service', ar: 'اطلب عرضاً', en: 'Request Quote' },
  { key: 'quote.form_title', section: 'service', ar: 'طلب عرض سعر', en: 'Request a Quote' },
  { key: 'quote.form_name', section: 'service', ar: 'الاسم', en: 'Your name' },
  { key: 'quote.form_company', section: 'service', ar: 'الشركة أو المدرسة', en: 'Company or school' },
  { key: 'quote.form_phone', section: 'service', ar: 'رقم الهاتف', en: 'Phone number' },
  { key: 'quote.form_email', section: 'service', ar: 'البريد الإلكتروني', en: 'Email address' },
  { key: 'quote.form_message', section: 'service', ar: 'تفاصيل الطلب / قائمة المستلزمات', en: 'Order details / list of supplies' },
  { key: 'quote.form_submit', section: 'service', ar: 'إرسال الطلب', en: 'SEND REQUEST' },
  { key: 'quote.thanks', section: 'service', ar: 'شكراً! وصلنا طلبك وسنتواصل معك قريباً.', en: 'Thank you! We received your request and will contact you soon.' },
  { key: 'quote.whatsapp', section: 'service', ar: 'مرحباً، أريد طلب عرض سعر للقرطاسية', en: 'Hello, I would like a stationery quotation' },

  /* ── Pied de page ──────────────────────────────────────────────── */
  { key: 'footer.contact_title', section: 'footer', ar: 'تواصل معنا', en: 'CONTACT US' },
  { key: 'footer.newsletter_title', section: 'footer', ar: 'اشترك في عروضنا', en: 'JOIN OUR NEWSLETTER' },
  {
    key: 'footer.newsletter_body',
    section: 'footer',
    multiline: true,
    ar: 'احصل على أحدث العروض، المنتجات الجديدة وقوائم العودة إلى المدرسة.',
    en: 'Get our latest offers, new products and back-to-school lists.',
  },
  { key: 'footer.email_placeholder', section: 'footer', ar: 'بريدك الإلكتروني', en: 'Your email address' },
  { key: 'footer.subscribe', section: 'footer', ar: 'اشتراك', en: 'SUBSCRIBE' },
  { key: 'footer.subscribed', section: 'footer', ar: 'شكراً لاشتراكك في عروضنا', en: 'Thank you for subscribing' },
  { key: 'footer.subscribe_error', section: 'footer', ar: 'تعذّر تسجيل بريدك، حاول لاحقاً', en: 'Could not save your email, please try again' },
  { key: 'footer.copyright', section: 'footer', ar: 'شركة المنهج للقرطاسية. جميع الحقوق محفوظة.', en: 'Al Manhaj Stationery. All rights reserved.' },

  /* ── Divers ────────────────────────────────────────────────────── */
  { key: 'common.map', section: 'common', ar: 'فتح الخريطة', en: 'OPEN MAP' },
  { key: 'common.shop_now', section: 'common', ar: 'تسوق الآن', en: 'Shop Now' },
  { key: 'common.discover', section: 'common', ar: 'اكتشف', en: 'DISCOVER' },
  { key: 'common.loading', section: 'common', ar: 'جارٍ التحميل...', en: 'Loading...' },
];

/* ────────────────────────────────────────────────────────────────────
 *  Réglages
 * ──────────────────────────────────────────────────────────────────── */

export type SettingType = 'text' | 'textarea' | 'number' | 'boolean' | 'list' | 'select';

export type SettingDef = {
  key: string;
  /** [libellé FR, libellé AR] */
  label: [string, string];
  group: string;
  type: SettingType;
  default: string | number | boolean | string[];
  options?: string[];
  internal?: boolean;
  hint?: [string, string];
};

export const SETTING_GROUPS: Record<string, [string, string]> = {
  identity: ['Identité du site', 'هوية الموقع'],
  contact: ['Coordonnées', 'بيانات الاتصال'],
  social: ['Réseaux sociaux', 'شبكات التواصل'],
  shop: ['Réglages boutique', 'إعدادات المتجر'],
  system: ['Système', 'النظام'],
};

export const SETTINGS_DEFS: SettingDef[] = [
  /* Identité */
  { key: 'brand.latin', group: 'identity', type: 'text', default: 'AL MANHAJ', label: ['Nom affiché dans le logo (latin)', 'الاسم الظاهر في الشعار'] },
  { key: 'seo.title_ar', group: 'identity', type: 'text', default: 'شركة المنهج للقرطاسية | Al Manhaj Stationery', label: ['Titre SEO (AR)', 'عنوان محرك البحث (عربي)'] },
  { key: 'seo.title_en', group: 'identity', type: 'text', default: 'Al Manhaj Stationery | شركة المنهج للقرطاسية', label: ['Titre SEO (EN)', 'عنوان محرك البحث (إنجليزي)'] },
  {
    key: 'seo.description_ar', group: 'identity', type: 'textarea',
    default: 'شركة المنهج للقرطاسية — قرطاسية، لوازم مدرسية، أدوات مكتبية وفنية في طرابلس، ليبيا.',
    label: ['Description SEO (AR)', 'وصف محرك البحث (عربي)'],
  },
  {
    key: 'seo.description_en', group: 'identity', type: 'textarea',
    default: 'Al Manhaj Stationery — stationery, school supplies, office and art materials in Tripoli, Libya.',
    label: ['Description SEO (EN)', 'وصف محرك البحث (إنجليزي)'],
  },
  { key: 'ui.default_language', group: 'identity', type: 'select', options: ['ar', 'en'], default: 'ar', label: ['Langue par défaut', 'اللغة الافتراضية'] },
  { key: 'ui.countdown', group: 'identity', type: 'boolean', default: true, label: ['Afficher le compte à rebours du jour', 'إظهار العد التنازلي اليومي'] },

  /* Coordonnées */
  { key: 'contact.phone', group: 'contact', type: 'text', default: '+218 91 234 5678', label: ['Téléphone principal', 'الهاتف الرئيسي'] },
  { key: 'contact.phone_alt', group: 'contact', type: 'text', default: '+218 92 345 6789', label: ['Téléphone secondaire', 'هاتف إضافي'] },
  { key: 'contact.email', group: 'contact', type: 'text', default: 'sales@almanhaj.ly', label: ['E-mail', 'البريد الإلكتروني'] },
  { key: 'contact.whatsapp', group: 'contact', type: 'text', default: '218912345678', label: ['Numéro WhatsApp (format international)', 'رقم واتساب'] },
  { key: 'contact.address_ar', group: 'contact', type: 'text', default: 'طرابلس، ليبيا', label: ['Adresse (AR)', 'العنوان (عربي)'] },
  { key: 'contact.address_en', group: 'contact', type: 'text', default: 'Tripoli, Libya', label: ['Adresse (EN)', 'العنوان (إنجليزي)'] },
  { key: 'contact.hours_ar', group: 'contact', type: 'text', default: 'السبت - الخميس، 09:00 - 20:00', label: ['Horaires (AR)', 'ساعات العمل (عربي)'] },
  { key: 'contact.hours_en', group: 'contact', type: 'text', default: 'Sat - Thu, 09:00 - 20:00', label: ['Horaires (EN)', 'ساعات العمل (إنجليزي)'] },

  /* Réseaux sociaux */
  { key: 'social.facebook', group: 'social', type: 'text', default: '#', label: ['Facebook', 'فيسبوك'] },
  { key: 'social.instagram', group: 'social', type: 'text', default: '#', label: ['Instagram', 'إنستغرام'] },
  { key: 'social.youtube', group: 'social', type: 'text', default: '#', label: ['YouTube', 'يوتيوب'] },
  { key: 'social.whatsapp', group: 'social', type: 'text', default: 'https://wa.me/218912345678', label: ['WhatsApp', 'واتساب'] },

  /* Boutique */
  {
    key: 'shop.currency_ar', group: 'shop', type: 'text', default: 'د.ل',
    label: ['Devise (AR)', 'العملة (عربي)'],
    hint: ['Affichée avec les prix en arabe', 'تظهر مع الأسعار بالعربية'],
  },
  { key: 'shop.currency_en', group: 'shop', type: 'text', default: 'LYD', label: ['Devise (EN)', 'العملة (إنجليزي)'] },
  {
    key: 'shop.free_delivery_threshold', group: 'shop', type: 'number', default: 150,
    label: ['Livraison gratuite à partir de', 'التوصيل المجاني ابتداءً من'],
    hint: ['Montant en dinars, utilisé dans le bandeau supérieur', 'المبلغ بالدينار، يظهر في الشريط العلوي'],
  },
  { key: 'shop.delivery_fee', group: 'shop', type: 'number', default: 0, label: ['Frais de livraison', 'رسوم التوصيل'] },
  {
    key: 'shop.deals_min_discount', group: 'shop', type: 'number', default: 5,
    label: ['Remise minimale (section « Meilleures offres »)', 'أقل خصم لقسم أفضل العروض'],
    hint: ['Les produits dont la remise atteint ce montant apparaissent dans la section offres', 'المنتجات التي يبلغ خصمها هذا المبلغ تظهر في قسم العروض'],
  },
  { key: 'shop.deals_limit', group: 'shop', type: 'number', default: 10, label: ['Nombre de produits dans la section offres', 'عدد المنتجات في قسم العروض'] },
  { key: 'shop.products_per_section', group: 'shop', type: 'number', default: 10, label: ['Produits affichés par rayon', 'عدد المنتجات في كل قسم'] },
  { key: 'shop.payments', group: 'shop', type: 'list', default: ['CASH', 'VISA', 'MASTERCARD', 'LYPAY'], label: ['Moyens de paiement affichés', 'وسائل الدفع المعروضة'] },

  /* Système (non modifiable depuis l'interface) */
  { key: 'app.seeded', group: 'system', type: 'text', default: '', label: ['Installation effectuée', 'تم التثبيت'], internal: true },
  { key: 'app.seeded_at', group: 'system', type: 'text', default: '', label: ['Date d’installation', 'تاريخ التثبيت'], internal: true },
];

export const SETTINGS_DEFAULTS: Record<string, string | number | boolean | string[]> = Object.fromEntries(
  SETTINGS_DEFS.map((d) => [d.key, d.default]),
);
