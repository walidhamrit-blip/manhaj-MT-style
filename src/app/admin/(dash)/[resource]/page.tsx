import Link from 'next/link';
import { notFound } from 'next/navigation';
import FilterBar, { type FilterDescriptor } from '@/components/admin/FilterBar';
import RowActions from '@/components/admin/RowActions';
import { ensureDatabase, type Row } from '@/lib/db';
import { listRows } from '@/lib/admin/crud';
import { displayValue } from '@/lib/admin/form';
import { bilingual, tr } from '@/lib/admin/i18n';
import { getAdminLang, getReferenceOptions } from '@/lib/admin/page-data';
import { getResource, rowLabel, type ResourceDef } from '@/lib/admin/resources';

export const dynamic = 'force-dynamic';

const PER_PAGE = 25;

type SearchParams = Record<string, string | string[] | undefined>;

function single(params: SearchParams, key: string): string {
  const value = params[key];
  return Array.isArray(value) ? value[0] ?? '' : value ?? '';
}

/** Options de filtre : soit fixes, soit chargées depuis une autre table. */
async function buildFilters(
  resource: ResourceDef,
  db: Awaited<ReturnType<typeof ensureDatabase>>,
  lang: 'fr' | 'ar',
): Promise<FilterDescriptor[]> {
  const descriptors: FilterDescriptor[] = [];
  for (const filter of resource.filters ?? []) {
    if (filter.options) {
      descriptors.push({
        column: filter.column,
        label: bilingual(lang, filter.label),
        options: filter.options.map((option) => ({
          value: option.value,
          label: bilingual(lang, option.label),
        })),
      });
      continue;
    }
    if (filter.dynamicFrom) {
      const target = getResource(filter.dynamicFrom);
      if (!target) continue;
      const rows = await db.query<Row>(
        `select ${target.pk}, ${target.labelField}${target.labelFieldEn ? `, ${target.labelFieldEn}` : ''}
           from ${target.table} order by ${target.orderBy} limit 200`,
      );
      descriptors.push({
        column: filter.column,
        label: bilingual(lang, filter.label),
        options: rows.map((row) => ({
          value: String(row[target.pk]),
          label: rowLabel(row, target, lang === 'ar' ? 'ar' : 'en'),
        })),
      });
    }
  }
  return descriptors;
}

export default async function ResourceListPage({
  params,
  searchParams,
}: {
  params: Promise<{ resource: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { resource: resourceKey } = await params;
  const query = await searchParams;
  const resource = getResource(resourceKey);
  if (!resource) notFound();

  const lang = await getAdminLang();
  const db = await ensureDatabase();

  const page = Math.max(1, Number(single(query, 'page') || 1));
  const filters: Record<string, unknown> = {};
  for (const filter of resource.filters ?? []) {
    const value = single(query, filter.column);
    if (value) filters[filter.column] = filter.column.endsWith('_id') || filter.column === 'category_id' ? Number(value) : value;
  }

  const [{ rows, total }, filterDescriptors, referenceOptions] = await Promise.all([
    listRows(resource, {
      search: single(query, 'q'),
      limit: PER_PAGE,
      offset: (page - 1) * PER_PAGE,
      filters,
    }, db),
    buildFilters(resource, db, lang),
    getReferenceOptions(resource, db),
  ]);

  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  const listFields = resource.fields.filter((field) => field.showInList);
  const canCreate = resource.canCreate !== false;
  const currentQuery = new URLSearchParams(
    Object.entries(query).flatMap(([key, value]) => {
      const text = Array.isArray(value) ? value[0] : value;
      return text ? [[key, text] as [string, string]] : [];
    }),
  );

  return (
    <>
      <div className="admin-top">
        <div>
          <h1>{bilingual(lang, resource.labelPlural)}</h1>
          {resource.description ? <p>{bilingual(lang, resource.description)}</p> : null}
        </div>
        <div className="actions">
          <Link className="a-btn ghost" href="/admin">
            <i className="fa-solid fa-gauge-high" /> {tr(lang, 'dashboard')}
          </Link>
          {canCreate ? (
            <Link className="a-btn primary" href={`/admin/${resource.key}/new`}>
              <i className="fa-solid fa-plus" /> {tr(lang, 'create')}
            </Link>
          ) : null}
        </div>
      </div>

      {query.deleted ? (
        <div className="alert ok">
          <i className="fa-solid fa-circle-check" /> {tr(lang, 'saved')}
        </div>
      ) : null}

      <div className="card">
        <FilterBar lang={lang} filters={filterDescriptors} basePath={`/admin/${resource.key}`} />

        {rows.length ? (
          <div className="table-wrap">
            <table className="admin">
              <thead>
                <tr>
                  {listFields.map((field) => (
                    <th key={field.name}>{bilingual(lang, field.label)}</th>
                  ))}
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const id = String(row[resource.pk]);
                  return (
                    <tr key={id}>
                      {listFields.map((field) => {
                        if (field.type === 'image') {
                          const url = String(row[field.name] ?? '');
                          return (
                            <td key={field.name}>
                              {url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img className="thumb" src={url} alt="" loading="lazy" />
                              ) : (
                                <span className="muted">—</span>
                              )}
                            </td>
                          );
                        }
                        if (field.type === 'boolean') {
                          const on = row[field.name] === true || row[field.name] === 'true';
                          return (
                            <td key={field.name}>
                              <span className={`pill ${on ? 'on' : 'off'}`}>
                                {on ? tr(lang, 'visible') : tr(lang, 'hidden')}
                              </span>
                            </td>
                          );
                        }
                        if (field.type === 'text-ar') {
                          const ar = String(row.ar ?? '');
                          return (
                            <td key={field.name} dir="rtl" style={{ maxWidth: 320 }}>
                              {ar || <span className="muted">—</span>}
                            </td>
                          );
                        }
                        if (field.type === 'reference') {
                          const raw = row[field.name];
                          const options = referenceOptions[field.reference?.resource ?? ''] ?? [];
                          const match = options.find((option) => option.value === String(raw ?? ''));
                          return (
                            <td key={field.name}>
                              {match ? match.label : <span className="muted">—</span>}
                            </td>
                          );
                        }
                        return (
                          <td key={field.name} style={{ maxWidth: 340 }}>
                            {displayValue(field, row)}
                          </td>
                        );
                      })}
                      <td>
                        <RowActions
                          resourceKey={resource.key}
                          id={id}
                          lang={lang}
                          canDelete={resource.canDelete !== false}
                          canDuplicate={resource.pk === 'id'}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <i className={resource.icon} />
            <div>{tr(lang, 'noResults')}</div>
            {canCreate ? <div className="hint">{tr(lang, 'noResultsHint')}</div> : null}
          </div>
        )}

        {pages > 1 ? (
          <div className="pagination">
            {Array.from({ length: pages }).slice(0, 12).map((_, index) => {
              const target = new URLSearchParams(currentQuery);
              target.set('page', String(index + 1));
              const active = index + 1 === page;
              return (
                <Link
                  key={index}
                  href={`/admin/${resource.key}?${target.toString()}`}
                  className={active ? 'a-btn primary small' : 'a-btn ghost small'}
                >
                  {index + 1}
                </Link>
              );
            })}
            <span>
              {total} {tr(lang, 'results')}
            </span>
          </div>
        ) : (
          <div className="pagination">
            {total} {tr(lang, 'results')}
          </div>
        )}
      </div>
    </>
  );
}
