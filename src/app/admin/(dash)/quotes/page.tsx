import Link from 'next/link';
import StatusSelect from '@/components/admin/StatusSelect';
import { deleteQuoteAction, updateQuoteStatusAction } from '@/lib/admin/actions';
import { ensureDatabase, type Row } from '@/lib/db';
import { getAdminLang } from '@/lib/admin/page-data';
import { tr } from '@/lib/admin/i18n';
import { formatDate } from '@/lib/format';
import { QUOTE_STATUSES, QUOTE_STATUS_LABELS, statusLabel } from '@/lib/admin/status';

export const dynamic = 'force-dynamic';

export default async function QuotesPage({
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
    conditions.push(`(reference ilike $${params.length} or contact_name ilike $${params.length} or company ilike $${params.length} or phone ilike $${params.length})`);
  }
  if (query.status && (QUOTE_STATUSES as readonly string[]).includes(query.status)) {
    params.push(query.status);
    conditions.push(`status = $${params.length}`);
  }
  const where = conditions.length ? ` where ${conditions.join(' and ')}` : '';

  const rows = await db.query<Row>(`select * from quotes${where} order by created_at desc limit 200`, params);

  return (
    <>
      <div className="admin-top">
        <div>
          <h1>{tr(lang, 'statQuotes')}</h1>
          <p>
            {lang === 'ar'
              ? 'طلبات عروض الأسعار من المدارس والشركات.'
              : 'Demandes de devis envoyées par les écoles et les entreprises.'}
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
            {QUOTE_STATUSES.map((status) => (
              <option key={status} value={status}>
                {statusLabel(QUOTE_STATUS_LABELS, status, lang)}
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
                  <th>{tr(lang, 'company')}</th>
                  <th>{tr(lang, 'phone')}</th>
                  <th>{tr(lang, 'message')}</th>
                  <th>{tr(lang, 'status')}</th>
                  <th>{tr(lang, 'date')}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const id = String(row.id);
                  const phone = String(row.phone ?? '');
                  return (
                    <tr key={id}>
                      <td style={{ fontWeight: 800, color: 'var(--a-navy)' }}>{String(row.reference)}</td>
                      <td>{String(row.contact_name ?? '—')}</td>
                      <td>{String(row.company ?? '') || <span className="muted">—</span>}</td>
                      <td className="num" dir="ltr">
                        {phone || '—'}
                        {phone ? (
                          <a
                            className="a-btn ghost small"
                            style={{ marginInlineStart: 8 }}
                            href={`https://wa.me/${phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <i className="fa-brands fa-whatsapp" />
                          </a>
                        ) : null}
                      </td>
                      <td style={{ maxWidth: 320 }}>
                        <span className="muted">{String(row.message ?? '').slice(0, 120) || '—'}</span>
                      </td>
                      <td>
                        <StatusSelect
                          id={id}
                          current={String(row.status ?? 'new')}
                          lang={lang}
                          action={updateQuoteStatusAction}
                          options={QUOTE_STATUSES.map((value) => ({ value, label: QUOTE_STATUS_LABELS[value] }))}
                        />
                      </td>
                      <td className="num muted">{formatDate(String(row.created_at ?? ''), lang === 'ar' ? 'ar' : 'en')}</td>
                      <td>
                        <form action={deleteQuoteAction.bind(null, id)}>
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
            <i className="fa-solid fa-file-invoice" />
            {tr(lang, 'noQuotes')}
          </div>
        )}
      </div>
    </>
  );
}
