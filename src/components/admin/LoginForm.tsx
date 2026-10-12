'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { loginAction, type ActionState } from '@/lib/admin/actions';
import { tr, type AdminLang } from '@/lib/admin/i18n';

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button className="a-btn primary" type="submit" disabled={pending} style={{ width: '100%', justifyContent: 'center' }}>
      <i className={pending ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-right-to-bracket'} />
      {label}
    </button>
  );
}

export default function LoginForm({ lang, configured }: { lang: AdminLang; configured: boolean }) {
  const [state, formAction] = useActionState<ActionState, FormData>(loginAction, null);

  return (
    <form action={formAction}>
      {!configured ? (
        <div className="alert warn">
          <i className="fa-solid fa-triangle-exclamation" /> {tr(lang, 'notConfigured')}
        </div>
      ) : null}

      {state && !state.ok ? (
        <div className="alert err">
          <i className="fa-solid fa-circle-exclamation" />{' '}
          {state.message === 'wrongPassword' ? tr(lang, 'wrongPassword') : state.message}
        </div>
      ) : null}

      <div className="a-field">
        <label htmlFor="password">{tr(lang, 'password')}</label>
        <input id="password" name="password" type="password" required autoFocus dir="ltr" />
      </div>

      <div style={{ marginTop: 18 }}>
        <Submit label={tr(lang, 'signIn')} />
      </div>
    </form>
  );
}
