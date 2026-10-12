import Link from 'next/link';
import { notFound } from 'next/navigation';
import ResourceForm from '@/components/admin/ResourceForm';
import RowActions from '@/components/admin/RowActions';
import { ensureDatabase } from '@/lib/db';
import { getRow } from '@/lib/admin/crud';
import { rowToValues } from '@/lib/admin/form';
import { bilingual, tr } from '@/lib/admin/i18n';
import { getAdminLang, getMediaOptions, getReferenceOptions } from '@/lib/admin/page-data';
import { getResource, rowLabel } from '@/lib/admin/resources';

export const dynamic = 'force-dynamic';

export default async function ResourceEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ resource: string; id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { resource: resourceKey, id } = await params;
  const query = await searchParams;
  const resource = getResource(resourceKey);
  if (!resource) notFound();

  const lang = await getAdminLang();
  const db = await ensureDatabase();
  const row = await getRow(resource, decodeURIComponent(id), db);
  if (!row) notFound();

  const hasImage = resource.fields.some((field) => field.type === 'image');
  const [mediaOptions, referenceOptions] = await Promise.all([
    hasImage ? getMediaOptions(db) : Promise.resolve([]),
    getReferenceOptions(resource, db),
  ]);

  return (
    <>
      <div className="admin-top">
        <div>
          <h1>{bilingual(lang, resource.label)}</h1>
          <p>
            <strong style={{ color: 'var(--a-navy)' }}>{rowLabel(row, resource)}</strong>
            {' · '}
            <Link className="hint" href={`/admin/${resource.key}`}>
              {bilingual(lang, resource.labelPlural)}
            </Link>
          </p>
        </div>
        <div className="actions">
          <RowActions
            resourceKey={resource.key}
            id={String(row[resource.pk])}
            lang={lang}
            canDelete={resource.canDelete !== false}
            canDuplicate={resource.pk === 'id'}
          />
        </div>
      </div>

      <ResourceForm
        resource={resource}
        values={rowToValues(resource, row)}
        id={String(row[resource.pk])}
        lang={lang}
        mediaOptions={mediaOptions}
        referenceOptions={referenceOptions}
        saved={Boolean(query.saved)}
      />

      <p className="hint" style={{ marginTop: 14 }}>
        {resource.pk === 'id' ? `${tr(lang, 'id')} : ${String(row[resource.pk])}` : `${tr(lang, 'technicalKey')} : ${String(row[resource.pk])}`}
      </p>
    </>
  );
}
