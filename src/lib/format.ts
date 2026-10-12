import type { Lang } from './types';

const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';

/**
 * Formate un montant de façon déterministe (identique côté serveur et
 * navigateur) : chiffres arabes-indiens en arabe, chiffres latins en anglais.
 */
export function formatMoney(value: number, lang: Lang, currency: string): string {
  const safe = Number.isFinite(value) ? value : 0;
  const rounded = Math.round(safe * 100) / 100;
  const [integer, decimals] = rounded.toFixed(2).split('.');
  const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  let out = decimals === '00' ? grouped : `${grouped}.${decimals}`;
  if (lang === 'ar') {
    out = out
      .replace(/[0-9]/g, (d) => ARABIC_DIGITS[Number(d)])
      .replace(/,/g, '٬')
      .replace('.', '٫');
  }
  return `${out} ${currency}`;
}

/** Référence courte et lisible pour les commandes et devis : AM-8F3K2. */
export function makeReference(prefix = 'AM'): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 5; i += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `${prefix}-${code}`;
}

/** Échappe le HTML des valeurs injectées dans un e-mail ou un PDF simple. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Date lisible (fuseau du serveur). */
export function formatDate(value: string | Date, lang: Lang = 'ar'): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '—';
  const iso = date.toISOString().slice(0, 16).replace('T', ' ');
  if (lang === 'ar') {
    return iso.replace(/[0-9]/g, (d) => ARABIC_DIGITS[Number(d)]).replace(/-/g, '/');
  }
  return iso;
}

/** Pourcentage de remise (0 si pas d'ancien prix). */
export function discountPercent(price: number, oldPrice: number | null): number {
  if (!oldPrice || oldPrice <= price) return 0;
  return Math.round((1 - price / oldPrice) * 100);
}
