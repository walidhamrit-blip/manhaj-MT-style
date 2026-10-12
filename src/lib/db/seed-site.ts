/**
 * Contenu initial de la structure du site : catégories, bandeaux, magasins,
 * avantages, marques, liens de navigation et sections de la page d'accueil.
 *
 * Tout est ensuite géré depuis le panneau d'administration.
 */

/* ── Catégories ──────────────────────────────────────────────────── */
export type SeedCategory = {
  slug: string; nameAr: string; nameEn: string; icon: string;
  descriptionAr?: string; descriptionEn?: string; sort: number;
};

export const SEED_CATEGORIES: SeedCategory[] = [
  { slug: 'school', nameAr: 'لوازم مدرسية', nameEn: 'School supplies', icon: 'fa-solid fa-graduation-cap', sort: 10 },
  { slug: 'paper', nameAr: 'دفاتر وورق', nameEn: 'Notebooks & paper', icon: 'fa-solid fa-book-open', sort: 20 },
  { slug: 'office', nameAr: 'أدوات مكتبية', nameEn: 'Office supplies', icon: 'fa-solid fa-briefcase', sort: 30 },
  { slug: 'art', nameAr: 'رسم وفنون', nameEn: 'Art supplies', icon: 'fa-solid fa-palette', sort: 40 },
  { slug: 'bags', nameAr: 'حقائب ومقالم', nameEn: 'Bags & cases', icon: 'fa-solid fa-bag-shopping', sort: 50 },
];

/* ── Bandeaux ────────────────────────────────────────────────────── */
export type SeedBanner = {
  placement: 'hero' | 'offer' | 'promo' | 'sale';
  kickerAr?: string; kickerEn?: string;
  titleAr?: string; titleEn?: string;
  bodyAr?: string; bodyEn?: string;
  priceTextAr?: string; priceTextEn?: string;
  priceValue?: number | null;
  ctaAr?: string; ctaEn?: string;
  ctaKind?: 'category' | 'anchor' | 'query' | 'url';
  ctaTarget?: string;
  icon?: string; imageUrl?: string; theme?: string; sort: number;
};

export const SEED_BANNERS: SeedBanner[] = [
  /* Héros */
  {
    placement: 'hero', sort: 10,
    kickerAr: 'العودة إلى المدرسة', kickerEn: 'BACK TO SCHOOL',
    titleAr: 'كل ما يحتاجه الطالب في مكان واحد', titleEn: 'Everything Students Need In One Place',
    bodyAr: 'دفاتر، أقلام، حقائب وأدوات هندسية مختارة بجودة ممتازة وأسعار مناسبة لكل المراحل.',
    bodyEn: 'Notebooks, pens, bags and geometry tools selected for every school level at excellent prices.',
    priceTextAr: 'ابتداءً من', priceTextEn: 'Starting from', priceValue: 2.5,
    ctaAr: 'تسوق الآن', ctaEn: 'Shop Now', ctaKind: 'category', ctaTarget: 'school',
    icon: 'fa-solid fa-graduation-cap',
    imageUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1500&q=88',
  },
  {
    placement: 'hero', sort: 20,
    kickerAr: 'حلول المكاتب', kickerEn: 'OFFICE SOLUTIONS',
    titleAr: 'مكتب منظم ليوم أكثر إنتاجاً', titleEn: 'An Organised Desk For A Productive Day',
    bodyAr: 'ورق تصوير، ملفات، دباسات وآلات حاسبة للأفراد والشركات مع عروض خاصة للكميات.',
    bodyEn: 'Copy paper, folders, staplers and calculators for individuals and businesses with volume offers.',
    priceTextAr: 'خصم حتى 25%', priceTextEn: 'Save up to 25%',
    ctaAr: 'اكتشف المجموعة', ctaEn: 'Explore Collection', ctaKind: 'category', ctaTarget: 'office',
    icon: 'fa-solid fa-briefcase',
    imageUrl: 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&w=1500&q=88',
  },
  {
    placement: 'hero', sort: 30,
    kickerAr: 'ألوان وإبداع', kickerEn: 'COLOUR & CREATIVITY',
    titleAr: 'أطلق العنان لإبداعك', titleEn: 'Bring Your Ideas To Life',
    bodyAr: 'ألوان خشبية ومائية وأكريليك، دفاتر رسم وفرش لكل طالب وفنان.',
    bodyEn: 'Colour pencils, watercolours, acrylics, sketchbooks and brushes for students and artists.',
    priceTextAr: 'ابتداءً من', priceTextEn: 'Starting from', priceValue: 8,
    ctaAr: 'تسوق أدوات الفن', ctaEn: 'Shop Art Supplies', ctaKind: 'category', ctaTarget: 'art',
    icon: 'fa-solid fa-palette',
    imageUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1500&q=88',
  },

  /* Cartes d'offre (colonne de droite du héros) */
  {
    placement: 'offer', sort: 10,
    kickerAr: 'عرض الأسبوع', kickerEn: 'DEAL OF THE WEEK',
    titleAr: 'حقائب مدرسية متينة', titleEn: 'Durable School Bags',
    priceTextAr: 'خصم 20%', priceTextEn: '20% OFF',
    ctaAr: 'اكتشف', ctaEn: 'DISCOVER', ctaKind: 'category', ctaTarget: 'bags',
    imageUrl: 'https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=800&q=85',
  },
  {
    placement: 'offer', sort: 20,
    kickerAr: 'اختيارات الدراسة', kickerEn: 'STUDY ESSENTIALS',
    titleAr: 'دفاتر وأقلام', titleEn: 'Notebooks & Pens',
    priceTextAr: 'من 2.5 د.ل', priceTextEn: 'From 2.5 LYD',
    ctaAr: 'تسوق', ctaEn: 'SHOP', ctaKind: 'category', ctaTarget: 'paper',
    imageUrl: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=800&q=85',
  },

  /* Promotions (deux cartes côte à côte) */
  {
    placement: 'promo', sort: 10, theme: 'red',
    titleAr: 'بداية مدرسية أفضل', titleEn: 'A Better School Start',
    bodyAr: 'جهّز قائمة المدرسة كاملة بأسعار مناسبة.', bodyEn: 'Complete the full school list at affordable prices.',
    priceTextAr: 'وفر حتى 25%', priceTextEn: 'SAVE UP TO 25%',
    ctaAr: 'تسوق الآن', ctaEn: 'Shop Now', ctaKind: 'category', ctaTarget: 'school',
    imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=85',
  },
  {
    placement: 'promo', sort: 20, theme: '',
    titleAr: 'جهّز مكتبك', titleEn: 'Upgrade Your Office',
    bodyAr: 'حلول يومية ذكية للمكاتب والشركات.', bodyEn: 'Smart everyday solutions for offices and companies.',
    priceTextAr: 'أسعار خاصة للكميات', priceTextEn: 'VOLUME PRICING',
    ctaAr: 'اكتشف المجموعة', ctaEn: 'Explore Range', ctaKind: 'category', ctaTarget: 'office',
    imageUrl: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=900&q=85',
  },

  /* Bandeaux de vente */
  {
    placement: 'sale', sort: 10, theme: 'navy',
    kickerAr: 'حلول العمل والدراسة', kickerEn: 'WORK & STUDY SOLUTIONS',
    titleAr: 'كل شيء في مكانه', titleEn: 'Everything In Its Place',
    bodyAr: 'ملفات، منظمات، دباسات ولوازم أرشفة لمكتب أكثر ترتيباً.',
    bodyEn: 'Files, organisers, staplers and filing supplies for a better workspace.',
    priceTextAr: 'خصم حتى 20%', priceTextEn: 'UP TO 20% OFF',
    ctaAr: 'تسوق أدوات المكتب', ctaEn: 'Shop Office Supplies', ctaKind: 'category', ctaTarget: 'office',
    imageUrl: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=1600&q=88',
  },
  {
    placement: 'sale', sort: 20, theme: 'green',
    kickerAr: 'الرسم والأشغال اليدوية', kickerEn: 'ART & CRAFT',
    titleAr: 'ألوان تصنع الفرق', titleEn: 'Colours That Inspire',
    bodyAr: 'كل ما يحتاجه الفنان الصغير والمحترف للرسم والتلوين والأعمال الإبداعية.',
    bodyEn: 'Everything young and professional artists need for drawing, colouring and creative work.',
    priceTextAr: 'ابتداءً من 6 د.ل', priceTextEn: 'FROM 6 LYD',
    ctaAr: 'تسوق المجموعة', ctaEn: 'Shop Collection', ctaKind: 'category', ctaTarget: 'art',
    imageUrl: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?auto=format&fit=crop&w=1600&q=88',
  },
];

/* ── Magasins ────────────────────────────────────────────────────── */
export type SeedStore = {
  nameAr: string; nameEn: string; phone: string; addressAr: string; addressEn: string;
  hoursAr: string; hoursEn: string; mapQuery: string; imageUrl: string; sort: number;
};

export const SEED_STORES: SeedStore[] = [
  {
    nameAr: 'المنهج قرقارش', nameEn: 'Al Manhaj Gargaresh', phone: '+218 91 234 5678',
    addressAr: 'طريق قرقارش، طرابلس', addressEn: 'Gargaresh Road, Tripoli',
    hoursAr: 'السبت - الخميس: 09:00 - 20:00', hoursEn: 'Sat - Thu: 09:00 - 20:00',
    mapQuery: 'Gargaresh Tripoli Libya', sort: 10,
    imageUrl: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=240&q=80',
  },
  {
    nameAr: 'المنهج جنزور', nameEn: 'Al Manhaj Janzour', phone: '+218 92 345 6789',
    addressAr: 'الطريق الساحلي، جنزور', addressEn: 'Coastal Road, Janzour',
    hoursAr: 'السبت - الخميس: 09:00 - 20:00', hoursEn: 'Sat - Thu: 09:00 - 20:00',
    mapQuery: 'Janzour Tripoli Libya', sort: 20,
    imageUrl: 'https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=240&q=80',
  },
  {
    nameAr: 'المنهج سوق الجمعة', nameEn: 'Al Manhaj Souq Al Jumaa', phone: '+218 91 456 7812',
    addressAr: 'سوق الجمعة، طرابلس', addressEn: 'Souq Al Jumaa, Tripoli',
    hoursAr: 'السبت - الخميس: 08:30 - 19:30', hoursEn: 'Sat - Thu: 08:30 - 19:30',
    mapQuery: 'Souq Al Jumaa Tripoli Libya', sort: 30,
    imageUrl: 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&w=240&q=80',
  },
];

/* ── Avantages ───────────────────────────────────────────────────── */
export type SeedBenefit = {
  placement: 'hero' | 'footer'; icon: string;
  titleAr: string; titleEn: string; subtitleAr?: string; subtitleEn?: string; sort: number;
};

export const SEED_BENEFITS: SeedBenefit[] = [
  { placement: 'hero', icon: 'fa-solid fa-truck-fast', titleAr: 'توصيل سريع', titleEn: 'Fast Delivery', subtitleAr: 'داخل طرابلس وضواحيها', subtitleEn: 'Across Tripoli', sort: 10 },
  { placement: 'hero', icon: 'fa-solid fa-medal', titleAr: 'جودة مضمونة', titleEn: 'Quality Guaranteed', subtitleAr: 'علامات موثوقة وأصلية', subtitleEn: 'Trusted genuine brands', sort: 20 },
  { placement: 'hero', icon: 'fa-solid fa-money-bill-wave', titleAr: 'الدفع عند الاستلام', titleEn: 'Cash On Delivery', subtitleAr: 'دفع آمن وسهل', subtitleEn: 'Safe and easy payment', sort: 30 },
  { placement: 'hero', icon: 'fa-solid fa-boxes-stacked', titleAr: 'أسعار الكميات', titleEn: 'Volume Pricing', subtitleAr: 'للمدارس والشركات', subtitleEn: 'For schools & businesses', sort: 40 },

  { placement: 'footer', icon: 'fa-solid fa-truck', titleAr: 'توصيل سريع', titleEn: 'Fast delivery', sort: 10 },
  { placement: 'footer', icon: 'fa-solid fa-store', titleAr: 'استلام من الفرع', titleEn: 'Store collection', sort: 20 },
  { placement: 'footer', icon: 'fa-solid fa-medal', titleAr: 'جودة مضمونة', titleEn: 'Quality guaranteed', sort: 30 },
  { placement: 'footer', icon: 'fa-solid fa-boxes-stacked', titleAr: 'طلبات الكميات', titleEn: 'Bulk orders', sort: 40 },
  { placement: 'footer', icon: 'fa-solid fa-headset', titleAr: 'خدمة العملاء', titleEn: 'Customer care', sort: 50 },
];

/* ── Marques ─────────────────────────────────────────────────────── */
export const SEED_BRANDS = [
  'FABER-CASTELL', 'BIC', 'STABILO', 'CASIO', 'MAPED', 'PILOT', 'DOUBLE A', 'JANSPORT',
].map((name, i) => ({ name, searchQuery: name.split(' ')[0], sort: (i + 1) * 10 }));

/* ── Liens de navigation ─────────────────────────────────────────── */
export type SeedNavLink = {
  location: 'utility' | 'main' | 'drawer' | 'mega' | 'tiles' | 'footer';
  groupAr?: string; groupEn?: string;
  labelAr: string; labelEn: string;
  kind: 'anchor' | 'category' | 'query' | 'action' | 'url';
  target: string; icon?: string; highlight?: boolean; sort: number;
};

export const SEED_NAV_LINKS: SeedNavLink[] = [
  /* Bandeau utilitaire */
  { location: 'utility', labelAr: 'فروعنا', labelEn: 'Store locator', kind: 'anchor', target: 'stores', icon: 'fa-solid fa-location-dot', sort: 10 },
  { location: 'utility', labelAr: 'تتبع طلبك', labelEn: 'Track order', kind: 'action', target: 'track', icon: 'fa-solid fa-box', sort: 20 },
  { location: 'utility', labelAr: 'توريد المدارس والشركات', labelEn: 'School & business supply', kind: 'anchor', target: 'business', icon: 'fa-solid fa-building', sort: 30 },
  { location: 'utility', labelAr: 'عن المنهج', labelEn: 'About Al Manhaj', kind: 'anchor', target: 'about', icon: 'fa-solid fa-circle-info', sort: 40 },

  /* Menu principal */
  { location: 'main', labelAr: 'الرئيسية', labelEn: 'Home', kind: 'anchor', target: 'top', sort: 10 },
  { location: 'main', labelAr: 'لوازم مدرسية', labelEn: 'School', kind: 'anchor', target: 'school', sort: 20 },
  { location: 'main', labelAr: 'المكتب', labelEn: 'Office', kind: 'anchor', target: 'office', sort: 30 },
  { location: 'main', labelAr: 'الرسم والفنون', labelEn: 'Art', kind: 'anchor', target: 'art', sort: 40 },
  { location: 'main', labelAr: 'الحقائب', labelEn: 'Bags', kind: 'anchor', target: 'bags', sort: 50 },
  { location: 'main', labelAr: 'فروعنا', labelEn: 'Stores', kind: 'anchor', target: 'stores', sort: 60 },
  { location: 'main', labelAr: 'عروض اليوم', labelEn: "TODAY'S DEALS", kind: 'anchor', target: 'deals', highlight: true, sort: 70 },

  /* Menu latéral (mobile) */
  { location: 'drawer', labelAr: 'الرئيسية', labelEn: 'Home', kind: 'anchor', target: 'top', icon: 'fa-solid fa-house', sort: 10 },
  { location: 'drawer', labelAr: 'اللوازم المدرسية', labelEn: 'School Supplies', kind: 'category', target: 'school', icon: 'fa-solid fa-graduation-cap', sort: 20 },
  { location: 'drawer', labelAr: 'الدفاتر والورق', labelEn: 'Notebooks & Paper', kind: 'category', target: 'paper', icon: 'fa-solid fa-book-open', sort: 30 },
  { location: 'drawer', labelAr: 'الأدوات المكتبية', labelEn: 'Office Supplies', kind: 'category', target: 'office', icon: 'fa-solid fa-briefcase', sort: 40 },
  { location: 'drawer', labelAr: 'الفنون والرسم', labelEn: 'Art Supplies', kind: 'category', target: 'art', icon: 'fa-solid fa-palette', sort: 50 },
  { location: 'drawer', labelAr: 'الحقائب والمقالم', labelEn: 'Bags & Cases', kind: 'category', target: 'bags', icon: 'fa-solid fa-bag-shopping', sort: 60 },
  { location: 'drawer', labelAr: 'فروعنا في طرابلس', labelEn: 'Tripoli Stores', kind: 'anchor', target: 'stores', icon: 'fa-solid fa-location-dot', sort: 70 },
  { location: 'drawer', labelAr: 'English', labelEn: 'العربية', kind: 'action', target: 'language', icon: 'fa-solid fa-globe', sort: 80 },

  /* Mégamenu — colonne 1 */
  { location: 'mega', groupAr: 'الكتابة والتصحيح', groupEn: 'Writing & Correction', labelAr: 'أقلام جاف وحبر', labelEn: 'Ballpoint & ink pens', kind: 'query', target: 'قلم|pen', sort: 10 },
  { location: 'mega', groupAr: 'الكتابة والتصحيح', groupEn: 'Writing & Correction', labelAr: 'أقلام رصاص', labelEn: 'Pencils', kind: 'query', target: 'pencil', sort: 20 },
  { location: 'mega', groupAr: 'الكتابة والتصحيح', groupEn: 'Writing & Correction', labelAr: 'أقلام تحديد', labelEn: 'Markers & highlighters', kind: 'query', target: 'marker', sort: 30 },
  { location: 'mega', groupAr: 'الكتابة والتصحيح', groupEn: 'Writing & Correction', labelAr: 'ممحاة وتصحيح', labelEn: 'Erasers & correction', kind: 'query', target: 'correction', sort: 40 },

  /* Mégamenu — colonne 2 */
  { location: 'mega', groupAr: 'الورق والدفاتر', groupEn: 'Paper & Notebooks', labelAr: 'دفاتر مدرسية', labelEn: 'School notebooks', kind: 'category', target: 'paper', sort: 50 },
  { location: 'mega', groupAr: 'الورق والدفاتر', groupEn: 'Paper & Notebooks', labelAr: 'ورق تصوير', labelEn: 'Copy paper', kind: 'query', target: 'copy', sort: 60 },
  { location: 'mega', groupAr: 'الورق والدفاتر', groupEn: 'Paper & Notebooks', labelAr: 'ملاحظات لاصقة', labelEn: 'Sticky notes', kind: 'query', target: 'sticky', sort: 70 },
  { location: 'mega', groupAr: 'الورق والدفاتر', groupEn: 'Paper & Notebooks', labelAr: 'ملفات وحافظات', labelEn: 'Files & folders', kind: 'query', target: 'folder', sort: 80 },

  /* Mégamenu — colonne 3 */
  { location: 'mega', groupAr: 'المدرسة', groupEn: 'School Essentials', labelAr: 'حقائب مدرسية', labelEn: 'School bags', kind: 'category', target: 'bags', sort: 90 },
  { location: 'mega', groupAr: 'المدرسة', groupEn: 'School Essentials', labelAr: 'مقالم', labelEn: 'Pencil cases', kind: 'query', target: 'case', sort: 100 },
  { location: 'mega', groupAr: 'المدرسة', groupEn: 'School Essentials', labelAr: 'أدوات هندسية', labelEn: 'Geometry sets', kind: 'query', target: 'geometry', sort: 110 },
  { location: 'mega', groupAr: 'المدرسة', groupEn: 'School Essentials', labelAr: 'علب طعام', labelEn: 'Lunch boxes', kind: 'query', target: 'lunch', sort: 120 },

  /* Mégamenu — colonne 4 */
  { location: 'mega', groupAr: 'الفنون والمكتب', groupEn: 'Art & Office', labelAr: 'ألوان ورسم', labelEn: 'Colours & drawing', kind: 'category', target: 'art', sort: 130 },
  { location: 'mega', groupAr: 'الفنون والمكتب', groupEn: 'Art & Office', labelAr: 'أدوات مكتبية', labelEn: 'Office supplies', kind: 'category', target: 'office', sort: 140 },
  { location: 'mega', groupAr: 'الفنون والمكتب', groupEn: 'Art & Office', labelAr: 'آلات حاسبة', labelEn: 'Calculators', kind: 'query', target: 'calculator', sort: 150 },
  { location: 'mega', groupAr: 'الفنون والمكتب', groupEn: 'Art & Office', labelAr: 'أحبار طابعات', labelEn: 'Printer supplies', kind: 'query', target: 'printer', sort: 160 },

  /* Tuiles « Acheter par rayon » */
  { location: 'tiles', labelAr: 'أقلام وكتابة', labelEn: 'Pens & Writing', kind: 'category', target: 'school', icon: 'fa-solid fa-pen', sort: 10 },
  { location: 'tiles', labelAr: 'دفاتر وورق', labelEn: 'Notebooks & Paper', kind: 'category', target: 'paper', icon: 'fa-solid fa-book-open', sort: 20 },
  { location: 'tiles', labelAr: 'حقائب ومقالم', labelEn: 'Bags & Cases', kind: 'category', target: 'bags', icon: 'fa-solid fa-bag-shopping', sort: 30 },
  { location: 'tiles', labelAr: 'ألوان وفنون', labelEn: 'Art & Colours', kind: 'category', target: 'art', icon: 'fa-solid fa-palette', sort: 40 },
  { location: 'tiles', labelAr: 'أدوات مكتبية', labelEn: 'Office Supplies', kind: 'category', target: 'office', icon: 'fa-solid fa-briefcase', sort: 50 },
  { location: 'tiles', labelAr: 'هندسة وقياس', labelEn: 'Geometry & Measure', kind: 'query', target: 'geometry', icon: 'fa-solid fa-compass-drafting', sort: 60 },
  { location: 'tiles', labelAr: 'آلات حاسبة', labelEn: 'Calculators', kind: 'query', target: 'calculator', icon: 'fa-solid fa-calculator', sort: 70 },
  { location: 'tiles', labelAr: 'وسائل تعليمية', labelEn: 'Educational Aids', kind: 'query', target: 'educational', icon: 'fa-solid fa-puzzle-piece', sort: 80 },

  /* Pied de page — colonne « Acheter » */
  { location: 'footer', groupAr: 'تسوق', groupEn: 'SHOP', labelAr: 'اللوازم المدرسية', labelEn: 'School supplies', kind: 'anchor', target: 'school', sort: 10 },
  { location: 'footer', groupAr: 'تسوق', groupEn: 'SHOP', labelAr: 'الدفاتر والورق', labelEn: 'Notebooks & paper', kind: 'anchor', target: 'paper', sort: 20 },
  { location: 'footer', groupAr: 'تسوق', groupEn: 'SHOP', labelAr: 'الأدوات المكتبية', labelEn: 'Office supplies', kind: 'anchor', target: 'office', sort: 30 },
  { location: 'footer', groupAr: 'تسوق', groupEn: 'SHOP', labelAr: 'الرسم والفنون', labelEn: 'Art supplies', kind: 'anchor', target: 'art', sort: 40 },
  { location: 'footer', groupAr: 'تسوق', groupEn: 'SHOP', labelAr: 'الحقائب والمقالم', labelEn: 'Bags & cases', kind: 'anchor', target: 'bags', sort: 50 },

  /* Pied de page — colonne « Service client » */
  { location: 'footer', groupAr: 'خدمة العملاء', groupEn: 'CUSTOMER SERVICE', labelAr: 'فروعنا', labelEn: 'Our stores', kind: 'anchor', target: 'stores', sort: 60 },
  { location: 'footer', groupAr: 'خدمة العملاء', groupEn: 'CUSTOMER SERVICE', labelAr: 'التوصيل والاستلام', labelEn: 'Delivery & collection', kind: 'anchor', target: 'stores', sort: 70 },
  { location: 'footer', groupAr: 'خدمة العملاء', groupEn: 'CUSTOMER SERVICE', labelAr: 'الاستبدال والاسترجاع', labelEn: 'Returns & exchanges', kind: 'anchor', target: 'about', sort: 80 },
  { location: 'footer', groupAr: 'خدمة العملاء', groupEn: 'CUSTOMER SERVICE', labelAr: 'الأسئلة الشائعة', labelEn: 'FAQs', kind: 'anchor', target: 'about', sort: 90 },
  { location: 'footer', groupAr: 'خدمة العملاء', groupEn: 'CUSTOMER SERVICE', labelAr: 'حسابات الشركات', labelEn: 'Business accounts', kind: 'anchor', target: 'business', sort: 100 },
];

/* ── Sections de la page d'accueil ───────────────────────────────── */
export type SeedSection = {
  key: string;
  type: 'hero' | 'categories' | 'products' | 'deals' | 'promos' | 'sale' | 'brands' | 'service' | 'stores' | 'about';
  anchor?: string;
  categorySlug?: string;
  /** Référence au n-ième bandeau d'un emplacement donné (bandeaux de vente). */
  bannerRef?: { placement: string; index: number };
  titleAr?: string; titleEn?: string;
  subtitleAr?: string; subtitleEn?: string;
  bodyAr?: string; bodyEn?: string;
  icon?: string; theme?: string; sort: number;
};

export const SEED_SECTIONS: SeedSection[] = [
  { key: 'hero', type: 'hero', sort: 10 },

  {
    key: 'categories', type: 'categories', anchor: 'categories', sort: 20,
    titleAr: 'تسوق حسب القسم', titleEn: 'Shop By Department',
    subtitleAr: 'كل مستلزمات المدرسة والمكتب والفنون', subtitleEn: 'Everything for school, office and creativity',
  },

  {
    key: 'school', type: 'products', anchor: 'school', categorySlug: 'school', theme: 'red', sort: 30,
    titleAr: 'اختيارات العودة إلى المدرسة', titleEn: 'Back To School Selection',
  },

  { key: 'promos', type: 'promos', sort: 40 },

  {
    key: 'paper', type: 'products', anchor: 'paper', categorySlug: 'paper', theme: 'cyan', sort: 50,
    titleAr: 'الدفاتر والورق الأكثر طلباً', titleEn: 'Popular Notebooks & Paper',
  },

  { key: 'sale-office', type: 'sale', bannerRef: { placement: 'sale', index: 0 }, sort: 60 },

  {
    key: 'office', type: 'products', anchor: 'office', categorySlug: 'office', theme: 'orange', sort: 70,
    titleAr: 'أدوات المكتب والتنظيم', titleEn: 'Office & Organisation',
  },

  { key: 'sale-art', type: 'sale', anchor: 'art', bannerRef: { placement: 'sale', index: 1 }, sort: 80 },

  {
    key: 'art', type: 'products', categorySlug: 'art', sort: 90,
    titleAr: 'أدوات الرسم والفنون', titleEn: 'Art & Creative Supplies',
  },

  {
    key: 'bags', type: 'products', anchor: 'bags', categorySlug: 'bags', sort: 100,
    titleAr: 'الحقائب والمقالم', titleEn: 'School Bags & Pencil Cases',
  },

  {
    key: 'deals', type: 'deals', anchor: 'deals', sort: 110,
    titleAr: 'أفضل العروض', titleEn: 'Best Deals',
    subtitleAr: 'أسعار مختارة لفترة محدودة', subtitleEn: 'Selected prices for a limited time',
  },

  {
    key: 'brands', type: 'brands', sort: 120,
    titleAr: 'أفضل العلامات التجارية', titleEn: 'Top Brands',
  },

  { key: 'service', type: 'service', anchor: 'business', sort: 130 },

  {
    key: 'stores', type: 'stores', anchor: 'stores', sort: 140,
    titleAr: 'فروعنا في طرابلس', titleEn: 'Our Tripoli Stores',
    subtitleAr: 'تسوق أو استلم طلبك من أقرب فرع', subtitleEn: 'Shop or collect your order from the nearest branch',
  },

  {
    key: 'about', type: 'about', anchor: 'about', sort: 150,
    bodyAr: 'شركة المنهج للقرطاسية هي وجهتك المتخصصة لشراء القرطاسية واللوازم المدرسية والمكتبية وأدوات الرسم في طرابلس. نوفر تشكيلة موثوقة من العلامات العالمية، وأسعاراً تنافسية، وتوصيلاً سريعاً وخدمات توريد للمدارس والشركات.',
    bodyEn: 'Al Manhaj Stationery is your specialist destination for stationery, school and office supplies, and art materials in Tripoli. We offer trusted international brands, competitive pricing, fast delivery and supply services for schools and businesses.',
    subtitleAr: 'مهمتنا: توفير كل ما تحتاجه للتعلم والعمل والإبداع، بجودة وخدمة يمكنك الاعتماد عليهما.',
    subtitleEn: 'Our mission: everything you need to learn, work and create, backed by quality and service you can trust.',
  },
];

/** Bibliothèque d'images initiale (les visuels du site d'origine). */
export const SEED_MEDIA: { url: string; label: string }[] = [
  { url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1500&q=88', label: 'Bannière héros — école' },
  { url: 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&w=1500&q=88', label: 'Bannière héros — bureau' },
  { url: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1500&q=88', label: 'Bannière héros — arts' },
  { url: 'https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=800&q=85', label: 'Carte offre — cartables' },
  { url: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=800&q=85', label: 'Carte offre — papeterie' },
  { url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=85', label: 'Promo — rentrée scolaire' },
  { url: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=900&q=85', label: 'Promo — bureau' },
  { url: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=1600&q=88', label: 'Bandeau vente — classement' },
  { url: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?auto=format&fit=crop&w=1600&q=88', label: 'Bandeau vente — couleurs' },
];
