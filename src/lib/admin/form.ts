/**
 * Conversions entre les lignes de la base et les valeurs de formulaire.
 * Module neutre (ni serveur ni client) : utilisable des deux côtés.
 */
import type { Row } from '../db';
import type { FieldDef, ResourceDef } from './resources';

export type FieldValue = string | number | boolean | null | [string, string];
export type FormValues = Record<string, FieldValue>;

function cell(row: Row, column: string): unknown {
  const value = row[column];
  return value === undefined || value === null ? '' : value;
}

/** Valeurs initiales d'un formulaire d'édition. */
export function rowToValues(resource: ResourceDef, row: Row | null): FormValues {
  const values: FormValues = {};
  for (const field of resource.fields) {
    if (!row) {
      const fallback = field.default;
      if (Array.isArray(fallback)) values[field.name] = [fallback[0], fallback[1]];
      else if (field.type === 'boolean') values[field.name] = Boolean(fallback ?? false);
      else if (field.type === 'number') values[field.name] = fallback === undefined || fallback === null ? '' : Number(fallback);
      else values[field.name] = fallback === undefined || fallback === null ? '' : String(fallback);
      continue;
    }
    if (field.type === 'bilingual-text' || field.type === 'bilingual-textarea') {
      values[field.name] = [String(cell(row, `${field.name}_ar`)), String(cell(row, `${field.name}_en`))];
    } else if (field.type === 'boolean') {
      values[field.name] = row[field.name] === true || row[field.name] === 'true';
    } else if (field.type === 'number') {
      const raw = cell(row, field.name);
      values[field.name] = raw === '' ? '' : Number(raw);
    } else if (field.type === 'reference') {
      const raw = cell(row, field.name);
      values[field.name] = raw === '' ? '' : String(raw);
    } else {
      values[field.name] = String(cell(row, field.name));
    }
  }
  return values;
}

/** Valeur affichée dans une liste. */
export function displayValue(field: FieldDef, row: Row): string {
  if (field.type === 'bilingual-text' || field.type === 'bilingual-textarea') {
    const ar = String(cell(row, `${field.name}_ar`));
    const en = String(cell(row, `${field.name}_en`));
    return ar || en || '—';
  }
  const raw = cell(row, field.name);
  if (field.type === 'boolean') return raw === true || raw === 'true' ? 'oui' : 'non';
  if (field.type === 'number') {
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? String(parsed) : '—';
  }
  return String(raw) || '—';
}

/** Champs regroupés pour l'affichage par sections dans le formulaire. */
export function groupFields(fields: FieldDef[]): { label: [string, string] | null; fields: FieldDef[] }[] {
  const groups: { label: [string, string] | null; fields: FieldDef[] }[] = [];
  for (const field of fields) {
    const label = field.group ?? null;
    const key = label ? label.join('|') : '';
    const existing = groups.find((group) => (group.label ? group.label.join('|') : '') === key);
    if (existing) existing.fields.push(field);
    else groups.push({ label, fields: [field] });
  }
  return groups;
}
