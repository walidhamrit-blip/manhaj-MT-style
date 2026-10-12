import Link from 'next/link';
import { ensureDatabase } from '@/lib/db';
import { getAdminLang } from '@/lib/admin/page-data';
import { tr } from '@/lib/admin/i18n';
import { formatDate } from '@/lib/format';
import { ORDER_STATUSES, PAYMENT_LABELS, STATUS_LABELS, statusLabel } from '@/lib/admin/status';
import StatusSelect from '@/components/admin/StatusSelect';
import { updateOrderStatusAction } from '@/lib/admin/actions';
import type { Row } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const query = await searchParams;
  const lang = await getAdminLang();
  const db = await ensureDatabase();

  const conditions: string[] = [];
  const params: unknown[] = [];
  if (query.q) {
    params.push(`%${query.q}%`);
    conditions.push(`(reference ilike $${params.length} or customer_name ilike $${params.length} or phone ilike $${params.length})`);
  }
  if (query.status && ORDER_STATUSES.includes(query.status as (typeof ORDER_STATUSES)[number])) {
    params.push(query.status);
    conditions.push(`status = $${params.length}`);
  }
  const where = conditions.length ? ` where ${conditions.join(' and ')}` : '';

  const rows = await db.query<Row>(
    `select * from orders${where} order by created_at desc limit 200`,
    params,
  );

  return (
    <>
      <div className="admin-top">
        <div>
          <h1>{tr(lang, 'statOrders')}</h1>
          <p>
            {lang === 'ar'
              ? 'الطلبات الواردة من الموقع، مع إمكانية تغيير حالتها.'
              : 'Commandes reçues depuis le site, avec mise à jour du statut en un clic.'}
          </p>
        </div>
        <div className="actions">
          <Link className="a-btn ghost" href="/admin">
            <i className="fa-solid fa-gauge-high" /> {tr(lang, 'dashboard')}
          </Link>
        </div>
      </div>

      <div className="card">
        <form className="toolbar" method="get">
          <input type="search" name="q" defaultValue={query.q ?? ''} placeholder={tr(lang, 'search')} />
          <select name="status" defaultValue={query.status ?? ''} style={{ padding: '9px 11px', border: '1px solid #cfd6da', borderRadius: 7, font: 'inherit' }}>
            <option value="">{tr(lang, 'status')} — {lang === 'ar' ? 'الكل' : 'tous'}</option>
            {ORDER_STATUSES.map((status) => (
              <option key={status} value={status}>
                {statusLabel(STATUS_LABELS, status, lang)}
              </option>
            ))}
          </select>
          <button className="a-btn ghost" type="submit">
            <i className="fa-solid fa-magnifying-glass" /> {tr(lang, 'searchButton')}
          </button>
        </form>

        {rows.length ? (
          <div className="table-wrap">
            <table className="admin">
              <thead>
                <tr>
                  <th>{tr(lang, 'orderRef')}</th>
                  <th>{tr(lang, 'customer')}</th>
                  <th>{tr(lang, 'phone')}</th>
                  <th>{tr(lang, 'total')}</th>
                  <th>{tr(lang, 'payment')}</th>
                  <th>{tr(lang, 'status')}</th>
                  <th>{tr(lang, 'date')}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const id = String(row.id);
                  const status = String(row.status ?? 'new');
                  const payment = String(row.payment_method ?? '');
                  const paymentEntry = PAYMENT_LABELS[payment];
                  return (
                    <tr key={id}>
                      <td>
                        <Link href={`/admin/orders/${id}`} style={{ fontWeight: 800, color: 'var(--a-navy)' }}>
                          {String(row.reference)}
                        </Link>
                      </td>
                      <td>{String(row.customer_name ?? '—')}</td>
                      <td className="num" dir="ltr">{String(row.phone ?? '—')}</td>
                      <td className="num">{Number(row.total ?? 0).toFixed(2)}</td>
                      <td className="muted">{paymentEntry ? (lang === 'ar' ? paymentEntry[1] : paymentEntry[0]) : payment || '—'}</td>
                      <td>
                        <StatusSelect
                          id={id}
                          current={status}
                          lang={lang}
                          action={updateOrderStatusAction}
                          options={ORDER_STATUSES.map((value) => ({ value, label: STATUS_LABELS[value] }))}
                        />
                      </td>
                      <td className="num muted">{formatDate(String(row.created_at ?? ''), lang === 'ar' ? 'ar' : 'en')}</td>
                      <td>
                        <Link className="a-btn ghost small" href={`/admin/orders/${id}`}>
                          <i className="fa-solid fa-eye" /> {tr(lang, 'edit')}
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <i className="fa-solid fa-receipt" />
            {tr(lang, 'noOrders')}
          </div>
        )}
      </div>
    </>
  );
}
