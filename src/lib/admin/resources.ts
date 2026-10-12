/**
 * Déclaration des ressources administrables.
 *
 * Chaque ressource décrit une table de la base et les champs éditables :
 * le panneau d'administration (listes, formulaires, API) est généré à partir
 * de cette description, ce qui garantit que *tout* élément du site est
 * modifiable sans écrire de code à chaque fois.
 */

import { TEXT_SECTIONS } from '../db/seed-texts';

export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'boolean'
  | 'select'
  | 'bilingual-text'
  | 'bilingual-textarea'
  | 'image'
  | 'reference'
  | 'text-ar'
  | 'text-en';

export type FieldOption = { value: string; label: [string, string] };

export type FieldDef = {
  /** Nom de la colonne (sans suffixe _ar/_en pour les champs bilingues). */
  name: string;
  label: [string, string];
  type: FieldType;
  required?: boolean;
  options?: FieldOption[];
  reference?: { resource: string; labelField: string; labelFieldEn?: string };
  hint?: [string, string];
  /** Valeur par défaut ; un couple [arabe, anglais] pour les champs bilingues. */
  default?: string | number | boolean | null | [string, string];
  showInList?: boolean;
  group?: [string, string];
  wide?: boolean;
};

export type ResourceFilter = {
  column: string;
  label: [string, string];
  /** Options fixes… */
  options?: FieldOption[];
  /** …ou chargées depuis une autre ressource (ex. liste des rayons). */
  dynamicFrom?: string;
};

export type ResourceDef = {
  key: string;
  table: string;
  label: [string, string];
  labelPlural: [string, string];
  icon: string;
  description?: [string, string];
  /** Clé primaire : 'id' (série) ou 'key' (texte). */
  pk: 'id' | 'key';
  orderBy: string;
  searchFields: string[];
  fields: FieldDef[];
  labelField: string;
  labelFieldEn?: string;
  canCreate?: boolean;
  canDelete?: boolean;
  sortField?: string;
  filters?: ResourceFilter[];
};

const TYPE_OPTIONS: FieldOption[] = [
  { value: 'hero', label: ['Bannière principale (héros)', 'الواجهة الرئيسية'] },
  { value: 'categories', label: ['Rayons', 'الأقسام'] },
  { value: 'products', label: ['Produits d’un rayon', 'منتجات قسم'] },
  { value: 'deals', label: ['Meilleures offres', 'أفضل العروض'] },
  { value: 'promos', label: ['Promotions', 'العروض الترويجية'] },
  { value: 'sale', label: ['Bandeau de vente', 'بانر التخفيضات'] },
  { value: 'brands', label: ['Marques', 'العلامات التجارية'] },
  { value: 'service', label: ['Devis / fournitures', 'عروض الأسعار والتوريد'] },
  { value: 'stores', label: ['Magasins', 'الفروع'] },
  { value: 'about', label: ['À propos', 'من نحن'] },
];

const THEME_OPTIONS: FieldOption[] = [
  { value: '', label: ['Bleu marine (défaut)', 'كحلي (افتراضي)'] },
  { value: 'red', label: ['Rouge', 'أحمر'] },
  { value: 'cyan', label: ['Turquoise', 'تركوازي'] },
  { value: 'orange', label: ['Orange', 'برتقالي'] },
  { value: 'green', label: ['Vert', 'أخضر'] },
  { value: 'navy', label: ['Bleu foncé', 'أزرق غامق'] },
];

const LOCATION_OPTIONS: FieldOption[] = [
  { value: 'main', label: ['Menu principal', 'القائمة الرئيسية'] },
  { value: 'drawer', label: ['Menu latéral (mobile)', 'القائمة الجانبية'] },
  { value: 'utility', label: ['Barre utilitaire (haut)', 'الشريط العلوي'] },
  { value: 'mega', label: ['Mégamenu des rayons', 'القائمة المنسدلة'] },
  { value: 'tiles', label: ['Tuiles « Acheter par rayon »', 'مربعات الأقسام'] },
  { value: 'footer', label: ['Pied de page', 'تذييل الصفحة'] },
];

const KIND_OPTIONS: FieldOption[] = [
  { value: 'anchor', label: ['Aller à une section (ancre)', 'الانتقال إلى قسم'] },
  { value: 'category', label: ['Ouvrir un rayon', 'فتح قسم'] },
  { value: 'query', label: ['Lancer une recherche', 'بحث'] },
  { value: 'action', label: ['Action (suivi, langue…)', 'إجراء'] },
  { value: 'url', label: ['Lien externe', 'رابط خارجي'] },
];

const PLACEMENT_OPTIONS: FieldOption[] = [
  { value: 'hero', label: ['Héros (grande bannière)', 'الواجهة الرئيسية'] },
  { value: 'offer', label: ['Carte d’offre (à droite)', 'بطاقة عرض'] },
  { value: 'promo', label: ['Promotion', 'عرض ترويجي'] },
  { value: 'sale', label: ['Bandeau de vente', 'بانر تخفيضات'] },
];

export const RESOURCES: ResourceDef[] = [
  /* ── Produits ──────────────────────────────────────────────────── */
  {
    key: 'products',
    table: 'products',
    label: ['Produit', 'منتج'],
    labelPlural: ['Produits', 'المنتجات'],
    icon: 'fa-solid fa-box',
    description: [
      'Prix, images, textes arabe/anglais et mots-clés de recherche.',
      'الأسعار والصور والنصوص بالعربية والإنجليزية وكلمات البحث.',
    ],
    pk: 'id',
    orderBy: 'sort asc, id asc',
    searchFields: ['name_ar', 'name_en', 'brand', 'keywords'],
    labelField: 'name_ar',
    labelFieldEn: 'name_en',
    sortField: 'sort',
    filters: [
      { column: 'category_id', label: ['Rayon', 'القسم'], dynamicFrom: 'categories' },
    ],
    fields: [
      { name: 'name', label: ['Nom du produit', 'اسم المنتج'], type: 'bilingual-text', required: true, showInList: true, group: ['Contenu', 'المحتوى'] },
      { name: 'brand', label: ['Marque', 'العلامة التجارية'], type: 'text', showInList: true, group: ['Contenu', 'المحتوى'] },
      { name: 'category_id', label: ['Rayon', 'القسم'], type: 'reference', reference: { resource: 'categories', labelField: 'name_ar', labelFieldEn: 'name_en' }, showInList: true, group: ['Contenu', 'المحتوى'] },
      { name: 'desc', label: ['Description', 'الوصف'], type: 'bilingual-textarea', group: ['Contenu', 'المحتوى'] },
      { name: 'keywords', label: ['Mots-clés de recherche', 'كلمات البحث'], type: 'text', hint: ['Séparés par des espaces, en arabe et en anglais', 'مفصولة بمسافات، بالعربية والإنجليزية'], group: ['Contenu', 'المحتوى'] },
      { name: 'price', label: ['Prix', 'السعر'], type: 'number', required: true, showInList: true, group: ['Prix & stock', 'السعر والمخزون'] },
      { name: 'old_price', label: ['Prix barré (avant remise)', 'السعر قبل الخصم'], type: 'number', group: ['Prix & stock', 'السعر والمخزون'] },
      { name: 'stock', label: ['Mention de disponibilité', 'حالة التوفر'], type: 'bilingual-text', default: ['متوفر', 'IN STOCK'], group: ['Prix & stock', 'السعر والمخزون'] },
      { name: 'rating', label: ['Note (sur 5)', 'التقييم (من 5)'], type: 'number', default: 4.8, group: ['Prix & stock', 'السعر والمخزون'] },
      { name: 'image_url', label: ['Image du produit', 'صورة المنتج'], type: 'image', showInList: true, group: ['Image', 'الصورة'] },
      { name: 'sort', label: ['Ordre d’affichage', 'ترتيب العرض'], type: 'number', default: 0, group: ['Publication', 'النشر'] },
      { name: 'active', label: ['Visible sur le site', 'ظاهر على الموقع'], type: 'boolean', default: true, showInList: true, group: ['Publication', 'النشر'] },
    ],
  },

  /* ── Rayons ────────────────────────────────────────────────────── */
  {
    key: 'categories',
    table: 'categories',
    label: ['Rayon', 'قسم'],
    labelPlural: ['Rayons', 'الأقسام'],
    icon: 'fa-solid fa-layer-group',
    description: [
      'Les rayons alimentent la navigation, la recherche et les sections de produits.',
      'الأقسام تُستخدم في التنقل والبحث وأقسام المنتجات.',
    ],
    pk: 'id',
    orderBy: 'sort asc, id asc',
    searchFields: ['name_ar', 'name_en', 'slug'],
    labelField: 'name_ar',
    labelFieldEn: 'name_en',
    sortField: 'sort',
    fields: [
      { name: 'name', label: ['Nom du rayon', 'اسم القسم'], type: 'bilingual-text', required: true, showInList: true },
      { name: 'slug', label: ['Identifiant (slug)', 'المعرّف'], type: 'text', required: true, showInList: true, hint: ['Utilisé dans les liens, sans espaces : school, paper…', 'يُستخدم في الروابط بدون مسافات'] },
      { name: 'icon', label: ['Icône', 'الأيقونة'], type: 'text', hint: ['Classe Font Awesome, ex. fa-solid fa-pen', 'رمز فونت أوسم، مثال: fa-solid fa-pen'] },
      { name: 'description', label: ['Description', 'الوصف'], type: 'bilingual-textarea' },
      { name: 'image_url', label: ['Image du rayon', 'صورة القسم'], type: 'image' },
      { name: 'sort', label: ['Ordre d’affichage', 'ترتيب العرض'], type: 'number', default: 0 },
      { name: 'active', label: ['Visible sur le site', 'ظاهر على الموقع'], type: 'boolean', default: true, showInList: true },
    ],
  },

  /* ── Sections de la page d'accueil ─────────────────────────────── */
  {
    key: 'sections',
    table: 'sections',
    label: ['Section', 'قسم الصفحة'],
    labelPlural: ['Sections de l’accueil', 'أقسام الصفحة الرئيسية'],
    icon: 'fa-solid fa-table-columns',
    description: [
      'Ordre, titres et visibilité des blocs de la page d’accueil.',
      'ترتيب وعناوين وإظهار بلوكات الصفحة الرئيسية.',
    ],
    pk: 'id',
    orderBy: 'sort asc, id asc',
    searchFields: ['key', 'title_ar', 'title_en'],
    labelField: 'title_ar',
    labelFieldEn: 'title_en',
    sortField: 'sort',
    filters: [{ column: 'type', label: ['Type de section', 'نوع القسم'], options: TYPE_OPTIONS }],
    fields: [
      { name: 'type', label: ['Type de section', 'نوع القسم'], type: 'select', options: TYPE_OPTIONS, required: true, showInList: true },
      { name: 'key', label: ['Identifiant interne', 'المعرّف الداخلي'], type: 'text', required: true, hint: ['Unique, sans espaces (ex. school, deals)', 'فريد بدون مسافات'] },
      { name: 'anchor', label: ['Ancre du lien (#…)', 'المرساة'], type: 'text', hint: ['Permet aux menus de pointer vers cette section', 'تسمح للقوائم بالانتقال إلى هذا القسم'] },
      { name: 'category_id', label: ['Rayon affiché', 'القسم المعروض'], type: 'reference', reference: { resource: 'categories', labelField: 'name_ar', labelFieldEn: 'name_en' } },
      { name: 'banner_id', label: ['Bandeau affiché', 'البانر المعروض'], type: 'reference', reference: { resource: 'banners', labelField: 'title_ar', labelFieldEn: 'title_en' } },
      { name: 'title', label: ['Titre', 'العنوان'], type: 'bilingual-text', showInList: true },
      { name: 'subtitle', label: ['Sous-titre', 'العنوان الفرعي'], type: 'bilingual-text' },
      { name: 'body', label: ['Texte', 'النص'], type: 'bilingual-textarea' },
      { name: 'theme', label: ['Couleur', 'اللون'], type: 'select', options: THEME_OPTIONS },
      { name: 'sort', label: ['Ordre d’affichage', 'ترتيب العرض'], type: 'number', default: 0, showInList: true },
      { name: 'active', label: ['Visible sur le site', 'ظاهر على الموقع'], type: 'boolean', default: true, showInList: true },
    ],
  },

  /* ── Bandeaux ──────────────────────────────────────────────────── */
  {
    key: 'banners',
    table: 'banners',
    label: ['Bandeau', 'بانر'],
    labelPlural: ['Bandeaux & promotions', 'البانرات والعروض'],
    icon: 'fa-solid fa-images',
    description: [
      'Grandes bannières, cartes d’offre, promotions et bandeaux de vente.',
      'البانرات الكبيرة وبطاقات العروض والبانرات الترويجية.',
    ],
    pk: 'id',
    orderBy: 'placement asc, sort asc, id asc',
    searchFields: ['title_ar', 'title_en', 'kicker_ar', 'kicker_en'],
    labelField: 'title_ar',
    labelFieldEn: 'title_en',
    sortField: 'sort',
    filters: [{ column: 'placement', label: ['Emplacement', 'الموضع'], options: PLACEMENT_OPTIONS }],
    fields: [
      { name: 'placement', label: ['Emplacement', 'الموضع'], type: 'select', options: PLACEMENT_OPTIONS, required: true, showInList: true },
      { name: 'title', label: ['Titre', 'العنوان'], type: 'bilingual-text', showInList: true },
      { name: 'kicker', label: ['Sur-titre (petit texte)', 'النص العلوي'], type: 'bilingual-text' },
      { name: 'body', label: ['Texte descriptif', 'النص الوصفي'], type: 'bilingual-textarea' },
      { name: 'price_text', label: ['Prix / accroche', 'السعر أو العرض'], type: 'bilingual-text', hint: ['Ex. « خصم 20% », « من 2.5 د.ل »', 'مثال: خصم 20%'] },
      { name: 'price_value', label: ['Montant (affiché comme prix)', 'المبلغ'], type: 'number', hint: ['Si rempli, ce montant est affiché avec la devise', 'إذا تم تعبئته يظهر مع العملة'] },
      { name: 'image_url', label: ['Image de fond', 'صورة الخلفية'], type: 'image', showInList: true },
      { name: 'cta', label: ['Texte du bouton', 'نص الزر'], type: 'bilingual-text' },
      { name: 'cta_kind', label: ['Action du bouton', 'وظيفة الزر'], type: 'select', options: KIND_OPTIONS },
      { name: 'cta_target', label: ['Cible du bouton', 'هدف الزر'], type: 'text', hint: ['Rayon (school…), ancre (deals…), recherche ou action', 'القسم أو المرساة أو البحث'] },
      { name: 'cta_href', label: ['Lien externe', 'رابط خارجي'], type: 'text', hint: ['Utilisé si l’action est « Lien externe »', 'يُستخدم عند اختيار رابط خارجي'] },
      { name: 'icon', label: ['Icône', 'الأيقونة'], type: 'text' },
      { name: 'theme', label: ['Couleur', 'اللون'], type: 'select', options: THEME_OPTIONS },
      { name: 'sort', label: ['Ordre d’affichage', 'ترتيب العرض'], type: 'number', default: 0, showInList: true },
      { name: 'active', label: ['Visible sur le site', 'ظاهر على الموقع'], type: 'boolean', default: true, showInList: true },
    ],
  },

  /* ── Magasins ──────────────────────────────────────────────────── */
  {
    key: 'stores',
    table: 'stores',
    label: ['Magasin', 'فرع'],
    labelPlural: ['Magasins', 'الفروع'],
    icon: 'fa-solid fa-store',
    description: ['Coordonnées et horaires des points de vente.', 'بيانات وعناوين وأوقات عمل الفروع.'],
    pk: 'id',
    orderBy: 'sort asc, id asc',
    searchFields: ['name_ar', 'name_en', 'phone'],
    labelField: 'name_ar',
    labelFieldEn: 'name_en',
    sortField: 'sort',
    fields: [
      { name: 'name', label: ['Nom du magasin', 'اسم الفرع'], type: 'bilingual-text', required: true, showInList: true },
      { name: 'phone', label: ['Téléphone', 'الهاتف'], type: 'text', showInList: true },
      { name: 'address', label: ['Adresse', 'العنوان'], type: 'bilingual-text' },
      { name: 'hours', label: ['Horaires', 'ساعات العمل'], type: 'bilingual-text' },
      { name: 'map_query', label: ['Recherche Google Maps', 'بحث خرائط جوجل'], type: 'text', hint: ['Ex. « Gargaresh Tripoli Libya »', 'مثال: Gargaresh Tripoli Libya'] },
      { name: 'image_url', label: ['Photo', 'الصورة'], type: 'image' },
      { name: 'sort', label: ['Ordre d’affichage', 'ترتيب العرض'], type: 'number', default: 0 },
      { name: 'active', label: ['Visible sur le site', 'ظاهر على الموقع'], type: 'boolean', default: true, showInList: true },
    ],
  },

  /* ── Avantages ─────────────────────────────────────────────────── */
  {
    key: 'benefits',
    table: 'benefits',
    label: ['Avantage', 'ميزة'],
    labelPlural: ['Avantages', 'المزايا'],
    icon: 'fa-solid fa-award',
    description: [
      'Petits blocs avec icône (sous la bannière et en bas de page).',
      'المربعات الصغيرة بالأيقونات أسفل الواجهة وأسفل الصفحة.',
    ],
    pk: 'id',
    orderBy: 'placement asc, sort asc, id asc',
    searchFields: ['title_ar', 'title_en'],
    labelField: 'title_ar',
    labelFieldEn: 'title_en',
    sortField: 'sort',
    filters: [{
      column: 'placement',
      label: ['Emplacement', 'الموضع'],
      options: [
        { value: 'hero', label: ['Sous la bannière d’accueil', 'أسفل الواجهة'] },
        { value: 'footer', label: ['Bandeau bas de page', 'الشريط السفلي'] },
      ],
    }],
    fields: [
      { name: 'placement', label: ['Emplacement', 'الموضع'], type: 'select', options: [
        { value: 'hero', label: ['Sous la bannière d’accueil', 'أسفل الواجهة'] },
        { value: 'footer', label: ['Bandeau bas de page', 'الشريط السفلي'] },
      ], required: true, showInList: true },
      { name: 'icon', label: ['Icône', 'الأيقونة'], type: 'text', default: 'fa-solid fa-truck-fast' },
      { name: 'title', label: ['Titre', 'العنوان'], type: 'bilingual-text', required: true, showInList: true },
      { name: 'subtitle', label: ['Sous-titre', 'العنوان الفرعي'], type: 'bilingual-text' },
      { name: 'sort', label: ['Ordre d’affichage', 'ترتيب العرض'], type: 'number', default: 0 },
      { name: 'active', label: ['Visible sur le site', 'ظاهر على الموقع'], type: 'boolean', default: true, showInList: true },
    ],
  },

  /* ── Marques ───────────────────────────────────────────────────── */
  {
    key: 'brands',
    table: 'brands',
    label: ['Marque', 'علامة تجارية'],
    labelPlural: ['Marques', 'العلامات التجارية'],
    icon: 'fa-solid fa-copyright',
    description: ['Bandeau des marques et recherche associée.', 'شريط العلامات التجارية والبحث المرتبط.'],
    pk: 'id',
    orderBy: 'sort asc, id asc',
    searchFields: ['name', 'search_query'],
    labelField: 'name',
    sortField: 'sort',
    fields: [
      { name: 'name', label: ['Nom affiché', 'الاسم المعروض'], type: 'text', required: true, showInList: true },
      { name: 'search_query', label: ['Recherche associée', 'البحث المرتبط'], type: 'text', hint: ['Mot-clé utilisé lors du clic', 'الكلمة المستخدمة عند النقر'] },
      { name: 'logo_url', label: ['Logo', 'الشعار'], type: 'image' },
      { name: 'sort', label: ['Ordre d’affichage', 'ترتيب العرض'], type: 'number', default: 0 },
      { name: 'active', label: ['Visible sur le site', 'ظاهر على الموقع'], type: 'boolean', default: true, showInList: true },
    ],
  },

  /* ── Liens de navigation ───────────────────────────────────────── */
  {
    key: 'nav-links',
    table: 'nav_links',
    label: ['Lien', 'رابط'],
    labelPlural: ['Menus & liens', 'القوائم والروابط'],
    icon: 'fa-solid fa-bars-staggered',
    description: [
      'Menus du haut, mégamenu, tuiles de rayons et colonnes du pied de page.',
      'القوائم العلوية والمربعات وروابط التذييل.',
    ],
    pk: 'id',
    orderBy: 'location asc, sort asc, id asc',
    searchFields: ['label_ar', 'label_en', 'target'],
    labelField: 'label_ar',
    labelFieldEn: 'label_en',
    sortField: 'sort',
    filters: [{ column: 'location', label: ['Emplacement', 'الموضع'], options: LOCATION_OPTIONS }],
    fields: [
      { name: 'location', label: ['Emplacement', 'الموضع'], type: 'select', options: LOCATION_OPTIONS, required: true, showInList: true },
      { name: 'label', label: ['Texte du lien', 'نص الرابط'], type: 'bilingual-text', required: true, showInList: true },
      { name: 'group', label: ['Groupe / colonne', 'المجموعة أو العمود'], type: 'bilingual-text', hint: ['Utilisé par le mégamenu et le pied de page', 'يُستخدم في القائمة المنسدلة والتذييل'] },
      { name: 'kind', label: ['Type de lien', 'نوع الرابط'], type: 'select', options: KIND_OPTIONS, required: true },
      { name: 'target', label: ['Cible', 'الهدف'], type: 'text', hint: ['Rayon (school), ancre (deals), recherche (pen), action (track, language)', 'القسم أو المرساة أو البحث أو الإجراء'] },
      { name: 'icon', label: ['Icône', 'الأيقونة'], type: 'text' },
      { name: 'highlight', label: ['Mettre en évidence (jaune)', 'إبراز (أصفر)'], type: 'boolean', default: false },
      { name: 'sort', label: ['Ordre d’affichage', 'ترتيب العرض'], type: 'number', default: 0, showInList: true },
      { name: 'active', label: ['Visible sur le site', 'ظاهر على الموقع'], type: 'boolean', default: true, showInList: true },
    ],
  },

  /* ── Textes ────────────────────────────────────────────────────── */
  {
    key: 'texts',
    table: 'texts',
    label: ['Texte', 'نص'],
    labelPlural: ['Textes de l’interface', 'نصوص الواجهة'],
    icon: 'fa-solid fa-font',
    description: [
      'Toutes les phrases du site, en arabe et en anglais.',
      'جميع عبارات الموقع بالعربية والإنجليزية.',
    ],
    pk: 'key',
    orderBy: 'section asc, sort asc, key asc',
    searchFields: ['key', 'ar', 'en'],
    labelField: 'key',
    canCreate: false,
    canDelete: false,
    filters: [{
      column: 'section',
      label: ['Groupe de textes', 'مجموعة النصوص'],
      options: Object.entries(TEXT_SECTIONS).map(([value, label]) => ({ value, label })),
    }],
    fields: [
      { name: 'ar', label: ['Texte arabe', 'النص العربي'], type: 'text-ar', showInList: true },
      { name: 'en', label: ['Texte anglais', 'النص الإنجليزي'], type: 'text-en' },
      { name: 'section', label: ['Groupe', 'المجموعة'], type: 'text', showInList: true },
      { name: 'key', label: ['Clé technique', 'المفتاح التقني'], type: 'text', showInList: true, hint: ['Identifiant interne — à ne pas modifier', 'معرّف داخلي — لا يُعدّل'] },
      { name: 'multiline', label: ['Texte long', 'نص طويل'], type: 'boolean', default: false },
      { name: 'sort', label: ['Ordre', 'الترتيب'], type: 'number', default: 0 },
    ],
  },

  /* ── Bibliothèque d'images ─────────────────────────────────────── */
  {
    key: 'media',
    table: 'media',
    label: ['Image', 'صورة'],
    labelPlural: ['Bibliothèque d’images', 'مكتبة الصور'],
    icon: 'fa-solid fa-image',
    description: [
      'Vos liens d’images réutilisables (Unsplash, Drive, hébergeur…).',
      'روابط الصور القابلة لإعادة الاستخدام.',
    ],
    pk: 'id',
    orderBy: 'id desc',
    searchFields: ['url', 'label'],
    labelField: 'label',
    fields: [
      { name: 'url', label: ['Adresse de l’image (URL)', 'رابط الصورة'], type: 'image', required: true, showInList: true },
      { name: 'label', label: ['Nom / description', 'الاسم أو الوصف'], type: 'text', showInList: true },
      { name: 'alt', label: ['Texte alternatif', 'النص البديل'], type: 'bilingual-text' },
    ],
  },
];

export const RESOURCES_BY_KEY: Record<string, ResourceDef> = Object.fromEntries(
  RESOURCES.map((r) => [r.key, r]),
);

export function getResource(key: string): ResourceDef | undefined {
  return RESOURCES_BY_KEY[key];
}

/** Colonnes réellement stockées pour un champ donné. */
export function fieldColumns(field: FieldDef): string[] {
  switch (field.type) {
    case 'bilingual-text':
    case 'bilingual-textarea':
      return [`${field.name}_ar`, `${field.name}_en`];
    default:
      return [field.name];
  }
}

/** Libellé lisible d'une ligne (pour les listes et les menus de sélection). */
export function rowLabel(row: Record<string, unknown>, resource: ResourceDef, lang: 'ar' | 'en' = 'ar'): string {
  const primary = lang === 'en' && resource.labelFieldEn ? resource.labelFieldEn : resource.labelField;
  const value = row[primary];
  if (value !== undefined && value !== null && String(value).length) return String(value);
  const fallback = resource.labelFieldEn ? row[resource.labelFieldEn] : '';
  if (fallback) return String(fallback);
  const pkValue = row[resource.pk];
  return pkValue !== undefined ? String(pkValue) : '—';
}
