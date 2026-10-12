'use client';

import { useState } from 'react';
import type { FieldDef } from '@/lib/admin/resources';
import type { AdminLang } from '@/lib/admin/i18n';
import { bilingual, tr } from '@/lib/admin/i18n';
import type { FieldValue } from '@/lib/admin/form';

export type ReferenceOptions = Record<string, { value: string; label: string }[]>;

function asString(value: FieldValue): string {
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) return value[0] ?? '';
  return String(value);
}

function asPair(value: FieldValue): [string, string] {
  if (Array.isArray(value)) return [value[0] ?? '', value[1] ?? ''];
  const text = value === null || value === undefined ? '' : String(value);
  return [text, text];
}

export default function FieldInput({
  field,
  value,
  lang,
  mediaOptions = [],
  referenceOptions = {},
}: {
  field: FieldDef;
  value: FieldValue;
  lang: AdminLang;
  mediaOptions?: string[];
  referenceOptions?: ReferenceOptions;
}) {
  const [imageValue, setImageValue] = useState(asString(value));
  const label = bilingual(lang, field.label);
  const wide = field.wide || field.type === 'bilingual-textarea' || field.type === 'textarea';

  return (
    <div className={`a-field${wide ? ' wide' : ''}`}>
      <label htmlFor={field.name}>
        {label}
        {field.required ? ' *' : ''}
      </label>
      {field.hint ? <span className="hint">{bilingual(lang, field.hint)}</span> : null}

      {renderControl()}
    </div>
  );

  function renderControl() {
    switch (field.type) {
      case 'bilingual-text': {
        const [ar, en] = asPair(value);
        return (
          <div className="pair">
            <div>
              <label htmlFor={`${field.name}_ar`}>العربية</label>
              <input id={`${field.name}_ar`} name={`${field.name}_ar`} type="text" dir="rtl" defaultValue={ar} />
            </div>
            <div>
              <label htmlFor={`${field.name}_en`}>English</label>
              <input id={`${field.name}_en`} name={`${field.name}_en`} type="text" dir="ltr" defaultValue={en} />
            </div>
          </div>
        );
      }
      case 'bilingual-textarea': {
        const [ar, en] = asPair(value);
        return (
          <div className="pair">
            <div>
              <label htmlFor={`${field.name}_ar`}>العربية</label>
              <textarea id={`${field.name}_ar`} name={`${field.name}_ar`} dir="rtl" defaultValue={ar} />
            </div>
            <div>
              <label htmlFor={`${field.name}_en`}>English</label>
              <textarea id={`${field.name}_en`} name={`${field.name}_en`} dir="ltr" defaultValue={en} />
            </div>
          </div>
        );
      }
      case 'textarea':
        return <textarea id={field.name} name={field.name} defaultValue={asString(value)} />;
      case 'boolean':
        return (
          <label className="checkbox" htmlFor={field.name}>
            <input id={field.name} name={field.name} type="checkbox" defaultChecked={value === true || value === 'true'} />
            <span>{bilingual(lang, field.label)}</span>
          </label>
        );
      case 'number':
        return (
          <input
            id={field.name}
            name={field.name}
            type="number"
            step="any"
            inputMode="decimal"
            defaultValue={asString(value)}
          />
        );
      case 'select':
        return (
          <select id={field.name} name={field.name} defaultValue={asString(value)}>
            {!field.required ? <option value="">—</option> : null}
            {(field.options ?? []).map((option) => (
              <option key={option.value} value={option.value}>
                {bilingual(lang, option.label)}
              </option>
            ))}
          </select>
        );
      case 'reference': {
        const options = referenceOptions[field.reference?.resource ?? ''] ?? [];
        return (
          <select id={field.name} name={field.name} defaultValue={asString(value)}>
            <option value="">—</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      }
      case 'image':
        return (
          <>
            <input
              id={field.name}
              name={field.name}
              type="text"
              dir="ltr"
              placeholder="https://…"
              value={imageValue}
              onChange={(event) => setImageValue(event.target.value)}
            />
            {imageValue ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="image-preview" src={imageValue} alt={tr(lang, 'imagePreview')} />
            ) : null}
            {mediaOptions.length ? (
              <>
                <span className="hint">{tr(lang, 'imageLibrary')}</span>
                <div className="library">
                  {mediaOptions.slice(0, 24).map((url) => (
                    <button key={url} type="button" title={url} onClick={() => setImageValue(url)}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="" loading="lazy" />
                    </button>
                  ))}
                </div>
              </>
            ) : null}
          </>
        );
      case 'text-ar':
        return <textarea id={field.name} name={field.name} dir="rtl" defaultValue={asString(value)} />;
      case 'text-en':
        return <textarea id={field.name} name={field.name} dir="ltr" defaultValue={asString(value)} />;
      default:
        return <input id={field.name} name={field.name} type="text" dir="ltr" defaultValue={asString(value)} />;
    }
  }
}
