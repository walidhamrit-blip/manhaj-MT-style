'use client';

import { useState } from 'react';
import { useStore } from './context';

export default function Footer() {
  const { content, pick, t, runLink, notify } = useStore();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);

  const footerLinks = content.navLinks.filter((link) => link.location === 'footer');
  const groups: { label: string; links: typeof footerLinks }[] = [];
  for (const link of footerLinks) {
    const label = pick(link.groupAr, link.groupEn);
    const existing = groups.find((group) => group.label === label);
    if (existing) existing.links.push(link);
    else groups.push({ label, links: [link] });
  }

  const settings = content.settings;
  const phone = String(settings['contact.phone'] ?? '');
  const email2 = String(settings['contact.email'] ?? '');
  const address = pick(String(settings['contact.address_ar'] ?? ''), String(settings['contact.address_en'] ?? ''));
  const hours = pick(String(settings['contact.hours_ar'] ?? ''), String(settings['contact.hours_en'] ?? ''));
  const payments = Array.isArray(settings['shop.payments'])
    ? (settings['shop.payments'] as string[])
    : String(settings['shop.payments'] ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  const footerBenefits = content.benefits.filter((benefit) => benefit.placement === 'footer');

  const socials = [
    { key: 'social.facebook', url: String(settings['social.facebook'] ?? ''), icon: 'fa-brands fa-facebook-f' },
    { key: 'social.instagram', url: String(settings['social.instagram'] ?? ''), icon: 'fa-brands fa-instagram' },
    { key: 'social.youtube', url: String(settings['social.youtube'] ?? ''), icon: 'fa-brands fa-youtube' },
    { key: 'social.whatsapp', url: String(settings['social.whatsapp'] ?? ''), icon: 'fa-brands fa-whatsapp' },
  ].filter((social) => social.url);

  const subscribe = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      const response = await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) throw new Error('failed');
      notify(t('footer.subscribed', 'Merci pour votre inscription'));
      setEmail('');
    } catch {
      notify(t('footer.subscribe_error', 'Inscription impossible, réessayez'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {socials.length ? (
        <div className="social">
          <div className="container social-row">
            {socials.map((social) => (
              <a key={social.key} href={social.url} target="_blank" rel="noopener noreferrer" aria-label={social.key}>
                <i className={social.icon} />
              </a>
            ))}
          </div>
        </div>
      ) : null}

      <footer>
        <div className="container footer-grid">
          {groups.map((group) => (
            <div className="footer-col" key={group.label}>
              <h3>{group.label}</h3>
              {group.links.map((link) => (
                <a
                  key={link.id}
                  href={link.kind === 'url' ? link.target : `#${link.target}`}
                  onClick={(event) => {
                    if (link.kind === 'url') return;
                    event.preventDefault();
                    runLink(link.kind, link.target);
                  }}
                >
                  {pick(link.labelAr, link.labelEn)}
                </a>
              ))}
            </div>
          ))}

          <div className="footer-col">
            <h3>{t('footer.contact_title', 'CONTACT')}</h3>
            {phone ? (
              <p>
                <i className="fa-solid fa-phone" />
                {phone}
              </p>
            ) : null}
            {email2 ? (
              <p>
                <i className="fa-solid fa-envelope" />
                {email2}
              </p>
            ) : null}
            {address ? (
              <p>
                <i className="fa-solid fa-location-dot" />
                <span>{address}</span>
              </p>
            ) : null}
            {hours ? (
              <p>
                <i className="fa-regular fa-clock" />
                <span>{hours}</span>
              </p>
            ) : null}
          </div>

          <div className="footer-col">
            <h3>{t('footer.newsletter_title', 'NEWSLETTER')}</h3>
            <p>{t('footer.newsletter_body')}</p>
            <form className="newsletter" onSubmit={subscribe}>
              <input
                type="email"
                required
                placeholder={t('footer.email_placeholder', 'Votre e-mail')}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <button disabled={busy}>{t('footer.subscribe', "S'ABONNER")}</button>
            </form>
            {payments.length ? (
              <div className="payments">
                {payments.map((payment) => (
                  <span key={payment}>{payment}</span>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        {footerBenefits.length ? (
          <div className="footer-benefits">
            {footerBenefits.map((benefit) => (
              <div className="footer-benefit" key={benefit.id}>
                <i className={benefit.icon} />
                <span>{pick(benefit.titleAr, benefit.titleEn)}</span>
              </div>
            ))}
          </div>
        ) : null}

        <div className="copyright">
          © {new Date().getFullYear()} {t('footer.copyright')}
          {' · '}
          <a href="/admin" className="admin-link">
            {t('footer.admin', 'Administration')}
          </a>
        </div>
      </footer>
    </>
  );
}
