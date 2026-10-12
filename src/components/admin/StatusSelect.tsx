'use client';

import { useState, useTransition } from 'react';
import { bilingual, tr, type AdminLang } from '@/lib/admin/i18n';

/**
 * Liste déroulante qui enregistre immédiatement le nouveau statut
 * (commande ou demande de devis) via une action serveur.
 */
export default function StatusSelect({
  id,
  current,
  options,
  lang,
  action,
}: {
  id: string;
  current: string;
  options: { value: string; label: [string, string] }[];
  lang: AdminLang;
  action: (id: string, status: string) => Promise<void>;
}) {
  const [value, setValue] = useState(current);
  const [pending, startTransition] = useTransition();

  return (
    <select
      value={value}
      disabled={pending}
      aria-label={tr(lang, 'updateStatus')}
      onChange={(event) => {
        const next = event.target.value;
        setValue(next);
        startTransition(() => {
          void action(id, next);
        });
      }}
      style={{
        padding: '7px 10px',
        border: '1px solid #cfd6da',
        borderRadius: 7,
        font: 'inherit',
        fontSize: 12,
        minWidth: 150,
        opacity: pending ? 0.6 : 1,
      }}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {bilingual(lang, option.label)}
        </option>
      ))}
    </select>
  );
}
