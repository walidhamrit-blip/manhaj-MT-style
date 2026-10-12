'use server';

/**
 * Actions serveur du panneau d'administration.
 * Toutes vérifient la session avant d'écrire en base.
 */
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ensureDatabase } from '../db';
import { SETTINGS_DEFS } from '../db/seed-texts';
import { createRow, deleteRow, duplicateRow, logActivity, updateRow } from './crud';
import { getResource, type ResourceDef } from './resources';
import {
  ADMIN_LANG_COOKIE, type AdminLang,
} from './i18n';
import {
  SESSION_COOKIE, createSessionToken, hasValidSession, isAdminConfigured, sessionMaxAgeSeconds, verifyPassword,
} from '../auth';

export type ActionState = { ok: boolean; message: string } | null;

/* ── Utilitaires ─────────────────────────────────────────────────── */

async function requireSession(): Promise<void> {
  if (!(await hasValidSession())) redirect('/admin/login');
}

function refresh(paths: string[] = []) {
  try {
    revalidatePath('/');
    revalidatePath('/admin');
    for (const path of paths) revalidatePath(path);
  } catch {
    /* hors requête Next : ignoré */
  }
}

/** Reconstruit l'entrée d'un formulaire à partir de la configuration. */
function formToInput(resource: ResourceDef, formData: FormData): Record<string, unknown> {
  const input: Record<string, unknown> = {};
  for (const field of resource.fields) {
    if (field.type === 'bilingual-text' || field.type === 'bilingual-textarea') {
      input[field.name] = [
        String(formData.get(`${field.name}_ar`) ?? ''),
        String(formData.get(`${field.name}_en`) ?? ''),
      ];
    } else if (field.type === 'boolean') {
      input[field.name] = formData.get(field.name) === 'on' || formData.get(field.name) === 'true';
    } else {
      const value = formData.get(field.name);
      input[field.name] = value === null ? '' : String(value);
    }
  }
  return input;
}

/* ── Authentification ────────────────────────────────────────────── */

export async function loginAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const password = String(formData.get('password') ?? '');

  if (!isAdminConfigured()) {
    return {
      ok: false,
      message: 'Aucun mot de passe administrateur configuré (variable ADMIN_PASSWORD manquante).',
    };
  }
  if (!verifyPassword(password)) {
    return { ok: false, message: 'wrongPassword' };
  }

  const { token, expiresAt } = createSessionToken();
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: sessionMaxAgeSeconds,
    expires: new Date(expiresAt),
  });

  await logActivity('login', 'session', 'admin', 'Connexion réussie');
  redirect('/admin');
}

export async function logoutAction(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect('/admin/login');
}

export async function setAdminLangAction(lang: AdminLang): Promise<void> {
  const store = await cookies();
  store.set(ADMIN_LANG_COOKIE, lang === 'ar' ? 'ar' : 'fr', {
    httpOnly: false,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  });
  revalidatePath('/admin');
}

/* ── CRUD générique ──────────────────────────────────────────────── */

export async function saveResourceAction(
  resourceKey: string,
  id: string | null,
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireSession();
  const resource = getResource(resourceKey);
  if (!resource) return { ok: false, message: 'Ressource inconnue.' };

  const input = formToInput(resource, formData);
  const db = await ensureDatabase();

  const result = id
    ? await updateRow(resource, id, input, db)
    : await createRow(resource, input, db);

  if (!result.ok) return { ok: false, message: result.error };

  await logActivity(id ? 'update' : 'create', resource.key, result.id, resource.label[0]);
  refresh([`/admin/${resource.key}`]);

  const target = resource.pk === 'key'
    ? `/admin/${resource.key}/${encodeURIComponent(result.id)}`
    : `/admin/${resource.key}/${result.id}`;
  redirect(`${target}?saved=1`);
}

export async function deleteResourceAction(resourceKey: string, id: string): Promise<void> {
  await requireSession();
  const resource = getResource(resourceKey);
  if (!resource) return;
  const db = await ensureDatabase();
  await deleteRow(resource, id, db);
  await logActivity('delete', resource.key, id, resource.label[0]);
  refresh([`/admin/${resource.key}`]);
  redirect(`/admin/${resource.key}?deleted=1`);
}

export async function duplicateResourceAction(resourceKey: string, id: string): Promise<void> {
  await requireSession();
  const resource = getResource(resourceKey);
  if (!resource) return;
  const db = await ensureDatabase();
  const result = await duplicateRow(resource, id, db);
  await logActivity('duplicate', resource.key, result.ok ? result.id : id, resource.label[0]);
  refresh([`/admin/${resource.key}`]);
  redirect(result.ok ? `/admin/${resource.key}/${result.id}?saved=1` : `/admin/${resource.key}`);
}

/* ── Réglages ────────────────────────────────────────────────────── */

export async function saveSettingsAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  await requireSession();
  const db = await ensureDatabase();

  for (const def of SETTINGS_DEFS) {
    if (def.internal) continue;
    const raw = formData.get(def.key);
    if (raw === null && def.type !== 'boolean') continue;

    let value: unknown;
    switch (def.type) {
      case 'number':
        value = Number(String(raw ?? '').replace(',', '.')) || 0;
        break;
      case 'boolean':
        value = formData.get(def.key) === 'on' || formData.get(def.key) === 'true';
        break;
      case 'list':
        value = String(raw ?? '')
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean);
        break;
      default:
        value = String(raw ?? '');
        break;
    }

    await db.query(
      `insert into settings (key, value) values ($1, $2::jsonb)
       on conflict (key) do update set value = excluded.value, updated_at = now()`,
      [def.key, JSON.stringify(value)],
    );
  }

  await logActivity('update', 'settings', 'site', 'Réglages du site');
  refresh(['/admin/settings']);
  return { ok: true, message: 'saved' };
}

/* ── Commandes, devis, abonnés ───────────────────────────────────── */

export async function updateOrderStatusAction(id: string, status: string): Promise<void> {
  await requireSession();
  const allowed = ['new', 'confirmed', 'shipped', 'delivered', 'cancelled'];
  if (!allowed.includes(status)) return;
  const db = await ensureDatabase();
  await db.query('update orders set status = $1, updated_at = now() where id = $2', [status, Number(id)]);
  await logActivity('update', 'orders', id, `Statut : ${status}`);
  refresh([`/admin/orders/${id}`, '/admin/orders']);
}

export async function deleteOrderAction(id: string): Promise<void> {
  await requireSession();
  const db = await ensureDatabase();
  await db.query('delete from orders where id = $1', [Number(id)]);
  await logActivity('delete', 'orders', id);
  refresh(['/admin/orders']);
  redirect('/admin/orders');
}

export async function updateQuoteStatusAction(id: string, status: string): Promise<void> {
  await requireSession();
  if (!['new', 'in_progress', 'done'].includes(status)) return;
  const db = await ensureDatabase();
  await db.query('update quotes set status = $1, updated_at = now() where id = $2', [status, Number(id)]);
  await logActivity('update', 'quotes', id, `Statut : ${status}`);
  refresh(['/admin/quotes']);
}

export async function deleteQuoteAction(id: string): Promise<void> {
  await requireSession();
  const db = await ensureDatabase();
  await db.query('delete from quotes where id = $1', [Number(id)]);
  await logActivity('delete', 'quotes', id);
  refresh(['/admin/quotes']);
}

export async function deleteSubscriberAction(id: string): Promise<void> {
  await requireSession();
  const db = await ensureDatabase();
  await db.query('delete from subscribers where id = $1', [Number(id)]);
  refresh(['/admin/subscribers']);
}


