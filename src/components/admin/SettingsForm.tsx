'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { saveSettingsAction, type ActionState } from '@/lib/admin/actions';
import { bilingual, tr, type AdminLang } from '@/lib/admin/i18n';
import { SETTING_GROUPS, SETTINGS_DEFS } from '@/lib/db/seed-texts';

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button className="a-btn primary" type="submit" disabled={pending}>
      <i className={pending ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-floppy-disk'} />
      {pending ? '…' : label}
    </button>
  );
}

function toDisplay(value: string | number | boolean | string[] | undefined): string {
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'boolean') return value ? 'true' : '';
  return value === undefined || value === null ? '' : String(value);
}

/** Formulaire des réglages du site (coordonnées, réseaux, devise, boutique). */
export default function SettingsForm({
  lang,
  values,
}: {
  lang: AdminLang;
  values: Record<string, string | number | boolean | string[]>;
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(saveSettingsAction, null);

  const groups = Object.keys(SETTING_GROUPS).map((groupKey) => ({
    key: groupKey,
    label: SETTING_GROUPS[groupKey],
    defs: SETTINGS_DEFS.filter((def) => def.group === groupKey && !def.internal),
  })).filter((group) => group.defs.length);

  return (
    <form action={formAction}>
      {state?.ok ? (
        <div className="alert ok">
          <i className="fa-solid fa-circle-check" /> {tr(lang, 'saved')}
        </div>
      ) : null}
      {state && !state.ok ? (
        <div className="alert err">
          <i className="fa-solid fa-triangle-exclamation" /> {state.message}
        </div>
      ) : null}

      {groups.map((group) => (
        <div className="card" key={group.key}>
          <h2>{bilingual(lang, group.label)}</h2>
          <div className="a-form-grid">
            {group.defs.map((def) => {
              const value = values[def.key];
              const label = bilingual(lang, def.label);
              const hint = def.hint ? bilingual(lang, def.hint) : '';
              return (
                <div className={`a-field${def.type === 'textarea' ? ' wide' : ''}`} key={def.key}>
                  <label htmlFor={def.key}>{label}</label>
                  {hint ? <span className="hint">{hint}</span> : null}

                  {def.type === 'boolean' ? (
                    <label className="checkbox" htmlFor={def.key}>
                      <input
                        id={def.key}
                        name={def.key}
                        type="checkbox"
                        defaultChecked={value === true || value === 'true'}
                      />
                      <span>{lang === 'ar' ? 'مُفعّل' : 'Activé'}</span>
                    </label>
                  ) : def.type === 'textarea' ? (
                    <textarea id={def.key} name={def.key} defaultValue={toDisplay(value)} />
                  ) : def.type === 'select' ? (
                    <select id={def.key} name={def.key} defaultValue={toDisplay(value)}>
                      {(def.options ?? []).map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id={def.key}
                      name={def.key}
                      type={def.type === 'number' ? 'number' : 'text'}
                      step={def.type === 'number' ? 'any' : undefined}
                      dir="ltr"
                      defaultValue={toDisplay(value)}
                    />
                  )}

                  {def.type === 'list' ? (
                    <span className="hint">
                      {lang === 'ar' ? 'مفصولة بفواصل' : 'Valeurs séparées par des virgules'}
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div className="form-actions">
        <Submit label={tr(lang, 'save')} />
      </div>
    </form>
  );
}
