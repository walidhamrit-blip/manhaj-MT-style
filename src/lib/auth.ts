/**
 * Authentification du panneau d'administration.
 *
 * Principe : un mot de passe unique (`ADMIN_PASSWORD`) échange un cookie de
 * session signé (HMAC-SHA256) — aucune donnée de connexion n'est stockée en
 * base. La structure est prête pour passer à plusieurs comptes plus tard :
 * il suffira de remplacer `verifyPassword()` et `getSession()`.
 */
import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

export const SESSION_COOKIE = 'manhaj_admin_session';

const SESSION_HOURS = Math.max(1, Number(process.env.ADMIN_SESSION_HOURS || 12));

function authSecret(): string {
  return process.env.AUTH_SECRET || process.env.ADMIN_PASSWORD || 'manhaj-development-secret';
}

/** Le mot de passe administrateur est-il configuré ? */
export function isAdminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD);
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/** Vérifie le mot de passe saisi (comparaison à temps constant). */
export function verifyPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return safeEqual(input, expected);
}

function sign(payload: string): string {
  return createHmac('sha256', authSecret()).update(payload).digest('hex');
}

/** Crée un jeton de session `expiration.signature`. */
export function createSessionToken(): { token: string; expiresAt: number } {
  const expiresAt = Date.now() + SESSION_HOURS * 3600 * 1000;
  const token = `${expiresAt}.${sign(`admin:${expiresAt}`)}`;
  return { token, expiresAt };
}

export function isValidToken(token: string | undefined): boolean {
  if (!token) return false;
  const [expires, signature] = token.split('.');
  if (!expires || !signature) return false;
  const expiresAt = Number(expires);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return false;
  return safeEqual(signature, sign(`admin:${expiresAt}`));
}

/** Session valide côté serveur (server components & route handlers). */
export async function hasValidSession(): Promise<boolean> {
  try {
    const store = await cookies();
    return isValidToken(store.get(SESSION_COOKIE)?.value);
  } catch {
    return false;
  }
}

export const sessionMaxAgeSeconds = SESSION_HOURS * 3600;
export const sessionHours = SESSION_HOURS;
