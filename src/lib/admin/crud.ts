/**
 * Moteur CRUD générique.
 *
 * Les requêtes SQL sont construites uniquement à partir des colonnes déclarées
 * dans `resources.ts` (liste blanche) : aucune entrée utilisateur n'est
 * concaténée dans le SQL, toutes les valeurs sont passées en paramètres.
 */
import { ensureDatabase, type DbClient, type Row } from '../db';
import { fieldColumns, type FieldDef, type ResourceDef } from './resources';

export type Input = Record<string, unknown>;

export type ListOptions = {
  search?: string;
  limit?: number;
  offset?: number;
  filters?: Record<string, unknown>;
  orderBy?: string;
};

export type ListResult = {
  rows: Row[];
  total: number;
};

function allColumns(resource: ResourceDef): string[] {
  return resource.fields.flatMap(fieldColumns);
}

function findField(resource: ResourceDef, name: string): FieldDef | undefined {
  return resource.fields.find((f) => f.name === name);
}

/* ── Coercition des valeurs ──────────────────────────────────────── */

function applyField(
  field: FieldDef,
  input: Input,
  columns: string[],
  values: unknown[],
  options: { includeDefaults: boolean },
): void {
  const hasValue = Object.prototype.hasOwnProperty.call(input, field.name);
  const raw = input[field.name];
  const fallback = options.includeDefaults ? field.default : undefined;

  const toText = (v: unknown): string => {
    if (v === null || v === undefined) return String(fallback ?? '');
    return String(v);
  };
  const toNumber = (v: unknown): number | null => {
    if (v === null || v === undefined || v === '') {
      if (fallback === undefined || fallback === null || fallback === '') return null;
      const parsed = Number(fallback);
      return Number.isFinite(parsed) ? parsed : null;
    }
    const parsed = Number(v);
    return Number.isFinite(parsed) ? parsed : null;
  };
  const toBoolean = (v: unknown): boolean => {
    if (v === null || v === undefined) return Boolean(fallback ?? false);
    return v === true || v === 'true' || v === 'on' || v === 1 || v === '1';
  };

  switch (field.type) {
    case 'bilingual-text':
    case 'bilingual-textarea': {
      columns.push(`${field.name}_ar`, `${field.name}_en`);
      if (!hasValue) {
        if (Array.isArray(fallback)) {
          values.push(toText(fallback[0]), toText(fallback[1]));
        } else if (fallback !== undefined && fallback !== null && fallback !== '') {
          values.push(toText(fallback), toText(fallback));
        } else {
          values.push('', '');
        }
      } else {
        const pair = Array.isArray(raw) ? raw : [raw, raw];
        values.push(toText(pair[0]), toText(pair[1]));
      }
      break;
    }
    case 'number': {
      columns.push(field.name);
      values.push(hasValue || options.includeDefaults ? toNumber(raw) : null);
      break;
    }
    case 'boolean': {
      columns.push(field.name);
      values.push(hasValue || options.includeDefaults ? toBoolean(raw) : false);
      break;
    }
    case 'reference': {
      columns.push(field.name);
      values.push(hasValue ? toNumber(raw) : null);
      break;
    }
    default: {
      columns.push(field.name);
      values.push(hasValue || options.includeDefaults ? toText(raw) : '');
      break;
    }
  }
}

/** Transforme un formulaire (ou un JSON d'API) en colonnes + valeurs. */
export function buildValues(
  resource: ResourceDef,
  input: Input,
  options: { includeDefaults?: boolean } = {},
): { columns: string[]; values: unknown[] } {
  const columns: string[] = [];
  const values: unknown[] = [];
  for (const field of resource.fields) {
    applyField(field, input, columns, values, { includeDefaults: options.includeDefaults ?? false });
  }
  return { columns, values };
}

/* ── Lecture ─────────────────────────────────────────────────────── */

export async function listRows(
  resource: ResourceDef,
  options: ListOptions = {},
  db?: DbClient,
): Promise<ListResult> {
  const client = db ?? (await ensureDatabase());
  const where: string[] = [];
  const params: unknown[] = [];

  const search = (options.search ?? '').trim();
  if (search && resource.searchFields.length) {
    const conditions = resource.searchFields.map((col) => {
      params.push(`%${search}%`);
      return `${col} ilike $${params.length}`;
    });
    where.push(`(${conditions.join(' or ')})`);
  }

  for (const [key, value] of Object.entries(options.filters ?? {})) {
    if (value === undefined || value === null || value === '') continue;
    if (!allColumns(resource).includes(key)) continue;
    params.push(value);
    where.push(`${key} = $${params.length}`);
  }

  const whereSql = where.length ? ` where ${where.join(' and ')}` : '';
  const limit = Math.min(Math.max(Number(options.limit ?? 100), 1), 500);
  const offset = Math.max(Number(options.offset ?? 0), 0);
  const orderBy = options.orderBy && allColumns(resource).includes(options.orderBy)
    ? options.orderBy
    : resource.orderBy;

  const rows = await client.query<Row>(
    `select * from ${resource.table}${whereSql} order by ${orderBy} limit ${limit} offset ${offset}`,
    params,
  );
  const countRows = await client.query<Row>(
    `select count(*)::int as total from ${resource.table}${whereSql}`,
    params,
  );

  return { rows, total: Number(countRows[0]?.total ?? rows.length) };
}

export async function getRow(resource: ResourceDef, id: string, db?: DbClient): Promise<Row | null> {
  const client = db ?? (await ensureDatabase());
  const rows = await client.query<Row>(
    `select * from ${resource.table} where ${resource.pk} = $1 limit 1`,
    [resource.pk === 'id' ? Number(id) : id],
  );
  return rows[0] ?? null;
}

/* ── Écriture ────────────────────────────────────────────────────── */

export type WriteResult = { ok: true; id: string } | { ok: false; error: string };

export async function createRow(resource: ResourceDef, input: Input, db?: DbClient): Promise<WriteResult> {
  const client = db ?? (await ensureDatabase());
  if (resource.canCreate === false) return { ok: false, error: 'Création désactivée pour cette ressource.' };

  const { columns, values } = buildValues(resource, input, { includeDefaults: true });

  /* Clé primaire textuelle (textes) : fournie par l'utilisateur. */
  if (resource.pk === 'key') {
    const keyValue = String(input[resource.pk] ?? '').trim();
    if (!keyValue) return { ok: false, error: 'La clé est obligatoire.' };
    if (columns.includes(resource.pk)) {
      const index = columns.indexOf(resource.pk);
      values[index] = keyValue;
    } else {
      columns.unshift(resource.pk);
      values.unshift(keyValue);
    }
  }

  if (!columns.length) return { ok: false, error: 'Aucun champ à enregistrer.' };

  const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
  const returning = resource.pk === 'key' ? resource.pk : 'id';

  try {
    const rows = await client.query<Row>(
      `insert into ${resource.table} (${columns.join(', ')})
       values (${placeholders})
       returning ${returning}`,
      values,
    );
    const id = rows[0]?.[returning];
    return { ok: true, id: String(id ?? '') };
  } catch (error) {
    return { ok: false, error: readableError(error) };
  }
}

export async function updateRow(
  resource: ResourceDef,
  id: string,
  input: Input,
  db?: DbClient,
): Promise<WriteResult> {
  const client = db ?? (await ensureDatabase());
  const { columns, values } = buildValues(resource, input);
  if (!columns.length) return { ok: false, error: 'Aucun champ à enregistrer.' };

  const pkParam = values.length + 1;
  const pkValue = resource.pk === 'id' ? Number(id) : id;

  const run = (withTimestamp: boolean) => {
    const sets = columns.map((col, i) => `${col} = $${i + 1}`);
    if (withTimestamp) sets.push('updated_at = now()');
    return client.query<Row>(
      `update ${resource.table} set ${sets.join(', ')}
        where ${resource.pk} = $${pkParam}
        returning ${resource.pk}`,
      [...values, pkValue],
    );
  };

  try {
    const rows = await run(true);
    if (!rows.length) return { ok: false, error: 'Élément introuvable.' };
    return { ok: true, id };
  } catch (error) {
    /* La table `media` ne possède pas de colonne updated_at. */
    if (String(error instanceof Error ? error.message : error).includes('updated_at')) {
      try {
        const rows = await run(false);
        if (!rows.length) return { ok: false, error: 'Élément introuvable.' };
        return { ok: true, id };
      } catch (retryError) {
        return { ok: false, error: readableError(retryError) };
      }
    }
    return { ok: false, error: readableError(error) };
  }
}

export async function deleteRow(resource: ResourceDef, id: string, db?: DbClient): Promise<WriteResult> {
  const client = db ?? (await ensureDatabase());
  if (resource.canDelete === false) return { ok: false, error: 'Suppression désactivée pour cette ressource.' };
  try {
    await client.query(
      `delete from ${resource.table} where ${resource.pk} = $1`,
      [resource.pk === 'id' ? Number(id) : id],
    );
    return { ok: true, id };
  } catch (error) {
    return { ok: false, error: readableError(error) };
  }
}

/** Duplique une ligne (pratique pour créer plusieurs produits similaires). */
export async function duplicateRow(resource: ResourceDef, id: string, db?: DbClient): Promise<WriteResult> {
  const client = db ?? (await ensureDatabase());
  const row = await getRow(resource, id, client);
  if (!row) return { ok: false, error: 'Élément introuvable.' };
  const input: Input = {};
  for (const field of resource.fields) {
    if (field.type === 'bilingual-text' || field.type === 'bilingual-textarea') {
      input[field.name] = [row[`${field.name}_ar`], row[`${field.name}_en`]];
    } else {
      input[field.name] = row[field.name];
    }
  }
  const suffix = ' (copie)';
  for (const candidate of ['name', 'title', 'label'] as const) {
    const value = input[candidate];
    if (typeof value === 'string') {
      input[candidate] = `${value}${suffix}`;
      break;
    }
    if (Array.isArray(value) && typeof value[0] === 'string') {
      input[candidate] = [`${value[0]}${suffix}`, value[1]];
      break;
    }
  }
  return createRow(resource, input, client);
}

/** Ajoute une entrée au journal d'activité (best effort). */
export async function logActivity(
  action: string,
  resource: string,
  resourceId: string | number,
  detail = '',
  db?: DbClient,
): Promise<void> {
  try {
    const client = db ?? (await ensureDatabase());
    await client.query(
      `insert into activity_log (action, resource, resource_id, detail) values ($1, $2, $3, $4)`,
      [action, resource, String(resourceId), detail],
    );
  } catch {
    /* le journal ne doit jamais faire échouer une action métier */
  }
}

export function readableError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes('duplicate key')) {
    if (message.includes('brands_name_group')) {
      return 'Cette marque existe déjà dans ce ruban (mêmes nom et ruban).';
    }
    if (message.includes('slug')) return 'Cet identifiant (slug) est déjà utilisé.';
    if (message.includes('key')) return 'Cette clé existe déjà.';
    if (message.includes('email')) return 'Cet e-mail est déjà enregistré.';
    if (message.includes('url')) return 'Cette image est déjà dans la bibliothèque.';
    return 'Cet enregistrement existe déjà.';
  }
  if (message.includes('violates not-null')) return 'Un champ obligatoire est vide.';
  if (message.includes('invalid input syntax')) return 'Valeur invalide dans un des champs.';
  if (message.includes('relation') && message.includes('does not exist')) {
    return 'La base de données n’est pas encore installée (rechargez la page).';
  }
  return message.slice(0, 300);
}

export { findField };
