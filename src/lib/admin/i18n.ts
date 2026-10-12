/**
 * Langues de l'interface d'administration (le contenu du site, lui, reste
 * bilingue arabe/anglais). Français par défaut, arabe au choix — le réglage
 * est conservé dans un cookie.
 */
export type AdminLang = 'fr' | 'ar';

export const ADMIN_LANGS: AdminLang[] = ['fr', 'ar'];

export const ADMIN_LANG_COOKIE = 'manhaj_admin_lang';

type Entry = [string, string]; // [français, arabe]

const LABELS: Record<string, Entry> = {
  /* Général */
  dashboard: ['Tableau de bord', 'لوحة التحكم'],
  catalog: ['Catalogue', 'الكتالوج'],
  content: ['Contenu du site', 'محتوى الموقع'],
  sales: ['Ventes & contacts', 'المبيعات والتواصل'],
  configuration: ['Configuration', 'الإعدادات'],
  viewSite: ['Voir le site', 'عرض الموقع'],
  logout: ['Déconnexion', 'تسجيل الخروج'],
  language: ['Langue', 'اللغة'],
  adminTitle: ['Panneau d’administration', 'لوحة الإدارة'],
  back: ['Retour', 'رجوع'],
  backToDashboard: ['Retour au tableau de bord', 'العودة إلى لوحة التحكم'],
  actions: ['Actions', 'إجراءات'],
  edit: ['Modifier', 'تعديل'],
  duplicate: ['Dupliquer', 'نسخ'],
  delete: ['Supprimer', 'حذف'],
  save: ['Enregistrer', 'حفظ'],
  saved: ['Modifications enregistrées', 'تم حفظ التعديلات'],
  create: ['Ajouter', 'إضافة'],
  cancel: ['Annuler', 'إلغاء'],
  search: ['Rechercher…', 'بحث…'],
  searchButton: ['Rechercher', 'بحث'],
  results: ['résultat(s)', 'نتيجة'],
  noResults: ['Aucun élément pour le moment.', 'لا توجد عناصر حالياً.'],
  noResultsHint: ['Utilisez le bouton « Ajouter » pour créer le premier.', 'استخدم زر الإضافة لإنشاء أول عنصر.'],
  confirmDelete: ['Supprimer définitivement ?', 'هل تريد الحذف نهائياً؟'],
  order: ['Ordre', 'الترتيب'],
  visible: ['Visible', 'ظاهر'],
  hidden: ['Masqué', 'مخفي'],
  id: ['N°', 'الرقم'],
  technicalKey: ['Clé technique', 'المفتاح التقني'],
  requiredFields: ['Les champs marqués d’un * sont obligatoires.', 'الحقول المعلّمة بـ * إلزامية.'],
  imagePreview: ['Aperçu', 'معاينة'],
  imageLibrary: ['Bibliothèque d’images (cliquez pour choisir)', 'مكتبة الصور (انقر للاختيار)'],
  imageUrlHint: ['Collez l’adresse d’une image (https://…)', 'الصق رابط الصورة (https://…)'],

  /* Connexion */
  login: ['Connexion', 'تسجيل الدخول'],
  loginTitle: ['Accès administrateur', 'دخول المسؤول'],
  loginIntro: [
    'Entrez le mot de passe administrateur pour gérer le contenu, les prix et les commandes.',
    'أدخل كلمة مرور المسؤول لإدارة المحتوى والأسعار والطلبات.',
  ],
  password: ['Mot de passe', 'كلمة المرور'],
  signIn: ['Se connecter', 'دخول'],
  wrongPassword: ['Mot de passe incorrect.', 'كلمة المرور غير صحيحة.'],
  notConfigured: [
    'Aucun mot de passe administrateur n’est configuré. Ajoutez la variable d’environnement ADMIN_PASSWORD (Vercel → Settings → Environment Variables) puis redéployez.',
    'لم تُضبط كلمة مرور المسؤول. أضف المتغير ADMIN_PASSWORD في إعدادات النشر ثم أعد النشر.',
  ],
  sessionExpired: ['Votre session a expiré, veuillez vous reconnecter.', 'انتهت الجلسة، يرجى تسجيل الدخول مجدداً.'],

  /* Tableau de bord */
  welcome: ['Bienvenue', 'مرحباً'],
  dashIntro: [
    'Tout ce que vous modifiez ici est enregistré dans la base et apparaît immédiatement sur le site, sur tous les appareils.',
    'كل ما تعدّله هنا يُحفظ في قاعدة البيانات ويظهر فوراً على الموقع في جميع الأجهزة.',
  ],
  statProducts: ['Produits', 'المنتجات'],
  statCategories: ['Rayons', 'الأقسام'],
  statOrders: ['Commandes', 'الطلبات'],
  statNewOrders: ['Nouvelles commandes', 'طلبات جديدة'],
  statQuotes: ['Demandes de devis', 'طلبات عروض الأسعار'],
  statSubscribers: ['Abonnés newsletter', 'مشتركو النشرة'],
  recentOrders: ['Dernières commandes', 'أحدث الطلبات'],
  quickActions: ['Actions rapides', 'إجراءات سريعة'],
  quickActionProduct: ['Ajouter un produit', 'إضافة منتج'],
  quickActionBanner: ['Modifier les bandeaux', 'تعديل البانرات'],
  quickActionTexts: ['Modifier les textes', 'تعديل النصوص'],
  quickActionSettings: ['Coordonnées & réglages', 'بيانات الاتصال والإعدادات'],
  databaseInfo: ['Base de données', 'قاعدة البيانات'],
  active: ['Active', 'نشط'],

  /* Commandes */
  orderRef: ['Référence', 'المرجع'],
  customer: ['Client', 'العميل'],
  phone: ['Téléphone', 'الهاتف'],
  city: ['Ville', 'المدينة'],
  address: ['Adresse', 'العنوان'],
  payment: ['Paiement', 'الدفع'],
  subtotal: ['Sous-total', 'المجموع الفرعي'],
  deliveryFee: ['Livraison', 'التوصيل'],
  total: ['Total', 'الإجمالي'],
  date: ['Date', 'التاريخ'],
  status: ['Statut', 'الحالة'],
  items: ['Articles', 'المنتجات'],
  statusNew: ['Nouvelle', 'جديد'],
  statusConfirmed: ['Confirmée', 'مؤكد'],
  statusShipped: ['Expédiée', 'في الطريق'],
  statusDelivered: ['Livrée', 'تم التوصيل'],
  statusCancelled: ['Annulée', 'ملغى'],
  updateStatus: ['Changer le statut', 'تغيير الحالة'],
  note: ['Remarque', 'ملاحظة'],
  noOrders: ['Aucune commande pour le moment.', 'لا توجد طلبات حالياً.'],

  /* Devis */
  company: ['Société / école', 'الشركة أو المدرسة'],
  message: ['Message', 'الرسالة'],
  noQuotes: ['Aucune demande de devis.', 'لا توجد طلبات عروض أسعار.'],
  quoteNew: ['Nouvelle', 'جديد'],
  quoteInProgress: ['En cours', 'قيد المعالجة'],
  quoteDone: ['Traitée', 'تمت المعالجة'],

  /* Abonnés */
  email: ['E-mail', 'البريد الإلكتروني'],
  subscribedAt: ['Inscrit le', 'تاريخ الاشتراك'],
  exportCsv: ['Exporter en CSV', 'تصدير CSV'],
  noSubscribers: ['Aucun abonné.', 'لا يوجد مشتركون.'],

  /* Réglages */
  settingsIntro: [
    'Coordonnées, réseaux sociaux, devise et règles de la boutique. Ces valeurs alimentent le site entier.',
    'بيانات الاتصال وشبكات التواصل والعملة وقواعد المتجر. تُستخدم في كل الموقع.',
  ],
  textIntro: [
    'Chaque phrase du site est modifiable, en arabe et en anglais.',
    'كل عبارة في الموقع قابلة للتعديل بالعربية والإنجليزية.',
  ],
  group: ['Groupe', 'المجموعة'],
};

export function tr(lang: AdminLang, key: keyof typeof LABELS | string): string {
  const entry = LABELS[key as string];
  if (!entry) return String(key);
  return lang === 'ar' ? entry[1] : entry[0];
}

/** Traduit un libellé [fr, ar] issu de la configuration des ressources. */
export function bilingual(lang: AdminLang, label: [string, string] | undefined): string {
  if (!label) return '';
  return lang === 'ar' ? label[1] : label[0];
}
