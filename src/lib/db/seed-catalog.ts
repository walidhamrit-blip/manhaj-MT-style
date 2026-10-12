/**
 * Catalogue initial (30 produits) repris du site d'origine.
 * Ce contenu est ensuite géré depuis le panneau d'administration → Produits.
 * Fichier généré par scripts/gen-catalog-seed.mjs — modifiable sans risque.
 */
export type SeedProduct = {
  categorySlug: string;
  brand: string;
  nameAr: string;
  nameEn: string;
  price: number;
  oldPrice: number | null;
  imageUrl: string;
  keywords: string;
  sort: number;
};

export const SEED_PRODUCTS: SeedProduct[] = [
  { categorySlug: 'school', brand: 'BIC', nameAr: 'طقم أقلام جاف كريستال 10 قطع', nameEn: 'Cristal Ballpoint Pens, 10 Pack', price: 12, oldPrice: 15, imageUrl: 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?auto=format&fit=crop&w=600&q=80', keywords: 'قلم pen writing', sort: 10 },
  { categorySlug: 'school', brand: 'FABER-CASTELL', nameAr: 'أقلام رصاص مدرسية HB - 12 قطعة', nameEn: 'HB School Pencils, 12 Pack', price: 10, oldPrice: 13, imageUrl: 'https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?auto=format&fit=crop&w=600&q=80', keywords: 'pencil قلم رصاص', sort: 20 },
  { categorySlug: 'school', brand: 'STABILO', nameAr: 'طقم أقلام تحديد بألوان باستيل', nameEn: 'Pastel Highlighter Set', price: 18, oldPrice: 22, imageUrl: 'https://images.unsplash.com/photo-1580569214296-5cf2bffc5ccd?auto=format&fit=crop&w=600&q=80', keywords: 'marker highlighter تحديد', sort: 30 },
  { categorySlug: 'school', brand: 'MAPED', nameAr: 'طقم هندسي متكامل 8 قطع', nameEn: 'Complete Geometry Set, 8 Pieces', price: 16, oldPrice: 20, imageUrl: 'https://images.unsplash.com/photo-1574607383476-f517f260d30b?auto=format&fit=crop&w=600&q=80', keywords: 'geometry هندسة ruler compass', sort: 40 },
  { categorySlug: 'school', brand: 'PILOT', nameAr: 'أقلام حبر جل قابلة للمسح', nameEn: 'Erasable Gel Pens, 3 Pack', price: 24, oldPrice: 29, imageUrl: 'https://images.unsplash.com/photo-1568205612837-017257d2310a?auto=format&fit=crop&w=600&q=80', keywords: 'pen حبر correction', sort: 50 },
  { categorySlug: 'school', brand: 'MAPED', nameAr: 'طقم ممحاة وبراية مدرسية', nameEn: 'School Eraser & Sharpener Set', price: 6, oldPrice: 8, imageUrl: 'https://images.unsplash.com/photo-1509223197845-458d87318791?auto=format&fit=crop&w=600&q=80', keywords: 'correction ممحاة sharpener', sort: 60 },
  { categorySlug: 'paper', brand: 'AL MANHAJ', nameAr: 'دفتر مدرسي مسطر 100 ورقة', nameEn: 'Ruled School Notebook, 100 Sheets', price: 5.5, oldPrice: 7, imageUrl: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=600&q=80', keywords: 'notebook دفتر', sort: 70 },
  { categorySlug: 'paper', brand: 'MOLESKINE', nameAr: 'دفتر ملاحظات فاخر بغلاف صلب', nameEn: 'Premium Hardcover Notebook', price: 38, oldPrice: 45, imageUrl: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=600&q=80', keywords: 'notebook دفتر ملاحظات', sort: 80 },
  { categorySlug: 'paper', brand: 'DOUBLE A', nameAr: 'رزمة ورق تصوير A4 - 500 ورقة', nameEn: 'A4 Copy Paper, 500 Sheets', price: 32, oldPrice: 36, imageUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=600&q=80', keywords: 'copy paper ورق تصوير', sort: 90 },
  { categorySlug: 'paper', brand: 'POST-IT', nameAr: 'ملاحظات لاصقة متعددة الألوان', nameEn: 'Assorted Colour Sticky Notes', price: 14, oldPrice: 18, imageUrl: 'https://images.unsplash.com/photo-1587467512961-120760940315?auto=format&fit=crop&w=600&q=80', keywords: 'sticky notes لاصقة', sort: 100 },
  { categorySlug: 'paper', brand: 'OXFORD', nameAr: 'دفتر جامعي حلزوني مقسم', nameEn: 'Sectioned Spiral College Notebook', price: 19, oldPrice: 23, imageUrl: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&w=600&q=80', keywords: 'notebook college دفتر', sort: 110 },
  { categorySlug: 'paper', brand: 'AL MANHAJ', nameAr: 'كراسة رسم بيضاء A4', nameEn: 'A4 White Sketch Pad', price: 11, oldPrice: 14, imageUrl: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&w=600&q=80', keywords: 'sketch paper رسم', sort: 120 },
  { categorySlug: 'office', brand: 'DELI', nameAr: 'دباسة مكتبية معدنية مع دبابيس', nameEn: 'Metal Office Stapler With Staples', price: 26, oldPrice: 31, imageUrl: 'https://images.unsplash.com/photo-1598618443855-232ee0f819f6?auto=format&fit=crop&w=600&q=80', keywords: 'stapler دباسة office', sort: 130 },
  { categorySlug: 'office', brand: 'CASIO', nameAr: 'آلة حاسبة مكتبية 12 خانة', nameEn: '12-Digit Desktop Calculator', price: 42, oldPrice: 49, imageUrl: 'https://images.unsplash.com/photo-1564466809058-bf4114d55352?auto=format&fit=crop&w=600&q=80', keywords: 'calculator حاسبة', sort: 140 },
  { categorySlug: 'office', brand: 'LEITZ', nameAr: 'ملفات أرشيف A4 - طقم 5 قطع', nameEn: 'A4 Archive Files, 5 Pack', price: 28, oldPrice: 34, imageUrl: 'https://images.unsplash.com/photo-1457694587812-e8bf29a43845?auto=format&fit=crop&w=600&q=80', keywords: 'folder file ملفات', sort: 150 },
  { categorySlug: 'office', brand: 'DELI', nameAr: 'منظم مكتب متعدد الأقسام', nameEn: 'Multi-Section Desk Organiser', price: 35, oldPrice: 42, imageUrl: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=600&q=80', keywords: 'organizer office مكتب', sort: 160 },
  { categorySlug: 'office', brand: 'HP', nameAr: 'خرطوشة حبر طابعة سوداء أصلية', nameEn: 'Original Black Printer Cartridge', price: 95, oldPrice: 110, imageUrl: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=600&q=80', keywords: 'printer ink حبر طابعة', sort: 170 },
  { categorySlug: 'office', brand: '3M', nameAr: 'شريط لاصق مع حامل مكتبي', nameEn: 'Desktop Tape Dispenser & Tape', price: 17, oldPrice: 21, imageUrl: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=600&q=80', keywords: 'tape office لاصق', sort: 180 },
  { categorySlug: 'art', brand: 'FABER-CASTELL', nameAr: 'ألوان خشبية كلاسيكية 24 لون', nameEn: 'Classic Colour Pencils, 24 Colours', price: 29, oldPrice: 36, imageUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=600&q=80', keywords: 'art colors ألوان', sort: 190 },
  { categorySlug: 'art', brand: 'GIOTTO', nameAr: 'ألوان مائية مدرسية 12 لون', nameEn: 'School Watercolours, 12 Colours', price: 22, oldPrice: 27, imageUrl: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?auto=format&fit=crop&w=600&q=80', keywords: 'watercolor art ألوان مائية', sort: 200 },
  { categorySlug: 'art', brand: 'REEVES', nameAr: 'طقم ألوان أكريليك 12 أنبوب', nameEn: 'Acrylic Paint Set, 12 Tubes', price: 45, oldPrice: 55, imageUrl: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&w=600&q=80', keywords: 'acrylic art أكريليك', sort: 210 },
  { categorySlug: 'art', brand: 'DALER-ROWNEY', nameAr: 'مجموعة فرش رسم 10 قطع', nameEn: 'Artist Brush Set, 10 Pieces', price: 24, oldPrice: 30, imageUrl: 'https://images.unsplash.com/photo-1510832842230-87253f48d74f?auto=format&fit=crop&w=600&q=80', keywords: 'brush art فرش', sort: 220 },
  { categorySlug: 'art', brand: 'CRAYOLA', nameAr: 'أقلام شمعية للأطفال 24 لون', nameEn: 'Kids Wax Crayons, 24 Colours', price: 19, oldPrice: 23, imageUrl: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&w=600&q=80', keywords: 'crayon children ألوان', sort: 230 },
  { categorySlug: 'art', brand: 'MAPED', nameAr: 'طقم أشغال يدوية للأطفال', nameEn: 'Creative Craft Kit For Kids', price: 39, oldPrice: 48, imageUrl: 'https://images.unsplash.com/photo-1598880940080-ff9a29891b85?auto=format&fit=crop&w=600&q=80', keywords: 'craft educational أطفال', sort: 240 },
  { categorySlug: 'bags', brand: 'JANSPORT', nameAr: 'حقيبة مدرسية كلاسيكية مبطنة', nameEn: 'Classic Padded School Backpack', price: 115, oldPrice: 139, imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80', keywords: 'bag backpack حقيبة', sort: 250 },
  { categorySlug: 'bags', brand: 'SKYBAGS', nameAr: 'حقيبة مدرسية بعجلات للأطفال', nameEn: 'Kids Trolley School Bag', price: 145, oldPrice: 175, imageUrl: 'https://images.unsplash.com/photo-1581605405669-fcdf81165afa?auto=format&fit=crop&w=600&q=80', keywords: 'bag trolley حقيبة', sort: 260 },
  { categorySlug: 'bags', brand: 'MAPED', nameAr: 'مقلمة مدرسية مزدوجة', nameEn: 'Double Compartment Pencil Case', price: 22, oldPrice: 28, imageUrl: 'https://images.unsplash.com/photo-1606248897732-2c5ffe759c04?auto=format&fit=crop&w=600&q=80', keywords: 'case مقلمة', sort: 270 },
  { categorySlug: 'bags', brand: 'MILAN', nameAr: 'مقلمة مجهزة بـ 30 قطعة', nameEn: 'Filled Pencil Case, 30 Pieces', price: 58, oldPrice: 69, imageUrl: 'https://images.unsplash.com/photo-1560785496-3c9d27877182?auto=format&fit=crop&w=600&q=80', keywords: 'case مقلمة school', sort: 280 },
  { categorySlug: 'bags', brand: 'LOCK&LOCK', nameAr: 'حافظة طعام مدرسية محكمة', nameEn: 'Sealed School Lunch Box', price: 36, oldPrice: 43, imageUrl: 'https://images.unsplash.com/photo-1602532305019-3dbbd482dae9?auto=format&fit=crop&w=600&q=80', keywords: 'lunch box طعام', sort: 290 },
  { categorySlug: 'bags', brand: 'CONTIGO', nameAr: 'قارورة مياه مدرسية 500 مل', nameEn: 'School Water Bottle, 500ml', price: 39, oldPrice: 47, imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80', keywords: 'bottle water قارورة', sort: 300 },
];
