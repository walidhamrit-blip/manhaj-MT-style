import Link from 'next/link';
import { notFound } from 'next/navigation';
import StatusSelect from '@/components/admin/StatusSelect';
import { deleteOrderAction, updateOrderStatusAction } from '@/lib/admin/actions';
import { ensureDatabase, type Row } from '@/lib/db';
import { getAdminLang } from '@/lib/admin/page-data';
import { tr } from '@/lib/admin/i18n';
import { formatDate } from '@/lib/format';
import { ORDER_STATUSES, PAYMENT_LABELS, STATUS_LABELS, statusLabel } from '@/lib/admin/status';

export const dynamic = 'force-dynamic';

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lang = await getAdminLang();
  const db = await ensureDatabase();

  const orders = await db.query<Row>('select * from orders where id = $1 limit 1', [Number(id)]);
  const order = orders[0];
  if (!order) notFound();

  const items = await db.query<Row>(
    'select * from order_items where order_id = $1 order by id',
    [Number(id)],
  );

  const paymentEntry = PAYMENT_LABELS[String(order.payment_method ?? '')];
  const details = [
    { label: tr(lang, 'orderRef'), value: String(order.reference) },
    { label: tr(lang, 'date'), value: formatDate(String(order.created_at ?? ''), lang === 'ar' ? 'ar' : 'en') },
    { label: tr(lang, 'customer'), value: String(order.customer_name ?? '—') },
    { label: tr(lang, 'phone'), value: String(order.phone ?? '—') },
    { label: tr(lang, 'city'), value: String(order.city ?? '—') },
    { label: tr(lang, 'address'), value: String(order.address ?? '—') },
    { label: tr(lang, 'payment'), value: paymentEntry ? (lang === 'ar' ? paymentEntry[1] : paymentEntry[0]) : String(order.payment_method ?? '—') },
    { label: tr(lang, 'note'), value: String(order.note ?? '') || '—' },
  ];

  const whatsappNumber = String(order.phone ?? '').replace(/[^0-9]/g, '');

  return (
    <>
      <div className="admin-top">
        <div>
          <h1>
            {tr(lang, 'orderRef')} {String(order.reference)}
          </h1>
          <p>
            <Link className="hint" href="/admin/orders">
              <i className="fa-solid fa-arrow-right" /> {tr(lang, 'statOrders')}
            </Link>
          </p>
        </div>
        <div className="actions">
          {whatsappNumber ? (
            <a
              className="a-btn ghost"
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fa-brands fa-whatsapp" /> WhatsApp
            </a>
          ) : null}
          <form
            action={deleteOrderAction.bind(null, String(order.id))}
          >
            <button className="a-btn danger" type="submit">
              <i className="fa-solid fa-trash" /> {tr(lang, 'delete')}
            </button>
          </form>
        </div>
      </div>

      <div className="card">
        <h2>{tr(lang, 'updateStatus')}</h2>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <StatusSelect
            id={String(order.id)}
            current={String(order.status ?? 'new')}
            lang={lang}
            action={updateOrderStatusAction}
            options={ORDER_STATUSES.map((value) => ({ value, label: STATUS_LABELS[value] }))}
          />
          <span className={`pill ${String(order.status)}`}>
            {statusLabel(STATUS_LABELS, String(order.status), lang)}
          </span>
        </div>
      </div>

      <div className="card">
        <h2>{tr(lang, 'customer')}</h2>
        <div className="detail-grid">
          {details.map((detail) => (
            <div className="item" key={detail.label}>
              <span>{detail.label}</span>
              <strong>{detail.value}</strong>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h2>{tr(lang, 'items')}</h2>
        <div className="table-wrap">
          <table className="admin">
            <thead>
              <tr>
                <th>{tr(lang, 'statProducts')}</th>
                <th>{tr(lang, 'total')}</th>
                <th>{tr(lang, 'items')}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={String(item.id)}>
                  <td>
                    <div dir="rtl" style={{ fontWeight: 700 }}>{String(item.name_ar ?? '')}</div>
                    <div dir="ltr" className="muted">{String(item.name_en ?? '')}</div>
                  </td>
                  <td className="num">{Number(item.price ?? 0).toFixed(2)}</td>
                  <td className="num">× {String(item.qty)}</td>
                  <td className="num">{Number(item.line_total ?? 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="detail-grid" style={{ marginTop: 16 }}>
          <div className="item">
            <span>{tr(lang, 'subtotal')}</span>
            <strong>{Number(order.subtotal ?? 0).toFixed(2)}</strong>
          </div>
          <div className="item">
            <span>{tr(lang, 'deliveryFee')}</span>
            <strong>{Number(order.delivery ?? 0).toFixed(2)}</strong>
          </div>
          <div className="item">
            <span>{tr(lang, 'total')}</span>
            <strong style={{ color: 'var(--a-red)', fontSize: 17 }}>{Number(order.total ?? 0).toFixed(2)}</strong>
          </div>
        </div>
      </div>
    </>
  );
}
