/** Statuts des commandes et des devis (libellés [français, arabe]). */

export const ORDER_STATUSES = ['new', 'confirmed', 'shipped', 'delivered', 'cancelled'] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const STATUS_LABELS: Record<string, [string, string]> = {
  new: ['Nouvelle', 'جديد'],
  confirmed: ['Confirmée', 'مؤكد'],
  shipped: ['Expédiée', 'في الطريق'],
  delivered: ['Livrée', 'تم التوصيل'],
  cancelled: ['Annulée', 'ملغى'],
};

export const QUOTE_STATUSES = ['new', 'in_progress', 'done'] as const;

export const QUOTE_STATUS_LABELS: Record<string, [string, string]> = {
  new: ['Nouvelle', 'جديد'],
  in_progress: ['En cours', 'قيد المعالجة'],
  done: ['Traitée', 'تمت المعالجة'],
};

export const PAYMENT_LABELS: Record<string, [string, string]> = {
  cod: ['Paiement à la livraison', 'الدفع عند الاستلام'],
  card: ['Carte bancaire', 'بطاقة مصرفية'],
};

export function statusLabel(map: Record<string, [string, string]>, status: string, lang: 'fr' | 'ar'): string {
  const entry = map[status];
  if (!entry) return status;
  return lang === 'ar' ? entry[1] : entry[0];
}
