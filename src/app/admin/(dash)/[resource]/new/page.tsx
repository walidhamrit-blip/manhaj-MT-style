import Link from 'next/link';
import { notFound } from 'next/navigation';
import ResourceForm from '@/components/admin/ResourceForm';
import { ensureDatabase } from '@/lib/db';
import { rowToValues } from '@/lib/admin/form';
import { bilingual, tr } from '@/lib/admin/i18n';
import { getAdminLang, getMediaOptions, getReferenceOptions } from '@/lib/admin/page-data';
import { getResource } from '@/lib/admin/resources';

export const dynamic = 'force-dynamic';

export default async function ResourceCreatePage({ params }: { params: Promise<{ resource: string }> }) {
  const { resource: resourceKey } = await params;
  const resource = getResource(resourceKey);
  if (!resource || resource.canCreate === false) notFound();

  const lang = await getAdminLang();
  const db = await ensureDatabase();
  const hasImage = resource.fields.some((field) => field.type === 'image');
  const [mediaOptions, referenceOptions] = await Promise.all([
    hasImage ? getMediaOptions(db) : Promise.resolve([]),
    getReferenceOptions(resource, db),
  ]);

  return (
    <>
      <div className="admin-top">
        <div>
          <h1>
            {tr(lang, 'create')} — {bilingual(lang, resource.label)}
          </h1>
          <Link className="hint" href={`/admin/${resource.key}`}>
            <i className="fa-solid fa-arrow-right" /> {bilingual(lang, resource.labelPlural)}
          </Link>
        </div>
      </div>

      <ResourceForm
        resource={resource}
        values={rowToValues(resource, null)}
        id={null}
        lang={lang}
        mediaOptions={mediaOptions}
        referenceOptions={referenceOptions}
        saved={false}
      />
    </>
  );
}
