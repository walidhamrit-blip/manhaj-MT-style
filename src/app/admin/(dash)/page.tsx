import Link from 'next/link';
import { getAdminContext, getAdminLang, getCounts, getRecentOrders } from '@/lib/admin/page-data';
import { tr } from '@/lib/admin/i18n';
import { formatDate } from '@/lib/format';
import { STATUS_LABELS } from '@/lib/admin/status';
import { SESSION_COOKIE, isValidToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const lang = await getAdminLang();
  const [counts, orders, context] = await Promise.all([
    getCounts(),
    getRecentOrders(6),
    getAdminContext(),
  ]);

  const store = await cookies();
  const sessionOk = isValidToken(store.get(SESSION_COOKIE)?.value);

  const stats = [
    { label: tr(lang, 'statProducts'), value: counts.products, icon: 'fa-solid fa-box', href: '/admin/products' },
    { label: tr(lang, 'statCategories'), value: counts.categories, icon: 'fa-solid fa-layer-group', href: '/admin/categories' },
    { label: tr(lang, 'statOrders'), value: counts.orders, icon: 'fa-solid fa-receipt', href: '/admin/orders' },
    { label: tr(lang, 'statNewOrders'), value: counts.newOrders, icon: 'fa-solid fa-bell', href: '/admin/orders' },
    { label: tr(lang, 'statQuotes'), value: counts.quotes, icon: 'fa-solid fa-file-invoice', href: '/admin/quotes' },
    { label: tr(lang, 'statSubscribers'), value: counts.subscribers, icon: 'fa-solid fa-envelope-open-text', href: '/admin/subscribers' },
  ];

  return (
    <>
      <div className="admin-top">
        <div>
          <h1>{tr(lang, 'dashboard')}</h1>
          <p>{tr(lang, 'dashIntro')}</p>
        </div>
        <div className="actions">
          <Link className="a-btn primary" href="/admin/products/new">
            <i className="fa-solid fa-plus" /> {tr(lang, 'quickActionProduct')}
          </Link>
          <a className="a-btn ghost" href="/" target="_blank" rel="noopener noreferrer">
            <i className="fa-solid fa-arrow-up-right-from-square" /> {tr(lang, 'viewSite')}
          </a>
        </div>
      </div>

      {!sessionOk ? <div className="alert warn">{tr(lang, 'sessionExpired')}</div> : null}

      <div className="grid-stats">
        {stats.map((stat) => (
          <Link className="stat" key={stat.label} href={stat.href}>
            <i className={stat.icon} />
            <span>
              <b>{stat.value}</b>
              <span>{stat.label}</span>
            </span>
          </Link>
        ))}
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h2>{tr(lang, 'quickActions')}</h2>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link className="a-btn ghost" href="/admin/products/new">
            <i className="fa-solid fa-box" /> {tr(lang, 'quickActionProduct')}
          </Link>
          <Link className="a-btn ghost" href="/admin/banners">
            <i className="fa-solid fa-images" /> {tr(lang, 'quickActionBanner')}
          </Link>
          <Link className="a-btn ghost" href="/admin/texts">
            <i className="fa-solid fa-font" /> {tr(lang, 'quickActionTexts')}
          </Link>
          <Link className="a-btn ghost" href="/admin/settings">
            <i className="fa-solid fa-sliders" /> {tr(lang, 'quickActionSettings')}
          </Link>
        </div>
      </div>

      <div className="card">
        <h2>{tr(lang, 'recentOrders')}</h2>
        {orders.length ? (
          <div className="table-wrap">
            <table className="admin">
              <thead>
                <tr>
                  <th>{tr(lang, 'orderRef')}</th>
                  <th>{tr(lang, 'customer')}</th>
                  <th>{tr(lang, 'total')}</th>
                  <th>{tr(lang, 'status')}</th>
                  <th>{tr(lang, 'date')}</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <Link href={`/admin/orders/${order.id}`} style={{ fontWeight: 800, color: 'var(--a-navy)' }}>
                        {order.reference}
                      </Link>
                    </td>
                    <td>{order.customerName || '—'}</td>
                    <td className="num">{order.total.toFixed(2)}</td>
                    <td>
                      <span className={`pill ${order.status}`}>
                        {STATUS_LABELS[order.status] ? (lang === 'ar' ? STATUS_LABELS[order.status][1] : STATUS_LABELS[order.status][0]) : order.status}
                      </span>
                    </td>
                    <td className="num muted">{formatDate(order.createdAt, lang === 'ar' ? 'ar' : 'en')}</td>
                  </tr>
                ))}
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

      <div className="card">
        <h2>{tr(lang, 'databaseInfo')}</h2>
        <p style={{ margin: 0, fontSize: 12.5, color: 'var(--a-muted)' }}>
          {context.database.remote ? (
            <>
              <i className="fa-solid fa-cloud" /> Neon PostgreSQL — {context.database.url || 'DATABASE_URL'}
            </>
          ) : (
            <>
              <i className="fa-solid fa-hard-drive" /> Base locale (PGlite) — définissez DATABASE_URL pour utiliser Neon
              en production.
            </>
          )}
        </p>
      </div>
    </>
  );
}
