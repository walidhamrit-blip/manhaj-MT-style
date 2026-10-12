'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logoutAction, setAdminLangAction } from '@/lib/admin/actions';
import { ADMIN_LANGS, tr, type AdminLang } from '@/lib/admin/i18n';
import { RESOURCES } from '@/lib/admin/resources';

type NavItem = { href: string; label: [string, string]; icon: string; count?: number };

/**
 * Navigation du panneau d'administration. Les entrées sont générées à partir
 * des ressources déclarées, plus les pages dédiées (commandes, devis…).
 */
export default function Sidebar({
  lang,
  counts,
  brandLatin,
}: {
  lang: AdminLang;
  counts: Record<string, number>;
  brandLatin: string;
}) {
  const pathname = usePathname();

  const find = (key: string) => RESOURCES.find((resource) => resource.key === key);
  const catalogResources = ['products', 'categories', 'sections'].map(find).filter(Boolean);
  const contentResources = ['banners', 'stores', 'benefits', 'brands', 'nav-links', 'media', 'texts'].map(find).filter(Boolean);

  const groups: { label: string; items: NavItem[] }[] = [
    {
      label: tr(lang, 'dashboard'),
      items: [{ href: '/admin', label: ['Tableau de bord', 'لوحة التحكم'], icon: 'fa-solid fa-gauge-high' }],
    },
    {
      label: tr(lang, 'catalog'),
      items: catalogResources.map((resource) => ({
        href: `/admin/${resource!.key}`,
        label: resource!.labelPlural,
        icon: resource!.icon,
        count: counts[resource!.key],
      })),
    },
    {
      label: tr(lang, 'content'),
      items: contentResources.map((resource) => ({
        href: `/admin/${resource!.key}`,
        label: resource!.labelPlural,
        icon: resource!.icon,
        count: counts[resource!.key],
      })),
    },
    {
      label: tr(lang, 'sales'),
      items: [
        { href: '/admin/orders', label: ['Commandes', 'الطلبات'], icon: 'fa-solid fa-receipt', count: counts.orders },
        { href: '/admin/quotes', label: ['Demandes de devis', 'طلبات عروض الأسعار'], icon: 'fa-solid fa-file-invoice', count: counts.quotes },
        { href: '/admin/subscribers', label: ['Abonnés newsletter', 'مشتركو النشرة'], icon: 'fa-solid fa-envelope-open-text', count: counts.subscribers },
      ],
    },
    {
      label: tr(lang, 'configuration'),
      items: [{ href: '/admin/settings', label: ['Réglages du site', 'إعدادات الموقع'], icon: 'fa-solid fa-sliders' }],
    },
  ];

  const isActive = (href: string) => (
    href === '/admin' ? pathname === '/admin' : pathname === href || pathname.startsWith(`${href}/`)
  );

  return (
    <aside className="admin-side">
      <div className="admin-brand">
        <span className="mark">M</span>
        <span>
          <strong>{brandLatin}</strong>
          <small>{tr(lang, 'adminTitle')}</small>
        </span>
      </div>

      <nav className="admin-nav">
        {groups.map((group) => (
          <div key={group.label}>
            <div className="admin-nav-group">{group.label}</div>
            {group.items.map((item) => (
              <Link key={item.href} href={item.href} className={isActive(item.href) ? 'active' : undefined}>
                <i className={item.icon} />
                <span>{lang === 'ar' ? item.label[1] : item.label[0]}</span>
                {typeof item.count === 'number' && item.count > 0 ? (
                  <span className="count">{item.count}</span>
                ) : null}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      <div className="admin-side-foot">
        <div className="lang-switch">
          {ADMIN_LANGS.map((code) => (
            <form key={code} action={setAdminLangAction.bind(null, code)}>
              <button type="submit" className={lang === code ? 'active' : undefined} style={{ width: '100%' }}>
                {code === 'fr' ? 'Français' : 'العربية'}
              </button>
            </form>
          ))}
        </div>
        <a href="/" target="_blank" rel="noopener noreferrer">
          <i className="fa-solid fa-arrow-up-right-from-square" />
          <span>{tr(lang, 'viewSite')}</span>
        </a>
        <form action={logoutAction}>
          <button type="submit">
            <i className="fa-solid fa-right-from-bracket" />
            <span>{tr(lang, 'logout')}</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
