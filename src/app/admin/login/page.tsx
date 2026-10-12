import { redirect } from 'next/navigation';
import LoginForm from '@/components/admin/LoginForm';
import { getAdminLang } from '@/lib/admin/page-data';
import { tr } from '@/lib/admin/i18n';
import { hasValidSession, isAdminConfigured } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  if (await hasValidSession()) redirect('/admin');

  const lang = await getAdminLang();

  return (
    <div className="admin-root" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="login-page">
        <div className="login-card">
          <span className="mark">M</span>
          <h1>{tr(lang, 'loginTitle')}</h1>
          <p>{tr(lang, 'loginIntro')}</p>
          <LoginForm lang={lang} configured={isAdminConfigured()} />
          <p style={{ marginTop: 20, marginBottom: 0, fontSize: 11.5 }}>
            {'شركة المنهج للقرطاسية · Al Manhaj Stationery'}
          </p>
        </div>
      </div>
    </div>
  );
}
