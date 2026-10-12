'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { tr, type AdminLang } from '@/lib/admin/i18n';

export type FilterDescriptor = {
  column: string;
  label: string;
  options: { value: string; label: string }[];
};

/**
 * Barre de recherche et de filtres des listes (produits, textes, liens…).
 * L'état est conservé dans l'URL pour permettre le partage et le retour arrière.
 */
export default function FilterBar({
  lang,
  filters,
  basePath,
}: {
  lang: AdminLang;
  filters: FilterDescriptor[];
  basePath: string;
}) {
  const router = useRouter();
  const params = useSearchParams();

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('page');
    const query = next.toString();
    router.push(query ? `${basePath}?${query}` : basePath);
  };

  return (
    <div className="toolbar">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const value = String(new FormData(event.currentTarget).get('q') ?? '');
          update('q', value);
        }}
      >
        <input type="search" name="q" defaultValue={params.get('q') ?? ''} placeholder={tr(lang, 'search')} />
        <button className="a-btn ghost" type="submit">
          <i className="fa-solid fa-magnifying-glass" />
        </button>
      </form>

      {filters.map((filter) => (
        <select
          key={filter.column}
          value={params.get(filter.column) ?? ''}
          onChange={(event) => update(filter.column, event.target.value)}
          style={{ padding: '9px 11px', border: '1px solid #cfd6da', borderRadius: 7, font: 'inherit', minWidth: 170 }}
        >
          <option value="">
            {filter.label} — {lang === 'ar' ? 'الكل' : 'tous'}
          </option>
          {filter.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ))}

      {params.toString() ? (
        <button className="a-btn ghost" type="button" onClick={() => router.push(basePath)}>
          <i className="fa-solid fa-xmark" /> {tr(lang, 'cancel')}
        </button>
      ) : null}
    </div>
  );
}
