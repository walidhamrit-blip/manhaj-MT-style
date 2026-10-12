import { redirect } from 'next/navigation';
import Sidebar from '@/components/admin/Sidebar';
import { getAdminContext, getAdminLang, getCounts } from '@/lib/admin/page-data';
import { hasValidSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * Coquille du panneau d'administration : vérifie la session puis affiche la
 * barre latérale. Les données affichées proviennent de la base (Neon en ligne).
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await hasValidSession())) redirect('/admin/login');

  const lang = await getAdminLang();
  const [counts, context] = await Promise.all([getCounts(), getAdminContext()]);

  return (
    <div className="admin-root" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="admin-shell" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <Sidebar lang={lang} counts={counts} brandLatin={context.brandLatin} />
        <div className="admin-main">{children}</div>
      </div>
    </div>
  );
}
