'use client';

import { StoreProvider, useStore } from './store/context';
import Header from './store/Header';
import Footer from './store/Footer';
import Overlays from './store/Overlays';
import SectionBlock from './store/Sections';
import type { SiteContent } from '@/lib/types';

function Sections() {
  const { content } = useStore();
  return (
    <>
      {content.sections.map((section) => (
        <SectionBlock key={section.id} section={section} />
      ))}
    </>
  );
}

function Shell() {
  const { content } = useStore();
  const email = String(content.settings['contact.email'] ?? '');

  return (
    <>
      <Header />
      <main id="top">
        <Sections />
      </main>
      <Footer />

      {/* Données structurées pour les moteurs de recherche */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Store',
            name: String(content.settings['brand.latin'] ?? 'Al Manhaj'),
            email: email || undefined,
            telephone: String(content.settings['contact.phone'] ?? '') || undefined,
            address: String(content.settings['contact.address_en'] ?? '') || undefined,
            priceRange: 'LYD',
          }),
        }}
      />
    </>
  );
}

export default function Storefront({ content }: { content: SiteContent }) {
  return (
    <StoreProvider content={content}>
      <Shell />
      <Overlays />
    </StoreProvider>
  );
}
