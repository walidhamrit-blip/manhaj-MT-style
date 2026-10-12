'use client';

import Link from 'next/link';
import { deleteResourceAction, duplicateResourceAction } from '@/lib/admin/actions';
import { tr, type AdminLang } from '@/lib/admin/i18n';

/** Boutons Modifier / Dupliquer / Supprimer d'une ligne de liste. */
export default function RowActions({
  resourceKey,
  id,
  lang,
  canDelete = true,
  canDuplicate = true,
}: {
  resourceKey: string;
  id: string;
  lang: AdminLang;
  canDelete?: boolean;
  canDuplicate?: boolean;
}) {
  const remove = deleteResourceAction.bind(null, resourceKey, id);
  const duplicate = duplicateResourceAction.bind(null, resourceKey, id);

  return (
    <div className="row-actions">
      <Link className="a-btn ghost small" href={`/admin/${resourceKey}/${encodeURIComponent(id)}`}>
        <i className="fa-solid fa-pen" /> {tr(lang, 'edit')}
      </Link>
      {canDuplicate ? (
        <form action={duplicate}>
          <button className="a-btn ghost small" type="submit" title={tr(lang, 'duplicate')}>
            <i className="fa-solid fa-clone" />
          </button>
        </form>
      ) : null}
      {canDelete ? (
        <form
          action={remove}
          onSubmit={(event) => {
            if (!window.confirm(tr(lang, 'confirmDelete'))) event.preventDefault();
          }}
        >
          <button className="a-btn danger small" type="submit" title={tr(lang, 'delete')}>
            <i className="fa-solid fa-trash" />
          </button>
        </form>
      ) : null}
    </div>
  );
}
