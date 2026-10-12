'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import FieldInput, { type ReferenceOptions } from './FieldInput';
import { saveResourceAction, type ActionState } from '@/lib/admin/actions';
import { bilingual, tr, type AdminLang } from '@/lib/admin/i18n';
import type { ResourceDef } from '@/lib/admin/resources';
import { groupFields, type FormValues } from '@/lib/admin/form';

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button className="a-btn primary" type="submit" disabled={pending}>
      <i className={pending ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-floppy-disk'} />
      {pending ? '…' : label}
    </button>
  );
}

/**
 * Formulaire générique piloté par la configuration de la ressource :
 * un seul composant pour les produits, bandeaux, magasins, textes, etc.
 */
export default function ResourceForm({
  resource,
  values,
  id,
  lang,
  mediaOptions,
  referenceOptions,
  saved,
}: {
  resource: ResourceDef;
  values: FormValues;
  id: string | null;
  lang: AdminLang;
  mediaOptions: string[];
  referenceOptions: ReferenceOptions;
  saved: boolean;
}) {
  const action = saveResourceAction.bind(null, resource.key, id);
  const [state, formAction] = useActionState<ActionState, FormData>(action, null);
  const groups = groupFields(resource.fields);

  return (
    <form action={formAction}>
      {saved ? (
        <div className="alert ok">
          <i className="fa-solid fa-circle-check" /> {tr(lang, 'saved')}
        </div>
      ) : null}
      {state && !state.ok ? (
        <div className="alert err">
          <i className="fa-solid fa-triangle-exclamation" />{' '}
          {state.message === 'wrongPassword' ? tr(lang, 'wrongPassword') : state.message}
        </div>
      ) : null}

      {groups.map((group) => (
        <div className="card" key={group.label ? group.label.join('|') : 'default'}>
          {group.label ? <h2>{bilingual(lang, group.label)}</h2> : null}
          <div className="a-form-grid">
            {group.fields.map((field) => (
              <FieldInput
                key={field.name}
                field={field}
                value={values[field.name] ?? ''}
                lang={lang}
                mediaOptions={mediaOptions}
                referenceOptions={referenceOptions}
              />
            ))}
          </div>
        </div>
      ))}

      <div className="form-actions">
        <SubmitButton label={tr(lang, 'save')} />
        <Link className="a-btn ghost" href={`/admin/${resource.key}`}>
          <i className="fa-solid fa-arrow-right-from-bracket" /> {tr(lang, 'cancel')}
        </Link>
        <span className="spacer" />
        <span className="hint">{tr(lang, 'requiredFields')}</span>
      </div>
    </form>
  );
}
