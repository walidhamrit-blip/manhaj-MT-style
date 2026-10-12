import Link from 'next/link';
import { deleteSubscriberAction } from '@/lib/admin/actions';
import { ensureDatabase, type Row } from '@/lib/db';
import { getAdminLang } from '@/lib/admin/page-data';
import { tr } from '@/lib/admin/i18n';
import { formatDate } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function SubscribersPage() {
  const lang = await getAdminLang();
  const db = await ensureDatabase();
  const rows = await db.query<Row>('select * from subscribers order by created_at desc limit 500');

  return (
    <>
      <div className="admin-top">
        <div>
          <h1>{tr(lang, 'statSubscribers')}</h1>
          <p>
            {lang === 'ar'
              ? 'عناوين البريد الإلكتروني المسجلة في النشرة البريدية.'
              : 'Adresses e-mail collectées via le formulaire d’abonnement du pied de page.'}
          </p>
        </div>
        <div className="actions">
          <a className="a-btn ghost" href="/api/admin/subscribers/export">
            <i className="fa-solid fa-file-csv" /> {tr(lang, 'exportCsv')}
          </a>
          <Link className="a-btn ghost" href="/admin">
            <i className="fa-solid fa-gauge-high" /> {tr(lang, 'dashboard')}
          </Link>
        </div>
      </div>

      <div className="card">
        {rows.length ? (
          <div className="table-wrap">
            <table className="admin">
              <thead>
                <tr>
                  <th>{tr(lang, 'email')}</th>
                  <th>{tr(lang, 'status')}</th>
                  <th>{tr(lang, 'subscribedAt')}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const id = String(row.id);
                  return (
                    <tr key={id}>
                      <td dir="ltr">{String(row.email)}</td>
                      <td>
                        <span className={`pill ${String(row.status) === 'active' ? 'on' : 'off'}`}>
                          {String(row.status)}
                        </span>
                      </td>
                      <td className="num muted">
                        {formatDate(String(row.created_at ?? ''), lang === 'ar' ? 'ar' : 'en')}
                      </td>
                      <td>
                        <form action={deleteSubscriberAction.bind(null, id)}>
                          <button className="a-btn danger small" type="submit">
                            <i className="fa-solid fa-trash" />
                          </button>
                        </form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <i className="fa-solid fa-envelope-open-text" />
            {tr(lang, 'noSubscribers')}
          </div>
        )}
      </div>
    </>
  );
}
